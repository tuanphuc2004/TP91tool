"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogIn, LogOut, Menu, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface HeaderUserState {
  email: string;
  isAdmin: boolean;
}

interface NavItem {
  readonly href: string;
  readonly label: string;
}

const BASE_NAV_ITEMS: readonly NavItem[] = [
  { href: "/marketplace", label: "Dự án & Tool" },
  { href: "/skills", label: "Skill & Plugin" },
  { href: "/services", label: "Nhận làm Web" },
];

function DesktopNavMarkup({
  items,
  pathname,
}: {
  items: readonly NavItem[];
  pathname: string;
}) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden items-center gap-1 md:flex"
    >
      {items.map((item) => {
        const active =
          pathname.length > 0 &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
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
            {item.href === "/admin" && <ShieldCheck className="size-3.5 text-primary" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveDesktopNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  return <DesktopNavMarkup items={items} pathname={pathname} />;
}

export function SiteHeaderClient({ initialUser }: { initialUser: HeaderUserState | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const navItems: readonly NavItem[] = initialUser?.isAdmin
    ? [...BASE_NAV_ITEMS, { href: "/admin", label: "Admin" }]
    : BASE_NAV_ITEMS;

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

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

        <Suspense fallback={<DesktopNavMarkup items={navItems} pathname="" />}>
          <ActiveDesktopNav items={navItems} />
        </Suspense>

        <div className="flex items-center gap-2 shrink-0">
          {initialUser ? (
            <div className="hidden items-center gap-2 md:flex">
              <span
                title={initialUser.email}
                className="inline-flex max-w-[170px] items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
              >
                <UserIcon className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{initialUser.email}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
                className="whitespace-nowrap"
              >
                <LogOut className="size-3.5" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden md:inline-flex whitespace-nowrap"
            >
              <Link href="/login">
                <LogIn className="size-3.5" />
                Đăng nhập
              </Link>
            </Button>
          )}

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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {item.href === "/admin" && <ShieldCheck className="size-4 text-primary" />}
                    {item.label}
                  </Link>
                ))}

                <div className="my-2 border-t border-border pt-3">
                  {initialUser ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 text-xs text-muted-foreground">
                        <UserIcon className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{initialUser.email}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleSignOut}
                        disabled={signingOut}
                      >
                        <LogOut className="size-4" />
                        Đăng xuất
                      </Button>
                    </div>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <LogIn className="size-4" />
                        Đăng nhập / Đăng ký
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
