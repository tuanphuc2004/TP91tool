"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Calculator, FileCode2, Table2 } from "lucide-react";

const QUICK_DEMOS = [
  {
    href: "/services?demo=dashboard-tool#demo-lab",
    label: "Demo Mini POS & Export",
    icon: Table2,
  },
  {
    href: "/services?demo=skill-inspector#demo-lab",
    label: "Kiểm tra SKILL.md",
    icon: FileCode2,
  },
  {
    href: "/services?demo=project-estimator#demo-lab",
    label: "Ước tính làm Web",
    icon: Calculator,
  },
] as const;

export function HeroVisualShowcase() {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/30">
          <Image
            src="/images/hero-showcase.jpg"
            alt="Minh họa giao diện sản phẩm số TP91tool"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>

        <motion.div
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/95 px-5 py-3.5 backdrop-blur-xs"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              4 Live Demo tương tác chạy thật
            </p>
            <p className="text-xs text-muted-foreground">
              Kiểm chứng trực tiếp chất lượng trước khi đặt làm web hoặc mua tool
            </p>
          </div>
          <Link
            href="/services#demo-lab"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
          >
            Mở phòng Demo
            <ArrowUpRight className="size-3.5" />
          </Link>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {QUICK_DEMOS.map((demo) => {
          const Icon = demo.icon;
          return (
            <Link
              key={demo.href}
              href={demo.href}
              className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs"
            >
              <span className="flex items-center gap-2 truncate">
                <Icon className="size-4 text-primary shrink-0" />
                <span className="truncate">{demo.label}</span>
              </span>
              <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
