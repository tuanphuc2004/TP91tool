"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogItem } from "@/lib/types";

export function SkillsBrowser({ items }: { items: CatalogItem[] }) {
  const [kindFilter, setKindFilter] = useState<"all" | "skill" | "plugin">("all");
  const [search, setSearch] = useState("");
  const reduce = useReducedMotion();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${item.title} ${item.tagline} ${item.category} ${item.tech_stack.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, kindFilter, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "all" ? "default" : "outline"}
            onClick={() => setKindFilter("all")}
            className="active:scale-[0.97]"
          >
            Tất cả ({items.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "skill" ? "default" : "outline"}
            onClick={() => setKindFilter("skill")}
            className="active:scale-[0.97]"
          >
            Skills
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "plugin" ? "default" : "outline"}
            onClick={() => setKindFilter("plugin")}
            className="active:scale-[0.97]"
          >
            Plugins
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm skill hoặc plugin..."
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-base font-medium text-foreground">
            Chưa có skill hoặc plugin khớp từ khóa
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
