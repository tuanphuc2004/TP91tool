import type { User } from "@supabase/supabase-js";
import type { AdminActor, AdminPermission } from "../types";

export const SUPER_ADMIN_EMAIL = "hoangphuc9102004@gmail.com";

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}

/**
 * Authorization strictly checks app_metadata (server-controlled),
 * never user_metadata (user-editable).
 */
export function isAdminUser(
  user: Pick<User, "app_metadata" | "email"> | null | undefined
): boolean {
  if (!user) return false;
  const role = user.app_metadata?.role;
  return role === "admin" || role === "super_admin" || isSuperAdminEmail(user.email);
}

export function canManageTargetAdmin(
  actorEmail: string | null | undefined,
  targetEmail: string | null | undefined
): boolean {
  if (!isSuperAdminEmail(actorEmail)) return false;
  if (!normalizeEmail(targetEmail)) return false;
  return !isSuperAdminEmail(targetEmail);
}

export function hasAdminPermission(
  actor: Pick<AdminActor, "isSuperAdmin" | "permissions"> | null | undefined,
  permission: AdminPermission
): boolean {
  if (!actor) return false;
  if (actor.isSuperAdmin) return true;
  return actor.permissions.includes(permission);
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
