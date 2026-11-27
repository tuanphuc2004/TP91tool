"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_PLATFORM_OPTIONS, matchesPlatformFilter } from "@/lib/catalog-taxonomy";
import type { AiPlatform, CatalogItem } from "@/lib/types";

export function SkillsBrowser({ items }: { items: CatalogItem[] }) {
  const [kindFilter, setKindFilter] = useState<"all" | "skill" | "plugin">("all");
  const [platformFilter, setPlatformFilter] = useState<"all" | AiPlatform>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const reduce = useReducedMotion();

  const categories = useMemo(() => {
    const source =
      kindFilter === "all" ? items : items.filter((item) => item.kind === kindFilter);
    return Array.from(new Set(source.map((item) => item.category))).sort((a, b) =>
      a.localeCompare(b, "vi")
    );
  }, [items, kindFilter]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (
        platformFilter !== "all" &&
        !matchesPlatformFilter(item.compatible_platforms, platformFilter)
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${item.title} ${item.tagline} ${item.category} ${item.tech_stack.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, kindFilter, categoryFilter, platformFilter, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={kindFilter === "all" ? "default" : "outline"}
              onClick={() => {
                setKindFilter("all");
                setCategoryFilter("all");
              }}
              className="active:scale-[0.97]"
            >
              Tất cả ({items.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kindFilter === "skill" ? "default" : "outline"}
              onClick={() => {
                setKindFilter("skill");
                setCategoryFilter("all");
              }}
              className="active:scale-[0.97]"
            >
              Skills
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kindFilter === "plugin" ? "default" : "outline"}
              onClick={() => {
                setKindFilter("plugin");
                setCategoryFilter("all");
              }}
              className="active:scale-[0.97]"
            >
              Plugins
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={platformFilter}
              onValueChange={(v) => setPlatformFilter(v as "all" | AiPlatform)}
            >
              <SelectTrigger className="w-full sm:w-44" aria-label="Lọc nền tảng AI">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi nền tảng AI</SelectItem>
                {AI_PLATFORM_OPTIONS.filter((opt) => opt.id !== "all").map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    Dùng cho {opt.shortLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Lọc danh mục">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm skill hoặc plugin..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-base font-medium text-foreground">
            Chưa có skill hoặc plugin khớp bộ lọc hiện tại
          </p>
        </div>
      ) : (
        <motion.div
          layout={!reduce}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((item) => (
            <CatalogCard key={item.id} item={item} showInstallBar />
          ))}
        </motion.div>
      )}
    </div>
  );
}
