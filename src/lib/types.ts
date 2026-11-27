export type CatalogKind = "project" | "tool" | "skill" | "plugin";

export type AiPlatform = "all" | "gemini" | "chatgpt" | "claude";

export type AdminRole = "super_admin" | "admin";

export type AdminPermission = "catalog" | "orders" | "requests";

export interface AdminAccountRecord {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: AdminRole;
  permissions: readonly AdminPermission[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminActor {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: readonly AdminPermission[];
  canManageAdmins: boolean;
}

export type DemoKey =
  | "landing-showcase"
  | "dashboard-tool"
  | "skill-inspector"
  | "project-estimator";

export type ContactChannel = "zalo" | "telegram" | "facebook" | "email";

export type OrderStatus =
  | "pending"
  | "contacted"
  | "paid"
  | "delivered"
  | "cancelled";

export type ServicePackage =
  | "landing"
  | "ecommerce"
  | "webapp"
  | "tool"
  | "custom";

export type RequestStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "in_progress"
  | "completed";

export interface CatalogItem {
  id: string;
  slug: string;
  kind: CatalogKind;
  title: string;
  tagline: string;
  description: string;
  price_vnd: number;
  category: string;
  compatible_platforms: AiPlatform[];
  tech_stack: string[];
  features: string[];
  demo_key: DemoKey | null;
  demo_url: string | null;
  install_command: string | null;
  download_url: string | null;
  skill_markdown: string | null;
  downloads_count: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRecord {
  id: string;
  item_id: string | null;
  item_title: string;
  amount_vnd: number;
  customer_name: string;
  contact_channel: ContactChannel;
  customer_contact: string;
  note: string | null;
  status: OrderStatus;
  created_at: string;
}

export interface ProjectRequestRecord {
  id: string;
  service_package: ServicePackage;
  customer_name: string;
  contact_channel: ContactChannel;
  customer_contact: string;
  budget_range: string;
  timeline: string;
  selected_features: string[];
  description: string;
  reference_url: string | null;
  status: RequestStatus;
  created_at: string;
}

export interface ScopeEstimateResult {
  stack: string[];
  estimatedDays: number;
  suggestedBudget: string;
  deliverables: string[];
}
