import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Transaction } from "./store/payments.server";

async function assertAdmin(context: { supabase: SupabaseClient; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

/** Grants the admin role to the first signed-in user when the store has no admin yet. */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false, reason: "An admin already exists." };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { granted: true, reason: "You are now the store admin." };
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [customers, orders, pending, revenue, balances] = await Promise.all([
      supabaseAdmin.from("bot_users").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabaseAdmin
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "submitted"]),
      supabaseAdmin.from("orders").select("total_amount").eq("status", "completed"),
      supabaseAdmin.from("bot_users").select("wallet_balance"),
    ]);
    const sum = (rows: Record<string, unknown>[] | null, key: string) =>
      (rows ?? []).reduce((total, row) => total + Number(row[key] ?? 0), 0);
    return {
      customers: customers.count ?? 0,
      orders: orders.count ?? 0,
      pendingPayments: pending.count ?? 0,
      revenue: sum(revenue.data as Record<string, unknown>[] | null, "total_amount"),
      liability: sum(balances.data as Record<string, unknown>[] | null, "wallet_balance"),
    };
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: number; action: "approve" | "reject" | "recheck" }) => {
    if (!Number.isInteger(input.id) || input.id <= 0) throw new Error("Invalid invoice");
    if (!["approve", "reject", "recheck"].includes(input.action)) throw new Error("Invalid action");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!tx) throw new Error("Invoice not found");

    const { settleTransaction, verifyAndSettle } = await import("./store/payments.server");
    if (data.action === "approve") {
      const result = await settleTransaction(data.id, {
        auto: false,
        note: "Approved from the web dashboard",
      });
      return {
        message: result.credited
          ? "Payment approved and balance credited."
          : "This invoice was already processed.",
      };
    }
    if (data.action === "recheck") {
      const outcome = await verifyAndSettle(tx as Transaction);
      return { message: outcome.message };
    }
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", verification_note: "Rejected from the web dashboard" })
      .eq("id", data.id);
    const { data: user } = await supabaseAdmin
      .from("bot_users")
      .select("telegram_id")
      .eq("id", tx.user_id)
      .maybeSingle();
    if (user) {
      const { sendMessage } = await import("./store/telegram.server");
      await sendMessage(
        Number(user.telegram_id),
        `❌ Your payment for invoice ${tx.invoice_code} was rejected.`,
      );
    }
    return { message: "Payment rejected." };
  });

export const adjustCustomerBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: number; amount: number; reason: string }) => {
    if (!Number.isInteger(input.userId)) throw new Error("Invalid customer");
    if (!Number.isFinite(input.amount) || input.amount === 0)
      throw new Error("Amount must be a non-zero number");
    return { ...input, reason: (input.reason || "Admin adjustment").slice(0, 200) };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { adjustBalance, getDb } = await import("./store/db.server");
    const balance = await adjustBalance(data.userId, data.amount, data.reason);
    const db = await getDb();
    const { data: user } = await db
      .from("bot_users")
      .select("telegram_id")
      .eq("id", data.userId)
      .maybeSingle();
    if (user) {
      const { sendMessage } = await import("./store/telegram.server");
      await sendMessage(
        Number(user.telegram_id),
        `💵 An admin updated your balance by <b>$${data.amount.toFixed(2)}</b>. New balance: <b>$${balance.toFixed(2)}</b>.`,
      );
    }
    return { balance };
  });

export const broadcastMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { text: string }) => {
    const text = (input.text ?? "").trim();
    if (text.length < 2 || text.length > 3000)
      throw new Error("Message must be between 2 and 3000 characters");
    return { text };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb } = await import("./store/db.server");
    const { sendMessage } = await import("./store/telegram.server");
    const db = await getDb();
    const { data: users } = await db.from("bot_users").select("telegram_id").eq("is_banned", false);
    let sent = 0;
    for (const user of (users ?? []) as { telegram_id: number }[]) {
      const result = await sendMessage(Number(user.telegram_id), data.text);
      if (result !== null) sent += 1;
    }
    await db.from("broadcasts").insert({ message_text: data.text, sent_count: sent });
    return { sent };
  });

export const addProductKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { productId: number; keys: string }) => {
    if (!Number.isInteger(input.productId)) throw new Error("Invalid product");
    const keys = (input.keys ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (keys.length === 0) throw new Error("Add at least one key");
    return { productId: input.productId, keys };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb } = await import("./store/db.server");
    const db = await getDb();
    await db
      .from("product_keys")
      .insert(data.keys.map((key) => ({ product_id: data.productId, key_value: key })));
    const { count } = await db
      .from("product_keys")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.productId)
      .eq("is_sold", false);
    await db
      .from("products")
      .update({ stock_count: count ?? 0 })
      .eq("id", data.productId);
    return { added: data.keys.length, stock: count ?? 0 };
  });
/** Manually registers a Telegram user and sends them an invitation message. */
export const inviteTelegramUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: { telegramId: string; firstName?: string; username?: string; note?: string }) => {
      const telegramId = Number(String(input.telegramId ?? "").trim());
      if (!Number.isInteger(telegramId) || telegramId <= 0)
        throw new Error("Enter a valid numeric Telegram ID");
      return {
        telegramId,
        firstName: (input.firstName ?? "").trim().slice(0, 60) || null,
        username: (input.username ?? "").trim().replace(/^@/, "").slice(0, 60) || null,
        note: (input.note ?? "").trim().slice(0, 500) || null,
      };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb, getSettings, miniAppUrl } = await import("./store/db.server");
    const { sendCard, escapeHtml } = await import("./store/telegram.server");
    const db = await getDb();

    const { data: existing } = await db
      .from("bot_users")
      .select("id")
      .eq("telegram_id", data.telegramId)
      .maybeSingle();
    let created = false;
    if (!existing) {
      const { error } = await db.from("bot_users").insert({
        telegram_id: data.telegramId,
        username: data.username,
        first_name: data.firstName,
      });
      if (error) throw new Error(error.message);
      created = true;
    }

    const settings = await getSettings();
    const lines = [
      `👋 <b>Welcome${data.firstName ? ` ${escapeHtml(data.firstName)}` : ""} to ${escapeHtml(settings.store_name)}!</b>`,
      "",
      escapeHtml(settings.welcome_message),
    ];
    if (data.note) lines.push("", escapeHtml(data.note));
    lines.push("", "Tap below to open the store, or send /start any time.");

    const sent = await sendCard(data.telegramId, settings.banner_image_url, lines.join("\n"), [
      [{ text: "🛍 Open store app", web_app: { url: miniAppUrl(settings) } }],
      [{ text: "📦 Browse in chat", callback_data: "shop" }],
    ]);

    return {
      created,
      delivered: sent !== null,
      message:
        sent !== null
          ? `${created ? "Customer added" : "Customer already existed"} — invitation delivered.`
          : `${created ? "Customer added" : "Customer already existed"}, but Telegram refused delivery (the user must message the bot at least once).`,
    };
  });

/** Renames / edits a product. */
export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      id: number;
      name?: string;
      price?: number;
      description?: string;
      isActive?: boolean;
    }) => {
      if (!Number.isInteger(input.id)) throw new Error("Invalid product");
      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) {
        const name = input.name.trim();
        if (name.length < 2) throw new Error("Product name is too short");
        patch["name"] = name.slice(0, 120);
      }
      if (input.price !== undefined) {
        if (!Number.isFinite(input.price) || input.price < 0)
          throw new Error("Price must be a positive number");
        patch["price"] = Number(input.price.toFixed(2));
      }
      if (input.description !== undefined)
        patch["description"] = input.description.trim().slice(0, 1000) || null;
      if (input.isActive !== undefined) patch["is_active"] = input.isActive;
      if (Object.keys(patch).length === 0) throw new Error("Nothing to update");
      return { id: input.id, patch };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb } = await import("./store/db.server");
    const db = await getDb();
    const { error } = await db.from("products").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { message: "Product updated." };
  });

/** Renames a category or subcategory. */
export const renameCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      id: number;
      kind: "category" | "subcategory";
      name?: string;
      description?: string;
    }) => {
      if (!Number.isInteger(input.id)) throw new Error("Invalid category");
      if (input.kind !== "category" && input.kind !== "subcategory")
        throw new Error("Invalid kind");
      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) {
        const name = input.name.trim();
        if (name.length < 2) throw new Error("Name is too short");
        patch["name"] = name.slice(0, 80);
      }
      if (input.description !== undefined)
        patch["description"] = input.description.trim().slice(0, 500) || null;
      if (Object.keys(patch).length === 0) throw new Error("Nothing to update");
      return { id: input.id, kind: input.kind, patch };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getDb } = await import("./store/db.server");
    const db = await getDb();
    const table = data.kind === "category" ? "categories" : "subcategories";
    const { error } = await db.from(table).update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { message: `${data.kind === "category" ? "Category" : "Subcategory"} updated.` };
  });
