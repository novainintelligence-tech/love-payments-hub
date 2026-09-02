/**
 * Shared purchase fulfillment: builds TXT receipts for every purchased item and
 * delivers them to the buyer on Telegram. Safe to call repeatedly — delivery is
 * guarded by orders.delivery_status so items are never duplicated.
 */
import { getDb, getSettings, money, notifyAdmin, type StoreSettings } from "./db.server";
import { escapeHtml, sendDocument, sendMessage, type InlineKeyboard } from "./telegram.server";

export type DeliveredItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  delivered_asset: string | null;
  product_type: "key" | "file";
};

export type OrderForDelivery = {
  id: number;
  total_amount: number;
  created_at: string;
  delivery_status: string;
  user: { id: number; telegram_id: number; username: string | null; first_name: string | null };
  items: DeliveredItem[];
};

function stamp(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

/** Human-readable TXT receipt embedding the full key or download link. */
export function receiptText(
  order: OrderForDelivery,
  item: DeliveredItem,
  settings: StoreSettings,
): string {
  const isKey = item.product_type !== "file";
  return [
    "==================================================",
    `  ${settings.store_name.toUpperCase()} — DIGITAL DELIVERY RECEIPT`,
    "==================================================",
    "",
    `Order ID      : #${order.id}`,
    `Order date    : ${stamp(order.created_at)}`,
    `Customer      : ${order.user.first_name ?? "-"}${order.user.username ? ` (@${order.user.username})` : ""}`,
    `Telegram ID   : ${order.user.telegram_id}`,
    "",
    "--------------------------------------------------",
    "  PRODUCT",
    "--------------------------------------------------",
    `Name          : ${item.product_name}`,
    `Type          : ${isKey ? "Key / account credentials" : "Downloadable file"}`,
    `Quantity      : ${item.quantity}`,
    `Unit price    : ${money(item.price)}`,
    `Order total   : ${money(order.total_amount)}`,
    "",
    "--------------------------------------------------",
    isKey ? "  YOUR KEY" : "  YOUR DOWNLOAD LINK",
    "--------------------------------------------------",
    "",
    item.delivered_asset ?? "(not available — contact support)",
    "",
    "--------------------------------------------------",
    settings.support_username
      ? `Support       : @${settings.support_username}`
      : "Support       : use the Support button in the bot",
    "Keep this file safe. Do not share it publicly.",
    "==================================================",
  ].join("\n");
}

function fileName(order: OrderForDelivery, item: DeliveredItem, index: number): string {
  const base = item.product_name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  return `order-${order.id}-${index + 1}-${base || "item"}.txt`;
}

async function loadOrder(orderId: number): Promise<OrderForDelivery | null> {
  const db = await getDb();
  const { data } = await db
    .from("orders")
    .select(
      "id, total_amount, created_at, delivery_status, bot_users(id, telegram_id, username, first_name), order_items(id, product_name, quantity, price, delivered_asset, products(product_type))",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as {
    id: number;
    total_amount: number;
    created_at: string;
    delivery_status: string;
    bot_users: {
      id: number;
      telegram_id: number;
      username: string | null;
      first_name: string | null;
    } | null;
    order_items: {
      id: number;
      product_name: string;
      quantity: number;
      price: number;
      delivered_asset: string | null;
      products: { product_type: "key" | "file" } | null;
    }[];
  };
  if (!row.bot_users) return null;
  return {
    id: row.id,
    total_amount: Number(row.total_amount),
    created_at: row.created_at,
    delivery_status: row.delivery_status ?? "pending",
    user: row.bot_users,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
      delivered_asset: item.delivered_asset,
      product_type: item.products?.product_type ?? "key",
    })),
  };
}

/**
 * Delivers every item of a completed order as an interactive message plus a TXT
 * file. Returns immediately when the order was already delivered.
 */
export async function fulfillOrder(
  orderId: number,
  options: { force?: boolean } = {},
): Promise<{ delivered: boolean; files: number; reason?: string }> {
  const db = await getDb();
  const settings = await getSettings();

  // Claim the order so concurrent webhook retries cannot double-send.
  if (!options.force) {
    const { data: claimed } = await db
      .from("orders")
      .update({ delivery_status: "delivering" })
      .eq("id", orderId)
      .in("delivery_status", ["pending", "failed"])
      .select("id")
      .maybeSingle();
    if (!claimed) return { delivered: false, files: 0, reason: "already delivered" };
  }

  const order = await loadOrder(orderId);
  if (!order) {
    await db.from("orders").update({ delivery_status: "failed", delivery_error: "order not found" }).eq("id", orderId);
    return { delivered: false, files: 0, reason: "order not found" };
  }

  const chatId = Number(order.user.telegram_id);
  const menu: InlineKeyboard = [
    [{ text: "📦 My orders", callback_data: "orders" }],
    [{ text: "🛍 Keep shopping", callback_data: "shop" }],
  ];

  await sendMessage(
    chatId,
    [
      "🎉 <b>PAYMENT CONFIRMED — ORDER DELIVERED</b> 🎉",
      "",
      `🧾 Order <b>#${order.id}</b> · Total <b>${money(order.total_amount)}</b>`,
      `📦 Items: <b>${order.items.length}</b>`,
      "",
      "📄 Each item below arrives as its own <b>.txt</b> file containing the full key or download link plus all order details.",
      "",
      "⬇️ Your files are on the way…",
    ].join("\n"),
  );

  let files = 0;
  const failures: string[] = [];
  for (const [index, item] of order.items.entries()) {
    const isKey = item.product_type !== "file";
    const caption = [
      `✅ <b>${escapeHtml(item.product_name)}</b>`,
      `${isKey ? "🔐 Key delivery" : "📥 Download delivery"} · Order #${order.id}`,
      "",
      isKey
        ? "Your key is inside the attached file."
        : `Direct link: <code>${escapeHtml(item.delivered_asset ?? "-")}</code>`,
    ].join("\n");

    const sent = await sendDocument(
      chatId,
      fileName(order, item, index),
      receiptText(order, item, settings),
      caption,
      index === order.items.length - 1 ? menu : undefined,
    );
    if (sent) files += 1;
    else {
      failures.push(item.product_name);
      // Fall back to plain text so the buyer still gets the asset.
      await sendMessage(
        chatId,
        [
          `✅ <b>${escapeHtml(item.product_name)}</b>`,
          "",
          `<code>${escapeHtml(item.delivered_asset ?? "-")}</code>`,
        ].join("\n"),
      );
    }
  }

  const ok = failures.length === 0;
  await db
    .from("orders")
    .update({
      delivery_status: ok ? "delivered" : "failed",
      delivered_at: new Date().toISOString(),
      delivery_error: ok ? null : `File delivery failed: ${failures.join(", ")}`,
    })
    .eq("id", orderId);

  await notifyAdmin(
    settings,
    [
      ok ? "🧾 <b>Order delivered</b>" : "⚠️ <b>Order delivery problem</b>",
      `Order #${order.id} · ${money(order.total_amount)}`,
      `Buyer: ${order.user.username ? `@${escapeHtml(order.user.username)}` : escapeHtml(order.user.first_name ?? "-")} (<code>${order.user.telegram_id}</code>)`,
      `Files sent: ${files}/${order.items.length}`,
      ...(ok ? [] : [`Failed: ${escapeHtml(failures.join(", "))}`]),
    ].join("\n"),
  );

  return { delivered: ok, files };
}

/** Retries any completed order whose items were never delivered. */
export async function sweepUndeliveredOrders(): Promise<{ retried: number }> {
  const db = await getDb();
  const { data } = await db
    .from("orders")
    .select("id")
    .eq("status", "completed")
    .in("delivery_status", ["pending", "failed"])
    .order("id", { ascending: true })
    .limit(20);
  const rows = (data ?? []) as { id: number }[];
  for (const row of rows) await fulfillOrder(row.id);
  return { retried: rows.length };
}
