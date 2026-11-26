import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MessageCircle, Send } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";
import type { ContactChannel } from "@/lib/types";

function ChannelIcon({ channel }: { channel: ContactChannel }) {
  switch (channel) {
    case "zalo":
      return <MessageCircle className="size-4 text-primary" />;
    case "telegram":
      return <Send className="size-4 text-primary" />;
    case "facebook":
      return <Globe className="size-4 text-primary" />;
    case "email":
      return <Mail className="size-4 text-primary" />;
  }
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="space-y-3 md:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/tp91-logo-light.svg"
                alt="TP91.tool"
                width={132}
                height={41}
                className="h-9 w-auto"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Kho dự án web, tool tiện ích, chia sẻ AI skill & plugin miễn phí và dịch vụ làm web tối ưu 100% hạ tầng miễn phí.
            </p>
            <p className="text-xs text-muted-foreground">
              Vận hành trên Vercel Hobby và Supabase Free
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-foreground">Điều hướng</h3>
            <ul className="mt-3.5 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/marketplace" className="transition-colors hover:text-primary">
                  Dự án & Tool
                </Link>
              </li>
              <li>
                <Link href="/skills" className="transition-colors hover:text-primary">
                  Kho Skill & Plugin miễn phí
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition-colors hover:text-primary">
                  Nhận làm Web & Live Demo
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-primary">
                  Quản trị Admin
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-foreground">Liên hệ trực tiếp</h3>
            <div className="mt-3.5 grid grid-cols-1 gap-2">
              {SITE_CONFIG.contacts.map((contact) => (
                <a
                  key={contact.channel}
                  href={contact.href}
                  target={contact.channel === "email" ? undefined : "_blank"}
                  rel={contact.channel === "email" ? undefined : "noopener noreferrer"}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <span className="flex items-center gap-2.5 font-medium text-foreground">
                    <ChannelIcon channel={contact.channel} />
                    {contact.label}
                  </span>
                  <span className="truncate pl-3 text-xs text-muted-foreground">
                    {contact.value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>{SITE_CONFIG.brandName} bởi {SITE_CONFIG.ownerHandle}</p>
          <p>{SITE_CONFIG.email}</p>
        </div>
      </div>
    </footer>
  );
}
