import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/catalog-skeleton";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedItems } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Dự án & Tool",
  description: "Khám phá các dự án web mẫu và công cụ tiện ích tại TP91tool.",
};

async function MarketplaceContent() {
  const items = await getPublishedItems({ kinds: ["project", "tool"] });
  return <MarketplaceBrowser items={items} />;
}

export default function MarketplacePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Kho Dự án Web & Tool
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Chọn sản phẩm trả phí để đặt mua nhanh qua Zalo, Telegram, Facebook hoặc Email, hoặc tải ngay các tool miễn phí.
          </p>
        </div>

        <Suspense fallback={<CatalogGridSkeleton count={6} />}>
          <MarketplaceContent />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
