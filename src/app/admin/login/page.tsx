import Link from "next/link";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Đăng nhập Admin",
};

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-14 sm:px-6">
        {!configured ? (
          <div className="w-full max-w-xl space-y-4">
            <Alert>
              <AlertTitle>Chưa gắn biến môi trường Supabase</AlertTitle>
              <AlertDescription className="mt-2 space-y-2 text-xs leading-relaxed">
                <p>
                  Trang công khai vẫn chạy mượt bằng dữ liệu seed. Để bật đăng nhập Admin và lưu đơn hàng thật trên Supabase Free:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Tạo project miễn phí tại supabase.com và chạy file SQL <code>supabase/migrations/001_initial_schema.sql</code>.</li>
                  <li>Tạo tài khoản admin trong Authentication và gán <code>raw_app_meta_data</code> thành <code>{`{"role":"admin"}`}</code>.</li>
                  <li>Thêm <code>NEXT_PUBLIC_SUPABASE_URL</code> và <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> vào Vercel hoặc <code>.env.local</code>.</li>
                </ol>
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline">
              <Link href="/">Quay về trang chủ</Link>
            </Button>
          </div>
        ) : (
          <AdminLoginForm />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
