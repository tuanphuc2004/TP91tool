import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllItemsForAdmin,
  getOrdersForAdmin,
  getProjectRequestsForAdmin,
} from "@/lib/data/catalog";
import { isAdminUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

async function AdminContent() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Alert>
          <AlertTitle>Cần liên kết Supabase Free để kích hoạt Admin</AlertTitle>
          <AlertDescription className="mt-2 space-y-2 text-xs leading-relaxed">
            <p>
              Hiện web đang hiển thị dữ liệu seed mẫu vì chưa có <code>NEXT_PUBLIC_SUPABASE_URL</code> và <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
            </p>
            <p>
              Hãy tạo project Supabase miễn phí, chạy file <code>supabase/migrations/001_initial_schema.sql</code> và thêm biến môi trường trên Vercel để bật quản trị CRUD.
            </p>
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login?next=/admin");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // Hide Admin page completely from non-admin accounts
  if (!isAdminUser(user)) {
    notFound();
  }

  const [items, orders, requests] = await Promise.all([
    getAllItemsForAdmin(),
    getOrdersForAdmin(),
    getProjectRequestsForAdmin(),
  ]);

  return (
    <AdminDashboard
      adminEmail={user.email ?? "admin"}
      items={items}
      orders={orders}
      requests={requests}
    />
  );
}

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <Suspense fallback={<Skeleton className="h-[460px] w-full rounded-xl" />}>
          <AdminContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
