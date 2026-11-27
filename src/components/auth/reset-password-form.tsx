"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { isAdminUser } from "@/lib/supabase/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(() => Boolean(supabase));
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(Boolean(session));
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!supabase) {
      setError("Hệ thống chưa cấu hình biến môi trường Supabase.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
      const target = isAdminUser(data.user) ? "/admin" : "/";
      router.push(target);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border shadow-xs">
      <CardHeader>
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
          <KeyRound className="size-5" />
        </div>
        <CardTitle className="text-xl font-bold">Đặt lại mật khẩu</CardTitle>
        <CardDescription>
          Nhập mật khẩu mới cho tài khoản TP91tool của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {checkingSession ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Đang xác thực phiên khôi phục...
          </div>
        ) : !hasSession ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Liên kết không hợp lệ hoặc đã hết hạn</AlertTitle>
              <AlertDescription className="mt-1 text-xs">
                Vui lòng yêu cầu lại liên kết đặt lại mật khẩu từ trang đăng nhập.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/login">Quay lại trang đăng nhập</Link>
            </Button>
          </div>
        ) : success ? (
          <Alert>
            <CheckCircle2 className="size-4 text-primary" />
            <AlertTitle>Đổi mật khẩu thành công</AlertTitle>
            <AlertDescription>
              Đang chuyển hướng bạn vào hệ thống...
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-password">Mật khẩu mới</Label>
              <PasswordInput
                id="reset-password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">Nhập lại mật khẩu mới</Label>
              <PasswordInput
                id="reset-confirm-password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <Button type="submit" className="w-full active:scale-[0.97]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang cập nhật
                </>
              ) : (
                "Cập nhật mật khẩu mới"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
