"use client";

import { useState } from "react";
import { Check, Laptop, Smartphone, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LayoutMode = "split" | "minimal";
type ViewportMode = "desktop" | "mobile";

export function LandingShowcaseDemo() {
  const [layout, setLayout] = useState<LayoutMode>("split");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [headline, setHeadline] = useState("Ra mắt sản phẩm web trong 7 ngày");
  const [ctaText, setCtaText] = useState("Nhận tư vấn ngay");
  const [leadEmail, setLeadEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleTestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadEmail.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/40 p-4 md:grid-cols-12">
        <div className="space-y-2 md:col-span-5">
          <Label htmlFor="demo-headline">Thử đổi tiêu đề Hero</Label>
          <Input
            id="demo-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="demo-cta">Nhãn nút CTA</Label>
          <Input
            id="demo-cta"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            maxLength={24}
          />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 md:col-span-4">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Button
              type="button"
              size="xs"
              variant={layout === "split" ? "default" : "ghost"}
              onClick={() => setLayout("split")}
            >
              Split
            </Button>
            <Button
              type="button"
              size="xs"
              variant={layout === "minimal" ? "default" : "ghost"}
              onClick={() => setLayout("minimal")}
            >
              Gọn nhẹ
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Button
              type="button"
              size="xs"
              variant={viewport === "desktop" ? "default" : "ghost"}
              onClick={() => setViewport("desktop")}
              aria-label="Xem khung Desktop"
            >
              <Laptop className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="xs"
              variant={viewport === "mobile" ? "default" : "ghost"}
              onClick={() => setViewport("mobile")}
              aria-label="Xem khung Mobile"
            >
              <Smartphone className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center rounded-xl border border-border bg-muted/20 p-4 sm:p-6">
        <div
          className={cn(
            "w-full rounded-xl border border-border bg-card p-6 shadow-xs transition-all",
            viewport === "mobile" ? "max-w-sm" : "max-w-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Landing Preview
            </span>
            <Badge variant="secondary" className="font-mono text-[11px]">
              {viewport === "mobile" ? "390px" : "100% Desktop"}
            </Badge>
          </div>

          <div
            className={cn(
              "mt-6 grid gap-6 items-center",
              layout === "split" && viewport === "desktop" ? "md:grid-cols-12" : "grid-cols-1"
            )}
          >
            <div className={layout === "split" && viewport === "desktop" ? "md:col-span-7" : ""}>
              <h4 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {headline || "Tiêu đề sản phẩm của bạn"}
              </h4>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                Giao diện tối giản giúp người truy cập hiểu rõ giá trị trong 5 giây và gửi thông tin liên hệ ngay lập tức.
              </p>

              <form onSubmit={handleTestSubmit} className="mt-4 flex flex-wrap gap-2">
                <Input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="nhap-email@thu-nghiem.vn"
                  className="max-w-xs"
                />
                <Button type="submit" size="sm">
                  {submitted ? (
                    <>
                      <Check className="size-4" />
                      Đã test form
                    </>
                  ) : (
                    ctaText || "Bắt đầu"
                  )}
                </Button>
              </form>
            </div>

            <div
              className={cn(
                "rounded-lg border border-border bg-accent/40 p-4",
                layout === "split" && viewport === "desktop" ? "md:col-span-5" : ""
              )}
            >
              <p className="font-mono text-xs font-medium text-primary">Thông số vận hành mẫu</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="font-mono text-lg font-semibold text-foreground">99/100</div>
                  <div className="text-xs text-muted-foreground">Lighthouse Perf</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="font-mono text-lg font-semibold text-foreground">0 đ</div>
                  <div className="text-xs text-muted-foreground">Hosting Vercel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
