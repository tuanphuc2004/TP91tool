import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  escapeTelegramHtml,
  formatOrderTelegramMessage,
  formatProjectRequestTelegramMessage,
  isHostedNotifyConfigured,
  isTelegramConfigured,
  notifyTelegramNewOrder,
  notifyTelegramProjectRequest,
  sendTelegramNotification,
} from "@/lib/telegram";

describe("telegram helpers", () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChatId = process.env.TELEGRAM_CHAT_ID;
  const originalNotifyKey = process.env.TP91_NOTIFY_KEY;
  const originalNotifyUrl = process.env.TP91_NOTIFY_URL;

  beforeEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.TP91_NOTIFY_KEY;
    delete process.env.TP91_NOTIFY_URL;
  });

  afterEach(() => {
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;

    if (originalChatId === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = originalChatId;

    if (originalNotifyKey === undefined) delete process.env.TP91_NOTIFY_KEY;
    else process.env.TP91_NOTIFY_KEY = originalNotifyKey;

    if (originalNotifyUrl === undefined) delete process.env.TP91_NOTIFY_URL;
    else process.env.TP91_NOTIFY_URL = originalNotifyUrl;
  });

  it("escapes HTML special characters safely", () => {
    expect(escapeTelegramHtml('<script>alert("a & b")</script>')).toBe(
      '&lt;script&gt;alert("a &amp; b")&lt;/script&gt;'
    );
  });

  it("formats order notification with escaped customer input", () => {
    const msg = formatOrderTelegramMessage(
      {
        mode: "database",
        orderId: "ORD-123",
        itemTitle: "TP91 Commerce Starter",
        amountVnd: 490000,
        customerName: "Phúc <Dev>",
        contactChannel: "zalo",
        customerContact: "0332155504",
        note: "Cần hướng dẫn deploy & cấu hình",
      },
      new Date("2026-11-27T03:00:00.000Z")
    );

    expect(msg).toContain("ĐƠN HÀNG MỚI");
    expect(msg).not.toContain("[PREVIEW]");
    expect(msg).toContain("ORD-123");
    expect(msg).toContain("490.000 đ");
    expect(msg).toContain("Phúc &lt;Dev&gt;");
    expect(msg).toContain("Cần hướng dẫn deploy &amp; cấu hình");
  });

  it("formats project request notification with package label and features", () => {
    const msg = formatProjectRequestTelegramMessage(
      {
        mode: "preview",
        requestId: "REQ-999",
        servicePackage: "ecommerce",
        customerName: "Minh Anh",
        contactChannel: "telegram",
        customerContact: "@minhanh",
        budgetRange: "2 - 5 triệu",
        timeline: "Tiêu chuẩn (1 - 2 tuần)",
        selectedFeatures: ["database", "seo"],
        description: "Muốn làm web bán khóa học có trang quản trị đơn giản.",
        referenceUrl: "https://example.com",
      },
      new Date("2026-11-27T03:00:00.000Z")
    );

    expect(msg).toContain("YÊU CẦU LÀM WEB MỚI [PREVIEW]");
    expect(msg).toContain("Web Bán Hàng &amp; Đặt Đơn");
    expect(msg).toContain("Cơ sở dữ liệu &amp; Trang Admin CRUD");
    expect(msg).toContain("https://example.com");
  });

  it("skips sending cleanly when env vars are missing", async () => {
    expect(isTelegramConfigured()).toBe(false);
    const fetchMock = vi.fn();
    const res = await sendTelegramNotification("test", fetchMock as unknown as typeof fetch);
    expect(res).toEqual({ ok: true, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts JSON payload to Telegram Bot API when configured", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    process.env.TELEGRAM_CHAT_ID = "999888";
    expect(isTelegramConfigured()).toBe(true);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    const res = await sendTelegramNotification(
      "<b>Hello</b>",
      fetchMock as unknown as typeof fetch
    );

    expect(res).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/bot123%3Aabc/sendMessage");
    expect(init.method).toBe("POST");
    const parsedBody = JSON.parse(init.body as string);
    expect(parsedBody.chat_id).toBe("999888");
    expect(parsedBody.parse_mode).toBe("HTML");
  });

  it("handles Telegram HTTP errors gracefully without throwing", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    process.env.TELEGRAM_CHAT_ID = "999888";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const res = await sendTelegramNotification(
      "<b>Hello</b>",
      fetchMock as unknown as typeof fetch
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("401");
    }
  });

  it("sends order notifications via hosted TP91_NOTIFY_KEY when configured", async () => {
    process.env.TP91_NOTIFY_KEY = "tp91_live_demo_key";
    expect(isHostedNotifyConfigured()).toBe(true);
    expect(isTelegramConfigured()).toBe(true);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    await notifyTelegramNewOrder(
      {
        mode: "database",
        orderId: "ORD-777",
        itemTitle: "TP91 Commerce Starter",
        amountVnd: 490000,
        customerName: "Nguyễn Văn A",
        contactChannel: "zalo",
        customerContact: "0912345678",
        note: "Giao giờ hành chính",
      },
      fetchMock as unknown as typeof fetch
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://tp91-telegram-notifier.vercel.app/api/notify");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe(
      "tp91_live_demo_key"
    );
    const body = JSON.parse(String(init.body));
    expect(body.type).toBe("order");
    expect(body.orderId).toBe("ORD-777");
    expect(body.amountVnd).toBe(490000);
  });

  it("sends project request notifications via hosted TP91_NOTIFY_KEY", async () => {
    process.env.TP91_NOTIFY_KEY = "tp91_live_demo_key";
    process.env.TP91_NOTIFY_URL = "https://custom.example.com/api/notify";

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    await notifyTelegramProjectRequest(
      {
        mode: "preview",
        requestId: "REQ-555",
        servicePackage: "ecommerce",
        customerName: "Minh",
        contactChannel: "telegram",
        customerContact: "@minh",
        budgetRange: "2 - 5 triệu",
        timeline: "1 - 2 tuần",
        selectedFeatures: ["seo"],
        description: "Cần làm web bán hàng chuẩn SEO.",
        referenceUrl: null,
      },
      fetchMock as unknown as typeof fetch
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://custom.example.com/api/notify");
    const body = JSON.parse(String(init.body));
    expect(body.type).toBe("project_request");
    expect(body.servicePackageName).toBe("Web Bán Hàng & Đặt Đơn");
    expect(body.selectedFeatures).toContain("Tối ưu SEO kỹ thuật & OpenGraph");
  });
});
