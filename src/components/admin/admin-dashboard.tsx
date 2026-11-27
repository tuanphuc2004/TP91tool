"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  LogOut,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
import {
  AI_PLATFORM_OPTIONS,
  KIND_LABELS,
  formatPlatformLabels,
  matchesPlatformFilter,
} from "@/lib/catalog-taxonomy";
import { formatVnd } from "@/lib/order-helper";
import { hasAdminPermission } from "@/lib/supabase/auth";
import type {
  AdminAccountRecord,
  AdminActor,
  AiPlatform,
  CatalogItem,
  CatalogKind,
  OrderRecord,
  ProjectRequestRecord,
} from "@/lib/types";
import { AdminTeamPanel } from "./admin-team-panel";
import { ItemFormDialog } from "./item-form-dialog";

const PAGE_SIZE = 8;

interface AdminDashboardProps {
  actor: AdminActor;
  items: CatalogItem[];
  orders: OrderRecord[];
  requests: ProjectRequestRecord[];
  adminAccounts: AdminAccountRecord[];
  adminMigrationReady: boolean;
  hasServiceRoleKey: boolean;
}

function PaginationBar({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (nextPage: number) => void;
}) {
  if (totalItems <= PAGE_SIZE) return null;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(totalItems, page * PAGE_SIZE);

  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row">
      <span>
        Hiển thị <strong className="text-foreground">{start}</strong>-
        <strong className="text-foreground">{end}</strong> trong tổng{" "}
        <strong className="text-foreground">{totalItems}</strong> mục
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-3.5" />
          Trước
        </Button>
        <span className="px-2 font-medium tabular-nums text-foreground">
          Trang {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function AdminDashboard({
  actor,
  items,
  orders,
  requests,
  adminAccounts,
  adminMigrationReady,
  hasServiceRoleKey,
}: AdminDashboardProps) {
  const router = useRouter();
  const canCatalog = hasAdminPermission(actor, "catalog");
  const canOrders = hasAdminPermission(actor, "orders");
  const canRequests = hasAdminPermission(actor, "requests");

  const defaultTab = canCatalog
    ? "catalog"
    : canOrders
      ? "orders"
      : canRequests
        ? "requests"
        : "team";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formNonce, setFormNonce] = useState(0);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Catalog filters + pagination
  const [kindFilter, setKindFilter] = useState<"all" | CatalogKind>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<"all" | AiPlatform>("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);

  // Orders filters + pagination
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);

  // Requests filters + pagination
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPage, setRequestPage] = useState(1);

  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const newRequestsCount = requests.filter((r) => r.status === "new").length;

  const kindCounts = useMemo(() => {
    const counts: Record<"all" | CatalogKind, number> = {
      all: items.length,
      project: 0,
      tool: 0,
      skill: 0,
      plugin: 0,
    };
    for (const item of items) {
      counts[item.kind] += 1;
    }
    return counts;
  }, [items]);

  const availableCategories = useMemo(() => {
    const source =
      kindFilter === "all" ? items : items.filter((item) => item.kind === kindFilter);
    return Array.from(new Set(source.map((i) => i.category))).sort((a, b) =>
      a.localeCompare(b, "vi")
    );
  }, [items, kindFilter]);

  const filteredItems = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (platformFilter !== "all" && !matchesPlatformFilter(item.compatible_platforms, platformFilter)) {
        return false;
      }
      if (q) {
        const hay = `${item.title} ${item.slug} ${item.category} ${item.tech_stack.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, kindFilter, categoryFilter, platformFilter, catalogSearch]);

  const catalogTotalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safeCatalogPage = Math.min(catalogPage, catalogTotalPages);
  const pagedItems = filteredItems.slice(
    (safeCatalogPage - 1) * PAGE_SIZE,
    safeCatalogPage * PAGE_SIZE
  );

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) return false;
      if (q) {
        const hay = `${order.item_title} ${order.customer_name} ${order.customer_contact}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, orderTotalPages);
  const pagedOrders = filteredOrders.slice(
    (safeOrderPage - 1) * PAGE_SIZE,
    safeOrderPage * PAGE_SIZE
  );

  const filteredRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase();
    return requests.filter((req) => {
      if (requestStatusFilter !== "all" && req.status !== requestStatusFilter) return false;
      if (q) {
        const hay = `${req.customer_name} ${req.customer_contact} ${req.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, requestStatusFilter, requestSearch]);

  const requestTotalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safeRequestPage = Math.min(requestPage, requestTotalPages);
  const pagedRequests = filteredRequests.slice(
    (safeRequestPage - 1) * PAGE_SIZE,
    safeRequestPage * PAGE_SIZE
  );

  function openCreate() {
    setEditingItem(null);
    setFormNonce((n) => n + 1);
    setDialogOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditingItem(item);
    setFormNonce((n) => n + 1);
    setDialogOpen(true);
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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Quản trị TP91tool
            </h1>
            {actor.isSuperAdmin ? (
              <Badge className="gap-1 bg-primary text-primary-foreground">
                <Crown className="size-3" />
                Super Admin
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3.5 text-primary" />
                Admin phân quyền
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng nhập với: <span className="font-medium text-foreground">{actor.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCatalog && (
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" />
              Thêm mục mới
            </Button>
          )}
          <form action={adminSignOutAction}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>

      {/* Thẻ thống kê gọn */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canCatalog && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Kho Sản phẩm & Skill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tabular-nums text-foreground">
                {items.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {kindCounts.project} dự án, {kindCounts.tool} tool, {kindCounts.skill} skill,{" "}
                {kindCounts.plugin} plugin
              </p>
            </CardContent>
          </Card>
        )}

        {canOrders && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đơn chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tabular-nums text-primary">
                {pendingOrdersCount}
              </div>
              <p className="text-xs text-muted-foreground">Tổng {orders.length} đơn mua</p>
            </CardContent>
          </Card>
        )}

        {canRequests && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Yêu cầu làm Web mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tabular-nums text-primary">
                {newRequestsCount}
              </div>
              <p className="text-xs text-muted-foreground">Tổng {requests.length} yêu cầu</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          {canCatalog && (
            <TabsTrigger value="catalog">
              Sản phẩm & Skill ({items.length})
            </TabsTrigger>
          )}
          {canOrders && (
            <TabsTrigger value="orders">
              Đơn mua ({orders.length})
            </TabsTrigger>
          )}
          {canRequests && (
            <TabsTrigger value="requests">
              Yêu cầu làm Web ({requests.length})
            </TabsTrigger>
          )}
          {actor.isSuperAdmin && (
            <TabsTrigger value="team">
              Phân quyền Admin ({adminAccounts.length})
            </TabsTrigger>
          )}
        </TabsList>

        {canCatalog && (
          <TabsContent value="catalog" className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "project", "tool", "skill", "plugin"] as const).map((kindKey) => (
                  <Button
                    key={kindKey}
                    type="button"
                    size="xs"
                    variant={kindFilter === kindKey ? "default" : "outline"}
                    onClick={() => {
                      setKindFilter(kindKey);
                      setCategoryFilter("all");
                      setCatalogPage(1);
                    }}
                  >
                    {kindKey === "all" ? "Tất cả" : KIND_LABELS[kindKey]} ({kindCounts[kindKey]})
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative lg:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setCatalogPage(1);
                    }}
                    placeholder="Tìm theo tiêu đề, slug, tech..."
                    className="pl-9"
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={(val) => {
                    setCategoryFilter(val);
                    setCatalogPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Lọc danh mục">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Mọi danh mục</SelectItem>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={platformFilter}
                  onValueChange={(val) => {
                    setPlatformFilter(val as "all" | AiPlatform);
                    setCatalogPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Lọc nền tảng AI">
                    <SelectValue placeholder="Nền tảng AI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Mọi nền tảng AI</SelectItem>
                    {AI_PLATFORM_OPTIONS.filter((opt) => opt.id !== "all").map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        Dùng cho {opt.shortLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Tiêu đề</TableHead>
                      <TableHead>Loại & Danh mục</TableHead>
                      <TableHead>Nền tảng AI</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          Không có mục nào khớp bộ lọc hiện tại.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedItems.map((item) => {
                        const platformLabels = formatPlatformLabels(item.compatible_platforms);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-[280px]">
                              <div className="truncate font-semibold text-foreground">
                                {item.title}
                              </div>
                              <div className="truncate font-mono text-xs text-muted-foreground">
                                {item.slug}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary" className="text-xs font-medium">
                                  {KIND_LABELS[item.kind]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.category}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {platformLabels.length === 0 ? (
                                <span className="text-xs text-muted-foreground">-</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {platformLabels.map((lbl) => (
                                    <Badge key={lbl} variant="outline" className="text-xs">
                                      {lbl}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-sm font-medium tabular-nums whitespace-nowrap">
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
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationBar
                page={safeCatalogPage}
                totalPages={catalogTotalPages}
                totalItems={filteredItems.length}
                onPageChange={setCatalogPage}
              />
            </div>
          </TabsContent>
        )}

        {canOrders && (
          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={orderSearch}
                  onChange={(e) => {
                    setOrderSearch(e.target.value);
                    setOrderPage(1);
                  }}
                  placeholder="Tìm theo sản phẩm, tên khách, liên hệ..."
                  className="pl-9"
                />
              </div>

              <Select
                value={orderStatusFilter}
                onValueChange={(val) => {
                  setOrderStatusFilter(val);
                  setOrderPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48" aria-label="Lọc trạng thái đơn">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="delivered">Đã bàn giao</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
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
                    {pagedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          Chưa có đơn hàng nào khớp bộ lọc.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="max-w-[220px] truncate font-medium">
                            {order.item_title}
                          </TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell className="text-xs">
                            <span className="mr-1.5 font-semibold uppercase">
                              {order.contact_channel}:
                            </span>
                            <span>{order.customer_contact}</span>
                          </TableCell>
                          <TableCell className="text-sm font-medium tabular-nums whitespace-nowrap">
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
              <PaginationBar
                page={safeOrderPage}
                totalPages={orderTotalPages}
                totalItems={filteredOrders.length}
                onPageChange={setOrderPage}
              />
            </div>
          </TabsContent>
        )}

        {canRequests && (
          <TabsContent value="requests" className="space-y-4">
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={requestSearch}
                  onChange={(e) => {
                    setRequestSearch(e.target.value);
                    setRequestPage(1);
                  }}
                  placeholder="Tìm theo tên khách, liên hệ, mô tả..."
                  className="pl-9"
                />
              </div>

              <Select
                value={requestStatusFilter}
                onValueChange={(val) => {
                  setRequestStatusFilter(val);
                  setRequestPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48" aria-label="Lọc trạng thái yêu cầu">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="new">Mới nhận</SelectItem>
                  <SelectItem value="reviewing">Đang xem xét</SelectItem>
                  <SelectItem value="quoted">Đã báo giá</SelectItem>
                  <SelectItem value="in_progress">Đang làm</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
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
                    {pagedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          Chưa có yêu cầu làm web nào khớp bộ lọc.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="font-medium">{req.customer_name}</div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {req.service_package}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="mr-1 font-semibold uppercase">
                              {req.contact_channel}:
                            </span>
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
              <PaginationBar
                page={safeRequestPage}
                totalPages={requestTotalPages}
                totalItems={filteredRequests.length}
                onPageChange={setRequestPage}
              />
            </div>
          </TabsContent>
        )}

        {actor.isSuperAdmin && (
          <TabsContent value="team">
            <AdminTeamPanel
              accounts={adminAccounts}
              migrationReady={adminMigrationReady}
              hasServiceRoleKey={hasServiceRoleKey}
            />
          </TabsContent>
        )}
      </Tabs>

      {canCatalog && (
        <>
          <ItemFormDialog
            key={`${editingItem?.id ?? "new"}-${formNonce}`}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editingItem={editingItem}
          />

          <AlertDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(o) => !o && setDeleteTarget(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa mục này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn sắp xóa vĩnh viễn <strong>{deleteTarget?.title}</strong> khỏi cơ sở dữ liệu
                  Supabase.
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
        </>
      )}
    </div>
  );
}
