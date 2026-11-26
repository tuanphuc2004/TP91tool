import type { CatalogItem } from "../types";

export const SEED_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    slug: "nextjs-store-starter",
    kind: "project",
    title: "TP91 Commerce Starter",
    tagline: "Mẫu web bán hàng & giới thiệu sản phẩm tối ưu tốc độ trên Vercel Hobby.",
    description:
      "Bộ source code Next.js App Router hoàn chỉnh dành cho shop bán sản phẩm số hoặc dịch vụ. Tích hợp sẵn lọc danh mục, trang chi tiết, modal đặt đơn nhanh và cấu trúc chuẩn SEO.",
    price_vnd: 490000,
    category: "Web Bán Hàng",
    tech_stack: ["Next.js 16", "TypeScript", "Tailwind v4", "shadcn/ui", "Supabase"],
    features: [
      "Lọc theo danh mục và tìm kiếm tức thì không reload trang",
      "Modal đặt mua lưu đơn trực tiếp về Supabase Postgres",
      "Trang quản trị CRUD sản phẩm và duyệt trạng thái đơn hàng",
      "Tối ưu 100% cho gói miễn phí Vercel Hobby & Supabase Free",
    ],
    demo_key: "landing-showcase",
    demo_url: "/services?demo=landing-showcase",
    install_command: null,
    download_url: null,
    skill_markdown: null,
    downloads_count: 14,
    featured: true,
    published: true,
    created_at: "2026-11-20T08:00:00.000Z",
    updated_at: "2026-11-20T08:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    slug: "mini-pos-export-tool",
    kind: "tool",
    title: "Mini POS & Export CSV/JSON",
    tagline: "Công cụ quản lý đơn nhanh trên trình duyệt, lọc chỉ số và xuất báo cáo tức thì.",
    description:
      "Tiện ích web nhẹ giúp chủ shop hoặc freelancer theo dõi doanh thu, tìm kiếm đơn theo trạng thái và xuất file CSV/JSON ngay trên trình duyệt mà không cần cài phần mềm nặng.",
    price_vnd: 290000,
    category: "Tool Quản Lý",
    tech_stack: ["React 19", "TypeScript", "Tailwind CSS", "Client Export"],
    features: [
      "Tìm kiếm, lọc trạng thái và tính tổng doanh thu theo thời gian thực",
      "Thêm nhanh bản ghi mẫu và kiểm tra dữ liệu ngay trên UI",
      "Xuất file CSV (UTF-8 cho Excel) và JSON chỉ với 1 lần bấm",
      "Chạy hoàn toàn trên browser, dễ nhúng vào hệ thống có sẵn",
    ],
    demo_key: "dashboard-tool",
    demo_url: "/services?demo=dashboard-tool",
    install_command: null,
    download_url: null,
    skill_markdown: null,
    downloads_count: 28,
    featured: true,
    published: true,
    created_at: "2026-11-21T08:00:00.000Z",
    updated_at: "2026-11-21T08:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111103",
    slug: "skill-frontmatter-linter",
    kind: "tool",
    title: "SKILL.md Inspector CLI & Web",
    tagline: "Kiểm tra cấu trúc YAML frontmatter của skill trước khi đóng gói vào plugin.",
    description:
      "Công cụ miễn phí giúp kiểm tra file SKILL.md theo chuẩn Antigravity và Claude Code: rà soát tên thư mục, trường description, độ dài nội dung và sinh lệnh cài đặt chuẩn.",
    price_vnd: 0,
    category: "Dev Tool",
    tech_stack: ["TypeScript", "Zod", "Node.js"],
    features: [
      "Kiểm tra frontmatter name & description chuẩn Antigravity / Claude",
      "Cảnh báo thiếu tiêu đề, sai định dạng kebab-case hoặc thiếu hướng dẫn",
      "Dùng thử trực tiếp ngay trong trình duyệt ở tab Demo",
    ],
    demo_key: "skill-inspector",
    demo_url: "/services?demo=skill-inspector",
    install_command: "npx tsx scripts/check-skills.ts",
    download_url: "https://github.com/tuanphuc2004/TP91tool",
    skill_markdown: null,
    downloads_count: 86,
    featured: true,
    published: true,
    created_at: "2026-11-22T08:00:00.000Z",
    updated_at: "2026-11-22T08:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111104",
    slug: "design-taste-frontend",
    kind: "skill",
    title: "Design Taste Frontend",
    tagline: "Skill hướng dẫn thiết kế giao diện tinh gọn, tránh lỗi bố cục và font mặc định AI.",
    description:
      "Bộ quy tắc thiết kế landing page và portfolio giúp AI đọc đúng ngữ cảnh sản phẩm, khóa bảng màu nhất quán, giữ hero gọn trong viewport và tránh các lỗi UI rập khuôn.",
    price_vnd: 0,
    category: "Frontend & UI",
    tech_stack: ["SKILL.md", "Tailwind v4", "Next.js", "Motion"],
    features: [
      "Bộ kiểm tra Pre-Flight trước khi bàn giao giao diện",
      "Quy tắc cân đối mật độ chữ, khoảng trắng và tỷ lệ tương phản WCAG AA",
      "Tương thích cả Antigravity và Claude Code",
    ],
    demo_key: null,
    demo_url: null,
    install_command: "mkdir -p ~/.gemini/config/skills/design-taste-frontend && curl -sL https://github.com/tuanphuc2004/TP91tool -o SKILL.md",
    download_url: "https://github.com/tuanphuc2004/TP91tool",
    skill_markdown: `---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and clean storefronts.
---

# Design Taste Frontend

1. Khai báo Design Read trước khi viết code.
2. Giữ một hệ màu chủ đạo nhất quán trên toàn trang.
3. Đảm bảo Hero nằm gọn trong 100dvh đầu tiên với tối đa 4 khối chữ.
4. Dùng dữ liệu và demo tương tác thật thay cho khung giả lập tĩnh.`,
    downloads_count: 142,
    featured: true,
    published: true,
    created_at: "2026-11-22T09:00:00.000Z",
    updated_at: "2026-11-22T09:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111105",
    slug: "nextjs-supabase-free-starter",
    kind: "skill",
    title: "Next.js + Supabase Free Guide",
    tagline: "Skill chuẩn hóa kết nối SSR, RLS và bảo mật app_metadata trên gói miễn phí.",
    description:
      "Tổng hợp các mẫu code thực chiến cho Next.js 16 (proxy.ts + getClaims) kết hợp Supabase Free Postgres, bảo vệ admin qua app_metadata và fallback dữ liệu mẫu khi chưa gắn env.",
    price_vnd: 0,
    category: "Backend & DB",
    tech_stack: ["SKILL.md", "Next.js 16", "Supabase RLS", "@supabase/ssr"],
    features: [
      "Mẫu proxy.ts làm mới session SSR an toàn bằng getClaims()",
      "Checklist RLS tránh lỗ hổng phân quyền bằng user_metadata",
      "Tách biệt Server Action xác thực giá và đầu vào bằng Zod",
    ],
    demo_key: null,
    demo_url: null,
    install_command: "cp -r skills/supabase ~/.gemini/config/skills/supabase",
    download_url: "https://github.com/tuanphuc2004/TP91tool",
    skill_markdown: `---
name: nextjs-supabase-free-starter
description: Guidelines for Next.js 16 App Router with Supabase Free SSR, proxy.ts, and strict RLS.
---

# Next.js + Supabase Free Checklist

- Luôn bật RLS trên mọi bảng trong schema public.
- Không bao giờ dùng user_metadata để kiểm tra quyền admin; chỉ dùng app_metadata.
- Không để lộ SUPABASE_SERVICE_ROLE_KEY ra client bundle.`,
    downloads_count: 118,
    featured: true,
    published: true,
    created_at: "2026-11-23T08:00:00.000Z",
    updated_at: "2026-11-23T08:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111106",
    slug: "tp91-migrated-skills-bundle",
    kind: "plugin",
    title: "TP91 Dev & Deploy Plugin Pack",
    tagline: "Gói plugin tổng hợp các skill Next.js, shadcn/ui, Supabase, Vercel CLI và Git Workflow.",
    description:
      "Plugin đóng gói sẵn cấu trúc plugin.json để cài một lần vào Antigravity hoặc Claude Code, giúp AI tự động kích hoạt đúng quy trình từ brainstorm, thiết kế giao diện đến deploy Vercel.",
    price_vnd: 0,
    category: "Plugin Bundle",
    tech_stack: ["plugin.json", "Antigravity Plugin", "Vercel CLI", "Git"],
    features: [
      "Bật hoặc tắt cả bộ kỹ năng chỉ với 1 công tắc trong Customizations",
      "Chuẩn hóa cấu trúc thư mục skills/ và manifest plugin.json",
      "Miễn phí hoàn toàn cho cộng đồng dev Việt Nam",
    ],
    demo_key: "skill-inspector",
    demo_url: "/services?demo=skill-inspector",
    install_command: "git clone https://github.com/tuanphuc2004/TP91tool.git",
    download_url: "https://github.com/tuanphuc2004/TP91tool",
    skill_markdown: `---
name: tp91-migrated-skills-bundle
description: Plugin bundle combining Next.js, shadcn/ui, Supabase, and Vercel CLI workflows.
---

# TP91 Dev & Deploy Plugin Pack

Đặt thư mục plugin vào ~/.gemini/config/plugins/<ten-plugin>/ kèm file plugin.json hợp lệ để Antigravity tự động nạp ở lượt tiếp theo.`,
    downloads_count: 205,
    featured: true,
    published: true,
    created_at: "2026-11-24T08:00:00.000Z",
    updated_at: "2026-11-24T08:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111107",
    slug: "saas-booking-kit",
    kind: "project",
    title: "Booking & Scope Estimator Portal",
    tagline: "Cổng nhận yêu cầu làm web có bộ ước tính phạm vi, stack và thời gian hoàn thành.",
    description:
      "Dự án web dành cho freelancer hoặc studio nhỏ: khách hàng tự chọn gói dịch vụ, tích năng cần thiết, xem ước tính ngày làm và gửi brief trực tiếp vào trang quản trị.",
    price_vnd: 790000,
    category: "Web Dịch Vụ",
    tech_stack: ["Next.js 16", "shadcn/ui", "Zod", "Supabase"],
    features: [
      "Bộ tính phạm vi và stack đề xuất theo từng lựa chọn của khách",
      "Đồng bộ dữ liệu từ bộ ước tính sang form gửi yêu cầu",
      "Lưu lịch sử yêu cầu và đổi trạng thái xử lý trong Admin",
    ],
    demo_key: "project-estimator",
    demo_url: "/services?demo=project-estimator",
    install_command: null,
    download_url: null,
    skill_markdown: null,
    downloads_count: 19,
    featured: false,
    published: true,
    created_at: "2026-11-24T10:00:00.000Z",
    updated_at: "2026-11-24T10:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111108",
    slug: "seo-checklist-plugin",
    kind: "plugin",
    title: "SEO Technical & Sitemap Kit",
    tagline: "Plugin kiểm tra meta tags, OpenGraph, sitemap và cấu trúc heading cho Next.js.",
    description:
      "Bộ skill và checklist giúp rà soát nhanh SEO kỹ thuật trước khi đưa website lên production trên Vercel: metadata động, canonical URL, sitemap.xml và tốc độ Core Web Vitals.",
    price_vnd: 0,
    category: "SEO & Growth",
    tech_stack: ["Next.js Metadata", "Sitemap", "Schema.org"],
    features: [
      "Checklist kiểm tra title, description, robots và canonical",
      "Mẫu cấu hình metadata động chuẩn App Router",
      "Dễ tích hợp vào bất kỳ dự án React/Next.js nào",
    ],
    demo_key: null,
    demo_url: null,
    install_command: "npx tsx scripts/seo-audit.ts",
    download_url: "https://github.com/tuanphuc2004/TP91tool",
    skill_markdown: `---
name: seo-checklist-plugin
description: Technical SEO checklist for Next.js metadata, sitemaps, and Core Web Vitals.
---

# SEO Technical & Sitemap Kit

1. Thiết lập metadataBase và generateMetadata cho mọi route chi tiết.
2. Kiểm tra đầy đủ thẻ H1 duy nhất trên mỗi trang.
3. Đảm bảo ảnh dùng next/image hoặc kích thước rõ ràng để tránh CLS.`,
    downloads_count: 74,
    featured: false,
    published: true,
    created_at: "2026-11-25T08:00:00.000Z",
    updated_at: "2026-11-25T08:00:00.000Z",
  },
];
