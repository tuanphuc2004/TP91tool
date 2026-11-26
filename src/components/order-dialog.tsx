"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { submitOrderAction } from "@/app/actions/public";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { formatVnd } from "@/lib/order-helper";
import { SITE_CONFIG } from "@/lib/site-config";
import type { CatalogItem, ContactChannel } from "@/lib/types";

interface OrderDialogProps {
  item: CatalogItem;
  triggerLabel?: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function OrderDialog({
  item,
  triggerLabel = "Đặt mua",
  size = "sm",
  className,
}: OrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contactChannel, setContactChannel] = useState<ContactChannel>("zalo");
  const [customerContact, setCustomerContact] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    orderId: string;
    message: string;
    amountVnd: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await submitOrderAction({
        itemId: item.id,
        customerName,
        contactChannel,
        customerContact,
        note,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setSuccess({
        orderId: res.orderId,
        message: res.message,
        amountVnd: res.amountVnd,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size={size} className={className}>
          <ShoppingBag className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Đặt mua: {item.title}</DialogTitle>
          <DialogDescription>
            Giá niêm yết:{" "}
            <span className="font-semibold text-foreground">{formatVnd(item.price_vnd)}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <Alert>
              <CheckCircle2 className="size-4 text-primary" />
              <AlertTitle>Mã đơn: {success.orderId}</AlertTitle>
              <AlertDescription className="mt-1 space-y-2">
                <p>{success.message}</p>
                <p className="font-mono text-xs text-foreground">
                  Tổng giá trị: {formatVnd(success.amountVnd)}
                </p>
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{SITE_CONFIG.paymentGuide.title}</p>
              <p className="mt-1">{SITE_CONFIG.paymentGuide.note}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SITE_CONFIG.contacts.map((c) => (
                  <a
                    key={c.channel}
                    href={c.href}
                    target={c.channel === "email" ? undefined : "_blank"}
                    rel={c.channel === "email" ? undefined : "noopener noreferrer"}
                    className="rounded-md border border-border bg-card px-2.5 py-1 font-medium text-foreground hover:border-primary"
                  >
                    {c.label}: {c.value}
                  </a>
                ))}
              </div>
            </div>

            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor={`order-name-${item.id}`}>Họ tên của bạn</Label>
              <Input
                id={`order-name-${item.id}`}
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`order-channel-${item.id}`}>Kênh liên hệ</Label>
                <Select
                  value={contactChannel}
                  onValueChange={(val) => setContactChannel(val as ContactChannel)}
                >
                  <SelectTrigger id={`order-channel-${item.id}`}>
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
                <Label htmlFor={`order-contact-${item.id}`}>SĐT / Username / Email</Label>
                <Input
                  id={`order-contact-${item.id}`}
                  required
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="0912345678 hoặc @username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`order-note-${item.id}`}>Ghi chú (tùy chọn)</Label>
              <Textarea
                id={`order-note-${item.id}`}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: cần hỗ trợ cấu hình Supabase & Vercel..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang gửi
                  </>
                ) : (
                  "Xác nhận đặt mua"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
