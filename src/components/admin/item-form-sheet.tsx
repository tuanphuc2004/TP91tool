"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { adminUpsertItemAction } from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { CatalogItem, CatalogKind } from "@/lib/types";

interface ItemFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: CatalogItem | null;
}

export function ItemFormSheet({ open, onOpenChange, editingItem }: ItemFormSheetProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(editingItem?.slug ?? "");
  const [kind, setKind] = useState<CatalogKind>(editingItem?.kind ?? "project");
  const [title, setTitle] = useState(editingItem?.title ?? "");
  const [tagline, setTagline] = useState(editingItem?.tagline ?? "");
  const [description, setDescription] = useState(editingItem?.description ?? "");
  const [priceVnd, setPriceVnd] = useState(String(editingItem?.price_vnd ?? 0));
  const [category, setCategory] = useState(editingItem?.category ?? "Web App");
  const [techStackText, setTechStackText] = useState(
    editingItem?.tech_stack.join(", ") ?? "Next.js 16, Tailwind v4, Supabase"
  );
  const [featuresText, setFeaturesText] = useState(editingItem?.features.join("\n") ?? "");
  const [demoUrl, setDemoUrl] = useState(editingItem?.demo_url ?? "");
  const [installCommand, setInstallCommand] = useState(editingItem?.install_command ?? "");
  const [downloadUrl, setDownloadUrl] = useState(editingItem?.download_url ?? "");
  const [skillMarkdown, setSkillMarkdown] = useState(editingItem?.skill_markdown ?? "");
  const [featured, setFeatured] = useState(editingItem?.featured ?? false);
  const [published, setPublished] = useState(editingItem?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await adminUpsertItemAction({
        id: editingItem?.id,
        slug: slug.trim().toLowerCase(),
        kind,
        title,
        tagline,
        description,
        price_vnd: Math.max(0, Number.parseInt(priceVnd, 10) || 0),
        category,
        tech_stack: techStackText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        features: featuresText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        demo_key: null,
        demo_url: demoUrl,
        install_command: installCommand,
        download_url: downloadUrl,
        skill_markdown: skillMarkdown,
        featured,
        published,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {editingItem ? `Chỉnh sửa: ${editingItem.title}` : "Thêm Dự án / Tool / Skill mới"}
          </SheetTitle>
          <SheetDescription>
            Điền đầy đủ thông tin và nhấn lưu để cập nhật ngay lên Supabase Postgres.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="item-kind">Loại mục</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as CatalogKind)}>
                <SelectTrigger id="item-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Dự án Web (project)</SelectItem>
                  <SelectItem value="tool">Tool (tool)</SelectItem>
                  <SelectItem value="skill">Skill (skill)</SelectItem>
                  <SelectItem value="plugin">Plugin (plugin)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-slug">Slug (URL)</Label>
              <Input
                id="item-slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vi-du-tool-moi"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-title">Tiêu đề</Label>
            <Input
              id="item-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-tagline">Mô tả ngắn</Label>
            <Input
              id="item-tagline"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-desc">Mô tả chi tiết</Label>
            <Textarea
              id="item-desc"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="item-price">Giá (VNĐ, 0 = Miễn phí)</Label>
              <Input
                id="item-price"
                type="number"
                min={0}
                value={priceVnd}
                onChange={(e) => setPriceVnd(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-category">Danh mục</Label>
              <Input
                id="item-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-tech">Tech stack (cách nhau bằng dấu phẩy)</Label>
            <Input
              id="item-tech"
              value={techStackText}
              onChange={(e) => setTechStackText(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-features">Tính năng nổi bật (mỗi dòng 1 ý)</Label>
            <Textarea
              id="item-features"
              rows={3}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-demourl">Link trang thực tế (tùy chọn)</Label>
            <Input
              id="item-demourl"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="item-install">Lệnh cài đặt (nếu là Skill/Plugin)</Label>
              <Input
                id="item-install"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-download">Link tải (GitHub / Archive)</Label>
              <Input
                id="item-download"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-skillmd">Nội dung SKILL.md (tùy chọn)</Label>
            <Textarea
              id="item-skillmd"
              rows={4}
              value={skillMarkdown}
              onChange={(e) => setSkillMarkdown(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span>Hiển thị nổi bật trang chủ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span>Công khai (Published)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
