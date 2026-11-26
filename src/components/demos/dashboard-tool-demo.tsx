"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatVnd } from "@/lib/order-helper";

interface DemoRow {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "paid" | "pending";
}

const INITIAL_ROWS: DemoRow[] = [
  { id: "ORD-101", customer: "Minh Quân", product: "TP91 Commerce Starter", amount: 490000, status: "paid" },
  { id: "ORD-102", customer: "Hải Yến", product: "Mini POS & Export Tool", amount: 290000, status: "paid" },
  { id: "ORD-103", customer: "Đức Anh", product: "Booking Portal Kit", amount: 790000, status: "pending" },
];

export function DashboardToolDemo() {
  const [rows, setRows] = useState<DemoRow[]>(INITIAL_ROWS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [newCustomer, setNewCustomer] = useState("");
  const [newAmount, setNewAmount] = useState("350000");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          row.customer.toLowerCase().includes(q) ||
          row.product.toLowerCase().includes(q) ||
          row.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, query, statusFilter]);

  const paidTotal = useMemo(
    () => filtered.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount, 0),
    [filtered]
  );

  function handleAddRow(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = newCustomer.trim() || `Khách mẫu #${rows.length + 1}`;
    const parsedAmount = Math.max(0, Number.parseInt(newAmount, 10) || 250000);
    setRows((prev) => [
      {
        id: `ORD-${101 + prev.length}`,
        customer: cleanName,
        product: "Gói Tool Tùy Chỉnh",
        amount: parsedAmount,
        status: "pending",
      },
      ...prev,
    ]);
    setNewCustomer("");
  }

  function toggleStatus(id: string) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: row.status === "paid" ? "pending" : "paid" }
          : row
      )
    );
  }

  function exportFile(type: "csv" | "json") {
    let content = "";
    let mime = "application/json;charset=utf-8";
    if (type === "json") {
      content = JSON.stringify(filtered, null, 2);
    } else {
      const header = "ID,KhachHang,SanPham,GiaTriVND,TrangThai";
      const lines = filtered.map(
        (r) => `${r.id},"${r.customer.replace(/"/g, '""')}","${r.product}",${r.amount},${r.status}`
      );
      content = `\uFEFF${header}\n${lines.join("\n")}`;
      mime = "text/csv;charset=utf-8";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tp91tool-demo.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Đơn đang lọc</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
            {filtered.length}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Doanh thu đã thu</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-primary">
            {formatVnd(paidTotal)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-2">
          <div className="text-xs text-muted-foreground">Xuất dữ liệu thật</div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="xs" onClick={() => exportFile("csv")}>
              <Download className="size-3.5" />
              CSV
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => exportFile("json")}>
              <Download className="size-3.5" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã đơn hoặc tên khách..."
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | "paid" | "pending")}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleAddRow} className="flex flex-wrap items-center gap-2">
          <Input
            value={newCustomer}
            onChange={(e) => setNewCustomer(e.target.value)}
            placeholder="Tên khách mới"
            className="w-36"
          />
          <Input
            type="number"
            min={0}
            step={10000}
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="w-28 font-mono"
          />
          <Button type="submit" size="sm">
            <Plus className="size-4" />
            Thêm
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Giá trị</TableHead>
              <TableHead className="text-right">Trạng thái (bấm để đổi)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="font-medium">{row.customer}</TableCell>
                <TableCell className="text-muted-foreground">{row.product}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatVnd(row.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => toggleStatus(row.id)}
                    className="cursor-pointer"
                  >
                    <Badge variant={row.status === "paid" ? "default" : "secondary"}>
                      {row.status === "paid" ? "Đã thanh toán" : "Chờ xử lý"}
                    </Badge>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
