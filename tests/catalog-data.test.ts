import { describe, expect, it } from "vitest";
import { isAdminUser } from "@/lib/supabase/auth";
import { getItemBySlug, getPublishedItems } from "@/lib/data/catalog";

describe("isAdminUser", () => {
  it("rejects null or users with admin only in user_metadata", () => {
    expect(isAdminUser(null)).toBe(false);
    expect(
      isAdminUser({
        id: "u1",
        app_metadata: {},
        user_metadata: { role: "admin" },
      } as never)
    ).toBe(false);
  });

  it("accepts user with role=admin in app_metadata", () => {
    expect(
      isAdminUser({
        id: "u2",
        app_metadata: { role: "admin" },
        user_metadata: {},
      } as never)
    ).toBe(true);
  });
});

describe("getPublishedItems & getItemBySlug (seed fallback)", () => {
  it("returns seeded items when Supabase is not configured", async () => {
    const all = await getPublishedItems();
    expect(all.length).toBeGreaterThanOrEqual(8);

    const skills = await getPublishedItems({ kinds: ["skill", "plugin"] });
    expect(skills.every((item) => item.kind === "skill" || item.kind === "plugin")).toBe(true);

    const freeTools = await getPublishedItems({ kinds: ["project", "tool"], pricing: "free" });
    expect(freeTools.every((item) => item.price_vnd === 0)).toBe(true);
  });

  it("finds a seeded item by slug and returns null for missing slug", async () => {
    const found = await getItemBySlug("nextjs-store-starter");
    expect(found?.title).toBe("TP91 Commerce Starter");

    const missing = await getItemBySlug("does-not-exist-xyz");
    expect(missing).toBeNull();
  });
});
