-- TP91tool Migration 002: Taxonomy Platforms & Super Admin RBAC
-- Run in Supabase Dashboard -> SQL Editor (or via supabase db push)

-- 1. Add compatible_platforms column to catalog_items
alter table public.catalog_items
  add column if not exists compatible_platforms text[] not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'catalog_items_compatible_platforms_check'
  ) then
    alter table public.catalog_items
      add constraint catalog_items_compatible_platforms_check
      check (compatible_platforms <@ array['all', 'gemini', 'chatgpt', 'claude']::text[]);
  end if;
end
$$;

create index if not exists idx_catalog_items_platforms_gin
  on public.catalog_items using gin (compatible_platforms);

-- Update starter seed records with compatible AI platforms (if present)
update public.catalog_items
set compatible_platforms = array['all']::text[]
where slug in ('skill-frontmatter-linter', 'design-taste-frontend', 'seo-checklist-plugin')
  and coalesce(array_length(compatible_platforms, 1), 0) = 0;

update public.catalog_items
set compatible_platforms = array['gemini', 'claude']::text[]
where slug in ('nextjs-supabase-free-starter', 'tp91-migrated-skills-bundle')
  and coalesce(array_length(compatible_platforms, 1), 0) = 0;

-- 2. Create admin_accounts table for Super Admin + Scoped Sub-Admin permissions
create table if not exists public.admin_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text not null unique,
  display_name text,
  role text not null default 'admin' check (role in ('super_admin', 'admin')),
  permissions text[] not null default array['catalog']::text[]
    check (permissions <@ array['catalog', 'orders', 'requests']::text[]),
  is_active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_accounts_email_lower
  on public.admin_accounts (lower(email));

drop trigger if exists trg_admin_accounts_updated_at on public.admin_accounts;
create trigger trg_admin_accounts_updated_at
before update on public.admin_accounts
for each row execute function public.set_updated_at();

-- Normalize email lowercase & guard Super Admin immutability
create or replace function public.protect_super_admin_account()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.email = lower(trim(new.email));
    if new.email = 'hoangphuc9102004@gmail.com' then
      new.role = 'super_admin';
      new.permissions = array['catalog', 'orders', 'requests']::text[];
      new.is_active = true;
    elsif new.role = 'super_admin' then
      raise exception 'Only hoangphuc9102004@gmail.com can hold super_admin role';
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.email = lower(trim(new.email));
    if lower(old.email) = 'hoangphuc9102004@gmail.com' or old.role = 'super_admin' then
      if new.email <> lower(old.email)
         or new.role <> 'super_admin'
         or new.is_active = false
         or not (new.permissions @> array['catalog', 'orders', 'requests']::text[]) then
        raise exception 'Super Admin account cannot be modified, downgraded, or deactivated';
      end if;
    elsif new.role = 'super_admin' then
      raise exception 'Cannot promote sub-admin to super_admin';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if lower(old.email) = 'hoangphuc9102004@gmail.com' or old.role = 'super_admin' then
      raise exception 'Super Admin account cannot be deleted';
    end if;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_protect_super_admin on public.admin_accounts;
create trigger trg_protect_super_admin
before insert or update or delete on public.admin_accounts
for each row execute function public.protect_super_admin_account();

-- Seed canonical Super Admin
insert into public.admin_accounts (email, display_name, role, permissions, is_active, created_by)
values (
  'hoangphuc9102004@gmail.com',
  'Super Admin (TP91)',
  'super_admin',
  array['catalog', 'orders', 'requests']::text[],
  true,
  'system'
)
on conflict (email) do update
set role = 'super_admin',
    permissions = array['catalog', 'orders', 'requests']::text[],
    is_active = true;

-- 3. Permission helper functions for RLS
create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_email() = 'hoangphuc9102004@gmail.com'
    or exists (
      select 1
      from public.admin_accounts a
      where lower(a.email) = public.current_user_email()
        and a.role = 'super_admin'
        and a.is_active = true
    );
$$;

create or replace function public.current_admin_has_permission(target_perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or exists (
      select 1
      from public.admin_accounts a
      where lower(a.email) = public.current_user_email()
        and a.is_active = true
        and (a.role = 'super_admin' or target_perm = any(a.permissions))
    );
$$;

grant select, insert, update, delete on public.admin_accounts to authenticated;
grant execute on function public.current_user_email() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.current_admin_has_permission(text) to authenticated;

-- 4. RLS for admin_accounts
alter table public.admin_accounts enable row level security;

drop policy if exists "Admin read own or super admin read all" on public.admin_accounts;
create policy "Admin read own or super admin read all"
  on public.admin_accounts
  for select
  to authenticated
  using (
    lower(email) = public.current_user_email()
    or public.is_super_admin()
  );

drop policy if exists "Super admin insert sub-admins" on public.admin_accounts;
create policy "Super admin insert sub-admins"
  on public.admin_accounts
  for insert
  to authenticated
  with check (
    public.is_super_admin()
    and lower(email) <> 'hoangphuc9102004@gmail.com'
    and role = 'admin'
  );

drop policy if exists "Super admin update sub-admins" on public.admin_accounts;
create policy "Super admin update sub-admins"
  on public.admin_accounts
  for update
  to authenticated
  using (
    public.is_super_admin()
    and lower(email) <> 'hoangphuc9102004@gmail.com'
    and role <> 'super_admin'
  )
  with check (
    public.is_super_admin()
    and lower(email) <> 'hoangphuc9102004@gmail.com'
    and role = 'admin'
  );

drop policy if exists "Super admin delete sub-admins" on public.admin_accounts;
create policy "Super admin delete sub-admins"
  on public.admin_accounts
  for delete
  to authenticated
  using (
    public.is_super_admin()
    and lower(email) <> 'hoangphuc9102004@gmail.com'
    and role <> 'super_admin'
  );

-- 5. Update scoped RLS policies on catalog_items, orders, project_requests
drop policy if exists "Admin read all catalog items" on public.catalog_items;
create policy "Admin read all catalog items"
  on public.catalog_items
  for select
  to authenticated
  using (public.current_admin_has_permission('catalog'));

drop policy if exists "Admin insert catalog items" on public.catalog_items;
create policy "Admin insert catalog items"
  on public.catalog_items
  for insert
  to authenticated
  with check (public.current_admin_has_permission('catalog'));

drop policy if exists "Admin update catalog items" on public.catalog_items;
create policy "Admin update catalog items"
  on public.catalog_items
  for update
  to authenticated
  using (public.current_admin_has_permission('catalog'))
  with check (public.current_admin_has_permission('catalog'));

drop policy if exists "Admin delete catalog items" on public.catalog_items;
create policy "Admin delete catalog items"
  on public.catalog_items
  for delete
  to authenticated
  using (public.current_admin_has_permission('catalog'));

drop policy if exists "Admin read orders" on public.orders;
create policy "Admin read orders"
  on public.orders
  for select
  to authenticated
  using (public.current_admin_has_permission('orders'));

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders"
  on public.orders
  for update
  to authenticated
  using (public.current_admin_has_permission('orders'))
  with check (public.current_admin_has_permission('orders'));

drop policy if exists "Admin delete orders" on public.orders;
create policy "Admin delete orders"
  on public.orders
  for delete
  to authenticated
  using (public.current_admin_has_permission('orders'));

drop policy if exists "Admin read project requests" on public.project_requests;
create policy "Admin read project requests"
  on public.project_requests
  for select
  to authenticated
  using (public.current_admin_has_permission('requests'));

drop policy if exists "Admin update project requests" on public.project_requests;
create policy "Admin update project requests"
  on public.project_requests
  for update
  to authenticated
  using (public.current_admin_has_permission('requests'))
  with check (public.current_admin_has_permission('requests'));

drop policy if exists "Admin delete project requests" on public.project_requests;
create policy "Admin delete project requests"
  on public.project_requests
  for delete
  to authenticated
  using (public.current_admin_has_permission('requests'));
