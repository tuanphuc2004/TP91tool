"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroEntrance({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-stagger", {
          opacity: 0,
          y: 16,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export function ScrollStaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>(".stagger-card");
        if (items.length === 0) return;

        gsap.from(items, {
          opacity: 0,
          y: 16,
          scale: 0.98,
          duration: 0.42,
          stagger: { each: 0.06, from: "start", grid: "auto" },
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            once: true,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export function MotionFadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.38, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
