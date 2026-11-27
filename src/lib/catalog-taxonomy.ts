import type { AdminPermission, AiPlatform, CatalogKind } from "./types";

export const KIND_LABELS: Record<CatalogKind, string> = {
  project: "Dự án Web",
  tool: "Tool",
  skill: "Skill",
  plugin: "Plugin",
};

export const CATEGORY_OPTIONS_BY_KIND: Record<CatalogKind, readonly string[]> = {
  project: [
    "Web Bán Hàng",
    "Landing Page",
    "Web App / SaaS",
    "Web Dịch Vụ",
    "Portfolio / Blog",
    "Hệ thống Quản trị",
  ],
  tool: [
    "Dev Tool",
    "Tool Quản Lý",
    "Tự động hóa",
    "Xử lý dữ liệu",
    "Tiện ích trình duyệt",
  ],
  skill: [
    "Frontend & UI",
    "Backend & DB",
    "Database & Auth",
    "SEO & Nội dung",
    "Testing & QA",
    "DevOps & Deploy",
    "Prompt & Workflow",
  ],
  plugin: [
    "Plugin Bundle",
    "SEO & Growth",
    "AI Agent Plugin",
    "IDE / CLI Extension",
    "Tích hợp API",
  ],
};

export const AI_PLATFORM_OPTIONS: ReadonlyArray<{
  id: AiPlatform;
  label: string;
  shortLabel: string;
}> = [
  { id: "all", label: "Tất cả (Gemini, ChatGPT, Claude)", shortLabel: "Tất cả AI" },
  { id: "gemini", label: "Gemini", shortLabel: "Gemini" },
  { id: "chatgpt", label: "ChatGPT", shortLabel: "ChatGPT" },
  { id: "claude", label: "Claude", shortLabel: "Claude" },
];

export const ADMIN_PERMISSION_OPTIONS: ReadonlyArray<{
  id: AdminPermission;
  label: string;
  description: string;
}> = [
  {
    id: "catalog",
    label: "Quản lý Sản phẩm, Tool, Skill & Plugin",
    description: "Thêm, sửa, xóa và phân loại danh mục hiển thị.",
  },
  {
    id: "orders",
    label: "Quản lý Đơn mua",
    description: "Xem thông tin đơn hàng và cập nhật trạng thái xử lý.",
  },
  {
    id: "requests",
    label: "Quản lý Yêu cầu làm Web",
    description: "Xem brief dự án của khách và cập nhật tiến độ báo giá.",
  },
];

const INDIVIDUAL_PLATFORMS: readonly AiPlatform[] = ["gemini", "chatgpt", "claude"];

export function getCategoryOptionsForKind(
  kind: CatalogKind,
  currentCategory?: string | null
): string[] {
  const presets = [...CATEGORY_OPTIONS_BY_KIND[kind]];
  const cleanCurrent = currentCategory?.trim();
  if (cleanCurrent && !presets.includes(cleanCurrent)) {
    presets.unshift(cleanCurrent);
  }
  return presets;
}

export function normalizePlatforms(input: readonly AiPlatform[]): AiPlatform[] {
  if (!input || input.length === 0) return [];
  const unique = new Set<AiPlatform>(input);
  if (unique.has("all")) {
    return ["all"];
  }
  const ordered = INDIVIDUAL_PLATFORMS.filter((p) => unique.has(p));
  if (ordered.length === INDIVIDUAL_PLATFORMS.length) {
    return ["all"];
  }
  return ordered;
}

export function matchesPlatformFilter(
  itemPlatforms: readonly AiPlatform[],
  filter: "all" | AiPlatform
): boolean {
  if (filter === "all") return true;
  if (itemPlatforms.includes("all")) return true;
  return itemPlatforms.includes(filter);
}

export function formatPlatformLabels(platforms: readonly AiPlatform[]): string[] {
  const normalized = normalizePlatforms(platforms);
  if (normalized.length === 0) return [];
  if (normalized.includes("all")) return ["Tất cả AI"];
  return normalized.map(
    (id) => AI_PLATFORM_OPTIONS.find((opt) => opt.id === id)?.shortLabel ?? id
  );
}

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
