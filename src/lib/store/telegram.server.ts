/** Thin Telegram Bot API wrapper (server-only). */

export type InlineButton = { text: string; callback_data?: string; url?: string };
export type InlineKeyboard = InlineButton[][];

function token(): string {
  const t = process.env["TELEGRAM_BOT_TOKEN"];
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return t;
}

export async function tg<T = unknown>(
  method: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!res.ok || !body.ok) {
    throw new Error(`Telegram ${method} failed [${res.status}]: ${body.description ?? "unknown"}`);
  }
  return body.result as T;
}

export async function tgSafe(method: string, payload: Record<string, unknown> = {}) {
  try {
    return await tg(method, payload);
  } catch (error) {
    console.error("[telegram]", method, error);
    return null;
  }
}

export function keyboard(rows: InlineKeyboard) {
  return { inline_keyboard: rows };
}

export async function sendMessage(
  chatId: number,
  text: string,
  markup?: InlineKeyboard,
  extra: Record<string, unknown> = {},
) {
  return tgSafe("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(markup ? { reply_markup: keyboard(markup) } : {}),
    ...extra,
  });
}

export async function editMessage(
  chatId: number,
  messageId: number,
  text: string,
  markup?: InlineKeyboard,
) {
  const result = await tgSafe("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(markup ? { reply_markup: keyboard(markup) } : {}),
  });
  if (result === null) await sendMessage(chatId, text, markup);
  return result;
}

export async function answerCallback(id: string, text?: string, alert = false) {
  return tgSafe("answerCallbackQuery", {
    callback_query_id: id,
    ...(text ? { text, show_alert: alert } : {}),
  });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}