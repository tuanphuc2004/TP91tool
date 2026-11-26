import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/catalog-skeleton";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkillsBrowser } from "@/components/skills-browser";
import { getPublishedItems } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Skill & Plugin miễn phí",
  description: "Kho chia sẻ miễn phí AI Skill, SKILL.md và Plugin bundle cho Antigravity & Claude Code.",
};

async function SkillsContent() {
  const items = await getPublishedItems({ kinds: ["skill", "plugin"] });
  return <SkillsBrowser items={items} />;
}

export default function SkillsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Chia sẻ Skill & Plugin miễn phí
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Xem hướng dẫn SKILL.md chi tiết, sao chép lệnh cài đặt 1 chạm và tải gói mở rộng cho quy trình lập trình web.
          </p>
        </div>

        <Suspense fallback={<CatalogGridSkeleton count={6} />}>
          <SkillsContent />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
