import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { CopyCommandButton } from "@/components/copy-command-button";
import { DashboardToolDemo } from "@/components/demos/dashboard-tool-demo";
import { LandingShowcaseDemo } from "@/components/demos/landing-showcase-demo";
import { ProjectEstimatorDemo } from "@/components/demos/project-estimator-demo";
import { SkillInspectorDemo } from "@/components/demos/skill-inspector-demo";
import { FreeDownloadButton } from "@/components/free-download-button";
import { OrderDialog } from "@/components/order-dialog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getItemBySlug } from "@/lib/data/catalog";
import { formatVnd } from "@/lib/order-helper";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm",
};

function EmbeddedDemo({ demoKey }: { demoKey: string }) {
  switch (demoKey) {
    case "landing-showcase":
      return <LandingShowcaseDemo />;
    case "dashboard-tool":
      return <DashboardToolDemo />;
    case "skill-inspector":
      return <SkillInspectorDemo />;
    case "project-estimator":
      return <ProjectEstimatorDemo />;
    default:
      return null;
  }
}

async function ItemDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const isFree = item.price_vnd === 0 || item.kind === "skill" || item.kind === "plugin";
  const backHref = item.kind === "skill" || item.kind === "plugin" ? "/skills" : "/marketplace";

  return (
    <div className="space-y-10">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{item.category}</Badge>
              <Badge variant="outline" className="font-mono">
                {item.kind}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {item.title}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">{item.tagline}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mô tả chi tiết</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>

            {item.features.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-foreground">Tính năng nổi bật</h3>
                <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {item.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {item.skill_markdown && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-foreground">Nội dung SKILL.md</h2>
                <CopyCommandButton text={item.skill_markdown} label="Copy SKILL.md" size="xs" />
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
                {item.skill_markdown}
              </pre>
            </div>
          )}

          {item.demo_key && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Live Demo tương tác</h2>
              <EmbeddedDemo demoKey={item.demo_key} />
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <div className="sticky top-24 space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-baseline justify-between border-b border-border pb-4">
              <span className="text-sm text-muted-foreground">Chi phí</span>
              <span className="font-mono text-2xl font-semibold text-primary">
                {formatVnd(item.price_vnd)}
              </span>
            </div>

            <div className="space-y-2.5">
              {isFree ? (
                <FreeDownloadButton
                  slug={item.slug}
                  initialCount={item.downloads_count}
                  downloadUrl={item.download_url}
                  size="lg"
                  className="w-full"
                />
              ) : (
                <OrderDialog item={item} size="lg" className="w-full" />
              )}

              {item.demo_url && !item.demo_key && (
                <Button asChild variant="outline" className="w-full">
                  <a href={item.demo_url} target="_blank" rel="noopener noreferrer">
                    Mở Demo ngoài
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
            </div>

            {item.install_command && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Lệnh cài đặt</span>
                  <CopyCommandButton text={item.install_command} label="Copy" size="xs" />
                </div>
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-[11px] text-foreground">
                  {item.install_command}
                </pre>
              </div>
            )}

            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-xs font-medium text-muted-foreground">Công nghệ sử dụng</span>
              <div className="flex flex-wrap gap-1.5">
                {item.tech_stack.map((tech) => (
                  <Badge key={tech} variant="outline" className="font-mono text-[11px]">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <ItemDetailContent params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
