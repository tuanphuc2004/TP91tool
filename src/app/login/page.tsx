import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { safeRedirectPath } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập hoặc tạo tài khoản TP91tool.",
};

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = safeRedirectPath(next);
  const initialError =
    error === "link_invalid"
      ? "Liên kết xác thực hoặc đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
      : null;

  if (!isSupabaseConfigured()) {
    return (
      <div className="w-full max-w-xl space-y-4">
        <Alert>
          <AlertTitle>Chưa cấu hình Supabase</AlertTitle>
          <AlertDescription className="mt-1 text-xs">
            Vui lòng gắn biến môi trường Supabase trong <code>.env.local</code> hoặc Vercel để kích hoạt đăng nhập.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect(nextPath);
    }
  }

  return <AuthForm nextPath={nextPath} initialError={initialError} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-2xl" />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
