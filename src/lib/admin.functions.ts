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

export const adminDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [
      customers,
      orders,
      transactions,
      products,
      categories,
      subcategories,
      disputes,
      broadcasts,
      settings,
    ] = await Promise.all([
      supabaseAdmin
        .from("bot_users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(250),
      supabaseAdmin
        .from("orders")
        .select("*, bot_users(telegram_id, username)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("products").select("*").order("id"),
      supabaseAdmin.from("categories").select("*").order("sort_order").order("id"),
      supabaseAdmin.from("subcategories").select("*").order("id"),
      supabaseAdmin
        .from("disputes")
        .select("*, orders(total_amount), bot_users(telegram_id, username)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
      supabaseAdmin.from("store_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    const results = [
      customers,
      orders,
      transactions,
      products,
      categories,
      subcategories,
      disputes,
      broadcasts,
      settings,
    ];
    const failure = results.find((result) => result.error);
    if (failure?.error) throw new Error(failure.error.message);
    const completedOrders = (orders.data ?? []).filter((order) => order.status === "completed");
    return {
      customers: customers.data ?? [],
      orders: orders.data ?? [],
      transactions: transactions.data ?? [],
      products: products.data ?? [],
      categories: categories.data ?? [],
      subcategories: subcategories.data ?? [],
      disputes: disputes.data ?? [],
      broadcasts: broadcasts.data ?? [],
      settings: settings.data,
      stats: {
        customers: customers.data?.length ?? 0,
        orders: completedOrders.length,
        pendingPayments: (transactions.data ?? []).filter((tx) =>
          ["pending", "submitted"].includes(tx.status),
        ).length,
        revenue: completedOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
        liability: (customers.data ?? []).reduce(
          (sum, user) => sum + Number(user.wallet_balance ?? 0),
          0,
        ),
        openDisputes: (disputes.data ?? []).filter((dispute) => dispute.status === "opened").length,
      },
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

export const updateCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { ids: number[]; isBanned: boolean }) => {
    const ids = [...new Set(input.ids)].filter(Number.isInteger).slice(0, 250);
    if (ids.length === 0) throw new Error("Select at least one customer");
    return { ids, isBanned: Boolean(input.isBanned) };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bot_users")
      .update({ is_banned: data.isBanned })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { message: `${data.ids.length} customer${data.ids.length === 1 ? "" : "s"} updated.` };
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

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      id?: number | null;
      name: string;
      price: number;
      description?: string;
      productType: "key" | "file";
      categoryId?: number | null;
      subcategoryId?: number | null;
      imageUrl?: string;
      downloadLink?: string;
      isActive?: boolean;
    }) => {
      const name = input.name.trim().slice(0, 120);
      if (name.length < 2 || !Number.isFinite(input.price) || input.price < 0)
        throw new Error("Check product name and price");
      if (input.id !== undefined && input.id !== null && !Number.isInteger(input.id))
        throw new Error("Invalid product");
      return {
        id: input.id ?? null,
        patch: {
          name,
          price: Number(input.price.toFixed(2)),
          description: input.description?.trim().slice(0, 1000) || null,
          product_type: input.productType,
          category_id: input.categoryId ?? null,
          subcategory_id: input.subcategoryId ?? null,
          image_url: input.imageUrl?.trim().slice(0, 1000) || null,
          download_link: input.downloadLink?.trim().slice(0, 1000) || null,
          is_active: input.isActive ?? true,
        },
      };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = data.id
      ? await supabaseAdmin.from("products").update(data.patch).eq("id", data.id)
      : await supabaseAdmin.from("products").insert(data.patch);
    if (result.error) throw new Error(result.error.message);
    return { message: data.id ? "Product updated." : "Product created." };
  });

export const bulkUpdateProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      ids: number[];
      action: "activate" | "deactivate" | "price" | "category";
      value?: number;
    }) => {
      const ids = [...new Set(input.ids)].filter(Number.isInteger).slice(0, 250);
      if (ids.length === 0) throw new Error("Select at least one product");
      if (["price", "category"].includes(input.action) && !Number.isFinite(input.value))
        throw new Error("Enter a valid value");
      return { ...input, ids };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch =
      data.action === "activate"
        ? { is_active: true }
        : data.action === "deactivate"
          ? { is_active: false }
          : data.action === "price"
            ? { price: Number(Number(data.value).toFixed(2)) }
            : { category_id: Number(data.value) };
    const { error } = await supabaseAdmin.from("products").update(patch).in("id", data.ids);
    if (error) throw new Error(error.message);
    return { message: `${data.ids.length} products updated.` };
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      id?: number | null;
      kind: "category" | "subcategory";
      name: string;
      description?: string;
      categoryId?: number;
      sortOrder?: number;
    }) => {
      const name = input.name.trim().slice(0, 80);
      if (name.length < 2) throw new Error("Name is too short");
      if (input.id !== undefined && input.id !== null && !Number.isInteger(input.id))
        throw new Error("Invalid category");
      if (input.kind === "subcategory" && !Number.isInteger(input.categoryId))
        throw new Error("Choose a parent category");
      return {
        id: input.id ?? null,
        kind: input.kind,
        patch:
          input.kind === "subcategory"
            ? {
                name,
                description: input.description?.trim().slice(0, 500) || null,
                category_id: input.categoryId,
              }
            : {
                name,
                description: input.description?.trim().slice(0, 500) || null,
                sort_order: input.sortOrder ?? 0,
              },
      };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result =
      data.kind === "subcategory"
        ? data.id
          ? await supabaseAdmin.from("subcategories").update(data.patch).eq("id", data.id)
          : await supabaseAdmin.from("subcategories").insert(data.patch)
        : data.id
          ? await supabaseAdmin.from("categories").update(data.patch).eq("id", data.id)
          : await supabaseAdmin.from("categories").insert(data.patch);
    if (result.error) throw new Error(result.error.message);
    return { message: `${data.kind === "category" ? "Category" : "Subcategory"} saved.` };
  });

export const resolveDispute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: number; resolution: string }) => {
    const resolution = input.resolution.trim().slice(0, 1000);
    if (!Number.isInteger(input.id) || resolution.length < 2) throw new Error("Enter a resolution");
    return { id: input.id, resolution };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: dispute, error } = await supabaseAdmin
      .from("disputes")
      .update({
        status: "resolved",
        resolution: data.resolution,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("user_id, order_id")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("orders")
      .update({ dispute_status: "resolved" })
      .eq("id", dispute.order_id);
    const { data: user } = await supabaseAdmin
      .from("bot_users")
      .select("telegram_id")
      .eq("id", dispute.user_id)
      .maybeSingle();
    if (user) {
      const { sendMessage } = await import("./store/telegram.server");
      await sendMessage(Number(user.telegram_id), `Your dispute was resolved:\n${data.resolution}`);
    }
    return { message: "Dispute resolved." };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      storeName: string;
      welcomeMessage: string;
      supportUsername?: string;
      miniAppUrl?: string;
      bannerImageUrl?: string;
      btcAddress?: string;
      usdtTrc20Address?: string;
      usdcErc20Address?: string;
      paymentExpiryMinutes?: number;
      amountTolerancePercent?: number;
    }) => ({
      store_name: input.storeName.trim().slice(0, 100),
      welcome_message: input.welcomeMessage.trim().slice(0, 2000),
      support_username: input.supportUsername?.trim().replace(/^@/, "").slice(0, 100) || null,
      mini_app_url: input.miniAppUrl?.trim().slice(0, 1000) || null,
      banner_image_url: input.bannerImageUrl?.trim().slice(0, 1000) || null,
      btc_address: input.btcAddress?.trim().slice(0, 200) || null,
      usdt_trc20_address: input.usdtTrc20Address?.trim().slice(0, 200) || null,
      usdc_erc20_address: input.usdcErc20Address?.trim().slice(0, 200) || null,
      payment_expiry_minutes: Math.min(1440, Math.max(5, input.paymentExpiryMinutes ?? 30)),
      amount_tolerance_percent: Math.min(20, Math.max(0, input.amountTolerancePercent ?? 2)),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.store_name) throw new Error("Store name is required");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("store_settings").update(data).eq("id", 1);
    if (error) throw new Error(error.message);
    return { message: "Store settings saved." };
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
