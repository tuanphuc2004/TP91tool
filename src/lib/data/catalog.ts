import { normalizePlatforms } from "../catalog-taxonomy";
import { isAdminUser, isSuperAdminEmail, normalizeEmail } from "../supabase/auth";
import { SEED_CATALOG_ITEMS } from "./seed";
import { isSupabaseConfigured } from "../supabase/env";
import { createPublicSupabaseClient, createServerSupabaseClient } from "../supabase/server";
import type {
  AdminAccountRecord,
  AdminActor,
  AdminPermission,
  AiPlatform,
  CatalogItem,
  CatalogKind,
  DemoKey,
  OrderRecord,
  ProjectRequestRecord,
} from "../types";

export interface CatalogFilter {
  kinds?: CatalogKind[];
  pricing?: "all" | "free" | "paid";
  featuredOnly?: boolean;
  search?: string;
}

function normalizeCatalogRow(row: Record<string, unknown>): CatalogItem {
  const featuresRaw = row.features;
  const features = Array.isArray(featuresRaw)
    ? featuresRaw.filter((x): x is string => typeof x === "string")
    : [];
  const techRaw = row.tech_stack;
  const techStack = Array.isArray(techRaw)
    ? techRaw.filter((x): x is string => typeof x === "string")
    : [];
  const platformsRaw = row.compatible_platforms;
  const compatiblePlatforms = Array.isArray(platformsRaw)
    ? normalizePlatforms(
        platformsRaw.filter(
          (x): x is AiPlatform =>
            x === "all" || x === "gemini" || x === "chatgpt" || x === "claude"
        )
      )
    : [];

  return {
    id: String(row.id),
    slug: String(row.slug),
    kind: row.kind as CatalogKind,
    title: String(row.title),
    tagline: String(row.tagline),
    description: String(row.description),
    price_vnd: Number(row.price_vnd ?? 0),
    category: String(row.category),
    compatible_platforms: compatiblePlatforms,
    tech_stack: techStack,
    features,
    demo_key: (row.demo_key as DemoKey | null) ?? null,
    demo_url: row.demo_url ? String(row.demo_url) : null,
    banner_url: row.banner_url ? String(row.banner_url) : null,
    install_command: row.install_command ? String(row.install_command) : null,
    download_url: row.download_url ? String(row.download_url) : null,
    skill_markdown: row.skill_markdown ? String(row.skill_markdown) : null,
    downloads_count: Number(row.downloads_count ?? 0),
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function filterItems(items: CatalogItem[], filter?: CatalogFilter): CatalogItem[] {
  if (!filter) return items;
  return items.filter((item) => {
    if (filter.kinds && filter.kinds.length > 0 && !filter.kinds.includes(item.kind)) {
      return false;
    }
    if (filter.pricing === "free" && item.price_vnd !== 0) return false;
    if (filter.pricing === "paid" && item.price_vnd === 0) return false;
    if (filter.featuredOnly && !item.featured) return false;
    if (filter.search && filter.search.trim().length > 0) {
      const q = filter.search.trim().toLowerCase();
      const hay = `${item.title} ${item.tagline} ${item.category} ${item.tech_stack.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export async function getPublishedItems(filter?: CatalogFilter): Promise<CatalogItem[]> {
  if (!isSupabaseConfigured()) {
    return filterItems(
      SEED_CATALOG_ITEMS.filter((i) => i.published),
      filter
    );
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return filterItems(SEED_CATALOG_ITEMS, filter);
  }

  let query = supabase
    .from("catalog_items")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter?.kinds && filter.kinds.length > 0) {
    query = query.in("kind", filter.kinds);
  }
  if (filter?.featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Failed to fetch catalog_items from Supabase, using seed fallback:", error?.message);
    return filterItems(SEED_CATALOG_ITEMS, filter);
  }

  const normalized = data.map((row) => normalizeCatalogRow(row as Record<string, unknown>));
  return filterItems(normalized, { pricing: filter?.pricing, search: filter?.search });
}

export async function getItemBySlug(slug: string): Promise<CatalogItem | null> {
  if (!isSupabaseConfigured()) {
    return SEED_CATALOG_ITEMS.find((item) => item.slug === slug && item.published) ?? null;
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return SEED_CATALOG_ITEMS.find((item) => item.slug === slug && item.published) ?? null;
  }

  const { data, error } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return normalizeCatalogRow(data as Record<string, unknown>);
}

export async function getAllItemsForAdmin(): Promise<CatalogItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("catalog_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => normalizeCatalogRow(row as Record<string, unknown>));
}

export async function getOrdersForAdmin(): Promise<OrderRecord[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as OrderRecord[];
}

export async function getProjectRequestsForAdmin(): Promise<ProjectRequestRecord[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("project_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as ProjectRequestRecord[];
}

const VALID_PERMISSIONS: readonly AdminPermission[] = ["catalog", "orders", "requests"];

export async function getCurrentAdminActor(): Promise<AdminActor | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const email = normalizeEmail(user.email);
  if (isSuperAdminEmail(email)) {
    return {
      userId: user.id,
      email,
      isSuperAdmin: true,
      permissions: ["catalog", "orders", "requests"],
      canManageAdmins: true,
    };
  }

  const { data: account, error: dbError } = await supabase
    .from("admin_accounts")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (dbError) {
    // Graceful fallback before migration 002 is executed
    if (isAdminUser(user)) {
      return {
        userId: user.id,
        email,
        isSuperAdmin: false,
        permissions: ["catalog", "orders", "requests"],
        canManageAdmins: false,
      };
    }
    return null;
  }

  if (!account || !account.is_active) {
    return null;
  }

  const rawPerms = Array.isArray(account.permissions) ? account.permissions : [];
  const permissions = rawPerms.filter((p: unknown): p is AdminPermission =>
    VALID_PERMISSIONS.includes(p as AdminPermission)
  );
  if (permissions.length === 0) return null;

  return {
    userId: user.id,
    email,
    isSuperAdmin: false,
    permissions,
    canManageAdmins: false,
  };
}

export async function getAdminAccountsForSuperAdmin(): Promise<{
  accounts: AdminAccountRecord[];
  migrationReady: boolean;
}> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { accounts: [], migrationReady: false };

  const { data, error } = await supabase
    .from("admin_accounts")
    .select("*")
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return { accounts: [], migrationReady: false };
  }

  const accounts: AdminAccountRecord[] = data.map((row) => ({
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    email: String(row.email),
    display_name: row.display_name ? String(row.display_name) : null,
    role: row.role === "super_admin" ? "super_admin" : "admin",
    permissions: Array.isArray(row.permissions)
      ? row.permissions.filter((p: unknown): p is AdminPermission =>
          VALID_PERMISSIONS.includes(p as AdminPermission)
        )
      : [],
    is_active: Boolean(row.is_active),
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }));

  return { accounts, migrationReady: true };
}
