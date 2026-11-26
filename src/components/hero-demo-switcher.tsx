"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Calculator, FileCode2, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/order-helper";
import { parseSkillFrontmatter } from "@/lib/skill-parser";
import { estimateProjectScope } from "@/lib/validators";
import { cn } from "@/lib/utils";

type PreviewTab = "pos" | "skill" | "estimator";

const SAMPLE_SKILL = `---
name: tp91-nextjs-starter
description: Ship fast Next.js App Router sites on Vercel Hobby and Supabase Free.
---

# Checklist
1. Validate input with Zod.
2. Keep RLS strict.`;

export function HeroDemoSwitcher() {
  const [tab, setTab] = useState<PreviewTab>("pos");
  const [posPaidOnly, setPosPaidOnly] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["auth", "database"]);
  const reduceMotion = useReducedMotion();

  const skillInfo = parseSkillFrontmatter(SAMPLE_SKILL);
  const scopeInfo = estimateProjectScope("webapp", selectedFeatures);

  const posRows = [
    { id: "ORD-01", name: "Commerce Starter", price: 490000, paid: true },
    { id: "ORD-02", name: "Mini POS Tool", price: 290000, paid: true },
    { id: "ORD-03", name: "Booking Kit", price: 790000, paid: false },
  ].filter((r) => (posPaidOnly ? r.paid : true));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("pos")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
              tab === "pos" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Table2 className="size-3.5 text-primary" />
            Tool POS
          </button>
          <button
            type="button"
            onClick={() => setTab("skill")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
              tab === "skill" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode2 className="size-3.5 text-primary" />
            Skill Check
          </button>
          <button
            type="button"
            onClick={() => setTab("estimator")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
              tab === "estimator" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calculator className="size-3.5 text-primary" />
            Ước tính Web
          </button>
        </div>

        <Link
          href="/services#demo-lab"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline whitespace-nowrap"
        >
          Mở full demo
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <motion.div
        key={tab}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="mt-4 min-h-[250px]"
      >
        {tab === "pos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Tổng hiển thị:{" "}
                <strong className="font-mono text-foreground">
                  {formatVnd(posRows.reduce((s, r) => s + r.price, 0))}
                </strong>
              </span>
              <Button
                type="button"
                size="xs"
                variant={posPaidOnly ? "default" : "outline"}
                onClick={() => setPosPaidOnly((v) => !v)}
              >
                {posPaidOnly ? "Đang lọc: Đã thu" : "Lọc đơn đã thu"}
              </Button>
            </div>
            <div className="divide-y divide-border rounded-lg border border-border">
              {posRows.map((row) => (
                <div key={row.id} className="flex items-center justify-between px-3 py-2.5 text-xs">
                  <div>
                    <span className="font-mono text-muted-foreground mr-2">{row.id}</span>
                    <span className="font-medium text-foreground">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{formatVnd(row.price)}</span>
                    <Badge variant={row.paid ? "default" : "secondary"} className="text-[10px]">
                      {row.paid ? "Đã thu" : "Chờ"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "skill" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-foreground">
                {skillInfo.name}
              </span>
              <Badge className="text-[10px]">Frontmatter hợp lệ</Badge>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground">
              {SAMPLE_SKILL}
            </pre>
            <p className="text-xs text-muted-foreground">
              Phát hiện {skillInfo.wordCount} từ hướng dẫn. Dùng bản đầy đủ tại phòng Demo để dán và kiểm tra file SKILL.md của bạn.
            </p>
          </div>
        )}

        {tab === "estimator" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Chọn nhanh module cho Web App để xem thời gian dự kiến:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "auth", label: "Đăng nhập Auth" },
                { id: "database", label: "Supabase DB + Admin" },
                { id: "demo", label: "Live Demo" },
                { id: "seo", label: "SEO" },
              ].map((opt) => {
                const active = selectedFeatures.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setSelectedFeatures((prev) =>
                        prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                      )
                    }
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs transition-colors cursor-pointer",
                      active
                        ? "border-primary bg-accent text-accent-foreground font-medium"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <div>
                <div className="text-[11px] text-muted-foreground">Thời gian dự kiến</div>
                <div className="font-mono text-lg font-semibold text-foreground">
                  ~{scopeInfo.estimatedDays} ngày
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Mức tham khảo</div>
                <div className="font-mono text-lg font-semibold text-primary">
                  {scopeInfo.suggestedBudget}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
