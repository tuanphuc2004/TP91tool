# Thiết kế Nâng cấp Trang Admin, Phân loại Skill/Plugin/Tool & Phân quyền Super Admin

**Ngày:** 2026-11-27
**Phạm vi:** Trang quản trị (`/admin`), bộ lọc danh mục & nền tảng AI công khai (`/skills`, `/marketplace`, `/items/[slug]`), cơ sở dữ liệu Supabase và hệ thống phân quyền Admin nhiều cấp.

## 1. Mục tiêu & Vấn đề cần giải quyết

1. **Sửa lỗi hiển thị Tab & chống phình giao diện danh sách (`/admin`):**
   - Sửa `TabsTrigger` trong `src/components/ui/tabs.tsx` từ `data-active:` sang `data-[state=active]:` để trạng thái tab đang chọn nổi bật rõ ràng.
   - Bổ sung bộ lọc nhanh theo loại (`Dự án Web`, `Tool`, `Skill`, `Plugin`), lọc theo danh mục, lọc theo nền tảng AI, ô tìm kiếm, độ rộng cột cố định hợp lý và **phân trang** cho cả 3 danh sách (`Sản phẩm & Skill`, `Đơn mua`, `Yêu cầu làm Web`) để trang không bị phóng to/kéo dài khi dữ liệu nhiều.
2. **Danh mục phân loại chuẩn & Nền tảng AI tương thích:**
   - Định nghĩa danh mục riêng cho từng loại (`project`, `tool`, `skill`, `plugin`).
   - Thêm trường `compatible_platforms` (`all`, `gemini`, `chatgpt`, `claude`) cho `skill`, `plugin` (và tùy chọn cho `tool`) ở cả Admin lẫn trang công khai (`/skills`, `CatalogCard`, `/items/[slug]`).
3. **Thay đổi form Thêm/Sửa mục mới:**
   - Thay ngăn kéo bên phải (`Sheet`) bằng **Modal Dialog căn giữa rộng (`max-w-3xl`)**, chia thành các khối rõ ràng theo từng loại sản phẩm/skill, tự gợi ý slug từ tiêu đề và ẩn bớt trường không cần thiết theo loại mục.
4. **Phân quyền Super Admin (`hoangphuc9102004@gmail.com`) & Admin con:**
   - Tài khoản `hoangphuc9102004@gmail.com` là **Super Admin** (quyền cao nhất), không thể bị bất kỳ Admin con nào chỉnh sửa, hạ quyền, tắt kích hoạt hay xóa (khóa ở cả UI, Server Action và Database Trigger/RLS).
   - Super Admin có tab **Phân quyền Admin** để tạo/gắn tài khoản Admin con và giới hạn quyền theo từng mảng (`catalog`, `orders`, `requests`).

## 2. Lựa chọn kiến trúc phân quyền

- **Phương án A (Khuyên dùng - Chuẩn đầy đủ):**
  - Tạo bảng `public.admin_accounts` trong Supabase Postgres lưu `email`, `role` (`'super_admin' | 'admin'`), `permissions` (`'catalog' | 'orders' | 'requests'`), `is_active`, `created_by`, kèm RLS và Trigger bảo vệ `hoangphuc9102004@gmail.com`.
  - Kết hợp `SUPABASE_SERVICE_ROLE_KEY` (server-only) trong Server Actions để Super Admin tạo tài khoản đăng nhập mới (email + mật khẩu) hoặc cập nhật user sẵn có ngay trong tab **Phân quyền Admin**.
- **Phương án B (Không cần thêm key bí mật):**
  - Dùng cùng bảng `public.admin_accounts` + RLS + Trigger; Admin con tự đăng ký tài khoản ở `/login`, sau đó Super Admin nhập email để cấp/giới hạn quyền.
- **Quyết định thiết kế:** Triển khai đầy đủ bảng `public.admin_accounts` + RLS + Trigger; Server Action tự hỗ trợ tạo tài khoản mới qua `SUPABASE_SERVICE_ROLE_KEY` nếu đã cấu hình, và fallback sang cơ chế cấp quyền theo email đã đăng ký nếu chưa cấu hình service role key.

## 3. Ràng buộc hệ thống

- Giữ nguyên stack miễn phí: Next.js 16.4.6 (`cacheComponents: true`), Tailwind CSS v4, shadcn/ui, Supabase Free, Vercel Hobby.
- Toàn bộ giao diện tiếng Việt, không dùng dấu gạch ngang dài (`—`), dùng font thống nhất `Plus Jakarta Sans` + `JetBrains Mono`.
- Không để lộ `SUPABASE_SERVICE_ROLE_KEY` ra client; mọi kiểm tra quyền thực hiện ở Server Component, Server Action và Postgres RLS.
