"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, Layers, Puzzle, Sparkles, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatVnd } from "@/lib/order-helper";
import type { CatalogItem, CatalogKind } from "@/lib/types";
import { CopyCommandButton } from "./copy-command-button";
import { FreeDownloadButton } from "./free-download-button";
import { OrderDialog } from "./order-dialog";

const KIND_META: Record<CatalogKind, { label: string; icon: typeof Layers }> = {
  project: { label: "Dự án Web", icon: Layers },
  tool: { label: "Tool", icon: Wrench },
  skill: { label: "Skill", icon: Sparkles },
  plugin: { label: "Plugin", icon: Puzzle },
};

export function CatalogCard({ item }: { item: CatalogItem }) {
  const [downloads, setDownloads] = useState(item.downloads_count);
  const meta = KIND_META[item.kind];
  const KindIcon = meta.icon;
  const isFree = item.price_vnd === 0 || item.kind === "skill" || item.kind === "plugin";

  return (
    <Card className="flex h-full flex-col justify-between transition-colors hover:border-primary/40">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1.5 font-medium">
            <KindIcon className="size-3.5 text-primary" />
            {meta.label}
          </Badge>
          <span
            className={
              isFree
                ? "font-mono text-xs font-semibold text-primary"
                : "font-mono text-xs font-semibold text-foreground"
            }
          >
            {formatVnd(item.price_vnd)}
          </span>
        </div>

        <div>
          <CardTitle className="text-lg leading-snug">
            <Link href={`/items/${item.slug}`} className="hover:text-primary transition-colors">
              {item.title}
            </Link>
          </CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2 leading-relaxed">
            {item.tagline}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {item.tech_stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        {item.install_command && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
            <code className="truncate font-mono text-[11px] text-foreground">
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
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
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

          {item.demo_url && (
            <Button asChild variant="outline" size="sm">
              <Link href={item.demo_url}>
                Demo
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-mono" title="Lượt tải / sử dụng">
            <Download className="size-3" />
            {downloads}
          </span>
          <Link
            href={`/items/${item.slug}`}
            className="font-medium text-foreground hover:text-primary whitespace-nowrap"
          >
            Chi tiết
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
