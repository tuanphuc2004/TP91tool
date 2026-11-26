"use client";

import { useState } from "react";
import { Check, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitProjectRequestAction } from "@/app/actions/public";
import { DemoLab } from "@/components/demos/demo-lab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SITE_CONFIG } from "@/lib/site-config";
import type { ContactChannel, DemoKey, ServicePackage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ServicesWorkspace({ initialDemo = "dashboard-tool" }: { initialDemo?: DemoKey }) {
  const [servicePackage, setServicePackage] = useState<ServicePackage>("ecommerce");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["database", "seo"]);
  const [budgetRange, setBudgetRange] = useState<string>(SITE_CONFIG.budgetPresets[1]);
  const [timeline, setTimeline] = useState<string>(SITE_CONFIG.timelinePresets[1]);
  const [customerName, setCustomerName] = useState("");
  const [contactChannel, setContactChannel] = useState<ContactChannel>("zalo");
  const [customerContact, setCustomerContact] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ requestId: string; message: string } | null>(null);

  function handleApplyEstimate(selection: {
    servicePackage: ServicePackage;
    selectedFeatures: string[];
    budgetRange: string;
    estimatedDays: number;
  }) {
    setServicePackage(selection.servicePackage);
    setSelectedFeatures(selection.selectedFeatures);
    setBudgetRange(selection.budgetRange);
    setAppliedNotice(
      `Đã điền cấu hình từ bộ ước tính (~${selection.estimatedDays} ngày, mức ${selection.budgetRange}).`
    );
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleFeature(id: string) {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await submitProjectRequestAction({
        servicePackage,
        customerName,
        contactChannel,
        customerContact,
        budgetRange,
        timeline,
        selectedFeatures,
        description,
        referenceUrl,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setSuccess({
        requestId: res.requestId,
        message: res.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-20">
      <section id="demo-lab" className="space-y-5 scroll-mt-24">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Phòng Live Demo chức năng thật
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Trải nghiệm trực tiếp các tính năng web thực tế ngay trên trình duyệt trước khi đặt làm dự án.
          </p>
        </div>

        <DemoLab initialDemo={initialDemo} onApplyEstimate={handleApplyEstimate} />
      </section>

      <section
        id="request-form"
        className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-10"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Badge variant="secondary">Nhận làm Web theo yêu cầu</Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Gửi yêu cầu thiết kế & lập trình Web
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tối ưu hạ tầng 100% miễn phí (Vercel Hobby, Supabase Free, GitHub) để bạn vận hành lâu dài với chi phí 0đ cố định.
            </p>

            <div className="space-y-2.5 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">Kênh trao đổi nhanh</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                {SITE_CONFIG.contacts.map((c) => (
                  <div key={c.channel} className="flex justify-between gap-2">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <a
                      href={c.href}
                      target={c.channel === "email" ? undefined : "_blank"}
                      rel={c.channel === "email" ? undefined : "noopener noreferrer"}
                      className="text-primary hover:underline"
                    >
                      {c.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {success ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="size-4 text-primary" />
                  <AlertTitle>Mã yêu cầu: {success.requestId}</AlertTitle>
                  <AlertDescription className="mt-1">{success.message}</AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuccess(null);
                    setDescription("");
                  }}
                >
                  Gửi thêm yêu cầu khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {appliedNotice && (
                  <Alert>
                    <Check className="size-4 text-primary" />
                    <AlertDescription>{appliedNotice}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="req-package">Loại dự án Web</Label>
                    <Select
                      value={servicePackage}
                      onValueChange={(v) => setServicePackage(v as ServicePackage)}
                    >
                      <SelectTrigger id="req-package">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SITE_CONFIG.servicePackages.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="req-budget">Ngân sách dự kiến</Label>
                    <Select value={budgetRange} onValueChange={setBudgetRange}>
                      <SelectTrigger id="req-budget">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SITE_CONFIG.budgetPresets.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="req-name">Họ tên / Đơn vị</Label>
                    <Input
                      id="req-name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-timeline">Thời gian mong muốn</Label>
                    <Select value={timeline} onValueChange={setTimeline}>
                      <SelectTrigger id="req-timeline">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SITE_CONFIG.timelinePresets.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="req-channel">Kênh phản hồi ưu tiên</Label>
                    <Select
                      value={contactChannel}
                      onValueChange={(v) => setContactChannel(v as ContactChannel)}
                    >
                      <SelectTrigger id="req-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zalo">Zalo</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-contact">SĐT / Username / Email</Label>
                    <Input
                      id="req-contact"
                      required
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder="0912345678 hoặc email@..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tính năng mong muốn</Label>
                  <div className="flex flex-wrap gap-2">
                    {SITE_CONFIG.estimatorFeatures.map((feat) => {
                      const active = selectedFeatures.includes(feat.id);
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeature(feat.id)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs transition-colors cursor-pointer",
                            active
                              ? "border-primary bg-accent text-accent-foreground font-medium"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {feat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="req-ref">Link tham khảo (tùy chọn)</Label>
                  <Input
                    id="req-ref"
                    type="url"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="req-desc">Mô tả bài toán và chức năng cần có</Label>
                  <Textarea
                    id="req-desc"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Cần làm trang web bán tool có trang chủ, lọc sản phẩm, đặt đơn và trang admin quản lý..."
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full sm:w-auto active:scale-[0.97]">
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang gửi yêu cầu
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Gửi yêu cầu làm Web
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
