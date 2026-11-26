import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Mail,
  MessageCircle,
  Puzzle,
  Send,
  Sparkles,
} from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { CatalogGridSkeleton } from "@/components/catalog-skeleton";
import { CopyCommandButton } from "@/components/copy-command-button";
import { FreeDownloadButton } from "@/components/free-download-button";
import { HeroVisualShowcase } from "@/components/hero-visual-showcase";
import {
  HeroEntrance,
  MotionFadeIn,
  ScrollStaggerGrid,
} from "@/components/motion-primitives";
import { ProjectEstimator } from "@/components/project-estimator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedItems } from "@/lib/data/catalog";
import { SITE_CONFIG } from "@/lib/site-config";

const WORKFLOW_STEPS = [
  {
    step: "Bước 01",
    title: "Chọn phạm vi & công nghệ",
    desc: "Tùy chỉnh loại web và tính năng cần có để ước tính ngay lộ trình phù hợp.",
  },
  {
    step: "Bước 02",
    title: "Trao đổi & Chốt giải pháp",
    desc: "Thống nhất giao diện, chức năng và tiến độ triển khai phù hợp nhu cầu thực tế.",
  },
  {
    step: "Bước 03",
    title: "Bàn giao & Deploy 0đ",
    desc: "Nhận source code qua GitHub và cấu hình chạy miễn phí trên Vercel + Supabase.",
  },
] as const;

async function FeaturedProjectsSection() {
  const items = await getPublishedItems({ kinds: ["project", "tool"] });
  const featured = items.slice(0, 3);

  return (
    <ScrollStaggerGrid className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featured.map((item) => (
        <CatalogCard key={item.id} item={item} />
      ))}
    </ScrollStaggerGrid>
  );
}

async function FeaturedSkillsDirectory() {
  const skills = await getPublishedItems({ kinds: ["skill", "plugin"] });
  const highlight = skills.find((s) => s.kind === "plugin") ?? skills[0];
  const listItems = skills.filter((s) => s.id !== highlight?.id).slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="divide-y divide-border rounded-2xl border border-border bg-card lg:col-span-7">
        {listItems.map((skill) => (
          <div
            key={skill.id}
            className="flex flex-col justify-between gap-3 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium shrink-0">
                  {skill.kind === "plugin" ? "Plugin" : "Skill"}
                </Badge>
                <Link
                  href={`/items/${skill.slug}`}
                  className="truncate font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {skill.title}
                </Link>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{skill.tagline}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {skill.install_command && (
                <CopyCommandButton text={skill.install_command} label="Copy lệnh" size="xs" />
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={`/items/${skill.slug}`}>Chi tiết</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {highlight && (
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-xs lg:col-span-5">
          <div className="relative aspect-video w-full border-b border-border bg-muted/30">
            <Image
              src="/images/hero-showcase.jpg"
              alt={highlight.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute left-3 top-3">
              <Badge className="gap-1.5 shadow-xs">
                <Puzzle className="size-3.5" />
                Gói nổi bật miễn phí
              </Badge>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {highlight.title}
                </h3>
                <span className="text-xs font-semibold tabular-nums text-primary shrink-0">
                  {highlight.downloads_count} lượt tải
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
              <ul className="space-y-1.5 pt-1 text-xs text-foreground">
                {highlight.features.slice(0, 3).map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 text-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
              <FreeDownloadButton
                slug={highlight.slug}
                initialCount={highlight.downloads_count}
                downloadUrl={highlight.download_url}
              />
              <Button asChild variant="outline" size="sm">
                <Link href={`/items/${highlight.slug}`}>
                  Xem tài liệu
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-10 pb-14 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:py-16">
            <HeroEntrance className="space-y-6 lg:col-span-5">
              <span className="hero-stagger inline-flex items-center rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                TP91tool Studio
              </span>
              <h1 className="hero-stagger text-4xl font-bold tracking-tight leading-[1.15] text-foreground sm:text-5xl">
                Dự án Web, Tool và Kho Skill sẵn sàng triển khai
              </h1>
              <p className="hero-stagger max-w-md text-base leading-relaxed text-muted-foreground">
                Mua dự án và tool hoàn chỉnh, tải skill miễn phí, hoặc đặt làm web theo yêu cầu.
              </p>
              <div className="hero-stagger flex flex-wrap items-center gap-3 pt-1">
                <Button asChild size="lg" className="active:scale-[0.97]">
                  <Link href="/services#request-form">
                    Đặt làm Web
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="active:scale-[0.97]">
                  <Link href="/marketplace">Khám phá Kho</Link>
                </Button>
              </div>
            </HeroEntrance>

            <div className="lg:col-span-7">
              <HeroVisualShowcase />
            </div>
          </div>
        </section>

        {/* Section 1: Featured Projects & Tools */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <MotionFadeIn className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Dự án & Tool nổi bật
              </h2>
              <p className="text-sm text-muted-foreground">
                Source code sạch, vận hành ổn định trên hạ tầng miễn phí Vercel Hobby và Supabase Free.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/marketplace">
                Xem toàn bộ kho
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </MotionFadeIn>

          <Suspense fallback={<CatalogGridSkeleton count={3} />}>
            <FeaturedProjectsSection />
          </Suspense>
        </section>

        {/* Section 2: Free Skills & Plugins Directory */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <MotionFadeIn className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <h2 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  <Sparkles className="size-6 text-primary" />
                  Kho Skill & Plugin miễn phí
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sao chép lệnh cài đặt hoặc đọc nhanh hướng dẫn SKILL.md cho Antigravity và Claude Code.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/skills">
                  Tất cả Skill & Plugin
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </MotionFadeIn>

            <Suspense fallback={<CatalogGridSkeleton count={2} />}>
              <FeaturedSkillsDirectory />
            </Suspense>
          </div>
        </section>

        {/* Section 3: Custom Web Service + 3 Steps + Scope Estimator */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <MotionFadeIn className="mb-10 space-y-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Nhận làm Web theo yêu cầu
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ước tính phạm vi & lộ trình trước khi đặt
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Tự chọn loại web và tính năng bên dưới để xem stack 100% miễn phí vận hành, thời gian bàn giao và mức ngân sách gợi ý.
            </p>
          </MotionFadeIn>

          <ScrollStaggerGrid className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="stagger-card rounded-2xl border border-border bg-card p-5"
              >
                <div className="text-xs font-semibold text-primary">{item.step}</div>
                <h3 className="mt-1.5 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </ScrollStaggerGrid>

          <ProjectEstimator />
        </section>

        {/* Section 4: Direct Contact Strip */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Kênh hỗ trợ & nhận đơn trực tiếp
              </h2>
            </div>
            <ScrollStaggerGrid className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {SITE_CONFIG.contacts.map((c) => {
                const Icon =
                  c.channel === "zalo"
                    ? MessageCircle
                    : c.channel === "telegram"
                      ? Send
                      : c.channel === "facebook"
                        ? Globe
                        : Mail;
                return (
                  <a
                    key={c.channel}
                    href={c.href}
                    target={c.channel === "email" ? undefined : "_blank"}
                    rel={c.channel === "email" ? undefined : "noopener noreferrer"}
                    className="stagger-card group flex items-center justify-between rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Icon className="size-4 text-primary shrink-0" />
                        {c.label}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {c.value}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary shrink-0" />
                  </a>
                );
              })}
            </ScrollStaggerGrid>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
