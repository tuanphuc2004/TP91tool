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
import type { CatalogItem } from "@/lib/types";

export function MarketplaceBrowser({ items }: { items: CatalogItem[] }) {
  const [kindFilter, setKindFilter] = useState<"all" | "project" | "tool">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [search, setSearch] = useState("");
  const reduce = useReducedMotion();

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
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "all" ? "default" : "outline"}
            onClick={() => setKindFilter("all")}
            className="active:scale-[0.97]"
          >
            Tất cả
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "project" ? "default" : "outline"}
            onClick={() => setKindFilter("project")}
            className="active:scale-[0.97]"
          >
            Dự án Web
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "tool" ? "default" : "outline"}
            onClick={() => setKindFilter("tool")}
            className="active:scale-[0.97]"
          >
            Tool tiện ích
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={priceFilter}
            onValueChange={(v) => setPriceFilter(v as "all" | "free" | "paid")}
          >
            <SelectTrigger className="w-full sm:w-40" aria-label="Lọc theo mức giá">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi mức giá</SelectItem>
              <SelectItem value="paid">Sản phẩm có phí</SelectItem>
              <SelectItem value="free">Tải miễn phí</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm dự án, tool..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-base font-medium text-foreground">Không tìm thấy sản phẩm phù hợp</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Thử đổi bộ lọc hoặc đặt làm riêng theo yêu cầu tại mục Nhận làm Web.
          </p>
        </div>
      ) : (
        <motion.div
          layout={!reduce}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((item) => (
            <CatalogCard key={item.id} item={item} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
