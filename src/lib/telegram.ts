import { formatVnd } from "./order-helper";
import { SITE_CONFIG } from "./site-config";
import type { ContactChannel, ServicePackage } from "./types";

const CHANNEL_LABELS: Record<ContactChannel, string> = {
  zalo: "Zalo",
  telegram: "Telegram",
  facebook: "Facebook",
  email: "Email",
};

export interface TelegramOrderPayload {
  mode: "database" | "preview";
  orderId: string;
  itemTitle: string;
  amountVnd: number;
  customerName: string;
  contactChannel: ContactChannel;
  customerContact: string;
  note: string | null;
}

export interface TelegramProjectRequestPayload {
  mode: "database" | "preview";
  requestId: string;
  servicePackage: ServicePackage;
  customerName: string;
  contactChannel: ContactChannel;
  customerContact: string;
  budgetRange: string;
  timeline: string;
  selectedFeatures: string[];
  description: string;
  referenceUrl?: string | null;
}

const DEFAULT_NOTIFY_API_URL =
  "https://tp91-telegram-notifier.vercel.app/api/notify";

export function isHostedNotifyConfigured(): boolean {
  return Boolean(process.env.TP91_NOTIFY_KEY?.trim());
}

export function isTelegramConfigured(): boolean {
  return (
    isHostedNotifyConfigured() ||
    Boolean(
      process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim()
    )
  );
}

export function escapeTelegramHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function truncateText(value: string, maxLength: number): string {
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function formatVietnamTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatOrderTelegramMessage(
  input: TelegramOrderPayload,
  now: Date = new Date()
): string {
  const modeTag = input.mode === "preview" ? " [PREVIEW]" : "";
  const lines = [
    `<b>🛒 ĐƠN HÀNG MỚI${modeTag} — ${escapeTelegramHtml(SITE_CONFIG.brandName)}</b>`,
    ``,
    `• <b>Mã đơn:</b> <code>${escapeTelegramHtml(input.orderId)}</code>`,
    `• <b>Sản phẩm:</b> ${escapeTelegramHtml(input.itemTitle)}`,
    `• <b>Giá trị:</b> ${escapeTelegramHtml(formatVnd(input.amountVnd))}`,
    `• <b>Khách hàng:</b> ${escapeTelegramHtml(input.customerName)}`,
    `• <b>Liên hệ (${CHANNEL_LABELS[input.contactChannel]}):</b> <code>${escapeTelegramHtml(input.customerContact)}</code>`,
  ];

  if (input.note && input.note.trim().length > 0) {
    lines.push(
      `• <b>Ghi chú:</b> ${escapeTelegramHtml(truncateText(input.note, 500))}`
    );
  }

  lines.push(`• <b>Thời gian:</b> ${escapeTelegramHtml(formatVietnamTime(now))}`);
  return lines.join("\n");
}

export function formatProjectRequestTelegramMessage(
  input: TelegramProjectRequestPayload,
  now: Date = new Date()
): string {
  const modeTag = input.mode === "preview" ? " [PREVIEW]" : "";
  const pkgName =
    SITE_CONFIG.servicePackages.find((p) => p.id === input.servicePackage)?.name ??
    input.servicePackage;

  const featureLabels = input.selectedFeatures.map((id) => {
    const found = SITE_CONFIG.estimatorFeatures.find((f) => f.id === id);
    return found ? found.label : id;
  });

  const lines = [
    `<b>🧩 YÊU CẦU LÀM WEB MỚI${modeTag} — ${escapeTelegramHtml(SITE_CONFIG.brandName)}</b>`,
    ``,
    `• <b>Mã yêu cầu:</b> <code>${escapeTelegramHtml(input.requestId)}</code>`,
    `• <b>Gói dịch vụ:</b> ${escapeTelegramHtml(pkgName)}`,
    `• <b>Ngân sách:</b> ${escapeTelegramHtml(input.budgetRange)}`,
    `• <b>Thời gian:</b> ${escapeTelegramHtml(input.timeline)}`,
    `• <b>Khách hàng:</b> ${escapeTelegramHtml(input.customerName)}`,
    `• <b>Liên hệ (${CHANNEL_LABELS[input.contactChannel]}):</b> <code>${escapeTelegramHtml(input.customerContact)}</code>`,
  ];

  if (featureLabels.length > 0) {
    lines.push(
      `• <b>Tính năng:</b> ${escapeTelegramHtml(featureLabels.join(", "))}`
    );
  }

  if (input.referenceUrl) {
    lines.push(`• <b>Link mẫu:</b> ${escapeTelegramHtml(input.referenceUrl)}`);
  }

  lines.push(
    `• <b>Mô tả:</b> ${escapeTelegramHtml(truncateText(input.description, 1000))}`
  );
  lines.push(`• <b>Gửi lúc:</b> ${escapeTelegramHtml(formatVietnamTime(now))}`);

  return lines.join("\n");
}

export async function sendTelegramNotification(
  htmlText: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true; skipped?: boolean } | { ok: false; error: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: truncateText(htmlText, 4000),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(4500),
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        error: `Telegram API HTTP ${response.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Telegram request failed",
    };
  }
}

export async function sendHostedNotifyRequest(
  payload: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true; skipped?: boolean } | { ok: false; error: string }> {
  const apiKey = process.env.TP91_NOTIFY_KEY?.trim();
  if (!apiKey) {
    return { ok: true, skipped: true };
  }

  const endpoint =
    process.env.TP91_NOTIFY_URL?.trim() || DEFAULT_NOTIFY_API_URL;

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        error: `TP91 Notify API HTTP ${response.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "TP91 Notify request failed",
    };
  }
}

export async function notifyTelegramNewOrder(
  input: TelegramOrderPayload,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  if (isHostedNotifyConfigured()) {
    const result = await sendHostedNotifyRequest(
      {
        type: "order",
        mode: input.mode,
        brandName: SITE_CONFIG.brandName,
        orderId: input.orderId,
        itemTitle: input.itemTitle,
        amountVnd: input.amountVnd,
        customerName: input.customerName,
        contactChannel: input.contactChannel,
        customerContact: input.customerContact,
        note: input.note,
      },
      fetchImpl
    );
    if (!result.ok) {
      console.warn("Hosted Telegram order notification failed:", result.error);
    }
    return;
  }

  const result = await sendTelegramNotification(
    formatOrderTelegramMessage(input),
    fetchImpl
  );
  if (!result.ok) {
    console.warn("Telegram order notification failed:", result.error);
  }
}

export async function notifyTelegramProjectRequest(
  input: TelegramProjectRequestPayload,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  if (isHostedNotifyConfigured()) {
    const pkgName =
      SITE_CONFIG.servicePackages.find((p) => p.id === input.servicePackage)?.name ??
      input.servicePackage;
    const featureLabels = input.selectedFeatures.map((id) => {
      const found = SITE_CONFIG.estimatorFeatures.find((f) => f.id === id);
      return found ? found.label : id;
    });

    const result = await sendHostedNotifyRequest(
      {
        type: "project_request",
        mode: input.mode,
        brandName: SITE_CONFIG.brandName,
        requestId: input.requestId,
        servicePackageName: pkgName,
        customerName: input.customerName,
        contactChannel: input.contactChannel,
        customerContact: input.customerContact,
        budgetRange: input.budgetRange,
        timeline: input.timeline,
        selectedFeatures: featureLabels,
        description: input.description,
        referenceUrl: input.referenceUrl ?? null,
      },
      fetchImpl
    );
    if (!result.ok) {
      console.warn(
        "Hosted Telegram project request notification failed:",
        result.error
      );
    }
    return;
  }

  const result = await sendTelegramNotification(
    formatProjectRequestTelegramMessage(input),
    fetchImpl
  );
  if (!result.ok) {
    console.warn("Telegram project request notification failed:", result.error);
  }
}
