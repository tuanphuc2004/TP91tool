import type { User } from "@supabase/supabase-js";

/**
 * Authorization strictly checks app_metadata (server-controlled),
 * never user_metadata (user-editable).
 */
export function isAdminUser(user: Pick<User, "app_metadata"> | null | undefined): boolean {
  if (!user) return false;
  return user.app_metadata?.role === "admin";
}

/**
 * Prevents open redirects by allowing only relative internal paths starting with single '/'.
 */
export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/";
  }
  return trimmed;
}
