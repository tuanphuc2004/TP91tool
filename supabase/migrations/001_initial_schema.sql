-- TP91tool Initial Database Schema & RLS Policies (Supabase Free Tier)
-- Run this in Supabase Dashboard -> SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind text not null check (kind in ('project', 'tool', 'skill', 'plugin')),
  title text not null,
  tagline text not null,
  description text not null,
  price_vnd integer not null default 0 check (price_vnd >= 0),
  category text not null,
  tech_stack text[] not null default '{}',
  features jsonb not null default '[]'::jsonb,
  demo_key text check (demo_key in ('landing-showcase', 'dashboard-tool', 'skill-inspector', 'project-estimator')),
  demo_url text,
  install_command text,
  download_url text,
  skill_markdown text,
  downloads_count integer not null default 0 check (downloads_count >= 0),
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.catalog_items(id) on delete set null,
  item_title text not null,
  amount_vnd integer not null default 0 check (amount_vnd >= 0),
  customer_name text not null,
  contact_channel text not null check (contact_channel in ('zalo', 'telegram', 'facebook', 'email')),
  customer_contact text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'contacted', 'paid', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  service_package text not null check (service_package in ('landing', 'ecommerce', 'webapp', 'tool', 'custom')),
  customer_name text not null,
  contact_channel text not null check (contact_channel in ('zalo', 'telegram', 'facebook', 'email')),
  customer_contact text not null,
  budget_range text not null,
  timeline text not null,
  selected_features text[] not null default '{}',
  description text not null,
  reference_url text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_catalog_items_kind_published on public.catalog_items (kind, published, featured);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_project_requests_created_at on public.project_requests (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_catalog_items_updated_at on public.catalog_items;
create trigger trg_catalog_items_updated_at
before update on public.catalog_items
for each row execute function public.set_updated_at();

-- Narrow, safe download counter RPC (cannot modify any other column or unpublished/paid items)
create or replace function public.increment_item_downloads(target_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.catalog_items
  set downloads_count = downloads_count + 1
  where slug = target_slug
    and published = true
    and (kind in ('skill', 'plugin') or price_vnd = 0)
  returning downloads_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

-- Expose schema & grants explicitly for PostgREST Data API
grant usage on schema public to anon, authenticated;
grant select on public.catalog_items to anon, authenticated;
grant insert on public.orders, public.project_requests to anon, authenticated;
grant all on public.catalog_items, public.orders, public.project_requests to authenticated;
grant execute on function public.increment_item_downloads(text) to anon, authenticated;

-- Enable Row Level Security on all tables
alter table public.catalog_items enable row level security;
alter table public.orders enable row level security;
alter table public.project_requests enable row level security;

-- Catalog policies: public sees published items; admin (app_metadata.role = 'admin') manages all
drop policy if exists "Public read published catalog items" on public.catalog_items;
create policy "Public read published catalog items"
  on public.catalog_items
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admin read all catalog items" on public.catalog_items;
create policy "Admin read all catalog items"
  on public.catalog_items
  for select
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin insert catalog items" on public.catalog_items;
create policy "Admin insert catalog items"
  on public.catalog_items
  for insert
  to authenticated
  with check (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin update catalog items" on public.catalog_items;
create policy "Admin update catalog items"
  on public.catalog_items
  for update
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  with check (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin delete catalog items" on public.catalog_items;
create policy "Admin delete catalog items"
  on public.catalog_items
  for delete
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- Orders policies: public can insert pending orders only; admin reads/updates/deletes
drop policy if exists "Public insert pending orders" on public.orders;
create policy "Public insert pending orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Admin read orders" on public.orders;
create policy "Admin read orders"
  on public.orders
  for select
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders"
  on public.orders
  for update
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  with check (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin delete orders" on public.orders;
create policy "Admin delete orders"
  on public.orders
  for delete
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- Project requests policies: public can insert new requests only; admin reads/updates/deletes
drop policy if exists "Public insert new project requests" on public.project_requests;
create policy "Public insert new project requests"
  on public.project_requests
  for insert
  to anon, authenticated
  with check (status = 'new');

drop policy if exists "Admin read project requests" on public.project_requests;
create policy "Admin read project requests"
  on public.project_requests
  for select
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin update project requests" on public.project_requests;
create policy "Admin update project requests"
  on public.project_requests
  for update
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  with check (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

drop policy if exists "Admin delete project requests" on public.project_requests;
create policy "Admin delete project requests"
  on public.project_requests
  for delete
  to authenticated
  using (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- Seed starter catalog items (idempotent)
insert into public.catalog_items (
  slug, kind, title, tagline, description, price_vnd, category, tech_stack, features,
  demo_key, demo_url, install_command, download_url, skill_markdown, downloads_count, featured, published
)
values
(
  'nextjs-store-starter', 'project', 'TP91 Commerce Starter',
  'Mẫu web bán hàng & giới thiệu sản phẩm tối ưu tốc độ trên Vercel Hobby.',
  'Bộ source code Next.js App Router hoàn chỉnh dành cho shop bán sản phẩm số hoặc dịch vụ. Tích hợp sẵn lọc danh mục, trang chi tiết, modal đặt đơn nhanh và cấu trúc chuẩn SEO.',
  490000, 'Web Bán Hàng',
  array['Next.js 16','TypeScript','Tailwind v4','shadcn/ui','Supabase'],
  '["Lọc theo danh mục và tìm kiếm tức thì không reload trang","Modal đặt mua lưu đơn trực tiếp về Supabase Postgres","Trang quản trị CRUD sản phẩm và duyệt trạng thái đơn hàng","Tối ưu 100% cho gói miễn phí Vercel Hobby & Supabase Free"]'::jsonb,
  'landing-showcase', '/services?demo=landing-showcase', null, null, null, 14, true, true
),
(
  'mini-pos-export-tool', 'tool', 'Mini POS & Export CSV/JSON',
  'Công cụ quản lý đơn nhanh trên trình duyệt, lọc chỉ số và xuất báo cáo tức thì.',
  'Tiện ích web nhẹ giúp chủ shop hoặc freelancer theo dõi doanh thu, tìm kiếm đơn theo trạng thái và xuất file CSV/JSON ngay trên trình duyệt mà không cần cài phần mềm nặng.',
  290000, 'Tool Quản Lý',
  array['React 19','TypeScript','Tailwind CSS','Client Export'],
  '["Tìm kiếm, lọc trạng thái và tính tổng doanh thu theo thời gian thực","Thêm nhanh bản ghi mẫu và kiểm tra dữ liệu ngay trên UI","Xuất file CSV (UTF-8 cho Excel) và JSON chỉ với 1 lần bấm","Chạy hoàn toàn trên browser, dễ nhúng vào hệ thống có sẵn"]'::jsonb,
  'dashboard-tool', '/services?demo=dashboard-tool', null, null, null, 28, true, true
),
(
  'skill-frontmatter-linter', 'tool', 'SKILL.md Inspector CLI & Web',
  'Kiểm tra cấu trúc YAML frontmatter của skill trước khi đóng gói vào plugin.',
  'Công cụ miễn phí giúp kiểm tra file SKILL.md theo chuẩn Antigravity và Claude Code: rà soát tên thư mục, trường description, độ dài nội dung và sinh lệnh cài đặt chuẩn.',
  0, 'Dev Tool',
  array['TypeScript','Zod','Node.js'],
  '["Kiểm tra frontmatter name & description chuẩn Antigravity / Claude","Cảnh báo thiếu tiêu đề, sai định dạng kebab-case hoặc thiếu hướng dẫn","Dùng thử trực tiếp ngay trong trình duyệt ở tab Demo"]'::jsonb,
  'skill-inspector', '/services?demo=skill-inspector', 'npx tsx scripts/check-skills.ts', 'https://github.com/tuanphuc2004/TP91tool', null, 86, true, true
),
(
  'design-taste-frontend', 'skill', 'Design Taste Frontend',
  'Skill hướng dẫn thiết kế giao diện tinh gọn, tránh lỗi bố cục và font mặc định AI.',
  'Bộ quy tắc thiết kế landing page và portfolio giúp AI đọc đúng ngữ cảnh sản phẩm, khóa bảng màu nhất quán, giữ hero gọn trong viewport và tránh các lỗi UI rập khuôn.',
  0, 'Frontend & UI',
  array['SKILL.md','Tailwind v4','Next.js','Motion'],
  '["Bộ kiểm tra Pre-Flight trước khi bàn giao giao diện","Quy tắc cân đối mật độ chữ, khoảng trắng và tỷ lệ tương phản WCAG AA","Tương thích cả Antigravity và Claude Code"]'::jsonb,
  null, null, 'mkdir -p ~/.gemini/config/skills/design-taste-frontend && curl -sL https://github.com/tuanphuc2004/TP91tool -o SKILL.md', 'https://github.com/tuanphuc2004/TP91tool',
  E'---\nname: design-taste-frontend\ndescription: Anti-slop frontend skill for landing pages, portfolios, and clean storefronts.\n---\n\n# Design Taste Frontend\n\n1. Khai báo Design Read trước khi viết code.\n2. Giữ một hệ màu chủ đạo nhất quán trên toàn trang.\n3. Đảm bảo Hero nằm gọn trong 100dvh đầu tiên với tối đa 4 khối chữ.\n4. Dùng dữ liệu và demo tương tác thật thay cho khung giả lập tĩnh.',
  142, true, true
),
(
  'nextjs-supabase-free-starter', 'skill', 'Next.js + Supabase Free Guide',
  'Skill chuẩn hóa kết nối SSR, RLS và bảo mật app_metadata trên gói miễn phí.',
  'Tổng hợp các mẫu code thực chiến cho Next.js 16 (proxy.ts + getClaims) kết hợp Supabase Free Postgres, bảo vệ admin qua app_metadata và fallback dữ liệu mẫu khi chưa gắn env.',
  0, 'Backend & DB',
  array['SKILL.md','Next.js 16','Supabase RLS','@supabase/ssr'],
  '["Mẫu proxy.ts làm mới session SSR an toàn bằng getClaims()","Checklist RLS tránh lỗ hổng phân quyền bằng user_metadata","Tách biệt Server Action xác thực giá và đầu vào bằng Zod"]'::jsonb,
  null, null, 'cp -r skills/supabase ~/.gemini/config/skills/supabase', 'https://github.com/tuanphuc2004/TP91tool',
  E'---\nname: nextjs-supabase-free-starter\ndescription: Guidelines for Next.js 16 App Router with Supabase Free SSR, proxy.ts, and strict RLS.\n---\n\n# Next.js + Supabase Free Checklist\n\n- Luôn bật RLS trên mọi bảng trong schema public.\n- Không bao giờ dùng user_metadata để kiểm tra quyền admin; chỉ dùng app_metadata.\n- Không để lộ SUPABASE_SERVICE_ROLE_KEY ra client bundle.',
  118, true, true
),
(
  'tp91-migrated-skills-bundle', 'plugin', 'TP91 Dev & Deploy Plugin Pack',
  'Gói plugin tổng hợp các skill Next.js, shadcn/ui, Supabase, Vercel CLI và Git Workflow.',
  'Plugin đóng gói sẵn cấu trúc plugin.json để cài một lần vào Antigravity hoặc Claude Code, giúp AI tự động kích hoạt đúng quy trình từ brainstorm, thiết kế giao diện đến deploy Vercel.',
  0, 'Plugin Bundle',
  array['plugin.json','Antigravity Plugin','Vercel CLI','Git'],
  '["Bật hoặc tắt cả bộ kỹ năng chỉ với 1 công tắc trong Customizations","Chuẩn hóa cấu trúc thư mục skills/ và manifest plugin.json","Miễn phí hoàn toàn cho cộng đồng dev Việt Nam"]'::jsonb,
  'skill-inspector', '/services?demo=skill-inspector', 'git clone https://github.com/tuanphuc2004/TP91tool.git', 'https://github.com/tuanphuc2004/TP91tool',
  E'---\nname: tp91-migrated-skills-bundle\ndescription: Plugin bundle combining Next.js, shadcn/ui, Supabase, and Vercel CLI workflows.\n---\n\n# TP91 Dev & Deploy Plugin Pack\n\nĐặt thư mục plugin vào ~/.gemini/config/plugins/<ten-plugin>/ kèm file plugin.json hợp lệ để Antigravity tự động nạp ở lượt tiếp theo.',
  205, true, true
)
on conflict (slug) do nothing;
