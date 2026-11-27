# Admin Redesign, Taxonomy & Super Admin RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa lỗi hiển thị và bố cục trang Admin (`/admin`), bổ sung danh mục chuẩn + nền tảng AI tương thích (`Gemini`, `ChatGPT`, `Claude`, `Tất cả`) cho Skill/Plugin/Tool, thay form nhập bên phải bằng modal căn giữa gọn gàng, và triển khai phân quyền Admin nhiều cấp với `hoangphuc9102004@gmail.com` là Super Admin bất khả xâm phạm.

**Architecture:** Tách taxonomy & nền tảng AI vào một module dùng chung (`src/lib/catalog-taxonomy.ts`), bổ sung migration Supabase `002_taxonomy_and_admin_rbac.sql` (cột `compatible_platforms` + bảng `admin_accounts` + RLS + trigger bảo vệ Super Admin), cập nhật Server Actions & Auth helpers kiểm tra quyền chi tiết theo mảng (`catalog`, `orders`, `requests`, `manage_admins`), và tách giao diện Admin thành các phần gọn nhẹ có lọc + phân trang + modal dialog căn giữa.

**Tech Stack:** Next.js 16.4.6 (App Router, Server Actions, `cacheComponents: true`), React 19, TypeScript, Zod, Tailwind CSS v4, shadcn/ui, Supabase Postgres & Auth (`@supabase/ssr`, `@supabase/supabase-js`), Vitest.

**Spec:** [2026-11-27-admin-rbac-redesign-design.md](file:///d:/TP91.Tool/docs/superpowers/specs/2026-11-27-admin-rbac-redesign-design.md)

## Global Constraints

- Không lưu hoặc đẩy `SUPABASE_SERVICE_ROLE_KEY` ra client (`NEXT_PUBLIC_*`).
- Mọi kiểm tra phân quyền phải chạy ở cả UI, Server Action, và Postgres RLS/Trigger.
- Tài khoản `hoangphuc9102004@gmail.com` luôn giữ `role = 'super_admin'`, toàn quyền, và không ai có thể sửa, tắt hoặc xóa.
- Toàn bộ text giao diện bằng tiếng Việt tự nhiên, không dùng em-dash (`—`), tuân thủ Next.js 16 `cacheComponents` (bọc dữ liệu động/request trong `<Suspense>`).
- Mỗi bước hoàn tất đều phải giữ `npx.cmd vitest run`, `npm.cmd run lint`, `npm.cmd run build` xanh.

## Review Focus

- **Nâng cấp/thu hồi quyền trái phép:** Admin con gửi request gọi `adminUpsertSubAdminAction` hoặc `adminDeleteSubAdminAction` lên `hoangphuc9102004@gmail.com` -> Server Action từ chối (`403`/lỗi) và Trigger DB chặn ở mức SQL.
- **Lạm quyền chéo mảng:** Admin con chỉ được cấp quyền `orders` cố tình gọi `adminUpsertItemAction` hoặc `adminDeleteItemAction` -> Server Action và RLS đều từ chối.
- **Nền tảng AI rỗng hoặc chọn lẫn `all`:** Khi chọn `"Tất cả nền tảng"` hoặc chọn cả 3 (`gemini`, `chatgpt`, `claude`), dữ liệu được chuẩn hóa sạch (`["all"]` hoặc mảng hợp lệ), lọc trên `/skills` khớp đúng cả khi lọc riêng `Gemini` nếu item đánh dấu `all`.
- **Dữ liệu seed/cũ thiếu cột mới:** Khi cột `compatible_platforms` rỗng hoặc null ở bản ghi cũ, `normalizeCatalogRow` luôn fallback về `[]` không gây crash runtime.
- **Tabs & Bảng khi danh sách lớn (>20 mục):** Bảng giữ cột gọn, tiêu đề truncate an toàn, và chuyển trang/lọc không gây vỡ layout trên mobile lẫn desktop.

---

### Task 1: Chuẩn hóa Taxonomy, Nền tảng AI và Auth RBAC Types + Validators

**Files:**
- Create: `src/lib/catalog-taxonomy.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/validators.ts`
- Modify: `src/lib/supabase/auth.ts`
- Test: `tests/validators.test.ts`
- Test: `tests/admin-rbac.test.ts`

**Interfaces:**
- Produces in `src/lib/types.ts`: `AiPlatform`, `AdminRole`, `AdminPermission`, `AdminAccountRecord`, `AdminActor`, cập nhật `CatalogItem.compatible_platforms: AiPlatform[]`.
- Produces in `src/lib/catalog-taxonomy.ts`: `CATEGORY_OPTIONS_BY_KIND`, `AI_PLATFORM_OPTIONS`, `getCategoryOptionsForKind(kind)`, `normalizePlatforms(platforms)`, `formatPlatformLabels(platforms)`, `matchesPlatformFilter(itemPlatforms, filter)`.
- Produces in `src/lib/supabase/auth.ts`: `SUPER_ADMIN_EMAIL = "hoangphuc9102004@gmail.com"`, `canAccessPermission(actor, permission)`, `isSuperAdminEmail(email)`.

- [ ] **Step 1: Viết unit test kiểm tra `normalizePlatforms`, `matchesPlatformFilter`, `catalogItemInputSchema` với `compatible_platforms`, và logic bảo vệ `SUPER_ADMIN_EMAIL` trong `tests/admin-rbac.test.ts` & `tests/validators.test.ts`**
- [ ] **Step 2: Chạy `npx.cmd vitest run` để xác nhận test mới fail trước khi cài đặt**
- [ ] **Step 3: Tạo `src/lib/catalog-taxonomy.ts`, cập nhật `src/lib/types.ts`, `src/lib/validators.ts`, `src/lib/supabase/auth.ts`**
- [ ] **Step 4: Chạy `npx.cmd vitest run` xác nhận toàn bộ test pass**

---

### Task 2: Database Migration (`002_taxonomy_and_admin_rbac.sql`) & Server Helpers

**Files:**
- Create: `supabase/migrations/002_taxonomy_and_admin_rbac.sql`
- Modify: `src/lib/data/seed.ts`
- Modify: `src/lib/data/catalog.ts`
- Modify: `src/lib/supabase/server.ts` (bổ sung `createServiceRoleSupabaseClient()` server-only nếu có `SUPABASE_SERVICE_ROLE_KEY`)

**Interfaces:**
- Produces in `supabase/migrations/002_taxonomy_and_admin_rbac.sql`:
  - Cột `compatible_platforms text[]` trên `public.catalog_items` + seed cập nhật nền tảng cho các Skill/Plugin/Tool mẫu.
  - Bảng `public.admin_accounts` + seed bản ghi `super_admin` cho `hoangphuc9102004@gmail.com`.
  - Hàm helper SQL `public.current_admin_has_permission(perm text)` & `public.is_super_admin()`.
  - Trigger `trg_protect_super_admin` chặn sửa/hạ quyền/xóa `hoangphuc9102004@gmail.com`.
  - Cập nhật RLS trên `catalog_items`, `orders`, `project_requests`, `admin_accounts` theo quyền chi tiết.
- Produces in `src/lib/data/catalog.ts`: `getCurrentAdminActor()`, `getAdminAccountsForSuperAdmin()`, cập nhật `normalizeCatalogRow` và `getPublishedItems` lọc theo platform/category.

- [ ] **Step 1: Viết `supabase/migrations/002_taxonomy_and_admin_rbac.sql` đầy đủ bảng, RLS, helper function và trigger bảo vệ Super Admin**
- [ ] **Step 2: Cập nhật `src/lib/data/seed.ts` và `src/lib/data/catalog.ts` hỗ trợ `compatible_platforms`, `getCurrentAdminActor`, và `getAdminAccountsForSuperAdmin`**
- [ ] **Step 3: Thêm `createServiceRoleSupabaseClient()` trong `src/lib/supabase/server.ts` (chỉ đọc `process.env.SUPABASE_SERVICE_ROLE_KEY`)**
- [ ] **Step 4: Chạy `npx.cmd vitest run` kiểm tra test data & validators**

---

### Task 3: Server Actions Phân quyền Chi tiết & Quản lý Admin con

**Files:**
- Modify: `src/app/actions/admin.ts`
- Modify: `src/components/site-header.tsx`
- Modify: `src/app/admin/page.tsx`
- Test: `tests/admin-rbac.test.ts`

**Interfaces:**
- Modifies in `src/app/actions/admin.ts`:
  - `requirePermission(permission: AdminPermission | "manage_admins")` dùng `getCurrentAdminActor()`.
  - `adminUpsertItemAction` lưu kèm `compatible_platforms`.
  - `adminUpsertSubAdminAction(rawInput)` (chỉ Super Admin; tạo user Auth nếu có `SUPABASE_SERVICE_ROLE_KEY`, hoặc gắn/cập nhật quyền trong `admin_accounts`, từ chối sửa `hoangphuc9102004@gmail.com`).
  - `adminDeleteSubAdminAction(id)` (chỉ Super Admin; chặn xóa `hoangphuc9102004@gmail.com`).
- Updates `src/components/site-header.tsx` và `src/app/admin/page.tsx` dùng `getCurrentAdminActor()` để nhận diện cả Super Admin lẫn Admin con được cấp quyền trong `admin_accounts`.

- [ ] **Step 1: Cập nhật `requirePermission` và kiểm tra quyền từng mảng trong `src/app/actions/admin.ts`**
- [ ] **Step 2: Thêm `adminUpsertSubAdminAction` và `adminDeleteSubAdminAction` với lớp bảo vệ Super Admin**
- [ ] **Step 3: Cập nhật `src/components/site-header.tsx` và `src/app/admin/page.tsx` đọc actor và truyền xuống `AdminDashboard`**
- [ ] **Step 4: Kiểm tra TypeScript & `npx.cmd vitest run`**

---

### Task 4: Sửa Tabs UI, Bố cục Admin Dashboard (Lọc + Phân trang) & Tab Phân quyền Admin

**Files:**
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/admin/admin-dashboard.tsx`
- Create: `src/components/admin/admin-team-panel.tsx`

**Interfaces:**
- Fixes `src/components/ui/tabs.tsx`: đổi `data-active:` thành `data-[state=active]:` để tab đang chọn hiển thị nền sáng, chữ rõ và viền nổi bật.
- Updates `AdminDashboardProps`: nhận `actor: AdminActor` và `adminAccounts: AdminAccountRecord[]`.
- Implements in `admin-dashboard.tsx`:
  - Chỉ hiển thị các tab & thẻ thống kê theo `actor.permissions` (và tab `Phân quyền Admin` chỉ hiện với `actor.isSuperAdmin`).
  - Tab **Sản phẩm & Skill**: sub-filter theo Loại (`Tất cả`, `Dự án Web`, `Tool`, `Skill`, `Plugin`), lọc Danh mục, lọc Nền tảng AI, ô tìm kiếm, bảng gọn có phân trang (8 dòng/trang), hiển thị badge loại + danh mục + nền tảng AI.
  - Tab **Đơn mua** và **Yêu cầu làm Web**: lọc trạng thái + phân trang gọn.
- Implements in `admin-team-panel.tsx`: danh sách Admin hiện có (gắn huy hiệu **Quyền cao nhất - Không thể sửa/xóa** cho `hoangphuc9102004@gmail.com`), form thêm/sửa quyền (`catalog`, `orders`, `requests`), bật/tắt trạng thái hoặc xóa Admin con.

- [ ] **Step 1: Sửa `data-[state=active]:` trong `src/components/ui/tabs.tsx`**
- [ ] **Step 2: Tạo `src/components/admin/admin-team-panel.tsx`**
- [ ] **Step 3: Nâng cấp `src/components/admin/admin-dashboard.tsx` với bộ lọc đa tầng, phân trang gọn và kiểm soát tab theo quyền**

---

### Task 5: Thay Form Thêm/Sửa Mục Mới sang Centered Modal Dialog + Danh mục & Nền tảng AI

**Files:**
- Create: `src/components/ui/dialog.tsx` (nếu chưa kiểm tra lại file có sẵn — đã có `alert-dialog.tsx` và `order-dialog.tsx` dùng `Dialog`, kiểm tra tái sử dụng `src/components/ui/dialog.tsx`)
- Modify: `src/components/admin/item-form-sheet.tsx` (hoặc tạo `item-form-dialog.tsx` gọn sạch và cập nhật import ở `admin-dashboard.tsx`)

**Interfaces:**
- Replaces right-side `Sheet` with centered `DialogContent` (`max-w-3xl max-h-[90vh] overflow-y-auto`):
  - **Khối 1 - Thông tin chung:** Loại mục (`project`, `tool`, `skill`, `plugin`), Tiêu đề, Slug (nút tạo slug tự động từ tiêu đề), Mô tả ngắn, Mô tả chi tiết.
  - **Khối 2 - Phân loại & Nền tảng:** Select Danh mục theo `kind` đang chọn (`getCategoryOptionsForKind(kind)`), Giá VNĐ, Tech stack, và cụm chọn **Nền tảng AI sử dụng** (`Tất cả (Gemini, ChatGPT, Claude)` hoặc chọn riêng `Gemini`, `ChatGPT`, `Claude` — hiện rõ cho `skill`, `plugin`, `tool`).
  - **Khối 3 - Tài nguyên & Xuất bản:** Trường chuyên biệt hiển thị hợp lý (`Lệnh cài đặt`, `Nội dung SKILL.md` nổi bật khi là `skill`/`plugin`/`tool`; `Link trang thực tế`, `Link tải`, `Tính năng nổi bật`, nút gạt `Nổi bật` và `Công khai`).

- [ ] **Step 1: Kiểm tra `src/components/ui/dialog.tsx` và xây dựng `src/components/admin/item-form-dialog.tsx` với bố cục 3 khối căn giữa thoáng rõ**
- [ ] **Step 2: Kết nối `ItemFormDialog` vào `admin-dashboard.tsx`, loại bỏ `ItemFormSheet` cũ**

---

### Task 6: Cập nhật Giao diện Công khai (`/skills`, `/marketplace`, `CatalogCard`, `/items/[slug]`) & Kiểm thử Toàn diện

**Files:**
- Modify: `src/components/catalog-card.tsx`
- Modify: `src/components/skills-browser.tsx`
- Modify: `src/components/marketplace-browser.tsx`
- Modify: `src/app/items/[slug]/page.tsx`

- [ ] **Step 1: Hiển thị badge Danh mục & Nền tảng AI (`Gemini`, `ChatGPT`, `Claude`, `Tất cả AI`) trên `CatalogCard` và `/items/[slug]`**
- [ ] **Step 2: Thêm bộ lọc Nền tảng AI & Danh mục vào `SkillsBrowser` (`/skills`) và bộ lọc Danh mục vào `MarketplaceBrowser` (`/marketplace`)**
- [ ] **Step 3: Chạy `npx.cmd vitest run`, `npm.cmd run lint`, `npm.cmd run build` để kiểm tra toàn bộ dự án**
- [ ] **Step 4: Hướng dẫn / chạy SQL migration `002_taxonomy_and_admin_rbac.sql` trên Supabase `WebTP91tool`, commit, push lên `main` và deploy Vercel**
