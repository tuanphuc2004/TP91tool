import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Tạo mật khẩu mới cho tài khoản TP91tool của bạn.",
};

function ResetPasswordContent() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="w-full max-w-xl space-y-4">
        <Alert>
          <AlertTitle>Chưa cấu hình Supabase</AlertTitle>
          <AlertDescription className="mt-1 text-xs">
            Vui lòng gắn biến môi trường Supabase trong <code>.env.local</code> hoặc Vercel.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    );
  }

  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Suspense fallback={<Skeleton className="h-[360px] w-full max-w-md rounded-2xl" />}>
          <ResetPasswordContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
