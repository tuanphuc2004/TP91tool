import Link from "next/link";
import { Mail, MessageCircle, Send, Globe, Terminal } from "lucide-react";
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 font-semibold text-foreground">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Terminal className="size-4" />
              </span>
              <span>{SITE_CONFIG.brandName}</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Nền tảng chia sẻ skill, plugin miễn phí, bán dự án web hoàn chỉnh, tool tiện ích và nhận thiết kế web theo yêu cầu.
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              GitHub: {SITE_CONFIG.ownerHandle} | Vercel Hobby + Supabase Free
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-foreground">Danh mục</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/marketplace" className="hover:text-foreground">
                  Dự án & Tool
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-foreground">
                  Kho Skill & Plugin miễn phí
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Nhận làm Web & Live Demo
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground">
                  Trang quản trị Admin
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-foreground">Liên hệ trực tiếp</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
              {SITE_CONFIG.contacts.map((contact) => (
                <a
                  key={contact.channel}
                  href={contact.href}
                  target={contact.channel === "email" ? undefined : "_blank"}
                  rel={contact.channel === "email" ? undefined : "noopener noreferrer"}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <ChannelIcon channel={contact.channel} />
                    {contact.label}
                  </span>
                  <span className="truncate pl-3 font-mono text-xs text-muted-foreground">
                    {contact.value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>TP91tool by {SITE_CONFIG.ownerHandle}</p>
          <p>Email: {SITE_CONFIG.email}</p>
        </div>
      </div>
    </footer>
  );
}
