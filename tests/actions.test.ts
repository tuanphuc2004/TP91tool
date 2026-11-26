import { describe, expect, it } from "vitest";
import { buildVerifiedOrderPayload } from "@/lib/order-helper";
import { SEED_CATALOG_ITEMS } from "@/lib/data/seed";

describe("buildVerifiedOrderPayload", () => {
  it("uses server-side item price_vnd and title for paid items", () => {
    const item = SEED_CATALOG_ITEMS.find((i) => i.slug === "nextjs-store-starter")!;
    const result = buildVerifiedOrderPayload(item, {
      itemId: item.id,
      customerName: "Nguyen Van A",
      contactChannel: "zalo",
      customerContact: "0912345678",
      note: "Giao qua Zalo",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.amount_vnd).toBe(490000);
      expect(result.payload.item_title).toBe("TP91 Commerce Starter");
      expect(result.payload.status).toBe("pending");
    }
  });

  it("rejects free items from paid order flow", () => {
    const freeItem = SEED_CATALOG_ITEMS.find((i) => i.price_vnd === 0)!;
    const result = buildVerifiedOrderPayload(freeItem, {
      itemId: freeItem.id,
      customerName: "Nguyen Van A",
      contactChannel: "email",
      customerContact: "a@example.com",
      note: "",
    });
    expect(result.ok).toBe(false);
  });
});
