"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminDeleteItemAction,
  adminSignOutAction,
  adminUpdateOrderStatusAction,
  adminUpdateRequestStatusAction,
} from "@/app/actions/admin";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatVnd } from "@/lib/order-helper";
import type { CatalogItem, OrderRecord, ProjectRequestRecord } from "@/lib/types";
import { ItemFormSheet } from "./item-form-sheet";

interface AdminDashboardProps {
  adminEmail: string;
  items: CatalogItem[];
  orders: OrderRecord[];
  requests: ProjectRequestRecord[];
}

export function AdminDashboard({
  adminEmail,
  items,
  orders,
  requests,
}: AdminDashboardProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const newRequestsCount = requests.filter((r) => r.status === "new").length;

  function openCreate() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await adminDeleteItemAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleOrderStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await adminUpdateOrderStatusAction(id, status);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRequestStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await adminUpdateRequestStatusAction(id, status);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Quản trị TP91tool
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng nhập với: {adminEmail}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm mục mới
          </Button>
          <form action={adminSignOutAction}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng sản phẩm & Skill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-foreground">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đơn chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-primary">
              {pendingOrdersCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yêu cầu làm Web mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-primary">
              {newRequestsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Sản phẩm & Skill ({items.length})</TabsTrigger>
          <TabsTrigger value="orders">Đơn mua ({orders.length})</TabsTrigger>
          <TabsTrigger value="requests">Yêu cầu làm Web ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">{item.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {item.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">
                      {formatVnd(item.price_vnd)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.published ? "default" : "outline"}>
                        {item.published ? "Công khai" : "Đang ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(item)}
                          aria-label={`Sửa ${item.title}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Xóa ${item.title}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead className="text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      Chưa có đơn hàng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.item_title}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell className="text-xs">
                        <span className="mr-1.5 font-semibold uppercase">
                          {order.contact_channel}:
                        </span>
                        <span>{order.customer_contact}</span>
                      </TableCell>
                      <TableCell className="text-sm font-medium tabular-nums">
                        {formatVnd(order.amount_vnd)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={order.status}
                          disabled={busyId === order.id}
                          onValueChange={(val) => handleOrderStatus(order.id, val)}
                        >
                          <SelectTrigger className="ml-auto w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="contacted">Đã liên hệ</SelectItem>
                            <SelectItem value="paid">Đã thanh toán</SelectItem>
                            <SelectItem value="delivered">Đã bàn giao</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gói / Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Ngân sách & Hạn</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      Chưa có yêu cầu làm web nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{req.customer_name}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {req.service_package}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="mr-1 font-semibold uppercase">{req.contact_channel}:</span>
                        <span>{req.customer_contact}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{req.budget_range}</div>
                        <div className="text-muted-foreground">{req.timeline}</div>
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-muted-foreground">
                        <p className="line-clamp-2">{req.description}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={req.status}
                          disabled={busyId === req.id}
                          onValueChange={(val) => handleRequestStatus(req.id, val)}
                        >
                          <SelectTrigger className="ml-auto w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Mới nhận</SelectItem>
                            <SelectItem value="reviewing">Đang xem xét</SelectItem>
                            <SelectItem value="quoted">Đã báo giá</SelectItem>
                            <SelectItem value="in_progress">Đang làm</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ItemFormSheet
        key={editingItem?.id ?? "new"}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingItem={editingItem}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mục này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa vĩnh viễn <strong>{deleteTarget?.title}</strong> khỏi cơ sở dữ liệu Supabase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={Boolean(busyId)}>
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
