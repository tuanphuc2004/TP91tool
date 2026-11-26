# TP91tool

Website bán dự án web & tool tiện ích, chia sẻ miễn phí AI skill & plugin, kèm dịch vụ nhận làm web có phòng Live Demo tương tác. Thiết kế tối ưu 100% trên hạ tầng miễn phí (**Next.js 16 + Tailwind v4 + shadcn/ui + Supabase Free + Vercel Hobby**).

## Tính năng chính

- **Kho Dự án & Tool (`/marketplace`)**: Lọc theo loại, mức giá (Miễn phí / Trả phí), tìm kiếm nhanh, đặt mua lưu đơn về Supabase Postgres.
- **Kho Skill & Plugin miễn phí (`/skills`)**: Xem nội dung `SKILL.md`, sao chép lệnh cài đặt 1 chạm, đếm lượt tải.
- **Nhận làm Web & Phòng Live Demo (`/services`)**: 4 demo chạy thật trên trình duyệt (`Mini POS & Export CSV/JSON`, `Landing Builder`, `SKILL.md Inspector`, `Bộ ước tính làm Web`) liên kết trực tiếp với form gửi yêu cầu.
- **Quản trị Admin (`/admin`)**: Bảo vệ bằng Supabase Auth + RLS (`app_metadata.role = 'admin'`), CRUD sản phẩm/skill và cập nhật trạng thái đơn mua, yêu cầu làm web.

---

## Hướng dẫn kích hoạt Supabase Free (0đ)

1. Tạo project miễn phí tại [supabase.com](https://supabase.com).
2. Vào **SQL Editor**, dán và chạy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql`.
3. Vào **Authentication → Users → Add user** để tạo tài khoản Admin (email + mật khẩu).
4. Mở **SQL Editor** và chạy lệnh gán quyền admin vào `raw_app_meta_data` (thay đúng email của bạn):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'hoangphuc9102004@gmail.com';
```

5. Lấy **Project URL** và **Publishable Key** (hoặc Legacy Anon Key) trong **Project Settings → API**, rồi gắn vào:
   - Local: tạo file `.env.local` từ `.env.example`.
   - Production: thêm vào **Vercel → Project → Settings → Environment Variables** rồi **Redeploy**.

## Chạy local & kiểm tra

```bash
npm install
npm run dev
npx vitest run
npm run lint
npm run build
```

## Tùy chỉnh thông tin liên hệ

Chỉnh nhanh link Zalo, Telegram, Facebook, Email và bảng cấu hình ước tính tại `src/lib/site-config.ts`.
