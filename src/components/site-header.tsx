"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/marketplace", label: "Dự án & Tool" },
  { href: "/skills", label: "Skill & Plugin" },
  { href: "/services", label: "Nhận làm Web" },
  { href: "/services#demo-lab", label: "Demo" },
  { href: "/admin", label: "Admin" },
] as const;

function NavLinksMarkup({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden items-center gap-1 md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const baseHref = item.href.split("#")[0];
        const active =
          pathname.length > 0 &&
          baseHref !== "/" &&
          (pathname === baseHref || pathname.startsWith(`${baseHref}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="header-nav-pill"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-lg bg-accent"
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveDesktopNav() {
  const pathname = usePathname();
  return <NavLinksMarkup pathname={pathname} />;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-border/80 bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Trang chủ TP91tool"
        >
          <Image
            src="/brand/tp91-logo-light.svg"
            alt="TP91.tool"
            width={132}
            height={41}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <Suspense fallback={<NavLinksMarkup pathname="" />}>
          <ActiveDesktopNav />
        </Suspense>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex whitespace-nowrap transition-transform active:scale-[0.97]"
          >
            <Link href="/services#request-form">
              Đặt làm Web
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center text-left">
                  <Image
                    src="/brand/tp91-logo-light.svg"
                    alt="TP91.tool"
                    width={120}
                    height={37}
                    className="h-8 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 w-full">
                  <Link href="/services#request-form" onClick={() => setOpen(false)}>
                    Đặt làm Web
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
