import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, ShieldCheck, Zap } from "lucide-react";
import { ImageOptimizerTool } from "@/components/image-optimizer-tool";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tiện ích Web miễn phí (Nén ảnh WebP & OG Image)",
  description:
    "Nén ảnh sang WebP/JPEG/PNG, cắt chuẩn OG Image 1200x630 và đóng dấu watermark trực tiếp trên trình duyệt — 0đ server, bảo mật dữ liệu.",
};

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-border pb-8 lg:flex-row lg:items-end">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <ImageIcon className="size-3.5 text-primary" />
                Tiện ích Web 0đ
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Xử lý trên trình duyệt
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Nén & Chỉnh kích thước ảnh (WebP / OG Image)
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Tối ưu dung lượng ảnh trước khi đăng lên website, tạo ảnh chia sẻ Facebook/Zalo chuẩn{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                1200×630
              </code>{" "}
              và đóng dấu watermark hàng loạt hoàn toàn miễn phí ngay trên trình duyệt.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-4 text-primary" />
            <span>Không giới hạn lượt • Tải ZIP nhiều ảnh</span>
          </div>
        </div>

        <ImageOptimizerTool />

        <section className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Cần tích hợp bộ xử lý ảnh hoặc tool tương tự vào website của bạn?
              </h2>
              <p className="text-sm text-muted-foreground">
                Tôi nhận thiết kế web & tool tiện ích chạy tối ưu trên hạ tầng miễn phí Vercel + Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Button asChild variant="outline">
                <Link href="/marketplace">Xem kho Dự án & Tool</Link>
              </Button>
              <Button asChild>
                <Link href="/services">
                  Đặt làm Web / Tool
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
