# TP91tool — UI/UX Pro Max & Motion Redesign Plan

**Date:** 2026-11-26  
**Skills Applied:** `ui-ux-pro-max`, `animate-ui`, `gsap-react`, `design-taste-frontend`, `frontend-design`, `shadcn`, `nextjs`  
**Status:** Pending user review & approval before editing pages

---

## 1. Chẩn đoán vấn đề giao diện hiện tại

1. **Lỗi font chữ không đồng nhất trên tiếng Việt:**
   - `layout.tsx` hiện đang nạp `Geist` và `Geist_Mono` chỉ với `subsets: ["latin"]`. Vì thiếu tập ký tự `vietnamese`, trình duyệt phải fallback các chữ có dấu (`ư, ơ, ệ, ẩ, đ`) sang font hệ thống, làm nét chữ trong cùng một câu bị dày/mỏng lệch nhau.
   - Nhiều thành phần không phải code (giá tiền VNĐ, số lượt tải, số ngày ước tính, nhãn mục, thông tin liên hệ) đang bị gán `font-mono` xen lẫn `font-sans`, tạo cảm giác rời rạc giữa các mục.
2. **Rối mắt do quá nhiều khung viền & mật độ chi tiết cao:**
   - Hero đặt ngay một widget nhiều tab/bảng/nút chọn cùng lúc khiến mắt người xem bị phân tán khi vừa vào trang.
   - `CatalogCard` hiển thị cùng lúc quá nhiều lớp thông tin (badge loại, giá, tiêu đề, mô tả, 4 pill tech stack, khung lệnh code, 2-3 nút bấm, lượt tải) với nhiều đường viền lồng nhau.
3. **Thiếu hình ảnh minh họa & chuyển động có chủ đích:**
   - Thư mục `public/brand/` đã có logo SVG/PNG (`tp91-logo-light.svg`, `tp91-mark-cobalt.svg`, `favicon.svg`) nhưng chưa được gắn vào Header, Footer và favicon.
   - Chưa có ảnh minh họa theo chủ đề cho Hero và các nhóm sản phẩm/dịch vụ, đồng thời hiệu ứng chuyển động còn thưa, chưa tạo cảm giác mượt và sống động.

---

## 2. Hệ thống Thiết kế & Typography Thống nhất (Design System)

### 2.1 Typography (Khắc phục triệt để lỗi lệch chữ)
- **Font duy nhất cho toàn bộ UI, Heading, Body, Giá, Nút, Badge:** `Plus Jakarta Sans` (hoặc `Be Vietnam Pro` — hỗ trợ đầy đủ `subsets: ["latin", "vietnamese"]` qua `next/font/google`).
- **Font Mono (`JetBrains Mono`, `subsets: ["latin", "vietnamese"]`):** **Chỉ** dùng cho đoạn code, lệnh CLI và cột `slug`/`id` kỹ thuật. Giá tiền, lượt tải, thời gian, tiêu đề nhỏ dùng hoàn toàn font chính (`tabular-nums` để thẳng hàng số).
- **Thang chữ cố định:** `12px` (chú thích) / `14px` (UI & bảng) / `16px` (body chuẩn, `line-height: 1.6`) / `20px` (tiêu đề card) / `28px-32px` (tiêu đề mục) / `44px-48px` (H1 Hero).

### 2.2 Bảng màu Light Clean (Giữ tối đa 1 màu nhấn Cobalt)
- Nền trang (`--background`): `#F8FAFC`
- Bề mặt Card (`--card`): `#FFFFFF`
- Viền dịu (`--border`): `#E2E8F0`
- Chữ chính (`--foreground`): `#0F172A`
- Chữ phụ (`--muted-foreground`): `#475569` (đạt tương phản WCAG AA > 4.5:1)
- Màu nhấn chính (`--primary`): `#2563EB` (Cobalt Blue) | Nền nhấn nhẹ (`--accent`): `#EFF6FF`

### 2.3 Bộ ảnh minh họa & Brand Assets
- Gắn `public/brand/tp91-logo-light.svg` vào Header/Footer và `public/favicon.svg` vào metadata.
- Tạo 4 ảnh minh họa đồng bộ tông sáng Cobalt/Clean White (bằng `image-generator`, lưu tại `public/images/`):
  1. `hero-showcase.png` — Minh họa không gian làm việc & giao diện sản phẩm số hiện đại.
  2. `card-project.png` — Minh họa cho nhóm Dự án Web & Thương mại điện tử.
  3. `card-tool.png` — Minh họa cho nhóm Tool tiện ích & Dashboard.
  4. `card-skill.png` — Minh họa cho nhóm AI Skill & Plugin.

---

## 3. Hệ thống Animation & Hiệu ứng Hình ảnh (`motion` + `gsap`)

- **Tôn trọng `prefers-reduced-motion`:** Bọc cấu hình giảm chuyển động toàn cục; tự tắt di chuyển khi người dùng bật chế độ giảm hiệu ứng.
- **Hero Entrance & Visual Motion:** Tiêu đề, đoạn mô tả và CTA xuất hiện tuần tự êm (`duration: 0.45s`, `easeOut`); khối hình ảnh minh họa Hero có hiệu ứng nổi nhẹ + lớp thẻ preview tương tác phía trước.
- **Scroll Reveal & Stagger (`GSAP` / `Motion`):** Các lưới card (Dự án, Skill, Liên hệ) xuất hiện theo sóng (`stagger: 0.06`, `y: 14px -> 0`), không dùng hiệu ứng nảy quá mạnh trên bảng dữ liệu.
- **Card & Image Micro-interactions:**
  - Hover card: nâng nhẹ `-translate-y-1`, viền chuyển sang `border-primary/40`, ảnh thumbnail bên trong zoom nhẹ `scale(1.04)` mượt (`duration-300`) trong khung `overflow-hidden`.
  - Nút bấm: phản hồi nhấn `active:scale-[0.97]`.
  - Tabs chuyển Demo / Bộ lọc: dùng `layoutId` cho thanh highlight trượt mượt giữa các tab.

---

## 4. Kế hoạch sửa chi tiết từng mục & từng trang

### Mục A — Nền tảng chung (`layout.tsx`, `globals.css`, `SiteHeader`, `SiteFooter`, `CatalogCard`)
1. Cập nhật `layout.tsx` & `globals.css`: đổi sang `Plus Jakarta Sans` + `JetBrains Mono` (có `vietnamese`), cập nhật bảng màu `#F8FAFC` / `#0F172A` / `#2563EB`, thêm `favicon.svg`.
2. `SiteHeader`: thay icon tạm bằng `/brand/tp91-logo-light.svg`, giữ thanh điều hướng 1 hàng thoáng (`h-16`), thêm highlight trượt mượt dưới mục đang chọn.
3. `SiteFooter`: dùng logo thương hiệu, gom link liên hệ gọn thành 1 cột có hover rõ ràng, bỏ chữ `font-mono` gây rối mắt.
4. `CatalogCard`: tinh giản còn 3 tầng rõ ràng:
   - Trên: Thumbnail minh họa gọn (tỉ lệ 16:9, hiệu ứng zoom khi hover) + 1 badge loại sản phẩm.
   - Giữa: Tiêu đề + Mô tả 2 dòng + tối đa 3 tag công nghệ gọn.
   - Dưới: Giá (font chính, đậm, thẳng hàng số) + 1 nút hành động chính (`Đặt mua` hoặc `Tải miễn phí`) + link `Chi tiết`. *(Chuyển khung lệnh CLI dài vào trang `/skills` và `/items/[slug]` để card sạch hơn).*

### Mục B — Trang chủ (`/` — `src/app/page.tsx`)
1. **Hero (Thoáng, tập trung 1 điểm nhìn):**
   - Cột trái: Tiêu đề H1 rõ ràng, đoạn giới thiệu ngắn gọn, 2 nút CTA chính (`Đặt làm Web`, `Khám phá Kho`).
   - Cột phải: Thay widget 3 tab phức tạp bằng **khung visual chính (ảnh `hero-showcase.png` kết hợp hiệu ứng chuyển động mượt + 3 pill chuyển nhanh mở thẳng sang phòng Live Demo)** → vừa sinh động vừa không rối mắt.
2. **Mục 1 — Dự án & Tool nổi bật:** Grid 3 cột thoáng (`gap-6`), dùng `CatalogCard` bản tinh gọn mới + hiệu ứng Scroll Stagger.
3. **Mục 2 — Kho Skill & Plugin miễn phí:** Bố cục 2 cột bất đối xứng sạch sẽ (danh sách 4 skill tiêu biểu bên trái chỉ gồm tên, mô tả ngắn, nút Copy 1 chạm; thẻ Plugin nổi bật kèm ảnh minh họa bên phải).
4. **Mục 3 — Dịch vụ Nhận làm Web (3 bước + Bộ ước tính):** Thêm dải 3 bước quy trình ngắn gọn (`1. Chọn phạm vi -> 2. Xem Live Demo -> 3. Bàn giao & Deploy 0đ`) phía trên khối `ProjectEstimatorDemo` để người xem hiểu ngay luồng làm việc.
5. **Mục 4 — Kênh liên hệ trực tiếp:** 4 thẻ `Zalo`, `Telegram`, `Facebook`, `Email` đồng bộ 1 kiểu chữ và kích thước, loại bỏ `font-mono` trên tên/giá trị hiển thị.

### Mục C — Các trang chức năng
1. **`/marketplace` (Kho Dự án & Tool):** Thanh lọc 1 hàng thống nhất (nhóm nút loại + nhóm mức giá + ô tìm kiếm), lưới card có `AnimatePresence` / layout transition mượt khi lọc.
2. **`/skills` (Chia sẻ Skill & Plugin):** Giữ thanh copy lệnh CLI gọn trên card Skill/Plugin (với font `JetBrains Mono` đúng chỗ), tăng khoảng cách giữa các hàng cho dễ quét mắt.
3. **`/items/[slug]` (Chi tiết sản phẩm / Skill):** Bổ sung banner ảnh minh họa đầu trang, cột phải sticky hiển thị giá & tính năng đồng bộ font chữ, khối `SKILL.md` có nút Copy mượt.
4. **`/services` (Nhận làm Web & 4 Live Demo):** Nâng cấp thanh tab 4 Demo bằng `layoutId` highlight mượt, tăng khoảng thở `space-y-20` giữa Phòng Demo và Form đặt làm web để trang không bị dính cục.
5. **`/admin` & `/admin/login`:** Đồng bộ font tiếng Việt thống nhất cho tiêu đề, thẻ thống kê, nhãn form và bảng dữ liệu; giữ `JetBrains Mono` chỉ cho cột `slug` và mã ID.

---

## 5. Thứ tự thực hiện sau khi bạn duyệt Plan

1. **Bước 1:** Tạo bộ 4 ảnh minh họa (`public/images/*.png`) + lưu `design-system/tp91tool/MASTER.md`.
2. **Bước 2:** Cài `@gsap/react` + `gsap` (nếu dùng GSAP cho scroll stagger) hoặc kết hợp `motion/react`, cập nhật `layout.tsx`, `globals.css`, `SiteHeader`, `SiteFooter`.
3. **Bước 3:** Nâng cấp `CatalogCard` + tạo wrapper animation tái sử dụng (`MotionReveal`, `StaggerGrid`).
4. **Bước 4:** Cập nhật lần lượt từng trang: `/` → `/marketplace` & `/skills` → `/items/[slug]` → `/services` → `/admin`.
5. **Bước 5:** Chạy `vitest`, `eslint`, `next build`, kiểm tra giao diện thực tế trên trình duyệt, commit & deploy lại lên `https://tp91tool.vercel.app`.
