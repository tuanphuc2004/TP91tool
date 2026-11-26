"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Calculator, FileCode2, LayoutTemplate, Table2 } from "lucide-react";
import type { DemoKey, ServicePackage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardToolDemo } from "./dashboard-tool-demo";
import { LandingShowcaseDemo } from "./landing-showcase-demo";
import { ProjectEstimatorDemo } from "./project-estimator-demo";
import { SkillInspectorDemo } from "./skill-inspector-demo";

const DEMO_TABS = [
  { id: "dashboard-tool" as DemoKey, label: "Mini POS & Export", icon: Table2 },
  { id: "landing-showcase" as DemoKey, label: "Landing Builder", icon: LayoutTemplate },
  { id: "skill-inspector" as DemoKey, label: "SKILL.md Check", icon: FileCode2 },
  { id: "project-estimator" as DemoKey, label: "Ước tính làm Web", icon: Calculator },
] as const;

interface DemoLabProps {
  initialDemo?: DemoKey;
  onApplyEstimate?: (selection: {
    servicePackage: ServicePackage;
    selectedFeatures: string[];
    budgetRange: string;
    estimatedDays: number;
  }) => void;
}

export function DemoLab({ initialDemo = "dashboard-tool", onApplyEstimate }: DemoLabProps) {
  const [activeTab, setActiveTab] = useState<DemoKey>(initialDemo);
  const reduce = useReducedMotion();

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Danh sách Live Demo tương tác"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1.5 sm:grid-cols-4"
      >
        {DEMO_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer sm:text-sm",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="demo-lab-active-tab"
                  transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-primary shadow-xs"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {activeTab === "dashboard-tool" && <DashboardToolDemo />}
          {activeTab === "landing-showcase" && <LandingShowcaseDemo />}
          {activeTab === "skill-inspector" && <SkillInspectorDemo />}
          {activeTab === "project-estimator" && (
            <ProjectEstimatorDemo onApplyEstimate={onApplyEstimate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
