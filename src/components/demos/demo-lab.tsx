"use client";

import { useState } from "react";
import { Calculator, FileCode2, LayoutTemplate, Table2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DemoKey, ServicePackage } from "@/lib/types";
import { DashboardToolDemo } from "./dashboard-tool-demo";
import { LandingShowcaseDemo } from "./landing-showcase-demo";
import { ProjectEstimatorDemo } from "./project-estimator-demo";
import { SkillInspectorDemo } from "./skill-inspector-demo";

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

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as DemoKey)}
      className="space-y-4"
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
        <TabsTrigger value="dashboard-tool" className="gap-1.5 py-2 text-xs sm:text-sm">
          <Table2 className="size-4 text-primary" />
          Mini POS & Export
        </TabsTrigger>
        <TabsTrigger value="landing-showcase" className="gap-1.5 py-2 text-xs sm:text-sm">
          <LayoutTemplate className="size-4 text-primary" />
          Landing Builder
        </TabsTrigger>
        <TabsTrigger value="skill-inspector" className="gap-1.5 py-2 text-xs sm:text-sm">
          <FileCode2 className="size-4 text-primary" />
          SKILL.md Check
        </TabsTrigger>
        <TabsTrigger value="project-estimator" className="gap-1.5 py-2 text-xs sm:text-sm">
          <Calculator className="size-4 text-primary" />
          Ước tính làm Web
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard-tool">
        <DashboardToolDemo />
      </TabsContent>
      <TabsContent value="landing-showcase">
        <LandingShowcaseDemo />
      </TabsContent>
      <TabsContent value="skill-inspector">
        <SkillInspectorDemo />
      </TabsContent>
      <TabsContent value="project-estimator">
        <ProjectEstimatorDemo onApplyEstimate={onApplyEstimate} />
      </TabsContent>
    </Tabs>
  );
}
