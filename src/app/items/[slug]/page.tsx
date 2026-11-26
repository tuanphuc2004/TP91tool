import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { CopyCommandButton } from "@/components/copy-command-button";
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

function getCoverImage(kind: string) {
  if (kind === "project") return "/images/card-project.jpg";
  if (kind === "tool") return "/images/card-tool.jpg";
  return "/images/hero-showcase.jpg";
}

async function ItemDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const isFree = item.price_vnd === 0 || item.kind === "skill" || item.kind === "plugin";
  const backHref = item.kind === "skill" || item.kind === "plugin" ? "/skills" : "/marketplace";
  const hasExternalPreview =
    Boolean(item.demo_url) &&
    (item.demo_url!.startsWith("http://") || item.demo_url!.startsWith("https://"));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-16/9 w-full bg-muted/30">
              <Image
                src={getCoverImage(item.kind)}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline">{item.kind}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {item.title}
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">{item.tagline}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Mô tả chi tiết</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>

            {item.features.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-foreground">Tính năng nổi bật</h3>
                <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-foreground">Nội dung SKILL.md</h2>
                <CopyCommandButton text={item.skill_markdown} label="Copy SKILL.md" size="xs" />
              </div>
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
                {item.skill_markdown}
              </pre>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-baseline justify-between border-b border-border pb-4">
              <span className="text-sm font-medium text-muted-foreground">Chi phí</span>
              <span className="text-2xl font-bold tabular-nums text-primary">
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

              {hasExternalPreview && (
                <Button asChild variant="outline" className="w-full">
                  <a href={item.demo_url!} target="_blank" rel="noopener noreferrer">
                    Xem trang thực tế
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
            </div>

            {item.install_command && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Lệnh cài đặt</span>
                  <CopyCommandButton text={item.install_command} label="Copy" size="xs" />
                </div>
                <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
                  {item.install_command}
                </pre>
              </div>
            )}

            <div className="space-y-2.5 border-t border-border pt-4">
              <span className="text-xs font-medium text-muted-foreground">Công nghệ sử dụng</span>
              <div className="flex flex-wrap gap-1.5">
                {item.tech_stack.map((tech) => (
                  <Badge key={tech} variant="outline" className="font-medium">
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
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
          <ItemDetailContent params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
