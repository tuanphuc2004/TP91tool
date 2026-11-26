"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { SEED_CATALOG_ITEMS } from "@/lib/data/seed";
import { buildVerifiedOrderPayload } from "@/lib/order-helper";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import type { CatalogItem } from "@/lib/types";
import { createOrderSchema, createProjectRequestSchema } from "@/lib/validators";

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || h.get("x-real-ip") || "local";
  } catch {
    return "local";
  }
}

export async function submitOrderAction(rawInput: unknown): Promise<
  | {
      ok: true;
      mode: "database" | "preview";
      orderId: string;
      itemTitle: string;
      amountVnd: number;
      message: string;
    }
  | { ok: false; error: string }
> {
  const ip = await getClientIp();
  if (!checkRateLimit(`order:${ip}`, 8, 60_000).allowed) {
    return { ok: false, error: "Bạn gửi thao tác quá nhanh, vui lòng thử lại sau 1 phút." };
  }

  const parsed = createOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu đơn hàng không hợp lệ." };
  }

  const configured = isSupabaseConfigured();
  let item: CatalogItem | null = null;

  if (configured) {
    const supabase = createPublicSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from("catalog_items")
        .select("*")
        .or(`id.eq.${parsed.data.itemId},slug.eq.${parsed.data.itemId}`)
        .eq("published", true)
        .maybeSingle();
      if (data) {
        item = data as CatalogItem;
      }
    }
  } else {
    item =
      SEED_CATALOG_ITEMS.find(
        (i) => (i.id === parsed.data.itemId || i.slug === parsed.data.itemId) && i.published
      ) ?? null;
  }

  const verified = buildVerifiedOrderPayload(item, parsed.data);
  if (!verified.ok) {
    return { ok: false, error: verified.error };
  }

  if (!configured) {
    return {
      ok: true,
      mode: "preview",
      orderId: `PREVIEW-${Date.now().toString().slice(-6)}`,
      itemTitle: verified.payload.item_title,
      amountVnd: verified.payload.amount_vnd,
      message:
        "Đã tạo bản xem trước đơn hàng (Supabase chưa gắn biến môi trường). Bạn có thể nhắn trực tiếp qua Zalo, Telegram hoặc Email bên dưới.",
    };
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Không thể kết nối máy chủ dữ liệu." };
  }

  const { data: inserted, error } = await supabase
    .from("orders")
    .insert(verified.payload)
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Insert order failed:", error?.message);
    return { ok: false, error: "Không thể lưu đơn hàng lúc này. Vui lòng thử lại hoặc liên hệ trực tiếp." };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    mode: "database",
    orderId: String(inserted.id),
    itemTitle: verified.payload.item_title,
    amountVnd: verified.payload.amount_vnd,
    message: "Đã ghi nhận đơn hàng thành công! Hãy nhắn mã đơn qua kênh bạn chọn để nhận bàn giao nhanh.",
  };
}

export async function trackFreeDownloadAction(slug: string): Promise<
  | { ok: true; downloadUrl: string | null; downloadsCount: number | null }
  | { ok: false; error: string }
> {
  if (!slug || slug.length > 100) {
    return { ok: false, error: "Slug sản phẩm không hợp lệ." };
  }

  if (!isSupabaseConfigured()) {
    const seed = SEED_CATALOG_ITEMS.find(
      (i) => i.slug === slug && i.published && (i.price_vnd === 0 || i.kind === "skill" || i.kind === "plugin")
    );
    if (!seed) return { ok: false, error: "Không tìm thấy tài nguyên miễn phí." };
    return {
      ok: true,
      downloadUrl: seed.download_url,
      downloadsCount: seed.downloads_count + 1,
    };
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Không thể kết nối Supabase." };
  }

  const { data: item } = await supabase
    .from("catalog_items")
    .select("download_url, downloads_count, price_vnd, kind")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!item || (item.price_vnd > 0 && item.kind !== "skill" && item.kind !== "plugin")) {
    return { ok: false, error: "Tài nguyên không khả dụng để tải miễn phí." };
  }

  const { data: newCount } = await supabase.rpc("increment_item_downloads", {
    target_slug: slug,
  });

  revalidatePath("/skills");
  revalidatePath("/marketplace");
  revalidatePath(`/items/${slug}`);

  return {
    ok: true,
    downloadUrl: item.download_url ? String(item.download_url) : null,
    downloadsCount: typeof newCount === "number" ? newCount : Number(item.downloads_count ?? 0) + 1,
  };
}

export async function submitProjectRequestAction(rawInput: unknown): Promise<
  | {
      ok: true;
      mode: "database" | "preview";
      requestId: string;
      message: string;
    }
  | { ok: false; error: string }
> {
  const ip = await getClientIp();
  if (!checkRateLimit(`request:${ip}`, 6, 60_000).allowed) {
    return { ok: false, error: "Bạn vừa gửi yêu cầu, vui lòng chờ 1 phút trước khi gửi tiếp." };
  }

  const parsed = createProjectRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Thông tin yêu cầu dự án chưa hợp lệ.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      mode: "preview",
      requestId: `REQ-${Date.now().toString().slice(-6)}`,
      message:
        "Đã ghi nhận bản xem trước yêu cầu (chưa gắn env Supabase). Bạn có thể gửi trực tiếp thông tin này qua Zalo, Telegram hoặc Email.",
    };
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Không thể kết nối máy chủ dữ liệu." };
  }

  const { data: inserted, error } = await supabase
    .from("project_requests")
    .insert({
      service_package: parsed.data.servicePackage,
      customer_name: parsed.data.customerName,
      contact_channel: parsed.data.contactChannel,
      customer_contact: parsed.data.customerContact,
      budget_range: parsed.data.budgetRange,
      timeline: parsed.data.timeline,
      selected_features: parsed.data.selectedFeatures,
      description: parsed.data.description,
      reference_url: parsed.data.referenceUrl ?? null,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Insert project_request failed:", error?.message);
    return { ok: false, error: "Không thể gửi yêu cầu lúc này. Vui lòng liên hệ trực tiếp qua Zalo hoặc Email." };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    mode: "database",
    requestId: String(inserted.id),
    message: "Đã gửi yêu cầu làm web thành công! Tôi sẽ phản hồi báo giá và lộ trình chi tiết sớm nhất.",
  };
}
