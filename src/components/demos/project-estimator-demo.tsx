"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/site-config";
import type { ServicePackage } from "@/lib/types";
import { estimateProjectScope } from "@/lib/validators";
import { cn } from "@/lib/utils";

interface ProjectEstimatorDemoProps {
  onApplyEstimate?: (selection: {
    servicePackage: ServicePackage;
    selectedFeatures: string[];
    budgetRange: string;
    estimatedDays: number;
  }) => void;
}

export function ProjectEstimatorDemo({ onApplyEstimate }: ProjectEstimatorDemoProps) {
  const [pkg, setPkg] = useState<ServicePackage>("ecommerce");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["database", "seo"]);

  const estimate = useMemo(
    () => estimateProjectScope(pkg, selectedFeatures),
    [pkg, selectedFeatures]
  );

  function toggleFeature(id: string) {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        <div>
          <p className="text-sm font-medium text-foreground">1. Chọn loại dự án web</p>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SITE_CONFIG.servicePackages.map((item) => {
              const active = pkg === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPkg(item.id)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition-colors cursor-pointer",
                    active
                      ? "border-primary bg-accent/60"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">{item.name}</span>
                  <span className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.summary}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">2. Chọn tính năng đi kèm</p>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SITE_CONFIG.estimatorFeatures.map((feat) => {
              const checked = selectedFeatures.includes(feat.id);
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => toggleFeature(feat.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                    checked
                      ? "border-primary bg-accent/60 text-foreground font-medium"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    {feat.label}
                  </span>
                  <span className="font-mono text-[11px] shrink-0">+{feat.extraDays}d</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 lg:col-span-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Layers className="size-4 text-primary" />
              Đề xuất kiến trúc 100% Free
            </span>
            <Badge variant="secondary" className="gap-1 font-mono text-xs">
              <Clock className="size-3" />
              ~{estimate.estimatedDays} ngày
            </Badge>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Stack đề xuất (0đ vận hành)</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {estimate.stack.map((tech) => (
                <Badge key={tech} variant="outline" className="font-mono text-[11px]">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Mức ngân sách tham khảo</p>
            <p className="mt-1 font-mono text-lg font-semibold text-primary">
              {estimate.suggestedBudget}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Bàn giao bao gồm</p>
            <ul className="mt-1.5 space-y-1 text-xs text-foreground">
              {estimate.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 size-3.5 text-primary shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          {onApplyEstimate ? (
            <Button
              type="button"
              className="w-full"
              onClick={() =>
                onApplyEstimate({
                  servicePackage: pkg,
                  selectedFeatures,
                  budgetRange: estimate.suggestedBudget,
                  estimatedDays: estimate.estimatedDays,
                })
              }
            >
              Áp dụng vào Form đặt làm Web
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/services#request-form">
                Đặt làm Web theo cấu hình này
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
