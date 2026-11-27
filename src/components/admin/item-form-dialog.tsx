"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { adminUpsertItemAction } from "@/app/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  AI_PLATFORM_OPTIONS,
  getCategoryOptionsForKind,
  normalizePlatforms,
  slugifyTitle,
} from "@/lib/catalog-taxonomy";
import type { AiPlatform, CatalogItem, CatalogKind } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: CatalogItem | null;
}

const CUSTOM_CATEGORY_SENTINEL = "__custom__";

export function ItemFormDialog({ open, onOpenChange, editingItem }: ItemFormDialogProps) {
  const router = useRouter();
  const initialKind: CatalogKind = editingItem?.kind ?? "project";
  const initialPresets = getCategoryOptionsForKind(initialKind, editingItem?.category);

  const [kind, setKind] = useState<CatalogKind>(initialKind);
  const [slug, setSlug] = useState(editingItem?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(editingItem));
  const [title, setTitle] = useState(editingItem?.title ?? "");
  const [tagline, setTagline] = useState(editingItem?.tagline ?? "");
  const [description, setDescription] = useState(editingItem?.description ?? "");
  const [priceVnd, setPriceVnd] = useState(String(editingItem?.price_vnd ?? 0));
  const [category, setCategory] = useState(editingItem?.category ?? initialPresets[0]);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [platforms, setPlatforms] = useState<AiPlatform[]>(
    editingItem?.compatible_platforms ?? (initialKind === "skill" || initialKind === "plugin" ? ["all"] : [])
  );
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

  const categoryOptions = getCategoryOptionsForKind(kind, editingItem?.category);
  const showsAiPlatforms = kind === "skill" || kind === "plugin" || kind === "tool";
  const showsSkillFields = kind === "skill" || kind === "plugin" || kind === "tool";

  function handleKindChange(nextKind: CatalogKind) {
    setKind(nextKind);
    const presets = getCategoryOptionsForKind(nextKind);
    if (!editingItem) {
      setCategory(presets[0]);
      setCustomCategoryMode(false);
      if (nextKind === "skill" || nextKind === "plugin") {
        setPriceVnd("0");
        if (platforms.length === 0) setPlatforms(["all"]);
      } else if (nextKind === "project") {
        setPlatforms([]);
      }
    }
  }

  function togglePlatform(target: AiPlatform) {
    if (target === "all") {
      setPlatforms((prev) => (prev.includes("all") ? [] : ["all"]));
      return;
    }

    setPlatforms((prev) => {
      const expanded: AiPlatform[] = prev.includes("all")
        ? ["gemini", "chatgpt", "claude"]
        : prev.filter((p) => p !== "all");

      const next = expanded.includes(target)
        ? expanded.filter((p) => p !== target)
        : [...expanded, target];

      return normalizePlatforms(next);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if ((kind === "skill" || kind === "plugin") && platforms.length === 0) {
      setError("Vui lòng chọn ít nhất 1 nền tảng AI tương thích cho Skill / Plugin.");
      return;
    }

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
        category: category.trim(),
        compatible_platforms: showsAiPlatforms ? normalizePlatforms(platforms) : [],
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto p-6 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingItem ? `Chỉnh sửa: ${editingItem.title}` : "Thêm Dự án / Tool / Skill mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin theo 3 phần rõ ràng bên dưới. Nhấn lưu để đồng bộ ngay lên Supabase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Khối 1: Thông tin cơ bản */}
          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">1. Thông tin cơ bản</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="item-kind">Loại mục</Label>
                <Select value={kind} onValueChange={(v) => handleKindChange(v as CatalogKind)}>
                  <SelectTrigger id="item-kind" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Dự án Web</SelectItem>
                    <SelectItem value="tool">Tool tiện ích</SelectItem>
                    <SelectItem value="skill">AI Skill</SelectItem>
                    <SelectItem value="plugin">Plugin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="item-slug">Slug (đường dẫn URL)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (title.trim()) {
                        setSlug(slugifyTitle(title));
                        setSlugTouched(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    <Wand2 className="size-3" />
                    Tạo từ tiêu đề
                  </button>
                </div>
                <Input
                  id="item-slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-title">Tiêu đề</Label>
              <Input
                id="item-title"
                required
                minLength={2}
                value={title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setTitle(nextTitle);
                  if (!editingItem && !slugTouched) {
                    setSlug(slugifyTitle(nextTitle));
                  }
                }}
                placeholder="Tên sản phẩm, tool, skill hoặc plugin..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-tagline">Mô tả ngắn (tối thiểu 4 ký tự)</Label>
              <Input
                id="item-tagline"
                required
                minLength={4}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Mô tả ngắn gọn giá trị chính..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-desc">Mô tả chi tiết (tối thiểu 10 ký tự)</Label>
              <Textarea
                id="item-desc"
                required
                minLength={10}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả rõ chức năng, đối tượng sử dụng và điểm nổi bật..."
              />
            </div>
          </section>

          {/* Khối 2: Phân loại & Nền tảng AI */}
          <section className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              2. Phân loại & Nền tảng tương thích
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="item-category-select">Danh mục</Label>
                {customCategoryMode ? (
                  <div className="flex gap-2">
                    <Input
                      id="item-category-select"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Nhập tên danh mục mới..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomCategoryMode(false);
                        setCategory(categoryOptions[0]);
                      }}
                    >
                      Chọn sẵn
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={categoryOptions.includes(category) ? category : categoryOptions[0]}
                    onValueChange={(val) => {
                      if (val === CUSTOM_CATEGORY_SENTINEL) {
                        setCustomCategoryMode(true);
                        setCategory("");
                      } else {
                        setCategory(val);
                      }
                    }}
                  >
                    <SelectTrigger id="item-category-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value={CUSTOM_CATEGORY_SENTINEL}>
                        + Nhập danh mục khác...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="item-price">Giá (VNĐ, nhập 0 = Miễn phí)</Label>
                <Input
                  id="item-price"
                  type="number"
                  min={0}
                  value={priceVnd}
                  onChange={(e) => setPriceVnd(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            {showsAiPlatforms && (
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Nền tảng AI sử dụng{" "}
                  <span className="font-normal text-muted-foreground">
                    (Gemini, ChatGPT, Claude hoặc Tất cả)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AI_PLATFORM_OPTIONS.map((opt) => {
                    const selected =
                      opt.id === "all"
                        ? platforms.includes("all")
                        : platforms.includes("all") || platforms.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => togglePlatform(opt.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {selected && <Check className="size-3.5" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="item-tech">Tech stack / Nhãn phụ (cách nhau bằng dấu phẩy)</Label>
              <Input
                id="item-tech"
                value={techStackText}
                onChange={(e) => setTechStackText(e.target.value)}
              />
            </div>
          </section>

          {/* Khối 3: Tài nguyên & Hiển thị */}
          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">3. Tài nguyên & Xuất bản</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="item-demourl">Link trang thực tế (tùy chọn)</Label>
                <Input
                  id="item-demourl"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
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

            {showsSkillFields && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="item-install">Lệnh cài đặt nhanh</Label>
                  <Input
                    id="item-install"
                    value={installCommand}
                    onChange={(e) => setInstallCommand(e.target.value)}
                    placeholder="npx ... hoặc git clone ..."
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="item-skillmd">Nội dung SKILL.md / Hướng dẫn cấu hình</Label>
                  <Textarea
                    id="item-skillmd"
                    rows={4}
                    value={skillMarkdown}
                    onChange={(e) => setSkillMarkdown(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="item-features">Tính năng nổi bật (mỗi dòng 1 ý)</Label>
              <Textarea
                id="item-features"
                rows={3}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Nổi bật trang chủ
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Công khai
              </label>
            </div>
          </section>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="-mx-6 -mb-6 mt-2 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu
                </>
              ) : editingItem ? (
                "Lưu thay đổi"
              ) : (
                "Tạo mục mới"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
