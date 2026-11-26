"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Terminal, ArrowUpRight } from "lucide-react";
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
              "rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
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
    <header className="sticky top-0 z-40 h-16 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground shrink-0"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="size-4" strokeWidth={2} />
          </span>
          <span className="text-base font-semibold tracking-tight">TP91tool</span>
        </Link>

        <Suspense fallback={<NavLinksMarkup pathname="" />}>
          <ActiveDesktopNav />
        </Suspense>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="hidden sm:inline-flex whitespace-nowrap">
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
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Terminal className="size-4 text-primary" />
                  TP91tool
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-3 w-full">
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
