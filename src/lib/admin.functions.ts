import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
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
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabaseAdmin.from("transactions").select("id", { count: "exact", head: true }).in("status", ["pending", "submitted"]),
      supabaseAdmin.from("orders").select("total_amount").eq("status", "completed"),
      supabaseAdmin.from("bot_users").select("wallet_balance"),
    ]);
    const sum = (rows: { [k: string]: any }[] | null, key: string) =>
      (rows ?? []).reduce((total, row) => total + Number(row[key] ?? 0), 0);
    return {
      customers: customers.count ?? 0,
      orders: orders.count ?? 0,
      pendingPayments: pending.count ?? 0,
      revenue: sum(revenue.data as any[], "total_amount"),
      liability: sum(balances.data as any[], "wallet_balance"),
    };
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: number; action: "approve" | "reject" | "recheck" }) => {
    if (!Number.isInteger(input.id) || input.id <= 0) throw new Error("Invalid invoice");
    if (!["approve", "reject", "recheck"].includes(input.action)) throw new Error("Invalid action");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tx } = await supabaseAdmin.from("transactions").select("*").eq("id", data.id).maybeSingle();
    if (!tx) throw new Error("Invoice not found");

    const { settleTransaction, verifyAndSettle } = await import("./store/payments.server");
    if (data.action === "approve") {
      const result = await settleTransaction(data.id, { auto: false, note: "Approved from the web dashboard" });
      return { message: result.credited ? "Payment approved and balance credited." : "This invoice was already processed." };
    }
    if (data.action === "recheck") {
      const outcome = await verifyAndSettle(tx as any);
      return { message: outcome.message };
    }
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", verification_note: "Rejected from the web dashboard" })
      .eq("id", data.id);
    const { data: user } = await supabaseAdmin.from("bot_users").select("telegram_id").eq("id", tx.user_id).maybeSingle();
    if (user) {
      const { sendMessage } = await import("./store/telegram.server");
      await sendMessage(Number(user.telegram_id), `❌ Your payment for invoice ${tx.invoice_code} was rejected.`);
    }
    return { message: "Payment rejected." };
  });

export const adjustCustomerBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: number; amount: number; reason: string }) => {
    if (!Number.isInteger(input.userId)) throw new Error("Invalid customer");
    if (!Number.isFinite(input.amount) || input.amount === 0) throw new Error("Amount must be a non-zero number");
    return { ...input, reason: (input.reason || "Admin adjustment").slice(0, 200) };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { adjustBalance, getDb } = await import("./store/db.server");
    const balance = await adjustBalance(data.userId, data.amount, data.reason);
    const db = await getDb();
    const { data: user } = await db.from("bot_users").select("telegram_id").eq("id", data.userId).maybeSingle();
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
  .inputValidator((input: { text: string }) => {
    const text = (input.text ?? "").trim();
    if (text.length < 2 || text.length > 3000) throw new Error("Message must be between 2 and 3000 characters");
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
  .inputValidator((input: { productId: number; keys: string }) => {
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
    await db.from("product_keys").insert(data.keys.map((key) => ({ product_id: data.productId, key_value: key })));
    const { count } = await db
      .from("product_keys")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.productId)
      .eq("is_sold", false);
    await db.from("products").update({ stock_count: count ?? 0 }).eq("id", data.productId);
    return { added: data.keys.length, stock: count ?? 0 };
  });