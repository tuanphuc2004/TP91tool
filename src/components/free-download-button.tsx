"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { trackFreeDownloadAction } from "@/app/actions/public";
import { Button } from "@/components/ui/button";

interface FreeDownloadButtonProps {
  slug: string;
  initialCount: number;
  downloadUrl: string | null;
  label?: string;
  size?: "default" | "sm" | "lg";
  className?: string;
  onCountUpdated?: (nextCount: number) => void;
}

export function FreeDownloadButton({
  slug,
  initialCount,
  downloadUrl,
  label = "Tải miễn phí",
  size = "sm",
  className,
  onCountUpdated,
}: FreeDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(initialCount);

  async function handleDownload() {
    setLoading(true);
    try {
      const result = await trackFreeDownloadAction(slug);
      if (result.ok) {
        if (typeof result.downloadsCount === "number") {
          setCount(result.downloadsCount);
          onCountUpdated?.(result.downloadsCount);
        }
        setDone(true);
        const target = result.downloadUrl ?? downloadUrl;
        if (target) {
          window.open(target, "_blank", "noopener,noreferrer");
        }
        setTimeout(() => setDone(false), 2500);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      onClick={handleDownload}
      disabled={loading}
      className={className}
      title={`Lượt tải hiện tại: ${count}`}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Đang xử lý
        </>
      ) : done ? (
        <>
          <CheckCircle2 className="size-4" />
          Đã mở liên kết
        </>
      ) : (
        <>
          <Download className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
