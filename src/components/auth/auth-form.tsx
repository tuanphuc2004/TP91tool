"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, UserPlus } from "lucide-react";
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
import { safeRedirectPath } from "@/lib/supabase/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

export function AuthForm({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const safeNext = safeRedirectPath(nextPath);

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
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setNotice(null);
            }}
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
            onClick={() => {
              setMode("register");
              setError(null);
              setNotice(null);
            }}
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

        <div>
          <CardTitle className="text-xl font-bold">
            {mode === "login" ? "Đăng nhập TP91tool" : "Tạo tài khoản mới"}
          </CardTitle>
          <CardDescription className="mt-1">
            {mode === "login"
              ? "Đăng nhập bằng tài khoản của bạn để quản lý phiên làm việc."
              : "Tạo tài khoản miễn phí chỉ trong vài giây."}
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

          <div className="space-y-2">
            <Label htmlFor="auth-password">Mật khẩu</Label>
            <Input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="auth-confirm-password">Nhập lại mật khẩu</Label>
              <Input
                id="auth-confirm-password"
                type="password"
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
            ) : (
              "Đăng ký tài khoản"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
