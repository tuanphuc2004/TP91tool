"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyCommandButtonProps {
  text: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "xs";
}

export function CopyCommandButton({
  text,
  label = "Sao chép lệnh",
  className,
  variant = "outline",
  size = "sm",
}: CopyCommandButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("whitespace-nowrap", className)}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-primary" />
          Đã sao chép
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
