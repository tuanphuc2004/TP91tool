import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-mono text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Không tìm thấy nội dung yêu cầu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đường dẫn có thể đã thay đổi hoặc sản phẩm tạm thời bị ẩn bởi quản trị viên.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/marketplace">Xem Dự án & Tool</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
