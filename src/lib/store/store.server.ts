import { createHmac, randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import {
  createSession,
  createStoreUser,
  generatePassword,
  generateUsername,
  requireAdmin,
  requireUser,
  uniquePublicId,
  uniqueUsername,
  userFromToken,
  verifyPassword,
  adjustBalance,
  clearSessionCookie,
  type StoreUser,
} from "./session.server";

import type { PublicCategory, PublicProduct } from "./types";

function num(value: unknown) {
  return Number(value ?? 0);
}

async function stockMap(productIds: number[]) {
  const map = new Map<number, number>();
  if (productIds.length === 0) return map;
  const sql = await getSql();
  const rows = await sql<{ product_id: number; stock: number }>`
    select product_id, count(*)::int as stock
    from product_keys
    where is_sold = false
    group by product_id
  `;
  for (const row of rows) map.set(Number(row.product_id), Number(row.stock));
  return map;
}

function toProduct(
  row: {
    id: number;
    name: string;
    description: string | null;
    price: string | number;
    image_url: string | null;
    category_id: number | null;
    is_featured: boolean;
    product_type: string;
  },
  stock: number,
): PublicProduct {
  const unlimited = row.product_type === "file";
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    price: num(row.price),
    image_url: row.image_url,
    category_id: row.category_id == null ? null : Number(row.category_id),
    is_featured: Boolean(row.is_featured),
    product_type: unlimited ? "file" : "key",
    stock: unlimited ? 0 : stock,
    unlimited,
  };
}

export async function getSettings() {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from store_settings where id = 1`;
  const row = rows[0] ?? {};
  return {
    store_name: String(row.store_name ?? "Enroll Log"),
    welcome_message: String(row.welcome_message ?? ""),
    support_username: (row.support_username as string | null) ?? "ebankenroll",
    channel_username: (row.channel_username as string | null) ?? "ebankenroll",
    banner_image_url: (row.banner_image_url as string | null) ?? "/catalog/banner.jpg",
    mini_app_url: (row.mini_app_url as string | null) ?? "/app",
    btc_address: (row.btc_address as string | null) ?? "",
    usdt_trc20_address: (row.usdt_trc20_address as string | null) ?? "",
    usdc_erc20_address: (row.usdc_erc20_address as string | null) ?? "",
    min_topup_usd: num(row.min_topup_usd ?? 5),
  };
}

export async function storefront() {
  const sql = await getSql();
  const [settings, categories, products, reviews, orderCount] = await Promise.all([
    getSettings(),
    sql<Record<string, unknown>>`select * from categories order by sort_order, name`,
    sql<{
      id: number;
      name: string;
      description: string | null;
      price: string | number;
      image_url: string | null;
      category_id: number | null;
      is_featured: boolean;
      product_type: string;
    }>`select id, name, description, price, image_url, category_id, is_featured, product_type from products where is_active = true order by name`,
    sql<{
      id: number;
      author: string;
      initials: string;
      product_label: string | null;
      rating: number;
      body: string;
    }>`select id, author, initials, product_label, rating, body from store_reviews where is_published = true order by created_at desc limit 12`,
    sql<{ n: number }>`select count(*)::int as n from orders`,
  ]);
  const stocks = await stockMap(products.map((p) => Number(p.id)));
  const mapped = products.map((p) => toProduct(p, stocks.get(Number(p.id)) ?? 0));
  const cats: PublicCategory[] = categories.map((c) => {
    const own = mapped.filter((p) => p.category_id === Number(c.id));
    return {
      id: Number(c.id),
      name: String(c.name),
      description: (c.description as string | null) ?? null,
      image_url: (c.image_url as string | null) ?? null,
      products: own.length,
      stock: own.reduce((sum, p) => sum + (p.unlimited ? 0 : p.stock), 0),
      fileProducts: own.filter((p) => p.unlimited).length,
    };
  });
  const inStock = mapped.reduce((sum, p) => sum + (p.unlimited ? 0 : p.stock), 0);
  return {
    store: {
      name: settings.store_name,
      welcome: settings.welcome_message,
      channel: settings.channel_username,
      support: settings.support_username,
      banner: settings.banner_image_url,
      miniApp: settings.mini_app_url,
    },
    stats: {
      products: mapped.length,
      inStock,
      categories: cats.length,
      orders: Number(orderCount[0]?.n ?? 0),
      reviews: reviews.length,
    },
    categories: cats,
    featured: mapped.filter((p) => p.is_featured),
    reviews,
  };
}

export async function shopCatalog() {
  const sql = await getSql();
  const [categories, products] = await Promise.all([
    sql<{ id: number; name: string; description: string | null; image_url: string | null }>`
      select id, name, description, image_url from categories order by sort_order, name
    `,
    sql<{
      id: number;
      name: string;
      description: string | null;
      price: string | number;
      image_url: string | null;
      category_id: number | null;
      is_featured: boolean;
      product_type: string;
    }>`select id, name, description, price, image_url, category_id, is_featured, product_type from products where is_active = true order by name`,
  ]);
  const stocks = await stockMap(products.map((p) => Number(p.id)));
  return {
    categories: categories.map((c) => ({
      id: Number(c.id),
      name: c.name,
      description: c.description,
      image_url: c.image_url,
    })),
    products: products.map((p) => toProduct(p, stocks.get(Number(p.id)) ?? 0)),
  };
}

type TelegramUser = { id: number; username?: string; first_name?: string };

function parseTelegramUser(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (hash && token) {
      const copy = new URLSearchParams(initData);
      copy.delete("hash");
      const dataCheckString = [...copy.entries()]
        .map(([k, v]) => `${k}=${v}`)
        .sort()
        .join("\n");
      const secret = createHmac("sha256", "WebAppData").update(token).digest();
      const computed = createHmac("sha256", secret).update(dataCheckString).digest("hex");
      if (computed !== hash) throw new Error("Invalid Telegram signature");
    }
    const raw = params.get("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TelegramUser;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function startAccount(input: { token?: string; initData?: string }) {
  const existing = await userFromToken(input.token);
  if (existing) {
    const token = await createSession(existing.id);
    return { created: false as const, token, user: publicUser(existing), password: null as string | null };
  }

  const telegram = input.initData ? parseTelegramUser(input.initData) : null;
  const sql = await getSql();
  if (telegram) {
    const found = await sql<Record<string, unknown>>`
      select * from store_users where public_id = ${telegram.id} limit 1
    `;
    if (found[0]) {
      const user = {
        id: Number(found[0].id),
        public_id: Number(found[0].public_id),
        username: String(found[0].username),
        first_name: (found[0].first_name as string | null) ?? null,
        wallet_balance: num(found[0].wallet_balance),
        is_banned: Boolean(found[0].is_banned),
        is_admin: Boolean(found[0].is_admin),
      };
      if (user.is_banned) throw new Error("This account is suspended.");
      const token = await createSession(user.id);
      return { created: false as const, token, user: publicUser(user), password: null as string | null };
    }
  }

  const password = generatePassword();
  const username = await uniqueUsername(telegram?.username || generateUsername());
  const publicId = telegram?.id ?? (await uniquePublicId());
  const user = await createStoreUser({
    username,
    publicId,
    password,
    firstName: telegram?.first_name ?? null,
  });
  const token = await createSession(user.id);
  return { created: true as const, token, user: publicUser(user), password };
}

export async function loginAccount(username: string, password: string) {
  const sql = await getSql();
  const handle = username.replace(/^@/, "").trim().toLowerCase();
  const rows = await sql<Record<string, unknown>>`
    select * from store_users where lower(username) = ${handle} limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("Unknown username or password.");
  const ok = await verifyPassword(password, String(row.password_hash));
  if (!ok) throw new Error("Unknown username or password.");
  if (row.is_banned) throw new Error("This account is suspended.");
  const user = {
    id: Number(row.id),
    public_id: Number(row.public_id),
    username: String(row.username),
    first_name: (row.first_name as string | null) ?? null,
    wallet_balance: num(row.wallet_balance),
    is_banned: Boolean(row.is_banned),
    is_admin: Boolean(row.is_admin),
  };
  const token = await createSession(user.id);
  return { token, user: publicUser(user) };
}

export async function logoutAccount() {
  await clearSessionCookie();
  return { ok: true };
}

function publicUser(user: StoreUser) {
  return {
    id: user.id,
    public_id: user.public_id,
    username: user.username,
    first_name: user.first_name,
    wallet_balance: user.wallet_balance,
    is_admin: user.is_admin,
  };
}

export async function currentAccount(token?: string) {
  const user = await userFromToken(token);
  if (!user) return null;
  const sql = await getSql();
  const unread = await sql<{ n: number }>`
    select count(*)::int as n from user_notes where user_id = ${user.id} and read_at is null
  `;
  return { ...publicUser(user), unreadNotes: Number(unread[0]?.n ?? 0) };
}

export async function addToCart(token: string | undefined, productId: number) {
  const user = await requireUser(token);
  const sql = await getSql();
  const products = await sql<{ id: number; product_type: string }>`
    select id, product_type from products where id = ${productId} and is_active = true
  `;
  const product = products[0];
  if (!product) throw new Error("Product not found.");
  if (product.product_type !== "file") {
    const stocks = await stockMap([productId]);
    if ((stocks.get(productId) ?? 0) <= 0) throw new Error("That product is out of stock.");
  }
  const existing = await sql<{ id: number; quantity: number }>`
    select id, quantity from cart_items where user_id = ${user.id} and product_id = ${productId}
  `;
  if (existing[0]) {
    await sql`update cart_items set quantity = quantity + 1 where id = ${existing[0].id}`;
  } else {
    await sql`insert into cart_items (user_id, product_id, quantity) values (${user.id}, ${productId}, 1)`;
  }
  return { ok: true };
}

export async function removeFromCart(token: string | undefined, cartItemId: number) {
  const user = await requireUser(token);
  const sql = await getSql();
  await sql`delete from cart_items where id = ${cartItemId} and user_id = ${user.id}`;
  return { ok: true };
}

export async function getCart(userId: number) {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    quantity: number;
    product_id: number;
    name: string;
    price: string | number;
    image_url: string | null;
    product_type: string;
  }>`
    select c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url, p.product_type
    from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = ${userId}
    order by c.id
  `;
  const stocks = await stockMap(rows.map((r) => Number(r.product_id)));
  const items = rows.map((row) => ({
    id: Number(row.id),
    quantity: Number(row.quantity),
    product: toProduct(
      {
        id: Number(row.product_id),
        name: row.name,
        description: null,
        price: row.price,
        image_url: row.image_url,
        category_id: null,
        is_featured: false,
        product_type: row.product_type,
      },
      stocks.get(Number(row.product_id)) ?? 0,
    ),
  }));
  const total = items.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
  return { items, total };
}

export async function checkoutCart(token?: string) {
  const user = await requireUser(token);
  const sql = await getSql();
  const { items, total } = await getCart(user.id);
  if (items.length === 0) return { ok: false as const, reason: "Your cart is empty." };
  const fresh = await sql<{ wallet_balance: string | number }>`
    select wallet_balance from store_users where id = ${user.id}
  `;
  const balance = num(fresh[0]?.wallet_balance);
  if (balance + 0.001 < total) {
    return {
      ok: false as const,
      reason: `Insufficient balance. Total is $${total.toFixed(2)} and you have $${balance.toFixed(2)}.`,
    };
  }
  for (const item of items) {
    if (!item.product.unlimited && item.product.stock < item.quantity) {
      return { ok: false as const, reason: `${item.product.name} does not have enough stock.` };
    }
  }

  const orderRows = await sql<{ id: number }>`
    insert into orders (user_id, total_amount, status)
    values (${user.id}, ${total}, 'completed')
    returning id
  `;
  const orderId = Number(orderRows[0]!.id);

  for (const item of items) {
    let delivered = "";
    if (item.product.unlimited) {
      const files = await sql<{ download_link: string | null }>`
        select download_link from products where id = ${item.product.id}
      `;
      delivered = files[0]?.download_link || "Download link will be sent by support.";
    } else {
      const keys = await sql.query<{ id: number; key_value: string }>(
        `select id, key_value from product_keys
         where product_id = $1 and is_sold = false
         order by id
         limit $2`,
        [item.product.id, item.quantity],
      );
      if (keys.length < item.quantity) {
        throw new Error(`${item.product.name} does not have enough stock.`);
      }
      for (const key of keys) {
        await sql`
          update product_keys
          set is_sold = true, order_id = ${orderId}, sold_at = now()
          where id = ${key.id} and is_sold = false
        `;
      }
      delivered = keys.map((k) => k.key_value).join("\n");
    }
    await sql`
      insert into order_items (order_id, product_id, product_name, quantity, price, delivered_asset)
      values (${orderId}, ${item.product.id}, ${item.product.name}, ${item.quantity}, ${item.product.price}, ${delivered})
    `;
  }

  const newBalance = await adjustBalance(user.id, -total, `Order #${orderId}`);
  await sql`delete from cart_items where user_id = ${user.id}`;
  return { ok: true as const, orderId, total, balance: newBalance };
}

const ASSET_META = {
  BTC: { label: "Bitcoin (BTC)", network: "Bitcoin", key: "btc_address" },
  USDT_TRC20: { label: "USDT · TRC20", network: "Tron", key: "usdt_trc20_address" },
  USDC_ERC20: { label: "USDC · Ethereum", network: "Ethereum", key: "usdc_erc20_address" },
} as const;

export type PaymentAsset = keyof typeof ASSET_META;

export async function createTopUp(token: string | undefined, asset: PaymentAsset, amountUsd: number) {
  const user = await requireUser(token);
  const settings = await getSettings();
  if (!Number.isFinite(amountUsd) || amountUsd < settings.min_topup_usd) {
    throw new Error(`Minimum top-up is $${settings.min_topup_usd.toFixed(2)}`);
  }
  const meta = ASSET_META[asset];
  const address = String(settings[meta.key as keyof typeof settings] ?? "").trim();
  if (!address) throw new Error("That coin is not configured yet.");
  const sql = await getSql();
  const code = `INV-${randomBytes(4).toString("hex").toUpperCase()}`;
  const expected =
    asset === "BTC" ? +(amountUsd / 65000).toFixed(8) : +(amountUsd).toFixed(2);
  const rows = await sql<{ id: number }>`
    insert into transactions (invoice_code, user_id, amount_usd, asset, pay_address, expected_amount, status)
    values (${code}, ${user.id}, ${amountUsd}, ${asset}, ${address}, ${expected}, 'pending')
    returning id
  `;
  return {
    id: Number(rows[0]!.id),
    code,
    asset,
    assetLabel: meta.label,
    network: meta.network,
    address,
    amount: expected.toString(),
    amountUsd,
  };
}

export async function submitHash(token: string | undefined, txId: number, hash: string) {
  const user = await requireUser(token);
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select * from transactions where id = ${txId} and user_id = ${user.id}
  `;
  const tx = rows[0];
  if (!tx) throw new Error("Invoice not found.");
  if (String(tx.status) === "completed") return { status: "credited", message: "Already credited." };
  const cleaned = hash.trim();
  if (cleaned.length < 8) throw new Error("That does not look like a transaction hash.");
  await sql`
    update transactions
    set tx_hash = ${cleaned}, status = 'submitted', submitted_at = now()
    where id = ${txId}
  `;
  return {
    status: "submitted",
    message: "Hash received. An operator will credit your balance after confirmation.",
  };
}

export async function accountOverview(token?: string) {
  const user = await requireUser(token);
  const sql = await getSql();
  const [orders, deposits, notes, cart] = await Promise.all([
    sql<Record<string, unknown>>`
      select id, status, total_amount, created_at from orders
      where user_id = ${user.id}
      order by id desc
      limit 25
    `,
    sql<Record<string, unknown>>`
      select id, invoice_code, asset, amount_usd, status, created_at
      from transactions where user_id = ${user.id}
      order by id desc limit 15
    `,
    sql<Record<string, unknown>>`
      select id, body, created_at, read_at from user_notes
      where user_id = ${user.id}
      order by id desc limit 40
    `,
    getCart(user.id),
  ]);
  const orderIds = orders.map((o) => Number(o.id));
  const items =
    orderIds.length === 0
      ? []
      : await sql<{
          id: number;
          order_id: number;
          product_name: string;
          quantity: number;
          price: string | number;
          delivered_asset: string | null;
        }>`select id, order_id, product_name, quantity, price, delivered_asset from order_items order by id`;
  return {
    user: publicUser(user),
    cart,
    orders: orders.map((order) => ({
      id: Number(order.id),
      status: String(order.status),
      total: num(order.total_amount),
      created_at: String(order.created_at),
      items: items
        .filter((item) => Number(item.order_id) === Number(order.id))
        .map((item) => ({
          id: Number(item.id),
          name: item.product_name,
          quantity: Number(item.quantity),
          price: num(item.price),
          delivered_asset: item.delivered_asset,
        })),
    })),
    deposits: deposits.map((d) => ({
      id: Number(d.id),
      code: String(d.invoice_code),
      asset: String(d.asset),
      amount: num(d.amount_usd),
      status: String(d.status),
      created_at: String(d.created_at),
    })),
    notes: notes.map((n) => ({
      id: Number(n.id),
      body: String(n.body),
      created_at: String(n.created_at),
      read: Boolean(n.read_at),
    })),
  };
}

export async function markNotesRead(token?: string) {
  const user = await requireUser(token);
  const sql = await getSql();
  await sql`update user_notes set read_at = now() where user_id = ${user.id} and read_at is null`;
  return { ok: true };
}

export async function claimAdmin(token?: string) {
  const user = await requireUser(token);
  const sql = await getSql();
  const existing = await sql<{ n: number }>`select count(*)::int as n from store_users where is_admin = true`;
  if (Number(existing[0]?.n ?? 0) > 0) {
    if (user.is_admin) return { granted: true, reason: "You already have operator access." };
    return { granted: false, reason: "An operator already exists." };
  }
  await sql`update store_users set is_admin = true where id = ${user.id}`;
  return { granted: true, reason: "You are now the store operator." };
}

export async function adminDashboard(token?: string) {
  await requireAdmin(token);
  const sql = await getSql();
  const [users, orders, pending, revenue, products, categories, notes, txs] = await Promise.all([
    sql<Record<string, unknown>>`select * from store_users order by created_at desc limit 250`,
    sql<Record<string, unknown>>`
      select o.*, u.username, u.public_id
      from orders o join store_users u on u.id = o.user_id
      order by o.id desc limit 100
    `,
    sql<{ n: number }>`select count(*)::int as n from transactions where status in ('pending','submitted')`,
    sql<{ s: string | number }>`select coalesce(sum(total_amount),0) as s from orders where status = 'completed'`,
    sql<Record<string, unknown>>`select * from products order by name`,
    sql<Record<string, unknown>>`select * from categories order by sort_order, name`,
    sql<Record<string, unknown>>`
      select n.*, u.username as to_username
      from user_notes n join store_users u on u.id = n.user_id
      order by n.id desc limit 50
    `,
    sql<Record<string, unknown>>`
      select t.*, u.username
      from transactions t join store_users u on u.id = t.user_id
      order by t.id desc limit 80
    `,
  ]);
  const mappedProducts = products.map((p) => ({
    id: Number(p.id),
    name: String(p.name),
    description: (p.description as string | null) ?? null,
    price: num(p.price),
    product_type: String(p.product_type),
    category_id: p.category_id == null ? null : Number(p.category_id),
    image_url: (p.image_url as string | null) ?? null,
    download_link: (p.download_link as string | null) ?? null,
    is_active: Boolean(p.is_active),
    is_featured: Boolean(p.is_featured),
  }));
  const stocks = await stockMap(mappedProducts.map((p) => p.id));
  const liability = users.reduce((sum, u) => sum + num(u.wallet_balance), 0);
  return {
    stats: {
      customers: users.length,
      orders: orders.length,
      pendingPayments: Number(pending[0]?.n ?? 0),
      revenue: num(revenue[0]?.s),
      liability,
    },
    settings: await getSettings(),
    customers: users.map((u) => ({
      id: Number(u.id),
      public_id: Number(u.public_id),
      username: String(u.username),
      first_name: (u.first_name as string | null) ?? null,
      wallet_balance: num(u.wallet_balance),
      is_banned: Boolean(u.is_banned),
      is_admin: Boolean(u.is_admin),
      created_at: String(u.created_at),
    })),
    orders: orders.map((o) => ({
      id: Number(o.id),
      username: String(o.username),
      public_id: Number(o.public_id),
      total: num(o.total_amount),
      status: String(o.status),
      created_at: String(o.created_at),
    })),
    products: mappedProducts.map((p) => ({
      ...p,
      stock: p.product_type === "file" ? null : (stocks.get(p.id) ?? 0),
    })),
    categories: categories.map((c) => ({
      id: Number(c.id),
      name: String(c.name),
      description: (c.description as string | null) ?? null,
      image_url: (c.image_url as string | null) ?? null,
      sort_order: Number(c.sort_order ?? 0),
    })),
    notes: notes.map((n) => ({
      id: Number(n.id),
      user_id: Number(n.user_id),
      to_username: String(n.to_username),
      body: String(n.body),
      created_at: String(n.created_at),
    })),
    payments: txs.map((t) => ({
      id: Number(t.id),
      code: String(t.invoice_code),
      username: String(t.username),
      asset: String(t.asset),
      amount: num(t.amount_usd),
      status: String(t.status),
      tx_hash: (t.tx_hash as string | null) ?? null,
      created_at: String(t.created_at),
    })),
  };
}

export async function sendPrivateNote(token: string | undefined, userId: number, body: string) {
  const admin = await requireAdmin(token);
  const text = body.trim();
  if (text.length < 2) throw new Error("Write a note first.");
  const sql = await getSql();
  const target = await sql<{ id: number }>`select id from store_users where id = ${userId}`;
  if (!target[0]) throw new Error("Customer not found.");
  await sql`
    insert into user_notes (user_id, author_id, body)
    values (${userId}, ${admin.id}, ${text})
  `;
  return { ok: true, message: "Private note delivered." };
}

export async function adminAdjustBalance(token: string | undefined, userId: number, amount: number, reason: string) {
  await requireAdmin(token);
  if (!Number.isFinite(amount) || amount === 0) throw new Error("Enter a non-zero amount.");
  const balance = await adjustBalance(userId, amount, reason.trim() || "Operator adjustment");
  return { ok: true, message: `Balance is now $${balance.toFixed(2)}.` };
}

export async function adminCreditPayment(token: string | undefined, txId: number) {
  await requireAdmin(token);
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from transactions where id = ${txId}`;
  const tx = rows[0];
  if (!tx) throw new Error("Invoice not found.");
  if (String(tx.status) === "completed") return { message: "Already credited." };
  const amount = num(tx.amount_usd);
  await adjustBalance(Number(tx.user_id), amount, `Top-up ${tx.invoice_code}`);
  await sql`
    update transactions set status = 'completed', completed_at = now() where id = ${txId}
  `;
  return { message: `Credited $${amount.toFixed(2)}.` };
}

export async function saveProduct(
  token: string | undefined,
  input: {
    id?: number;
    name: string;
    description?: string;
    price: number;
    product_type: "key" | "file";
    category_id?: number | null;
    image_url?: string | null;
    download_link?: string | null;
    is_active?: boolean;
    is_featured?: boolean;
  },
) {
  await requireAdmin(token);
  const sql = await getSql();
  if (input.id) {
    await sql`
      update products set
        name = ${input.name},
        description = ${input.description ?? null},
        price = ${input.price},
        product_type = ${input.product_type},
        category_id = ${input.category_id ?? null},
        image_url = ${input.image_url ?? null},
        download_link = ${input.download_link ?? null},
        is_active = ${input.is_active ?? true},
        is_featured = ${input.is_featured ?? false}
      where id = ${input.id}
    `;
    return { message: "Product updated." };
  }
  await sql`
    insert into products (name, description, price, product_type, category_id, image_url, download_link, is_active, is_featured)
    values (
      ${input.name}, ${input.description ?? null}, ${input.price}, ${input.product_type},
      ${input.category_id ?? null}, ${input.image_url ?? null}, ${input.download_link ?? null},
      ${input.is_active ?? true}, ${input.is_featured ?? false}
    )
  `;
  return { message: "Product created." };
}

export async function addProductKeys(token: string | undefined, productId: number, keysText: string) {
  await requireAdmin(token);
  const keys = keysText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (keys.length === 0) throw new Error("Paste at least one key.");
  const sql = await getSql();
  for (const key of keys) {
    await sql`insert into product_keys (product_id, key_value) values (${productId}, ${key})`;
  }
  return { message: `Added ${keys.length} key${keys.length === 1 ? "" : "s"}.` };
}

export async function saveCategory(
  token: string | undefined,
  input: { id?: number; name: string; description?: string; image_url?: string; sort_order?: number },
) {
  await requireAdmin(token);
  const sql = await getSql();
  if (input.id) {
    await sql`
      update categories
      set name = ${input.name}, description = ${input.description ?? null},
          image_url = ${input.image_url ?? null}, sort_order = ${input.sort_order ?? 0}
      where id = ${input.id}
    `;
    return { message: "Category updated." };
  }
  await sql`
    insert into categories (name, description, image_url, sort_order)
    values (${input.name}, ${input.description ?? null}, ${input.image_url ?? null}, ${input.sort_order ?? 0})
  `;
  return { message: "Category created." };
}

export async function saveSettings(
  token: string | undefined,
  input: {
    store_name: string;
    welcome_message: string;
    channel_username?: string;
    support_username?: string;
    btc_address?: string;
    usdt_trc20_address?: string;
    usdc_erc20_address?: string;
    min_topup_usd: number;
  },
) {
  await requireAdmin(token);
  const sql = await getSql();
  await sql`
    update store_settings set
      store_name = ${input.store_name},
      welcome_message = ${input.welcome_message},
      channel_username = ${input.channel_username ?? null},
      support_username = ${input.support_username ?? null},
      btc_address = ${input.btc_address ?? null},
      usdt_trc20_address = ${input.usdt_trc20_address ?? null},
      usdc_erc20_address = ${input.usdc_erc20_address ?? null},
      min_topup_usd = ${input.min_topup_usd},
      updated_at = now()
    where id = 1
  `;
  return { message: "Settings saved." };
}

export async function setBanned(token: string | undefined, userId: number, banned: boolean) {
  await requireAdmin(token);
  const sql = await getSql();
  await sql`update store_users set is_banned = ${banned} where id = ${userId}`;
  return { message: banned ? "Customer suspended." : "Customer reinstated." };
}

export async function bootMiniApp(token?: string) {
  const [front, catalog, account] = await Promise.all([
    storefront(),
    shopCatalog(),
    token ? accountOverview(token).catch(() => null) : Promise.resolve(null),
  ]);
  return { ...front, catalog, account };
}
