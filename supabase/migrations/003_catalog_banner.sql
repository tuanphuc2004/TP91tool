-- TP91tool Migration 003: Product Banner Image URL & Storage Bucket
-- Run in Supabase Dashboard -> SQL Editor (or via supabase db query)

alter table public.catalog_items
  add column if not exists banner_url text;

-- Create public bucket for product/tool/skill banner images (5MB limit per image)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-banners',
  'catalog-banners',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage RLS policies on storage.objects for catalog-banners
drop policy if exists "Public read catalog banners" on storage.objects;
create policy "Public read catalog banners"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'catalog-banners');

drop policy if exists "Catalog admin upload banners" on storage.objects;
create policy "Catalog admin upload banners"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'catalog-banners'
    and public.current_admin_has_permission('catalog')
  );

drop policy if exists "Catalog admin update banners" on storage.objects;
create policy "Catalog admin update banners"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'catalog-banners'
    and public.current_admin_has_permission('catalog')
  )
  with check (
    bucket_id = 'catalog-banners'
    and public.current_admin_has_permission('catalog')
  );

drop policy if exists "Catalog admin delete banners" on storage.objects;
create policy "Catalog admin delete banners"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'catalog-banners'
    and public.current_admin_has_permission('catalog')
  );
