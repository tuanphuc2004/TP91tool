"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Crown,
  Loader2,
  Lock,
  Pencil,
  ShieldAlert,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  adminDeleteSubAdminAction,
  adminUpsertSubAdminAction,
} from "@/app/actions/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_PERMISSION_OPTIONS } from "@/lib/catalog-taxonomy";
import { isSuperAdminEmail } from "@/lib/supabase/auth";
import type { AdminAccountRecord, AdminPermission } from "@/lib/types";

interface AdminTeamPanelProps {
  accounts: AdminAccountRecord[];
  migrationReady: boolean;
  hasServiceRoleKey: boolean;
}

const PERM_LABEL_MAP: Record<AdminPermission, string> = {
  catalog: "Sản phẩm & Skill",
  orders: "Đơn mua",
  requests: "Yêu cầu Web",
};

export function AdminTeamPanel({
  accounts,
  migrationReady,
  hasServiceRoleKey,
}: AdminTeamPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccountRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccountRecord | null>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<AdminPermission[]>(["catalog"]);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function openCreate() {
    setEditingAccount(null);
    setEmail("");
    setDisplayName("");
    setPassword("");
    setPermissions(["catalog"]);
    setIsActive(true);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(account: AdminAccountRecord) {
    if (account.role === "super_admin" || isSuperAdminEmail(account.email)) return;
    setEditingAccount(account);
    setEmail(account.email);
    setDisplayName(account.display_name ?? "");
    setPassword("");
    setPermissions(account.permissions.length > 0 ? [...account.permissions] : ["catalog"]);
    setIsActive(account.is_active);
    setError(null);
    setDialogOpen(true);
  }

  function togglePermission(perm: AdminPermission) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (permissions.length === 0) {
      setError("Vui lòng chọn ít nhất 1 quyền cho tài khoản Admin này.");
      return;
    }

    setSaving(true);
    try {
      const res = await adminUpsertSubAdminAction({
        id: editingAccount?.id,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        password: editingAccount ? undefined : password,
        permissions,
        isActive,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      if (res.notice) {
        setNotice(res.notice);
      } else {
        setNotice("Đã lưu cấu hình phân quyền Admin.");
      }

      setDialogOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setNotice(null);
    try {
      const res = await adminDeleteSubAdminAction(deleteTarget.id);
      if (!res.ok) {
        setError(res.error);
      } else {
        setNotice(`Đã xóa quyền quản trị của ${deleteTarget.email}.`);
      }
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {!migrationReady && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Chưa kích hoạt bảng phân quyền Admin trên Supabase</AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed">
            Vui lòng mở Supabase SQL Editor của project <code>WebTP91tool</code> và chạy file{" "}
            <code>supabase/migrations/002_taxonomy_and_admin_rbac.sql</code> để bật lưu trữ danh sách Admin con và RLS bảo vệ Super Admin.
          </AlertDescription>
        </Alert>
      )}

      {notice && (
        <Alert>
          <CheckCircle2 className="size-4 text-primary" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Quản lý tài khoản & Giới hạn quyền Admin
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Super Admin (hoangphuc9102004@gmail.com) được bảo vệ tuyệt đối, Admin con chỉ thao tác trong phạm vi quyền được cấp.
          </p>
        </div>

        <Button type="button" size="sm" onClick={openCreate} disabled={!migrationReady}>
          <UserPlus className="size-4" />
          Tạo / Cấp quyền Admin
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tài khoản Admin</TableHead>
              <TableHead>Cấp độ</TableHead>
              <TableHead>Quyền được cấp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu trong bảng admin_accounts.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc) => {
                const isRoot =
                  acc.role === "super_admin" || isSuperAdminEmail(acc.email);
                return (
                  <TableRow key={acc.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{acc.email}</div>
                      {acc.display_name && (
                        <div className="text-xs text-muted-foreground">{acc.display_name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isRoot ? (
                        <Badge className="gap-1 bg-primary text-primary-foreground">
                          <Crown className="size-3" />
                          Quyền cao nhất
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Admin phân quyền</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {isRoot ? (
                          <Badge variant="outline" className="text-xs">
                            Toàn quyền hệ thống + Quản lý Admin
                          </Badge>
                        ) : (
                          acc.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {PERM_LABEL_MAP[perm] ?? perm}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={acc.is_active ? "default" : "outline"}>
                        {acc.is_active ? "Hoạt động" : "Tạm khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isRoot ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="size-3.5" />
                          Được bảo vệ
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(acc)}
                            aria-label={`Sửa quyền ${acc.email}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(acc)}
                            aria-label={`Xóa admin ${acc.email}`}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Cập nhật quyền Admin con" : "Tạo hoặc cấp quyền Admin con"}
            </DialogTitle>
            <DialogDescription>
              Tài khoản Admin con không thể xem tab này và không thể chỉnh sửa hay xóa Super Admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="subadmin-email">Email Admin</Label>
              <Input
                id="subadmin-email"
                type="email"
                required
                disabled={Boolean(editingAccount)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhanvien@tp91tool.vn"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subadmin-name">Tên hiển thị (tùy chọn)</Label>
              <Input
                id="subadmin-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ví dụ: Quản lý Đơn hàng"
              />
            </div>

            {!editingAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="subadmin-password">
                  Mật khẩu đăng nhập{" "}
                  {hasServiceRoleKey ? "(nếu tạo tài khoản mới)" : "(để trống nếu đã đăng ký ở /login)"}
                </Label>
                <PasswordInput
                  id="subadmin-password"
                  minLength={6}
                  disabled={!hasServiceRoleKey}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    hasServiceRoleKey
                      ? "Để trống nếu email đã đăng ký sẵn"
                      : "Cần SUPABASE_SERVICE_ROLE_KEY để tạo mật khẩu từ đây"
                  }
                />
                {!hasServiceRoleKey && (
                  <p className="text-xs text-muted-foreground">
                    Người được cấp quyền tự đăng ký tài khoản tại <code>/login</code>, sau đó bạn nhập email vào đây để kích hoạt quyền Admin tương ứng.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Phạm vi quyền được phép thao tác</Label>
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
                {ADMIN_PERMISSION_OPTIONS.map((opt) => {
                  const checked = permissions.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex items-start gap-2.5 rounded-lg p-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(opt.id)}
                        className="mt-0.5 size-4 accent-primary"
                      />
                      <div>
                        <div className="font-medium text-foreground">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 accent-primary"
              />
              Kích hoạt tài khoản Admin này
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang lưu
                  </>
                ) : editingAccount ? (
                  "Lưu thay đổi"
                ) : (
                  "Xác nhận cấp quyền"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi & xóa Admin con?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản <strong>{deleteTarget?.email}</strong> sẽ mất toàn bộ quyền truy cập trang Admin ngay lập tức.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
