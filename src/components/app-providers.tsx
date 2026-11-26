"use client";

import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>{children}</TooltipProvider>
    </MotionConfig>
  );
}
