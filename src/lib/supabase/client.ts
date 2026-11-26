import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createBrowserSupabaseClient() {
  const { url, publishableKey, configured } = getSupabaseEnv();
  if (!configured) {
    return null;
  }
  return createBrowserClient(url, publishableKey);
}
