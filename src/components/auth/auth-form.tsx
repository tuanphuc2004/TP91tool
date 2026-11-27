"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, LogIn, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { safeRedirectPath } from "@/lib/supabase/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register" | "forgot";

export function AuthForm({
  nextPath = "/",
  initialError = null,
}: {
  nextPath?: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  const safeNext = safeRedirectPath(nextPath);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Hệ thống chưa cấu hình biến môi trường Supabase.");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setError("Mật khẩu cần tối thiểu 6 ký tự.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          { redirectTo }
        );

        if (resetError) {
          setError(
            resetError.message ||
              "Không thể gửi email khôi phục mật khẩu lúc này. Vui lòng thử lại sau."
          );
          return;
        }

        setNotice(
          `Đã gửi liên kết đặt lại mật khẩu tới ${cleanEmail}. Vui lòng kiểm tra cả hộp thư đến và thư mục Spam.`
        );
        return;
      }

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInError) {
          setError("Email hoặc mật khẩu không đúng.");
          return;
        }

        router.push(safeNext);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || "Không thể tạo tài khoản. Vui lòng thử lại.");
        return;
      }

      if (data.session) {
        router.push(safeNext);
        router.refresh();
      } else {
        setNotice(
          "Đăng ký thành công! Vui lòng kiểm tra hộp thư email để xác nhận tài khoản trước khi đăng nhập."
        );
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border shadow-xs">
      <CardHeader className="space-y-4">
        {mode === "forgot" ? (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Quay lại đăng nhập
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer",
                mode === "login"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="size-4 text-primary" />
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer",
                mode === "register"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserPlus className="size-4 text-primary" />
              Đăng ký
            </button>
          </div>
        )}

        <div>
          <CardTitle className="text-xl font-bold">
            {mode === "login"
              ? "Đăng nhập TP91tool"
              : mode === "register"
                ? "Tạo tài khoản mới"
                : "Quên mật khẩu"}
          </CardTitle>
          <CardDescription className="mt-1">
            {mode === "login"
              ? "Đăng nhập bằng tài khoản của bạn để quản lý phiên làm việc."
              : mode === "register"
                ? "Tạo tài khoản miễn phí chỉ trong vài giây."
                : "Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {notice && (
            <Alert>
              <CheckCircle2 className="size-4 text-primary" />
              <AlertTitle>Thông báo</AlertTitle>
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="auth-password">Mật khẩu</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <PasswordInput
                id="auth-password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="auth-confirm-password">Nhập lại mật khẩu</Label>
              <PasswordInput
                id="auth-confirm-password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          )}

          <Button type="submit" className="w-full active:scale-[0.97]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xử lý
              </>
            ) : mode === "login" ? (
              "Đăng nhập"
            ) : mode === "register" ? (
              "Đăng ký tài khoản"
            ) : (
              <>
                <KeyRound className="size-4" />
                Gửi liên kết đặt lại mật khẩu
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
