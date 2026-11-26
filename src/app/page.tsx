import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Mail, MessageCircle, Puzzle, Send, Globe, Sparkles } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { CatalogGridSkeleton } from "@/components/catalog-skeleton";
import { CopyCommandButton } from "@/components/copy-command-button";
import { ProjectEstimatorDemo } from "@/components/demos/project-estimator-demo";
import { FreeDownloadButton } from "@/components/free-download-button";
import { HeroDemoSwitcher } from "@/components/hero-demo-switcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedItems } from "@/lib/data/catalog";
import { SITE_CONFIG } from "@/lib/site-config";

async function FeaturedProjectsSection() {
  const items = await getPublishedItems({ kinds: ["project", "tool"] });
  const featured = items.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featured.map((item) => (
        <CatalogCard key={item.id} item={item} />
      ))}
    </div>
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
            className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {skill.kind === "plugin" ? "Plugin" : "Skill"}
                </Badge>
                <Link
                  href={`/items/${skill.slug}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
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
                <Link href={`/items/${skill.slug}`}>Xem chi tiết</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {highlight && (
        <div className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-accent/40 p-6 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="gap-1.5">
                <Puzzle className="size-3.5" />
                Gói nổi bật miễn phí
              </Badge>
              <span className="font-mono text-xs text-primary font-medium">
                {highlight.downloads_count} lượt tải
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {highlight.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-foreground">
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
            <div className="space-y-5 lg:col-span-5">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary">
                TP91tool Studio
              </p>
              <h1 className="text-4xl font-semibold tracking-tight leading-[1.1] text-foreground sm:text-5xl">
                Dự án Web, Tool và Kho Skill sẵn sàng triển khai
              </h1>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Mua dự án và tool hoàn chỉnh, tải skill miễn phí, hoặc đặt làm web có demo chạy thật.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button asChild size="lg">
                  <Link href="/services#request-form">
                    Đặt làm Web
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/marketplace">Khám phá Kho</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <HeroDemoSwitcher />
            </div>
          </div>
        </section>

        {/* Section 1: Featured Projects & Tools */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Dự án & Tool nổi bật
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Source code sạch, chạy ổn định trên hạ tầng 0đ Vercel Hobby và Supabase Free.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/marketplace">
                Xem toàn bộ kho
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Suspense fallback={<CatalogGridSkeleton count={3} />}>
            <FeaturedProjectsSection />
          </Suspense>
        </section>

        {/* Section 2: Free Skills & Plugins Directory */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  <Sparkles className="size-6 text-primary" />
                  Kho Skill & Plugin miễn phí
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Copy lệnh cài đặt hoặc đọc nhanh hướng dẫn SKILL.md cho Antigravity và Claude Code.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/skills">
                  Tất cả Skill & Plugin
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>

            <Suspense fallback={<CatalogGridSkeleton count={2} />}>
              <FeaturedSkillsDirectory />
            </Suspense>
          </div>
        </section>

        {/* Section 3: Custom Web Service + Live Estimator */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 space-y-2">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Nhận làm Web theo yêu cầu
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ước tính phạm vi & xem Demo chức năng trước khi đặt
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Tự chọn loại web và tính năng bên dưới để xem stack 100% miễn phí vận hành, thời gian bàn giao và mức ngân sách gợi ý.
            </p>
          </div>

          <ProjectEstimatorDemo />
        </section>

        {/* Section 4: Direct Contact Strip */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Kênh hỗ trợ & nhận đơn trực tiếp
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Icon className="size-4 text-primary shrink-0" />
                        {c.label}
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {c.value}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
