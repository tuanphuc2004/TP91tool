"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentAdminActor } from "@/lib/data/catalog";
import {
  canManageTargetAdmin,
  hasAdminPermission,
  isSuperAdminEmail,
} from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import type { AdminPermission } from "@/lib/types";
import {
  adminUpsertSubAdminSchema,
  catalogItemInputSchema,
  orderStatusSchema,
  requestStatusSchema,
} from "@/lib/validators";

async function requirePermission(permission: AdminPermission | "manage_admins") {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Chưa cấu hình biến môi trường Supabase." };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false as const, error: "Không thể khởi tạo Supabase server client." };
  }

  const actor = await getCurrentAdminActor();
  if (!actor) {
    return { ok: false as const, error: "Bạn không có quyền quản trị hệ thống." };
  }

  if (permission === "manage_admins") {
    if (!actor.isSuperAdmin) {
      return {
        ok: false as const,
        error: "Chỉ tài khoản Super Admin cao nhất mới có quyền quản lý phân quyền Admin.",
      };
    }
  } else if (!hasAdminPermission(actor, permission)) {
    return {
      ok: false as const,
      error: "Tài khoản của bạn chưa được cấp quyền thao tác mục này.",
    };
  }

  return { ok: true as const, supabase, actor };
}

export async function adminUpsertItemAction(
  rawInput: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requirePermission("catalog");
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
    compatible_platforms: parsed.data.compatible_platforms,
    tech_stack: parsed.data.tech_stack,
    features: parsed.data.features,
    demo_key: parsed.data.demo_key,
    demo_url: parsed.data.demo_url ?? null,
    banner_url: parsed.data.banner_url ?? null,
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
      if (error.message.includes("compatible_platforms")) {
        return {
          ok: false,
          error:
            "Cơ sở dữ liệu chưa chạy migration 002_taxonomy_and_admin_rbac.sql (thiếu cột compatible_platforms).",
        };
      }
      return { ok: false, error: "Không thể cập nhật mục này (kiểm tra trùng slug hoặc quyền RLS)." };
    }
  } else {
    const { error } = await auth.supabase.from("catalog_items").insert(payload);
    if (error) {
      console.error("Admin insert item failed:", error.message);
      if (error.message.includes("compatible_platforms")) {
        return {
          ok: false,
          error:
            "Cơ sở dữ liệu chưa chạy migration 002_taxonomy_and_admin_rbac.sql (thiếu cột compatible_platforms).",
        };
      }
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
  const auth = await requirePermission("catalog");
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
  const auth = await requirePermission("orders");
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
  const auth = await requirePermission("requests");
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

export async function adminUpsertSubAdminAction(
  rawInput: unknown
): Promise<{ ok: true; notice?: string } | { ok: false; error: string }> {
  const auth = await requirePermission("manage_admins");
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = adminUpsertSubAdminSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dữ liệu tài khoản admin chưa hợp lệ.",
    };
  }

  if (!canManageTargetAdmin(auth.actor.email, parsed.data.email)) {
    return {
      ok: false,
      error: "Không thể chỉnh sửa hoặc ghi đè quyền tài khoản Super Admin cao nhất.",
    };
  }

  const serviceClient = createServiceRoleSupabaseClient();
  let createdUserId: string | null = null;
  let notice: string | undefined;

  if (parsed.data.id) {
    const { data: existing, error: fetchError } = await auth.supabase
      .from("admin_accounts")
      .select("id, email, role")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (fetchError || !existing) {
      return { ok: false, error: "Không tìm thấy tài khoản admin cần cập nhật." };
    }
    if (isSuperAdminEmail(String(existing.email)) || existing.role === "super_admin") {
      return {
        ok: false,
        error: "Tài khoản Super Admin cao nhất được bảo vệ, không thể sửa đổi.",
      };
    }

    const { error: updateError } = await auth.supabase
      .from("admin_accounts")
      .update({
        display_name: parsed.data.displayName || null,
        permissions: parsed.data.permissions,
        is_active: parsed.data.isActive,
      })
      .eq("id", parsed.data.id);

    if (updateError) {
      console.error("Update sub-admin failed:", updateError.message);
      return { ok: false, error: "Không thể cập nhật quyền admin." };
    }

    revalidatePath("/admin");
    return { ok: true };
  }

  if (parsed.data.password) {
    if (!serviceClient) {
      return {
        ok: false,
        error:
          "Server chưa gắn SUPABASE_SERVICE_ROLE_KEY nên chưa thể tạo mật khẩu trực tiếp. Bạn có thể bỏ trống ô mật khẩu để cấp quyền cho email đã đăng ký qua /login.",
      };
    }

    const { data: created, error: createUserError } = await serviceClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: parsed.data.displayName
        ? { display_name: parsed.data.displayName }
        : undefined,
    });

    if (createUserError) {
      const msg = createUserError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        notice =
          "Email này đã tồn tại tài khoản đăng nhập trước đó nên giữ nguyên mật khẩu cũ và đã cập nhật quyền Admin.";
      } else {
        console.error("Create sub-admin auth user failed:", createUserError.message);
        return {
          ok: false,
          error: `Không thể tạo tài khoản đăng nhập: ${createUserError.message}`,
        };
      }
    } else if (created.user) {
      createdUserId = created.user.id;
      notice = `Đã tạo tài khoản Admin mới cho ${parsed.data.email}.`;
    }
  } else {
    notice = `Đã cấp quyền Admin cho ${parsed.data.email} (đăng nhập bằng tài khoản đã đăng ký tại /login).`;
  }

  const { error: upsertError } = await auth.supabase.from("admin_accounts").upsert(
    {
      email: parsed.data.email,
      display_name: parsed.data.displayName || null,
      role: "admin",
      permissions: parsed.data.permissions,
      is_active: parsed.data.isActive,
      created_by: auth.actor.email,
      ...(createdUserId ? { user_id: createdUserId } : {}),
    },
    { onConflict: "email" }
  );

  if (upsertError) {
    console.error("Upsert admin_accounts failed:", upsertError.message);
    return {
      ok: false,
      error:
        "Không thể lưu phân quyền Admin (kiểm tra đã chạy migration 002_taxonomy_and_admin_rbac.sql chưa).",
    };
  }

  revalidatePath("/admin");
  return { ok: true, notice };
}

export async function adminDeleteSubAdminAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requirePermission("manage_admins");
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "ID tài khoản không hợp lệ." };
  }

  const { data: target, error: fetchError } = await auth.supabase
    .from("admin_accounts")
    .select("id, user_id, email, role")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !target) {
    return { ok: false, error: "Không tìm thấy tài khoản admin cần xóa." };
  }

  if (
    !canManageTargetAdmin(auth.actor.email, String(target.email)) ||
    target.role === "super_admin"
  ) {
    return {
      ok: false,
      error: "Không thể xóa tài khoản Super Admin cao nhất.",
    };
  }

  const { error: deleteError } = await auth.supabase
    .from("admin_accounts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Delete sub-admin failed:", deleteError.message);
    return { ok: false, error: "Không thể xóa tài khoản admin này." };
  }

  const serviceClient = createServiceRoleSupabaseClient();
  if (serviceClient && target.user_id) {
    await serviceClient.auth.admin
      .updateUserById(String(target.user_id), { app_metadata: { role: null } })
      .catch(() => null);
  }

  revalidatePath("/admin");
  return { ok: true };
}

const ALLOWED_BANNER_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_BANNER_BYTES = 5 * 1024 * 1024;

export async function adminUploadBannerAction(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const auth = await requirePermission("catalog");
  if (!auth.ok) return { ok: false, error: auth.error };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Không tìm thấy tệp ảnh hợp lệ." };
  }

  const ext = ALLOWED_BANNER_MIME[file.type];
  if (!ext) {
    return {
      ok: false,
      error: "Chỉ hỗ trợ ảnh JPG, PNG, WebP, GIF hoặc SVG.",
    };
  }

  if (file.size <= 0 || file.size > MAX_BANNER_BYTES) {
    return { ok: false, error: "Dung lượng ảnh tối đa là 5MB." };
  }

  const rawSlug = String(formData.get("slug") ?? "banner")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const safeBase = rawSlug || "banner";
  const path = `banners/${Date.now()}-${safeBase}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const storageClient = createServiceRoleSupabaseClient() ?? auth.supabase;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await storageClient.storage
    .from("catalog-banners")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload banner failed:", uploadError.message);
    return {
      ok: false,
      error: `Không thể tải ảnh lên Supabase Storage: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = storageClient.storage.from("catalog-banners").getPublicUrl(path);

  return { ok: true, url: publicUrl };
}

export async function adminSignOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
