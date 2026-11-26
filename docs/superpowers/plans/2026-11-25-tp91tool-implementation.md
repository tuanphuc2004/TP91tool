# TP91tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or superpowers:subagent-driven-development) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the complete **TP91tool** Next.js App Router + Supabase Free web application (selling Projects & Tools, sharing free Skills & Plugins, showcasing Custom Web Services with 4 real interactive live demos, and providing an Auth + RLS-protected `/admin` dashboard), ready to push to `tuanphuc2004/TP91tool` for Vercel Hobby auto-deploy.

**Architecture:** Next.js 16 App Router (Server Components default + isolated `'use client'` leaves) with Tailwind CSS v4, shadcn/ui (`new-york`, Radix primitives), Motion (`motion/react`), Zod validation, and `@supabase/ssr` + `@supabase/supabase-js`. When Supabase env vars are missing, a typed data layer seamlessly falls back to `src/lib/data/seed.ts` for read paths and interactive demos while surfacing setup status in `/admin`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`radix-ui`), `lucide-react`, `motion`, `zod`, `@supabase/ssr`, `@supabase/supabase-js`, `vitest`.

**Spec:** [2026-11-25-tp91tool-design.md](file:///d:/TP91.Tool/docs/superpowers/specs/2026-11-25-tp91tool-design.md)

## Global Constraints

- 100% Free infrastructure & OSS dependencies only (Vercel Hobby, GitHub Free, Supabase Free, MIT/Apache npm packages).
- Light Clean theme locked across every route and section (`#FAFAFA` background, `#FFFFFF` cards, `#E4E4E7` border, `#09090B` foreground, single Cobalt Blue `#2563EB` accent, `Geist` + `Geist Mono`, unified `0.625rem` radius).
- Zero em-dashes (`—`) in any visible UI copy; concise Vietnamese-first copy; no duplicate CTA intents; single-line 64px header; `min-h-[100dvh]` for hero; no div-based fake screenshots; single icon family (`lucide-react`).
- Supabase security rules: RLS enabled on all `public` tables; admin checks use `app_metadata.role === 'admin'` (never `user_metadata`); `orders.amount_vnd` computed server-side from `catalog_items.price_vnd`; `proxy.ts` uses `supabase.auth.getClaims()` while protected Admin routes/actions use `supabase.auth.getUser()`.
- App must pass `npm run build`, `npm run lint`, and `vitest` with zero Supabase env vars configured.

## Review Focus

1. **Order price tampering:** Client submits manipulated `amount_vnd` or non-existent `item_id` -> Server action ignores client amount, queries `catalog_items.price_vnd` (or seed fallback error if DB not configured), and rejects negative/invalid inputs with Zod.
2. **Missing Supabase env vars at build/runtime:** `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `ANON_KEY` unset -> `isSupabaseConfigured()` returns `false`, catalog pages render seed data without crashing, and write/admin actions return structured setup-required errors.
3. **XSS / unsafe markdown or links in `skill_markdown` and `reference_url`:** Malicious `javascript:` URLs in `demo_url`, `download_url`, or `reference_url` -> Zod URL validator allows only `http:`/`https:`, and `SKILL.md` renders safely via React text/structured renderer without `dangerouslySetInnerHTML`.
4. **Admin privilege escalation via `user_metadata`:** Authenticated non-admin user tries accessing `/admin` or mutating `catalog_items` / `orders` -> `isAdminUser(user)` checks `user.app_metadata?.role === 'admin'` only; RLS enforces `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`.
5. **Rate limiting / spam on public order & project request endpoints:** Burst requests from same IP -> server-side sliding-window limiter returns `429` cleanly without crashing.

---

### Task 1: Project Scaffold, Tooling & Design Tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `components.json`, `vitest.config.ts`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `.env.example`, `.gitignore` (verify `.env*` ignored)

**Interfaces:**
- Produces: Next.js 16 + Tailwind v4 + shadcn/ui base components (`button`, `card`, `badge`, `input`, `textarea`, `label`, `select`, `tabs`, `dialog`, `alert-dialog`, `sheet`, `separator`, `table`, `alert`, `skeleton`, `tooltip`), Vitest test runner, Cobalt Light Clean `@theme inline` tokens in `src/app/globals.css`.

- [ ] **Step 1:** Scaffold Next.js 16 TypeScript + Tailwind v4 app into temporary `_scaffold/` and merge into `d:\TP91.Tool` preserving `.git/` and `docs/`.
- [ ] **Step 2:** Install `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `motion`, `lucide-react`, and devDependencies `vitest`, `@vitejs/plugin-react` via `npm.cmd`.
- [ ] **Step 3:** Initialize shadcn/ui non-interactively (`npx.cmd shadcn@latest init -d --base radix`) and add required components (`button card badge input textarea label select tabs dialog alert-dialog sheet separator table alert skeleton tooltip`).
- [ ] **Step 4:** Configure `src/app/globals.css` (Cobalt `#2563EB` Light Clean tokens, literal `Geist` / `Geist Mono` font names per `shadcn` skill gotcha, `prefers-reduced-motion` safety) and `src/app/layout.tsx` (`lang="vi"`, `Geist` + `Geist_Mono` variables on `<html>`, `TooltipProvider`, metadata).
- [ ] **Step 5:** Create `.env.example`, `vitest.config.ts`, and verify `npm.cmd run build` passes.

---

### Task 2: Domain Types, Site Config, Validators & Seed Catalog

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/site-config.ts`
- Create: `src/lib/validators.ts`
- Create: `src/lib/data/seed.ts`
- Create: `src/lib/rate-limit.ts`
- Test: `tests/validators.test.ts`

**Interfaces:**
- Produces:
  - `CatalogItem`, `CatalogKind`, `OrderRecord`, `ProjectRequestRecord`, `OrderStatus`, `RequestStatus`, `ContactChannel`
  - `SITE_CONFIG` (brand, owner email `hoangphuc9102004@gmail.com`, Zalo/Telegram/Facebook links, estimator presets & budget tiers)
  - `createOrderSchema`, `createProjectRequestSchema`, `catalogItemInputSchema`, `safeHttpUrlSchema`
  - `estimateProjectScope(input)` -> `{ stack: string[]; estimatedDays: number; suggestedBudget: string; deliverables: string[] }`
  - `SEED_CATALOG_ITEMS` (8 curated Projects, Tools, Skills, Plugins with Vietnamese copy, realistic install commands, and `SKILL.md` content)
  - `checkRateLimit(key: string, limit?: number, windowMs?: number)`

- [ ] **Step 1:** Write failing unit tests in `tests/validators.test.ts` covering Zod schemas (`safeHttpUrlSchema` rejects `javascript:`, `createOrderSchema`, `createProjectRequestSchema`, `catalogItemInputSchema`), `estimateProjectScope`, and `checkRateLimit`.
- [ ] **Step 2:** Run `npx.cmd vitest run` to verify expected failure.
- [ ] **Step 3:** Implement `src/lib/types.ts`, `src/lib/site-config.ts`, `src/lib/validators.ts`, `src/lib/rate-limit.ts`, and `src/lib/data/seed.ts`.
- [ ] **Step 4:** Run `npx.cmd vitest run` and verify all tests pass.

---

### Task 3: Supabase Schema, RLS Migration, SSR Clients & Data Layer

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `src/lib/supabase/env.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/proxy.ts`
- Create: `src/lib/data/catalog.ts`
- Test: `tests/catalog-data.test.ts`

**Interfaces:**
- Produces:
  - `isSupabaseConfigured(): boolean`
  - `createBrowserSupabaseClient()`
  - `createServerSupabaseClient()`
  - `isAdminUser(user): boolean` (strictly checks `user?.app_metadata?.role === 'admin'`)
  - `getPublishedItems(filter?)`, `getItemBySlug(slug)`, `getAllItemsForAdmin()`, `getOrdersForAdmin()`, `getProjectRequestsForAdmin()`

- [ ] **Step 1:** Write failing unit tests in `tests/catalog-data.test.ts` verifying `isAdminUser()` rejects `user_metadata.role = 'admin'` and accepts `app_metadata.role = 'admin'`, and `getPublishedItems()` / `getItemBySlug()` return filtered seed items when Supabase env vars are absent.
- [ ] **Step 2:** Run `npx.cmd vitest run` to verify failure.
- [ ] **Step 3:** Author `supabase/migrations/001_initial_schema.sql` (tables `catalog_items`, `orders`, `project_requests`, indexes, RLS policies using `app_metadata`, `increment_item_downloads(target_slug text)` RPC with `SET search_path = public` restricted to `published = true` and `(kind in ('skill','plugin') or price_vnd = 0)`, plus optional sample seed insert), Supabase client helpers, `src/proxy.ts` (using `getClaims()`), and `src/lib/data/catalog.ts`.
- [ ] **Step 4:** Run `npx.cmd vitest run` and verify pass.

---

### Task 4: Server Actions & API Route Handlers (Orders, Project Requests, Downloads, Admin CRUD)

**Files:**
- Create: `src/app/actions/public.ts`
- Create: `src/app/actions/admin.ts`
- Create: `src/app/api/health/route.ts`
- Test: `tests/actions.test.ts`

**Interfaces:**
- Consumes: `src/lib/validators.ts`, `src/lib/rate-limit.ts`, `src/lib/supabase/server.ts`, `src/lib/data/catalog.ts`
- Produces:
  - `submitOrderAction(input)` -> validates with Zod, rate-limits, fetches authoritative `price_vnd` from DB (never trusts client price), rejects `price_vnd === 0` paid-order attempt or missing item, inserts `status: 'pending'`
  - `trackFreeDownloadAction(slug)` -> invokes `increment_item_downloads` RPC when Supabase configured, returns `{ ok, downloadUrl }`
  - `submitProjectRequestAction(input)` -> validates with Zod, rate-limits, inserts `status: 'new'`
  - `adminUpsertItemAction(input)`, `adminDeleteItemAction(id)`, `adminUpdateOrderStatusAction(id, status)`, `adminUpdateRequestStatusAction(id, status)`, `adminSignOutAction()`

- [ ] **Step 1:** Write unit tests in `tests/actions.test.ts` verifying price computation helper and structured setup-required response when Supabase is not configured.
- [ ] **Step 2:** Implement `src/app/actions/public.ts`, `src/app/actions/admin.ts`, and `src/app/api/health/route.ts`.
- [ ] **Step 3:** Run `npx.cmd vitest run` and verify pass.

---

### Task 5: 4 Real Interactive Live Demos & Shared Storefront Components

**Files:**
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Create: `src/components/copy-command-button.tsx`
- Create: `src/components/order-dialog.tsx`
- Create: `src/components/free-download-button.tsx`
- Create: `src/components/catalog-card.tsx`
- Create: `src/components/demos/landing-showcase-demo.tsx`
- Create: `src/components/demos/dashboard-tool-demo.tsx`
- Create: `src/components/demos/skill-inspector-demo.tsx`
- Create: `src/components/demos/project-estimator-demo.tsx`
- Create: `src/components/demos/demo-lab.tsx`
- Test: `tests/skill-inspector.test.ts`

**Interfaces:**
- Produces:
  - Single-line 64px header (`SiteHeader`), contact-rich footer (`SiteFooter`)
  - Reusable `CatalogCard`, `OrderDialog` (for `price_vnd > 0`), `FreeDownloadButton` (for `price_vnd === 0` or `skill`/`plugin`), `CopyCommandButton`
  - Pure parser `parseSkillFrontmatter(markdown)` tested in `tests/skill-inspector.test.ts`
  - 4 real working interactive demos + tabbed `DemoLab` + Hero interactive switcher

- [ ] **Step 1:** Write failing test in `tests/skill-inspector.test.ts` for `parseSkillFrontmatter(markdown)`.
- [ ] **Step 2:** Run `npx.cmd vitest run` to verify failure.
- [ ] **Step 3:** Implement `src/lib/skill-parser.ts`, all 4 interactive demo components, and shared storefront UI components.
- [ ] **Step 4:** Run `npx.cmd vitest run` to verify pass.

---

### Task 6: Public Pages (`/`, `/marketplace`, `/skills`, `/items/[slug]`, `/services`)

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/marketplace/page.tsx`, `src/components/marketplace-browser.tsx`
- Create: `src/app/skills/page.tsx`, `src/components/skills-browser.tsx`
- Create: `src/app/items/[slug]/page.tsx`
- Create: `src/app/services/page.tsx`, `src/components/project-request-form.tsx`
- Create: `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `src/lib/data/catalog.ts`, `src/components/demos/*`, `src/app/actions/public.ts`

- [ ] **Step 1:** Build Home (`/`), adhering strictly to Light Clean design rules (asymmetric split hero in `min-h-[100dvh]`, varied section layouts, no em-dashes, restrained eyebrows, Cobalt `#2563EB` accent).
- [ ] **Step 2:** Build `/marketplace`, `/skills`, `/items/[slug]`, `/services` (including `DemoLab` + estimator-to-form pre-fill + `ProjectRequestForm`), and `not-found.tsx`.
- [ ] **Step 3:** Verify `npm.cmd run build` succeeds across all public routes.

---

### Task 7: Admin Auth & Dashboard (`/admin/login`, `/admin`) + README & Final Verification

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/components/admin/login-form.tsx`
- Create: `src/app/admin/page.tsx`, `src/components/admin/admin-dashboard.tsx`, `src/components/admin/item-form-sheet.tsx`
- Create: `README.md`

**Interfaces:**
- Consumes: `src/lib/data/catalog.ts`, `src/app/actions/admin.ts`, `src/lib/supabase/server.ts`

- [ ] **Step 1:** Build `/admin/login` with clean email/password Supabase Auth form (and setup banner when Supabase env vars are absent).
- [ ] **Step 2:** Build `/admin` protected Server Component (`getUser()` + `isAdminUser(user)` gate) + `AdminDashboard` client tabs (Overview, Catalog CRUD with Sheet + `AlertDialog`, Orders status table, Project Requests status table).
- [ ] **Step 3:** Write `README.md` documenting free-tier setup for Supabase SQL migration (`001_initial_schema.sql`), creating the admin user & granting `app_metadata.role = 'admin'`, `.env.local`, and Vercel Environment Variables.
- [ ] **Step 4:** Run full verification suite (`npx.cmd vitest run`, `npm.cmd run lint`, `npm.cmd run build`), start local dev server + verify rendered pages with `browser` or HTTP checks if needed, and commit + push to `origin main` on GitHub.
