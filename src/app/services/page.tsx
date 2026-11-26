import { Suspense } from "react";
import type { Metadata } from "next";
import { ServicesWorkspace } from "@/components/services-workspace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { DemoKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "Nhận làm Web & Live Demo",
  description: "Trải nghiệm 4 Live Demo chức năng chạy thật và gửi yêu cầu làm web trên hạ tầng miễn phí.",
};

const VALID_DEMOS: DemoKey[] = [
  "dashboard-tool",
  "landing-showcase",
  "skill-inspector",
  "project-estimator",
];

async function ServicesContent({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const initialDemo: DemoKey = VALID_DEMOS.includes(demo as DemoKey)
    ? (demo as DemoKey)
    : "dashboard-tool";

  return <ServicesWorkspace initialDemo={initialDemo} />;
}

export default function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Dịch vụ làm Web & Phòng Live Demo
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Kiểm chứng trực tiếp chất lượng code, tốc độ phản hồi và cấu trúc chức năng trước khi gửi yêu cầu xây dựng website của riêng bạn.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
          <ServicesContent searchParams={searchParams} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
