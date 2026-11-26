import { describe, expect, it } from "vitest";
import {
  catalogItemInputSchema,
  createOrderSchema,
  createProjectRequestSchema,
  estimateProjectScope,
  safeHttpUrlSchema,
} from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

describe("safeHttpUrlSchema", () => {
  it("accepts valid http and https URLs", () => {
    expect(safeHttpUrlSchema.safeParse("https://github.com/tuanphuc2004/TP91tool").success).toBe(true);
    expect(safeHttpUrlSchema.safeParse("http://localhost:3000").success).toBe(true);
  });

  it("rejects javascript: and data: URLs", () => {
    expect(safeHttpUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
    expect(safeHttpUrlSchema.safeParse("data:text/html,<script>alert(1)</script>").success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  it("validates a valid paid order payload", () => {
    const res = createOrderSchema.safeParse({
      itemId: "nextjs-store-starter",
      customerName: "Nguyen Van A",
      contactChannel: "zalo",
      customerContact: "0912345678",
      note: "Cần hỗ trợ deploy Vercel",
    });
    expect(res.success).toBe(true);
  });

  it("rejects missing contact or invalid channel", () => {
    const res = createOrderSchema.safeParse({
      itemId: "nextjs-store-starter",
      customerName: "A",
      contactChannel: "sms",
      customerContact: "",
    });
    expect(res.success).toBe(false);
  });
});

describe("createProjectRequestSchema", () => {
  it("validates a complete custom web request", () => {
    const res = createProjectRequestSchema.safeParse({
      servicePackage: "webapp",
      customerName: "Tran Thi B",
      contactChannel: "telegram",
      customerContact: "@tranthib",
      budgetRange: "2 - 5 triệu",
      timeline: "Tiêu chuẩn (1 - 2 tuần)",
      selectedFeatures: ["auth", "database"],
      description: "Cần làm web quản lý đơn hàng và danh mục sản phẩm có admin.",
      referenceUrl: "https://example.com",
    });
    expect(res.success).toBe(true);
  });

  it("rejects unsafe referenceUrl", () => {
    const res = createProjectRequestSchema.safeParse({
      servicePackage: "landing",
      customerName: "Tran Thi B",
      contactChannel: "email",
      customerContact: "b@example.com",
      budgetRange: "Dưới 2 triệu",
      timeline: "Gấp (3 - 5 ngày)",
      selectedFeatures: [],
      description: "Cần làm landing page giới thiệu sản phẩm công nghệ.",
      referenceUrl: "javascript:void(0)",
    });
    expect(res.success).toBe(false);
  });
});

describe("catalogItemInputSchema", () => {
  it("enforces kebab-case slug and non-negative price", () => {
    expect(
      catalogItemInputSchema.safeParse({
        slug: "Invalid Slug!",
        kind: "tool",
        title: "Tool",
        tagline: "Tagline",
        description: "Mô tả đủ dài cho sản phẩm.",
        price_vnd: -100,
        category: "Tool",
        tech_stack: ["Next.js"],
        features: ["Nhanh"],
      }).success
    ).toBe(false);
  });
});

describe("estimateProjectScope", () => {
  it("calculates free-tier stack, days, and budget tier", () => {
    const result = estimateProjectScope("ecommerce", ["auth", "database", "seo"]);
    expect(result.estimatedDays).toBe(13);
    expect(result.stack).toContain("Next.js App Router");
    expect(result.stack).toContain("Supabase Free (Postgres + Auth)");
    expect(result.suggestedBudget).toBe("5 - 10 triệu");
  });
});

describe("checkRateLimit", () => {
  it("blocks requests exceeding limit in window", () => {
    const key = `test-ip-${Date.now()}`;
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(false);
  });
});
