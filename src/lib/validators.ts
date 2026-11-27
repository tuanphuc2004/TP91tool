import { z } from "zod";
import { normalizePlatforms } from "./catalog-taxonomy";
import { SITE_CONFIG } from "./site-config";
import { isSuperAdminEmail } from "./supabase/auth";
import type { ScopeEstimateResult, ServicePackage } from "./types";

export const safeHttpUrlSchema = z
  .string()
  .trim()
  .url("URL không hợp lệ")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Chỉ chấp nhận đường dẫn http:// hoặc https://");

export const optionalSafeHttpUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))
  .pipe(safeHttpUrlSchema.optional());

export const contactChannelSchema = z.enum(["zalo", "telegram", "facebook", "email"]);

export const createOrderSchema = z.object({
  itemId: z.string().trim().min(1, "Thiếu thông tin sản phẩm").max(120),
  customerName: z.string().trim().min(2, "Vui lòng nhập tên (tối thiểu 2 ký tự)").max(100),
  contactChannel: contactChannelSchema,
  customerContact: z.string().trim().min(3, "Vui lòng nhập thông tin liên hệ").max(160),
  note: z.string().trim().max(1000).optional().default(""),
});

export const createProjectRequestSchema = z.object({
  servicePackage: z.enum(["landing", "ecommerce", "webapp", "tool", "custom"]),
  customerName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
  contactChannel: contactChannelSchema,
  customerContact: z.string().trim().min(3, "Vui lòng nhập Zalo / Telegram / Email").max(160),
  budgetRange: z.string().trim().min(1, "Vui lòng chọn mức ngân sách").max(60),
  timeline: z.string().trim().min(1, "Vui lòng chọn thời gian dự kiến").max(60),
  selectedFeatures: z.array(z.string().trim().max(60)).max(12).default([]),
  description: z.string().trim().min(15, "Vui lòng mô tả rõ yêu cầu (tối thiểu 15 ký tự)").max(3000),
  referenceUrl: optionalSafeHttpUrlSchema,
});

export const aiPlatformSchema = z.enum(["all", "gemini", "chatgpt", "claude"]);

export const adminPermissionSchema = z.enum(["catalog", "orders", "requests"]);

export const catalogItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug tối thiểu 2 ký tự")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ dùng chữ thường, số và dấu gạch ngang"),
  kind: z.enum(["project", "tool", "skill", "plugin"]),
  title: z.string().trim().min(2, "Tiêu đề tối thiểu 2 ký tự").max(120),
  tagline: z.string().trim().min(4, "Mô tả ngắn tối thiểu 4 ký tự").max(200),
  description: z.string().trim().min(10, "Mô tả chi tiết tối thiểu 10 ký tự").max(4000),
  price_vnd: z.number().int().min(0, "Giá không được âm").max(500_000_000),
  category: z.string().trim().min(2, "Vui lòng chọn danh mục").max(60),
  compatible_platforms: z
    .array(aiPlatformSchema)
    .max(4)
    .default([])
    .transform((vals) => normalizePlatforms(vals)),
  tech_stack: z.array(z.string().trim().min(1).max(40)).max(16).default([]),
  features: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
  demo_key: z
    .enum(["landing-showcase", "dashboard-tool", "skill-inspector", "project-estimator"])
    .nullable()
    .optional()
    .default(null),
  demo_url: optionalSafeHttpUrlSchema,
  install_command: z.string().trim().max(300).optional(),
  download_url: optionalSafeHttpUrlSchema,
  skill_markdown: z.string().max(30_000).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const adminUpsertSubAdminSchema = z.object({
  id: z.string().uuid().optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email không hợp lệ")
    .refine((email) => !isSuperAdminEmail(email), {
      message: "Không thể chỉnh sửa hoặc ghi đè tài khoản Super Admin cao nhất.",
    }),
  displayName: z.string().trim().max(80).optional().default(""),
  password: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined))
    .refine((val) => !val || val.length >= 6, {
      message: "Mật khẩu tạm tối thiểu 6 ký tự",
    }),
  permissions: z
    .array(adminPermissionSchema)
    .min(1, "Vui lòng chọn ít nhất 1 quyền quản trị")
    .max(3)
    .transform((vals) => Array.from(new Set(vals))),
  isActive: z.boolean().default(true),
});

export const orderStatusSchema = z.enum([
  "pending",
  "contacted",
  "paid",
  "delivered",
  "cancelled",
]);

export const requestStatusSchema = z.enum([
  "new",
  "reviewing",
  "quoted",
  "in_progress",
  "completed",
]);

export function estimateProjectScope(
  pkg: ServicePackage,
  selectedFeatures: string[]
): ScopeEstimateResult {
  const pkgInfo =
    SITE_CONFIG.servicePackages.find((p) => p.id === pkg) ?? SITE_CONFIG.servicePackages[0];

  const validFeatures = SITE_CONFIG.estimatorFeatures.filter((f) =>
    selectedFeatures.includes(f.id)
  );
  const extraDays = validFeatures.reduce((sum, f) => sum + f.extraDays, 0);
  const estimatedDays = pkgInfo.baseDays + extraDays;

  const stack = ["Next.js App Router", "Tailwind CSS v4 + shadcn/ui", "Vercel Hobby (Free)"];
  if (selectedFeatures.includes("auth") || selectedFeatures.includes("database")) {
    stack.push("Supabase Free (Postgres + Auth)");
  }
  if (selectedFeatures.includes("motion")) {
    stack.push("Motion (Framer Motion)");
  }

  let suggestedBudget: string = pkgInfo.defaultBudget;
  if (pkg !== "custom") {
    if (estimatedDays <= 5) suggestedBudget = "Dưới 2 triệu";
    else if (estimatedDays <= 11) suggestedBudget = "2 - 5 triệu";
    else if (estimatedDays <= 18) suggestedBudget = "5 - 10 triệu";
    else suggestedBudget = "Trên 10 triệu";
  }

  const deliverables = [
    `Source code sạch (${pkgInfo.name}) bàn giao qua GitHub`,
    "Cấu hình deploy tự động miễn phí trên Vercel Hobby",
    ...validFeatures.map((f) => f.label),
  ];

  return {
    stack,
    estimatedDays,
    suggestedBudget,
    deliverables,
  };
}
