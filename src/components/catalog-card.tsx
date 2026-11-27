"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download, Layers, Puzzle, Sparkles, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPlatformLabels } from "@/lib/catalog-taxonomy";
import { formatVnd } from "@/lib/order-helper";
import type { CatalogItem, CatalogKind } from "@/lib/types";
import { CopyCommandButton } from "./copy-command-button";
import { FreeDownloadButton } from "./free-download-button";
import { OrderDialog } from "./order-dialog";

const KIND_META: Record<
  CatalogKind,
  { label: string; icon: typeof Layers; image: string }
> = {
  project: {
    label: "Dự án Web",
    icon: Layers,
    image: "/images/card-project.jpg",
  },
  tool: {
    label: "Tool",
    icon: Wrench,
    image: "/images/card-tool.jpg",
  },
  skill: {
    label: "Skill",
    icon: Sparkles,
    image: "/images/card-skill.jpg",
  },
  plugin: {
    label: "Plugin",
    icon: Puzzle,
    image: "/images/card-skill.jpg",
  },
};

interface CatalogCardProps {
  item: CatalogItem;
  showInstallBar?: boolean;
}

export function CatalogCard({ item, showInstallBar = false }: CatalogCardProps) {
  const [downloads, setDownloads] = useState(item.downloads_count);
  const meta = KIND_META[item.kind];
  const KindIcon = meta.icon;
  const platformLabels = formatPlatformLabels(item.compatible_platforms);
  const isFree =
    item.price_vnd === 0 || item.kind === "skill" || item.kind === "plugin";

  return (
    <article className="stagger-card group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <Link
        href={`/items/${item.slug}`}
        className="relative block aspect-video w-full overflow-hidden border-b border-border bg-muted/40"
      >
        <Image
          src={meta.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3">
          <Badge
            variant="secondary"
            className="gap-1.5 border border-border/80 bg-card/90 backdrop-blur-xs font-medium text-foreground shadow-xs"
          >
            <KindIcon className="size-3.5 text-primary" />
            {meta.label}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold leading-snug text-foreground">
              <Link
                href={`/items/${item.slug}`}
                className="transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {item.tagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs font-medium text-foreground">
              {item.category}
            </Badge>
            {platformLabels.map((plat) => (
              <Badge
                key={plat}
                variant="secondary"
                className="bg-accent text-xs font-medium text-primary"
              >
                {plat}
              </Badge>
            ))}
            {item.tech_stack.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tech}
              </span>
            ))}
          </div>

          {showInstallBar && item.install_command && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
              <code className="truncate font-mono text-xs text-foreground">
                {item.install_command}
              </code>
              <CopyCommandButton
                text={item.install_command}
                label="Copy"
                variant="ghost"
                size="xs"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <div className="space-y-0.5">
            <div
              className={
                isFree
                  ? "text-sm font-semibold tabular-nums text-primary"
                  : "text-base font-semibold tabular-nums text-foreground"
              }
            >
              {formatVnd(item.price_vnd)}
            </div>
            <div className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
              <Download className="size-3" />
              {downloads} lượt tải
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFree ? (
              <FreeDownloadButton
                slug={item.slug}
                initialCount={downloads}
                downloadUrl={item.download_url}
                onCountUpdated={setDownloads}
              />
            ) : (
              <OrderDialog item={item} />
            )}

            <Button asChild variant="outline" size="sm">
              <Link href={`/items/${item.slug}`} aria-label={`Xem chi tiết ${item.title}`}>
                Chi tiết
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
