"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  catalogItemInputSchema,
  orderStatusSchema,
  requestStatusSchema,
} from "@/lib/validators";

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Chưa cấu hình biến môi trường Supabase." };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false as const, error: "Không thể khởi tạo Supabase server client." };
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminUser(user)) {
    return { ok: false as const, error: "Bạn không có quyền quản trị (yêu cầu role admin)." };
  }
  return { ok: true as const, supabase, user };
}

export async function adminUpsertItemAction(
  rawInput: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = catalogItemInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu sản phẩm chưa hợp lệ." };
  }

  const payload = {
    slug: parsed.data.slug,
    kind: parsed.data.kind,
    title: parsed.data.title,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    price_vnd: parsed.data.price_vnd,
    category: parsed.data.category,
    tech_stack: parsed.data.tech_stack,
    features: parsed.data.features,
    demo_key: parsed.data.demo_key,
    demo_url: parsed.data.demo_url ?? null,
    install_command: parsed.data.install_command || null,
    download_url: parsed.data.download_url ?? null,
    skill_markdown: parsed.data.skill_markdown || null,
    featured: parsed.data.featured,
    published: parsed.data.published,
  };

  if (parsed.data.id) {
    const { error } = await auth.supabase
      .from("catalog_items")
      .update(payload)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("Admin update item failed:", error.message);
      return { ok: false, error: "Không thể cập nhật mục này (kiểm tra trùng slug hoặc quyền RLS)." };
    }
  } else {
    const { error } = await auth.supabase.from("catalog_items").insert(payload);
    if (error) {
      console.error("Admin insert item failed:", error.message);
      return { ok: false, error: "Không thể tạo mới mục này (kiểm tra trùng slug hoặc quyền RLS)." };
    }
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/skills");
  revalidatePath("/admin");
  revalidatePath(`/items/${parsed.data.slug}`);
  return { ok: true };
}

export async function adminDeleteItemAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "ID không hợp lệ." };
  }

  const { error } = await auth.supabase.from("catalog_items").delete().eq("id", id);
  if (error) {
    console.error("Admin delete item failed:", error.message);
    return { ok: false, error: "Không thể xóa mục này." };
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/skills");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminUpdateOrderStatusAction(
  id: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "Mã đơn không hợp lệ." };
  }
  const parsedStatus = orderStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { ok: false, error: "Trạng thái đơn không hợp lệ." };
  }

  const { error } = await auth.supabase
    .from("orders")
    .update({ status: parsedStatus.data })
    .eq("id", id);

  if (error) {
    console.error("Update order status failed:", error.message);
    return { ok: false, error: "Không thể cập nhật trạng thái đơn." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminUpdateRequestStatusAction(
  id: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "Mã yêu cầu không hợp lệ." };
  }
  const parsedStatus = requestStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { ok: false, error: "Trạng thái yêu cầu không hợp lệ." };
  }

  const { error } = await auth.supabase
    .from("project_requests")
    .update({ status: parsedStatus.data })
    .eq("id", id);

  if (error) {
    console.error("Update request status failed:", error.message);
    return { ok: false, error: "Không thể cập nhật trạng thái yêu cầu." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminSignOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
