import { describe, expect, it } from "vitest";
import {
  formatPlatformLabels,
  getCategoryOptionsForKind,
  matchesPlatformFilter,
  normalizePlatforms,
} from "@/lib/catalog-taxonomy";
import {
  SUPER_ADMIN_EMAIL,
  canManageTargetAdmin,
  hasAdminPermission,
  isSuperAdminEmail,
} from "@/lib/supabase/auth";
import { adminUpsertSubAdminSchema } from "@/lib/validators";

describe("catalog taxonomy & AI platforms", () => {
  it("normalizes all 3 individual platforms to ['all'] and preserves single selections", () => {
    expect(normalizePlatforms(["gemini", "chatgpt", "claude"])).toEqual(["all"]);
    expect(normalizePlatforms(["all", "gemini"])).toEqual(["all"]);
    expect(normalizePlatforms(["claude", "gemini"])).toEqual(["gemini", "claude"]);
    expect(normalizePlatforms([])).toEqual([]);
  });

  it("matches platform filter including 'all' items under specific platform filters", () => {
    expect(matchesPlatformFilter(["all"], "gemini")).toBe(true);
    expect(matchesPlatformFilter(["all"], "chatgpt")).toBe(true);
    expect(matchesPlatformFilter(["all"], "claude")).toBe(true);
    expect(matchesPlatformFilter(["gemini", "claude"], "chatgpt")).toBe(false);
    expect(matchesPlatformFilter(["gemini", "claude"], "gemini")).toBe(true);
    expect(matchesPlatformFilter([], "all")).toBe(true);
  });

  it("formats Vietnamese platform badges and returns per-kind category presets", () => {
    expect(formatPlatformLabels(["all"])).toEqual(["Tất cả AI"]);
    expect(formatPlatformLabels(["gemini", "claude"])).toEqual(["Gemini", "Claude"]);
    expect(getCategoryOptionsForKind("skill")).toContain("Frontend & UI");
    expect(getCategoryOptionsForKind("tool")).toContain("Dev Tool");
    expect(getCategoryOptionsForKind("plugin", "Custom Cat")).toContain("Custom Cat");
  });
});

describe("Super Admin protection & scoped RBAC", () => {
  it("identifies canonical Super Admin email case-insensitively", () => {
    expect(isSuperAdminEmail(SUPER_ADMIN_EMAIL)).toBe(true);
    expect(isSuperAdminEmail("HOANGPHUC9102004@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("subadmin@example.com")).toBe(false);
  });

  it("blocks any account including super admin from deleting or downgrading Super Admin target", () => {
    expect(canManageTargetAdmin(SUPER_ADMIN_EMAIL, SUPER_ADMIN_EMAIL)).toBe(false);
    expect(canManageTargetAdmin("subadmin@example.com", SUPER_ADMIN_EMAIL)).toBe(false);
    expect(canManageTargetAdmin("subadmin@example.com", "other@example.com")).toBe(false);
    expect(canManageTargetAdmin(SUPER_ADMIN_EMAIL, "subadmin@example.com")).toBe(true);
  });

  it("checks scoped permissions for super admin and sub-admin", () => {
    const superActor = {
      userId: "1",
      email: SUPER_ADMIN_EMAIL,
      isSuperAdmin: true,
      permissions: ["catalog", "orders", "requests"] as const,
      canManageAdmins: true,
    };
    const ordersOnlyActor = {
      userId: "2",
      email: "orders@example.com",
      isSuperAdmin: false,
      permissions: ["orders"] as const,
      canManageAdmins: false,
    };

    expect(hasAdminPermission(superActor, "catalog")).toBe(true);
    expect(hasAdminPermission(ordersOnlyActor, "orders")).toBe(true);
    expect(hasAdminPermission(ordersOnlyActor, "catalog")).toBe(false);
    expect(hasAdminPermission(ordersOnlyActor, "requests")).toBe(false);
  });

  it("validates sub-admin payload and rejects super admin email as target", () => {
    const invalidSelf = adminUpsertSubAdminSchema.safeParse({
      email: SUPER_ADMIN_EMAIL,
      permissions: ["catalog"],
    });
    expect(invalidSelf.success).toBe(false);

    const validSub = adminUpsertSubAdminSchema.safeParse({
      email: "editor@tp91tool.vn",
      displayName: "Biên tập viên",
      permissions: ["catalog", "orders"],
      isActive: true,
    });
    expect(validSub.success).toBe(true);
  });
});
