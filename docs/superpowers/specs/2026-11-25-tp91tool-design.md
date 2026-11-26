# TP91tool — Design Document

**Date:** 2026-11-25  
**Repository:** `https://github.com/tuanphuc2004/TP91tool.git`  
**Owner:** `tuanphuc2004` (`hoangphuc9102004@gmail.com`)  
**Status:** Draft (pending user approval)

---

## 1. Intent & Why

**TP91tool** is a personal developer storefront, resource hub, and custom web-building showcase for `tuanphuc2004`. It solves three goals in one place:

1. **Sell finished web projects & tools** (`project`, `tool`) with clear feature breakdowns, live interactive previews, and a direct order flow.
2. **Share free AI skills & plugins** (`skill`, `plugin`) with readable documentation (`SKILL.md` viewer), one-click install/copy commands, and download tracking.
3. **Accept custom web development commissions** (`/services`) backed by real, functional interactive demos directly in the browser so prospective clients can test quality before submitting a project request.

---

## 2. Constraints

- **100% Free Infrastructure & Dependencies:**
  - Hosting: **Vercel Hobby** (free tier), auto-deployed from GitHub `main`.
  - Source control: **GitHub Free** (`tuanphuc2004/TP91tool`).
  - Database & Auth: **Supabase Free tier** (PostgreSQL + Auth + RLS).
  - Packages: Open-source MIT/Apache libraries only (Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, Motion, Lucide React, Zod, `@supabase/supabase-js`, `@supabase/ssr`). No paid APIs, paid SaaS CMS, or paid UI kits.
- **Pre-Env Resilience:** The app must build and run cleanly on Vercel immediately after the first `git push`, even before the owner adds Supabase environment variables. When `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, public catalog pages read from built-in typed seed data and interactive demos continue to work; mutations and `/admin` display a clear setup checklist until Supabase is linked.

---

## 3. Goals, Non-Goals & Anti-Goals

### Goals
- **Light Clean visual identity:** Crisp light surfaces (`#FAFAFA` background, `#FFFFFF` cards, `#E4E4E7` borders, `#09090B` ink) with a single locked **Cobalt Blue (`#2563EB`)** accent, `Geist` + `Geist Mono` typography, and unified `10px` radius.
- **Real interactive demos:** Live functional mini-apps running in the browser (never fake static screenshot `<div>`s).
- **Database-backed catalog & admin:** Full CRUD for catalog items and status tracking for orders & custom project requests via `/admin`, protected by Supabase Auth + RLS (`app_metadata.role = 'admin'`).
- **Vietnamese-first copy** with clean technical labels and direct contact channels (Zalo, Telegram, Facebook, Email `hoangphuc9102004@gmail.com`).

### Non-Goals
- Automated paid payment gateway integration (Stripe/VNPay/MoMo merchant webhooks). Orders use direct contact + manual/QR confirmation tracked in Admin.
- Public buyer registration/accounts or multi-vendor marketplace onboarding.
- Paid email/SMS notification services (optional free mailto / direct contact links are used at launch).

### Anti-Goals
- AI-slop dark-purple gradients or warm-cream/brass palettes.
- Exposing `SUPABASE_SERVICE_ROLE_KEY` in client bundles or authorizing admin access via user-editable `user_metadata`.
- Relying on unvalidated client-sent prices (`amount_vnd`) when creating orders.

---

## 4. Approaches Considered

| Approach | Summary | Tradeoffs | Decision |
| --- | --- | --- | --- |
| **A. Static File-Driven (No DB)** | Store projects, tools, and skills as local TS/MDX files; send orders via external links/webhooks. | Zero setup, never pauses; but adding items requires editing code & pushing Git, and there is no in-app Admin CRUD or order status table. | Rejected |
| **B. Next.js App Router + Supabase Free + Admin** | Store catalog, orders, and custom web requests in Supabase Postgres with RLS + `/admin` Auth dashboard, plus built-in seed fallback before env setup. | Requires 1-time Supabase project creation + SQL migration + env vars; free tier pauses after 7 days of zero traffic. Gives real Admin CRUD and order persistence at $0. | **Chosen by user** |

---

## 5. Architecture & Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components by default, isolated `'use client'` interactive leaves, `proxy.ts` for Supabase SSR session refresh).
- **UI & Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn/ui (`new-york` / Radix primitives via `radix-ui`), `lucide-react` (single icon family), `motion/react` (restrained UI motion, respecting `prefers-reduced-motion`).
- **Fonts:** `next/font/google` (`Geist` & `Geist_Mono`), bound via literal font names in `@theme inline` (`globals.css`) and classNames on `<html>`.
- **Backend / Data:**
  - `@supabase/ssr` + `@supabase/supabase-js` with separate browser (`lib/supabase/client.ts`) and server (`lib/supabase/server.ts`) helpers.
  - Typed data access layer (`lib/data/catalog.ts`) that queries Supabase when configured and falls back cleanly to `lib/data/seed.ts` when env vars are absent.
  - Zod validation on all Server Actions / Route Handlers (`lib/validators.ts`).
  - Simple in-memory / IP rate guard on public order & project request submissions.

---

## 6. Database Schema & Security (Supabase Free)

Migration file: `supabase/migrations/001_initial_schema.sql`

### Tables
1. **`catalog_items`**
   - `id` (`uuid primary key default gen_random_uuid()`)
   - `slug` (`text unique not null`)
   - `kind` (`text not null check (kind in ('project', 'tool', 'skill', 'plugin'))`)
   - `title` (`text not null`)
   - `tagline` (`text not null`)
   - `description` (`text not null`)
   - `price_vnd` (`integer not null default 0`) — `0` means Free
   - `category` (`text not null`)
   - `tech_stack` (`text[] not null default '{}'`)
   - `features` (`jsonb not null default '[]'`)
   - `demo_key` (`text`) — maps to built-in interactive demo (`landing-showcase`, `dashboard-tool`, `skill-inspector`, `project-estimator`, or null)
   - `demo_url` (`text`) — optional external live URL
   - `install_command` (`text`) — e.g. CLI copy command for skills/plugins
   - `download_url` (`text`) — free GitHub/archive link
   - `skill_markdown` (`text`) — full `SKILL.md` / README content rendered in detail view
   - `downloads_count` (`integer not null default 0`)
   - `featured` (`boolean not null default false`)
   - `published` (`boolean not null default true`)
   - `created_at` (`timestamptz not null default now()`)
   - `updated_at` (`timestamptz not null default now()`)

2. **`orders`**
   - `id` (`uuid primary key default gen_random_uuid()`)
   - `item_id` (`uuid references public.catalog_items(id) on delete set null`)
   - `item_title` (`text not null`)
   - `amount_vnd` (`integer not null default 0`) — **computed server-side from `catalog_items.price_vnd`**, never trusted from client input
   - `customer_name` (`text not null`)
   - `contact_channel` (`text not null check (contact_channel in ('zalo', 'telegram', 'facebook', 'email'))`)
   - `customer_contact` (`text not null`)
   - `note` (`text`)
   - `status` (`text not null default 'pending' check (status in ('pending', 'contacted', 'paid', 'delivered', 'cancelled'))`)
   - `created_at` (`timestamptz not null default now()`)

3. **`project_requests`**
   - `id` (`uuid primary key default gen_random_uuid()`)
   - `service_package` (`text not null check (service_package in ('landing', 'ecommerce', 'webapp', 'tool', 'custom'))`)
   - `customer_name` (`text not null`)
   - `contact_channel` (`text not null check (contact_channel in ('zalo', 'telegram', 'facebook', 'email'))`)
   - `customer_contact` (`text not null`)
   - `budget_range` (`text not null`)
   - `timeline` (`text not null`)
   - `selected_features` (`text[] not null default '{}'`)
   - `description` (`text not null`)
   - `reference_url` (`text`)
   - `status` (`text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'in_progress', 'completed'))`)
   - `created_at` (`timestamptz not null default now()`)

### RLS & Authorization Rules
- Enable RLS on all 3 tables.
- Admin check helper expression: `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` (immutable by end users; set via Supabase Dashboard SQL `UPDATE auth.users SET raw_app_meta_data = ...`).
- `catalog_items`:
  - `SELECT` (`to anon, authenticated`): `using (published = true)`
  - `SELECT/INSERT/UPDATE/DELETE` (`to authenticated`): `using/with check` admin role
- `orders` & `project_requests`:
  - Public submissions happen via validated Server Actions / Route Handlers that validate with Zod and insert allowed columns (`status` locked to `'pending'` / `'new'`). RLS allows `INSERT` `to anon, authenticated` with `with check (status = 'pending')` / `with check (status = 'new')`.
  - `SELECT`, `UPDATE`, `DELETE` (`to authenticated`): admin role only.
- Download counter: `download_events` (`id`, `item_id`, `created_at`) or a narrowly scoped RPC `increment_item_downloads(target_slug text)` (`SECURITY DEFINER` with `SET search_path = public`) that increments `downloads_count = downloads_count + 1` **only** when `published = true` and (`kind in ('skill', 'plugin')` or `price_vnd = 0`).

---

## 7. Pages, Routes & Interactive Demos

### Routes
1. **`/` (Home — Light Clean Storefront & Showcase)**
   - **Header (64px single-line):** Brand `TP91tool` + nav (`Dự án & Tool`, `Skill & Plugin`, `Nhận làm Web`, `Demo`, `Admin`) + primary CTA (`Đặt làm Web`).
   - **Hero (Asymmetric Split, fits within `100dvh`):**
     - Left: Headline (≤ 2 lines), concise subtext (≤ 20 words), 1 primary CTA (`Đặt làm Web`) + 1 secondary CTA (`Khám phá Kho`).
     - Right: **Interactive Demo Switcher** (switch live between real working previews: Tool Dashboard / Skill Inspector / Web Scope & Timeline Estimator).
   - **Section 1 — Dự án & Tool nổi bật:** Curated grid (Projects & Tools with price badge, stack pills, "Xem Demo", and conditional primary action: `Tải miễn phí` when `price_vnd = 0` or `Đặt mua` when `price_vnd > 0`).
   - **Section 2 — Kho Skill & Plugin miễn phí:** Compact asymmetric showcase of free skills/plugins with instant copy-command button & link to `/skills`.
   - **Section 3 — Dịch vụ Nhận làm Web & Live Demo:** Package overview + embedded interactive **Web Scope & Timeline Estimator** + link to `/services`.
   - **Section 4 — Liên hệ trực tiếp & Footer:** Direct channels (Zalo, Telegram, Facebook, Email `hoangphuc9102004@gmail.com`) configured centrally in `lib/site-config.ts`.

2. **`/marketplace` (Dự án & Tool)**
   - Filter by kind (`Tất cả`, `Dự án Web`, `Tool tiện ích`), category, price (`Miễn phí` / `Trả phí`), and instant search.
   - Items with `price_vnd > 0` open the **Đặt mua** modal (creates an `orders` record with server-verified `amount_vnd` and shows contact/QR instructions); items with `price_vnd = 0` provide an instant **Tải miễn phí** action (`download_url` + `increment_item_downloads`).

3. **`/skills` (Chia sẻ Skill & Plugin miễn phí)**
   - Filter by `Skill` / `Plugin` / category.
   - Each card has 1-click copy install command, download/view count, and opens `/items/[slug]` with formatted `SKILL.md` viewer.

4. **`/items/[slug]` (Chi tiết sản phẩm / Skill)**
   - Full description, feature checklist, tech stack, embedded **Live Interactive Demo** (if `demo_key` is set) or external demo link, `SKILL.md` viewer (for skills/plugins), and `Đặt mua` (when `price_vnd > 0`) or `Tải miễn phí` (when `price_vnd = 0` or `skill`/`plugin`).

5. **`/services` (Nhận làm Web + Phòng Demo Chức năng)**
   - **4 Real Interactive Live Demos** selectable in tabs:
     1. `landing-showcase`: Interactive SaaS/Storefront Landing builder preview (toggle layout presets, accent tint, responsive viewport width `Desktop / Mobile`).
     2. `dashboard-tool`: Functional Mini Sales & Inventory Tool (live search, status filter, summary metrics, add sample record, export JSON/CSV).
     3. `skill-inspector`: Live `SKILL.md` frontmatter parser & validator (paste markdown -> validates `name`, `description`, word count, generates Antigravity/Claude install snippet).
     4. `project-estimator`: Interactive **Web Scope & Timeline Estimator** (choose `service_package`, auth, database, animations -> outputs recommended 100%-free stack, estimated timeline in days, and suggested budget tier without locking hard commercial prices; pre-fills the Request Form below).
   - **Custom Web Request Form** (`project_requests` submission with `budget_range` presets: `Dưới 2 triệu`, `2 – 5 triệu`, `5 – 10 triệu`, `Trên 10 triệu`, `Thỏa thuận`, Zod validation, and confirmation card with direct Zalo/Telegram/Facebook/Email handoff).

6. **`/admin/login` & `/admin` (Admin Dashboard)**
   - Protected via Supabase Auth (`supabase.auth.getUser()` + `app_metadata.role === 'admin'`).
   - Tabs:
     - **Tổng quan:** Counts of catalog items, pending orders, new web project requests.
     - **Quản lý Sản phẩm & Skill:** Table + Create/Edit Sheet + Delete `AlertDialog` for `catalog_items`.
     - **Đơn mua Tool/Dự án:** Table with status selector (`pending` -> `contacted` -> `paid` -> `delivered` -> `cancelled`).
     - **Yêu cầu làm Web:** Table with full scope details + status selector (`new` -> `reviewing` -> `quoted` -> `in_progress` -> `completed`).

---

## 8. Builder Handoff & Decisions Made

- **Decisions settled after builder review (editable anytime):**
  1. **Free `project`/`tool` items (`price_vnd = 0`):** Treated as instant free downloads (`Tải miễn phí` + `increment_item_downloads` allowed for any published `skill`, `plugin`, or `price_vnd = 0` item), rather than forcing a payment/order modal.
  2. **Estimator output:** Calculates recommended 100%-free architecture, estimated delivery timeline (days), and suggested `budget_range` preset (`Dưới 2 triệu`, `2 – 5 triệu`, `5 – 10 triệu`, `Trên 10 triệu`, `Thỏa thuận`) configurable in `lib/site-config.ts`, instead of hardcoding fixed commercial VND quotes.
- **Items left to builder:**
  - Exact component decomposition under `src/components/` and `src/app/`.
  - Seed catalog items (realistic Projects, Tools, Skills, and Plugins including Vietnamese descriptions, real install commands, and `SKILL.md` snippets).
  - Placeholder Zalo/Telegram/Facebook handles & optional VietQR info in `lib/site-config.ts` (centralized in one file for easy editing).
  - `README.md` with step-by-step free setup instructions for Supabase Free (`001_initial_schema.sql`, setting `app_metadata.role = 'admin'`, `.env.local` & Vercel Environment Variables).
