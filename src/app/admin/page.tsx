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
  getAdminAccountsForSuperAdmin,
  getAllItemsForAdmin,
  getCurrentAdminActor,
  getOrdersForAdmin,
  getProjectRequestsForAdmin,
} from "@/lib/data/catalog";
import { hasAdminPermission } from "@/lib/supabase/auth";
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
              Hãy tạo project Supabase miễn phí, chạy các file migration trong <code>supabase/migrations/</code> và thêm biến môi trường trên Vercel để bật quản trị CRUD.
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

  const actor = await getCurrentAdminActor();

  // Hide Admin page completely from non-admin or deactivated accounts
  if (!actor) {
    notFound();
  }

  const [items, orders, requests, adminTeam] = await Promise.all([
    hasAdminPermission(actor, "catalog") ? getAllItemsForAdmin() : Promise.resolve([]),
    hasAdminPermission(actor, "orders") ? getOrdersForAdmin() : Promise.resolve([]),
    hasAdminPermission(actor, "requests") ? getProjectRequestsForAdmin() : Promise.resolve([]),
    actor.isSuperAdmin
      ? getAdminAccountsForSuperAdmin()
      : Promise.resolve({ accounts: [], migrationReady: true }),
  ]);

  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  return (
    <AdminDashboard
      actor={actor}
      items={items}
      orders={orders}
      requests={requests}
      adminAccounts={adminTeam.accounts}
      adminMigrationReady={adminTeam.migrationReady}
      hasServiceRoleKey={hasServiceRoleKey}
    />
  );
}

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<Skeleton className="h-[460px] w-full rounded-xl" />}>
          <AdminContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
