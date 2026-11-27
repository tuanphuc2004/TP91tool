import { Suspense } from "react";
import { getCurrentAdminActor } from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteHeaderClient, type HeaderUserState } from "./site-header-client";

async function HeaderWithAuth() {
  let initialUser: HeaderUserState | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const actor = await getCurrentAdminActor();
        initialUser = {
          email: user.email ?? "Tài khoản",
          isAdmin: Boolean(actor),
        };
      }
    }
  }

  return <SiteHeaderClient initialUser={initialUser} />;
}

export function SiteHeader() {
  return (
    <Suspense fallback={<SiteHeaderClient initialUser={null} />}>
      <HeaderWithAuth />
    </Suspense>
  );
}
