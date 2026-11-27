import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export async function createServerSupabaseClient() {
  const { url, publishableKey, configured } = getSupabaseEnv();
  if (!configured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored when called from Server Components without mutable cookies
        }
      },
    },
  });
}

/**
 * Cookieless read-only client for public published catalog queries.
 */
export function createPublicSupabaseClient() {
  const { url, publishableKey, configured } = getSupabaseEnv();
  if (!configured) {
    return null;
  }
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server-only admin client using SUPABASE_SERVICE_ROLE_KEY when configured.
 * Never import in Client Components.
 */
export function createServiceRoleSupabaseClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !serviceRoleKey) {
    return null;
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
