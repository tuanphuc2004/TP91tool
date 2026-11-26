"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogItem } from "@/lib/types";

export function MarketplaceBrowser({ items }: { items: CatalogItem[] }) {
  const [kindFilter, setKindFilter] = useState<"all" | "project" | "tool">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (priceFilter === "free" && item.price_vnd !== 0) return false;
      if (priceFilter === "paid" && item.price_vnd === 0) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${item.title} ${item.tagline} ${item.category} ${item.tech_stack.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, kindFilter, priceFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "all" ? "default" : "outline"}
            onClick={() => setKindFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "project" ? "default" : "outline"}
            onClick={() => setKindFilter("project")}
          >
            Dự án Web
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "tool" ? "default" : "outline"}
            onClick={() => setKindFilter("tool")}
          >
            Tool tiện ích
          </Button>

          <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />

          <Button
            type="button"
            size="sm"
            variant={priceFilter === "all" ? "secondary" : "ghost"}
            onClick={() => setPriceFilter("all")}
          >
            Mọi mức giá
          </Button>
          <Button
            type="button"
            size="sm"
            variant={priceFilter === "paid" ? "secondary" : "ghost"}
            onClick={() => setPriceFilter("paid")}
          >
            Trả phí
          </Button>
          <Button
            type="button"
            size="sm"
            variant={priceFilter === "free" ? "secondary" : "ghost"}
            onClick={() => setPriceFilter("free")}
          >
            Miễn phí
          </Button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm dự án, tool, tech stack..."
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">Không tìm thấy sản phẩm phù hợp</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Thử đổi bộ lọc hoặc đặt làm riêng theo yêu cầu tại mục Nhận làm Web.
          </p>
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
