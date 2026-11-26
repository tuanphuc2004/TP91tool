import type { CatalogItem, ContactChannel } from "./types";

export interface ValidatedOrderInput {
  itemId: string;
  customerName: string;
  contactChannel: ContactChannel;
  customerContact: string;
  note: string;
}

export function buildVerifiedOrderPayload(
  item: CatalogItem | null,
  input: ValidatedOrderInput
):
  | {
      ok: true;
      payload: {
        item_id: string;
        item_title: string;
        amount_vnd: number;
        customer_name: string;
        contact_channel: ContactChannel;
        customer_contact: string;
        note: string | null;
        status: "pending";
      };
    }
  | { ok: false; error: string } {
  if (!item || !item.published) {
    return { ok: false, error: "Không tìm thấy sản phẩm hợp lệ." };
  }
  if (item.price_vnd <= 0) {
    return {
      ok: false,
      error: "Sản phẩm này đang miễn phí, vui lòng dùng nút Tải miễn phí trực tiếp.",
    };
  }

  return {
    ok: true,
    payload: {
      item_id: item.id,
      item_title: item.title,
      amount_vnd: item.price_vnd,
      customer_name: input.customerName,
      contact_channel: input.contactChannel,
      customer_contact: input.customerContact,
      note: input.note ? input.note : null,
      status: "pending",
    },
  };
}

export function formatVnd(amount: number): string {
  if (amount <= 0) return "Miễn phí";
  return `${new Intl.NumberFormat("vi-VN").format(amount)} đ`;
}
