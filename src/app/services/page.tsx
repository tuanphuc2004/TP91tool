import type { Metadata } from "next";
import { ServicesWorkspace } from "@/components/services-workspace";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Nhận làm Web theo yêu cầu",
  description: "Ước tính phạm vi và gửi yêu cầu thiết kế, lập trình website trên hạ tầng miễn phí Vercel + Supabase.",
};

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dịch vụ Nhận làm Web theo yêu cầu
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Chọn gói chức năng phù hợp để ước tính thời gian và gửi yêu cầu xây dựng website tối ưu chi phí vận hành 0đ.
          </p>
        </div>

        <ServicesWorkspace />
      </main>

      <SiteFooter />
    </div>
  );
}
