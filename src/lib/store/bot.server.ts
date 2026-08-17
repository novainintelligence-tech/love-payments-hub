/** Telegram update dispatcher for the store bot. */
import { adminMenu, handleAdminCallback, handleAdminState, showAdminMenu } from "./admin.server";
import { getDb, getOrCreateUser, getSettings, getState, isAdmin, money, setState, type BotUser, type StoreSettings } from "./db.server";
import { ASSET_LABEL, formatAmount, type PaymentAsset } from "./rates.server";
import {
  createInvoice,
  invoiceKeyboard,
  invoiceText,
  notifyAdminPending,
  verifyAndSettle,
  type Transaction,
} from "./payments.server";
import {
  addToCart,
  availableStock,
  cartKeyboard,
  cartText,
  checkout,
  getCart,
  getProduct,
  listCategories,
  listOrders,
  listProducts,
  orderDetail,
} from "./shop.server";
import { answerCallback, editMessage, escapeHtml, sendMessage, type InlineKeyboard } from "./telegram.server";
import { isPlausibleHash } from "./verify.server";

type From = { id: number; username?: string; first_name?: string; is_bot?: boolean };

function mainMenu(admin: boolean): InlineKeyboard {
  const rows: InlineKeyboard = [
    [{ text: "🛍 Browse products", callback_data: "shop" }],
    [
      { text: "🛒 Cart", callback_data: "cart" },
      { text: "📦 My orders", callback_data: "orders" },
    ],
    [
      { text: "💰 Balance", callback_data: "bal" },
      { text: "➕ Top up", callback_data: "top" },
    ],
    [{ text: "🆘 Support", callback_data: "support" }],
  ];
  if (admin) rows.push([{ text: "🛠 Admin panel", callback_data: "adm" }]);
  return rows;
}

function welcomeText(settings: StoreSettings, user: BotUser): string {
  return [
    `👋 <b>${escapeHtml(settings.store_name)}</b>`,
    "",
    escapeHtml(settings.welcome_message),
    "",
    `Balance: <b>${money(user.wallet_balance)}</b>`,
    "",
    "Top up with BTC, USDT (TRC20) or USDC (Ethereum) and buy instantly.",
  ].join("\n");
}

const ASSETS: PaymentAsset[] = ["BTC", "USDT_TRC20", "USDC_ERC20"];

async function showTopUpAssets(chatId: number, messageId?: number) {
  const text = [
    "➕ <b>Top up your balance</b>",
    "",
    "Choose the coin you want to pay with. You will get a wallet address and the exact amount to send.",
  ].join("\n");
  const markup: InlineKeyboard = [
    ...ASSETS.map((asset) => [{ text: ASSET_LABEL[asset], callback_data: `top:${asset}` }]),
    [{ text: "⬅️ Menu", callback_data: "menu" }],
  ];
  if (messageId) return editMessage(chatId, messageId, text, markup);
  return sendMessage(chatId, text, markup);
}

async function showProduct(chatId: number, messageId: number, productId: number) {
  const product = await getProduct(productId);
  if (!product) return editMessage(chatId, messageId, "Product not found.", [[{ text: "⬅️ Menu", callback_data: "menu" }]]);
  const stock = await availableStock(product);
  const text = [
    `<b>${escapeHtml(product.name)}</b>`,
    "",
    escapeHtml(product.description ?? "No description."),
    "",
    `Price: <b>${money(product.price)}</b>`,
    `Stock: <b>${product.product_type === "file" ? "unlimited" : stock}</b>`,
  ].join("\n");
  const markup: InlineKeyboard = [];
  if (stock > 0) {
    markup.push([{ text: "🛒 Add to cart", callback_data: `cart:add:${product.id}` }]);
    markup.push([{ text: "⚡ Buy now", callback_data: `buy:${product.id}` }]);
  } else {
    markup.push([{ text: "❌ Out of stock", callback_data: "noop" }]);
  }
  markup.push([{ text: "⬅️ Back", callback_data: product.category_id ? `cat:${product.category_id}` : "shop" }]);
  return editMessage(chatId, messageId, text, markup);
}

async function showCategories(chatId: number, messageId: number) {
  const categories = await listCategories();
  if (categories.length === 0) {
    const products = await listProducts(null);
    if (products.length === 0) {
      return editMessage(chatId, messageId, "🛍 The catalog is empty right now. Please check back soon.", [
        [{ text: "⬅️ Menu", callback_data: "menu" }],
      ]);
    }
    return editMessage(chatId, messageId, "🛍 <b>All products</b>", [
      ...products.map((p) => [{ text: `${p.name} — $${Number(p.price).toFixed(2)}`, callback_data: `prod:${p.id}` }]),
      [{ text: "⬅️ Menu", callback_data: "menu" }],
    ]);
  }
  return editMessage(chatId, messageId, "🛍 <b>Choose a category</b>", [
    ...categories.map((c) => [{ text: c.name, callback_data: `cat:${c.id}` }]),
    [{ text: "⬅️ Menu", callback_data: "menu" }],
  ]);
}

async function startTopUpAmount(chatId: number, messageId: number, asset: PaymentAsset, settings: StoreSettings) {
  await setState(chatId, "topup_amount", { asset });
  await editMessage(
    chatId,
    messageId,
    [
      `Paying with <b>${escapeHtml(ASSET_LABEL[asset])}</b>.`,
      "",
      `Send the amount in USD you want to add to your balance (minimum ${money(settings.min_topup_usd)}).`,
    ].join("\n"),
    [[{ text: "Cancel", callback_data: "menu" }]],
  );
}

async function sendInvoice(chatId: number, tx: Transaction, settings: StoreSettings) {
  await sendMessage(chatId, invoiceText(tx, settings), invoiceKeyboard(tx));
}

async function loadTransaction(id: number): Promise<Transaction | null> {
  const db = await getDb();
  const { data } = await db.from("transactions").select("*").eq("id", id).maybeSingle();
  return (data as Transaction) ?? null;
}

async function doCheckout(chatId: number, user: BotUser) {
  const result = await checkout(user);
  if (!result.ok) {
    await sendMessage(chatId, `❌ ${escapeHtml(result.reason)}`, [
      [{ text: "➕ Top up", callback_data: "top" }],
      [{ text: "⬅️ Menu", callback_data: "menu" }],
    ]);
    return;
  }
  await sendMessage(
    chatId,
    [
      `✅ <b>Order #${result.orderId} completed</b>`,
      `Total: <b>${money(result.total)}</b> · New balance: <b>${money(result.balance)}</b>`,
      "",
      "Your items:",
      "",
      ...result.delivery,
    ].join("\n"),
    [
      [{ text: "📦 My orders", callback_data: "orders" }],
      [{ text: "🏠 Menu", callback_data: "menu" }],
    ],
  );
  const settings = await getSettings();
  if (settings.admin_telegram_id) {
    await sendMessage(
      Number(settings.admin_telegram_id),
      `🧾 New order #${result.orderId} — ${money(result.total)} from @${escapeHtml(user.username ?? String(user.telegram_id))}`,
    );
  }
}

async function handleText(chatId: number, from: From, text: string, user: BotUser, settings: StoreSettings) {
  const trimmed = text.trim();
  const admin = isAdmin(settings, from.id);

  if (trimmed.startsWith("/start")) {
    await setState(chatId, null);
    await sendMessage(chatId, welcomeText(settings, user), mainMenu(admin));
    return;
  }
  if (trimmed === "/menu") {
    await sendMessage(chatId, welcomeText(settings, user), mainMenu(admin));
    return;
  }
  if (trimmed === "/balance") {
    await sendMessage(chatId, `💰 Your balance: <b>${money(user.wallet_balance)}</b>`, mainMenu(admin));
    return;
  }
  if (trimmed === "/admin") {
    if (!admin) {
      await sendMessage(chatId, "You are not authorised to use the admin panel.");
      return;
    }
    await showAdminMenu(chatId);
    return;
  }
  if (admin && (trimmed.startsWith("/ban ") || trimmed.startsWith("/unban "))) {
    const db = await getDb();
    const banned = trimmed.startsWith("/ban ");
    const target = Number(trimmed.split(/\s+/)[1]);
    await db.from("bot_users").update({ is_banned: banned }).eq("telegram_id", target);
    await sendMessage(chatId, `${banned ? "🚫 Banned" : "✅ Unbanned"} ${target}.`, adminMenu);
    return;
  }

  const state = await getState(chatId);
  if (state) {
    if (await handleAdminState(chatId, trimmed, state)) return;

    if (state.name === "topup_amount") {
      const amount = Number(trimmed.replace(/[^0-9.]/g, ""));
      if (!amount || amount < Number(settings.min_topup_usd)) {
        await sendMessage(chatId, `❌ Please send a number of at least ${money(settings.min_topup_usd)}.`);
        return;
      }
      const asset = state.data["asset"] as PaymentAsset;
      await setState(chatId, null);
      try {
        const tx = await createInvoice(user.id, asset, Math.round(amount * 100) / 100, settings);
        await sendInvoice(chatId, tx, settings);
      } catch (error) {
        await sendMessage(chatId, `❌ ${escapeHtml(error instanceof Error ? error.message : "Could not create the invoice.")}`);
      }
      return;
    }

    if (state.name === "await_hash") {
      const txId = Number(state.data["txId"]);
      const tx = await loadTransaction(txId);
      if (!tx) {
        await setState(chatId, null);
        await sendMessage(chatId, "❌ Invoice not found.", mainMenu(admin));
        return;
      }
      if (!isPlausibleHash(tx.asset, trimmed)) {
        await sendMessage(chatId, "❌ That does not look like a valid transaction hash. Please paste the TxID again.");
        return;
      }
      const db = await getDb();
      const { error } = await db
        .from("transactions")
        .update({ tx_hash: trimmed, status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", tx.id);
      if (error) {
        await sendMessage(chatId, "❌ This transaction hash was already submitted for another invoice.");
        return;
      }
      await setState(chatId, null);
      await sendMessage(chatId, "🔎 Checking your transaction on-chain, one moment…");
      const outcome = await verifyAndSettle({ ...tx, tx_hash: trimmed, status: "submitted" }, settings);
      if (outcome.status !== "credited") {
        await sendMessage(chatId, outcome.message, [
          [{ text: "🔄 Check again", callback_data: `pay:check:${tx.id}` }],
          [{ text: "🏠 Menu", callback_data: "menu" }],
        ]);
      }
      return;
    }

    if (state.name === "dispute_reason") {
      const orderId = Number(state.data["orderId"]);
      const db = await getDb();
      await db.from("disputes").insert({ order_id: orderId, user_id: user.id, reason: trimmed });
      await db.from("orders").update({ dispute_status: "opened" }).eq("id", orderId);
      await setState(chatId, null);
      await sendMessage(chatId, "⚖️ Your dispute has been opened. An admin will review it shortly.", mainMenu(admin));
      if (settings.admin_telegram_id) {
        await sendMessage(
          Number(settings.admin_telegram_id),
          `⚖️ New dispute on order #${orderId} from @${escapeHtml(user.username ?? String(user.telegram_id))}:\n${escapeHtml(trimmed)}`,
        );
      }
      return;
    }

    if (state.name === "support_message") {
      await setState(chatId, null);
      if (settings.admin_telegram_id) {
        await sendMessage(
          Number(settings.admin_telegram_id),
          `🆘 Support message from @${escapeHtml(user.username ?? String(user.telegram_id))} (${user.telegram_id}):\n${escapeHtml(trimmed)}`,
        );
      }
      await sendMessage(chatId, "🆘 Message sent to support. You will get a reply here.", mainMenu(admin));
      return;
    }
  }

  // Fallback: treat a bare hash as a payment submission for the newest open invoice.
  await sendMessage(chatId, welcomeText(settings, user), mainMenu(admin));
}

async function handleCallback(
  chatId: number,
  messageId: number,
  callbackId: string,
  data: string,
  from: From,
  user: BotUser,
  settings: StoreSettings,
) {
  const parts = data.split(":");
  const root = parts[0] ?? "";
  const admin = isAdmin(settings, from.id);

  if (root === "adm") {
    if (!admin) {
      await answerCallback(callbackId, "Not authorised", true);
      return;
    }
    await handleAdminCallback(chatId, messageId, callbackId, parts);
    await answerCallback(callbackId);
    return;
  }

  switch (root) {
    case "menu":
      await setState(chatId, null);
      await editMessage(chatId, messageId, welcomeText(settings, user), mainMenu(admin));
      break;
    case "shop":
      await showCategories(chatId, messageId);
      break;
    case "cat": {
      const categoryId = Number(parts[1]);
      const products = await listProducts(categoryId);
      await editMessage(
        chatId,
        messageId,
        products.length === 0 ? "No products in this category yet." : "🛍 <b>Products</b>",
        [
          ...products.map((p) => [{ text: `${p.name} — $${Number(p.price).toFixed(2)}`, callback_data: `prod:${p.id}` }]),
          [{ text: "⬅️ Categories", callback_data: "shop" }],
        ],
      );
      break;
    }
    case "prod":
      await showProduct(chatId, messageId, Number(parts[1]));
      break;
    case "cart": {
      const action = parts[1];
      if (action === "add") {
        await addToCart(user.id, Number(parts[2]));
        await answerCallback(callbackId, "Added to cart ✅");
      } else if (action === "del") {
        const db = await getDb();
        await db.from("cart_items").delete().eq("id", Number(parts[2])).eq("user_id", user.id);
      } else if (action === "checkout") {
        await answerCallback(callbackId, "Processing…");
        await doCheckout(chatId, user);
        return;
      }
      const rows = await getCart(user.id);
      await editMessage(chatId, messageId, cartText(rows), cartKeyboard(rows));
      break;
    }
    case "buy": {
      await addToCart(user.id, Number(parts[1]));
      await answerCallback(callbackId, "Processing…");
      await doCheckout(chatId, user);
      return;
    }
    case "orders": {
      const orders = await listOrders(user.id);
      await editMessage(
        chatId,
        messageId,
        orders.length === 0 ? "📦 You have no orders yet." : "📦 <b>Your orders</b>",
        [
          ...orders.map((o) => [
            { text: `#${o.id} · $${Number(o.total_amount).toFixed(2)} · ${o.status}`, callback_data: `order:${o.id}` },
          ]),
          [{ text: "⬅️ Menu", callback_data: "menu" }],
        ],
      );
      break;
    }
    case "order": {
      const order = await orderDetail(user.id, Number(parts[1]));
      if (!order) {
        await answerCallback(callbackId, "Order not found", true);
        break;
      }
      await editMessage(
        chatId,
        messageId,
        [
          `📦 <b>Order #${order.id}</b>`,
          `Status: <b>${escapeHtml(order.status)}</b> · Total: <b>${money(order.total_amount)}</b>`,
          "",
          ...order.order_items.map(
            (item) =>
              `<b>${escapeHtml(item.product_name)}</b> × ${item.quantity}\n<code>${escapeHtml(item.delivered_asset ?? "-")}</code>`,
          ),
        ].join("\n"),
        [
          [{ text: "⚖️ Open dispute", callback_data: `dispute:${order.id}` }],
          [{ text: "⬅️ My orders", callback_data: "orders" }],
        ],
      );
      break;
    }
    case "dispute":
      await setState(chatId, "dispute_reason", { orderId: Number(parts[1]) });
      await editMessage(chatId, messageId, "⚖️ Describe the problem with this order in one message.", [
        [{ text: "Cancel", callback_data: "menu" }],
      ]);
      break;
    case "bal": {
      const db = await getDb();
      const { data: ledger } = await db
        .from("wallet_ledger")
        .select("amount, reason, created_at")
        .eq("user_id", user.id)
        .order("id", { ascending: false })
        .limit(8);
      const rows = (ledger ?? []) as { amount: number; reason: string; created_at: string }[];
      const { data: fresh } = await db.from("bot_users").select("wallet_balance").eq("id", user.id).maybeSingle();
      await editMessage(
        chatId,
        messageId,
        [
          `💰 <b>Balance: ${money(fresh?.wallet_balance ?? user.wallet_balance)}</b>`,
          "",
          rows.length ? "Recent activity:" : "No wallet activity yet.",
          ...rows.map((row) => `${Number(row.amount) >= 0 ? "➕" : "➖"} ${money(Math.abs(Number(row.amount)))} — ${escapeHtml(row.reason)}`),
        ].join("\n"),
        [
          [{ text: "➕ Top up", callback_data: "top" }],
          [{ text: "⬅️ Menu", callback_data: "menu" }],
        ],
      );
      break;
    }
    case "top": {
      if (parts.length === 1) {
        await showTopUpAssets(chatId, messageId);
        break;
      }
      await startTopUpAmount(chatId, messageId, parts[1] as PaymentAsset, settings);
      break;
    }
    case "pay": {
      const action = parts[1];
      const tx = await loadTransaction(Number(parts[2]));
      if (!tx || tx.user_id !== user.id) {
        await answerCallback(callbackId, "Invoice not found", true);
        break;
      }
      if (action === "hash") {
        await setState(chatId, "await_hash", { txId: tx.id });
        await editMessage(
          chatId,
          messageId,
          [
            `Invoice <code>${escapeHtml(tx.invoice_code)}</code>`,
            `Expected: <code>${formatAmount(Number(tx.expected_amount), tx.asset)}</code>`,
            "",
            "Paste your transaction hash (TxID) here.",
          ].join("\n"),
          [[{ text: "Cancel", callback_data: "menu" }]],
        );
      } else if (action === "cancel") {
        const db = await getDb();
        await db.from("transactions").update({ status: "expired" }).eq("id", tx.id).in("status", ["pending", "submitted"]);
        await setState(chatId, null);
        await editMessage(chatId, messageId, "❌ Invoice cancelled.", mainMenu(admin));
      } else {
        if (tx.status === "completed") {
          await answerCallback(callbackId, "Already confirmed ✅", true);
          break;
        }
        if (!tx.tx_hash) {
          await answerCallback(callbackId, "Submit your transaction hash first.", true);
          break;
        }
        const outcome = await verifyAndSettle(tx, settings);
        await answerCallback(callbackId, outcome.message.slice(0, 190), true);
      }
      break;
    }
    case "support":
      await setState(chatId, "support_message");
      await editMessage(
        chatId,
        messageId,
        settings.support_username
          ? `🆘 Contact @${escapeHtml(settings.support_username)} or send your message here and we'll pass it on.`
          : "🆘 Send your message and our support team will reply here.",
        [[{ text: "⬅️ Menu", callback_data: "menu" }]],
      );
      break;
    default:
      break;
  }
  await answerCallback(callbackId);
}

export async function handleUpdate(update: Record<string, any>): Promise<void> {
  const settings = await getSettings();
  const message = update["message"] ?? update["edited_message"];
  const callback = update["callback_query"];
  const from: From | undefined = message?.from ?? callback?.from;
  if (!from || from.is_bot) return;

  const user = await getOrCreateUser(from);
  const chatId = Number(message?.chat?.id ?? callback?.message?.chat?.id ?? from.id);

  if (user.is_banned) {
    if (callback) await answerCallback(callback.id, "Your account is suspended.", true);
    else await sendMessage(chatId, "🚫 Your account has been suspended. Contact support.");
    return;
  }

  if (callback) {
    await handleCallback(
      chatId,
      Number(callback.message?.message_id),
      String(callback.id),
      String(callback.data ?? ""),
      from,
      user,
      settings,
    );
    return;
  }

  const text = message?.text;
  if (typeof text === "string") {
    await handleText(chatId, from, text, user, settings);
  }
}

/** Re-checks submitted invoices and expires stale ones. Used by the scheduled job. */
export async function sweepPendingPayments(): Promise<{ checked: number; credited: number; expired: number }> {
  const db = await getDb();
  const settings = await getSettings();
  const { data } = await db
    .from("transactions")
    .select("*")
    .eq("status", "submitted")
    .not("tx_hash", "is", null)
    .order("id", { ascending: true })
    .limit(25);
  const rows = (data ?? []) as Transaction[];
  let credited = 0;
  for (const tx of rows) {
    const outcome = await verifyAndSettle(tx, settings);
    if (outcome.status === "credited") credited += 1;
  }
  const { data: expired } = await db
    .from("transactions")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString())
    .select("id");
  return { checked: rows.length, credited, expired: (expired ?? []).length };
}

export { notifyAdminPending };