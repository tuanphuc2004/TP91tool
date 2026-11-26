"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { CopyCommandButton } from "@/components/copy-command-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseSkillFrontmatter } from "@/lib/skill-parser";

const PRESETS = {
  valid: `---
name: nextjs-clean-storefront
description: Build fast Next.js App Router storefronts with Tailwind v4, shadcn/ui, and strict server validation.
---

# Next.js Clean Storefront

1. Use Server Components by default and keep interactive state in isolated client leaves.
2. Validate all public inputs with Zod before writing to Supabase.`,
  broken: `---
name: Invalid Skill Name
---

Short body.`,
};

export function SkillInspectorDemo() {
  const [markdown, setMarkdown] = useState(PRESETS.valid);
  const parsed = useMemo(() => parseSkillFrontmatter(markdown), [markdown]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            Dán nội dung SKILL.md để kiểm tra chuẩn Antigravity & Claude
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setMarkdown(PRESETS.valid)}
            >
              Mẫu chuẩn
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setMarkdown(PRESETS.broken)}
            >
              Mẫu lỗi
            </Button>
          </div>
        </div>
        <Textarea
          rows={11}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="font-mono text-xs leading-relaxed bg-card"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4 lg:col-span-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Kết quả kiểm tra</span>
          {parsed.valid ? (
            <Badge className="gap-1">
              <CheckCircle2 className="size-3.5" />
              Hợp lệ
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="size-3.5" />
              Cần sửa ({parsed.issues.length})
            </Badge>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">name:</span>
            <span className="font-mono font-medium text-foreground">
              {parsed.name ?? "Chưa có"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Số từ hướng dẫn:</span>
            <span className="font-mono font-medium text-foreground">{parsed.wordCount} từ</span>
          </div>
          <div className="pt-1">
            <span className="text-muted-foreground">description:</span>
            <p className="mt-1 text-foreground leading-relaxed">
              {parsed.description ?? "Chưa phát hiện trường description"}
            </p>
          </div>
        </div>

        {parsed.issues.length > 0 && (
          <ul className="space-y-1.5 text-xs text-destructive">
            {parsed.issues.map((issue) => (
              <li key={issue} className="flex items-start gap-1.5">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Lệnh cài nhanh vào Antigravity
            </span>
            <CopyCommandButton text={parsed.installSnippet} label="Copy" size="xs" />
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-[11px] text-foreground">
            {parsed.installSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
