import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/supabase/auth";

describe("safeRedirectPath", () => {
  it("allows safe internal relative paths", () => {
    expect(safeRedirectPath("/admin")).toBe("/admin");
    expect(safeRedirectPath("/marketplace?filter=tool")).toBe("/marketplace?filter=tool");
  });

  it("blocks external URLs, protocol-relative URLs, and invalid values", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("//evil.com/phish")).toBe("/");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
  });
});
