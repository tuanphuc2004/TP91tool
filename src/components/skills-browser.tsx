"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogItem } from "@/lib/types";

export function SkillsBrowser({ items }: { items: CatalogItem[] }) {
  const [kindFilter, setKindFilter] = useState<"all" | "skill" | "plugin">("all");
  const [search, setSearch] = useState("");

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "all" ? "default" : "outline"}
            onClick={() => setKindFilter("all")}
          >
            Tất cả ({items.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "skill" ? "default" : "outline"}
            onClick={() => setKindFilter("skill")}
          >
            Skills
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "plugin" ? "default" : "outline"}
            onClick={() => setKindFilter("plugin")}
          >
            Plugins
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm skill hoặc plugin..."
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">Chưa có skill hoặc plugin khớp từ khóa</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <CatalogCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
