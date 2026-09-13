import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getSql } from "@/lib/db";

const scrypt = promisify(scryptCb);
const COOKIE = "el_session";
const SESSION_DAYS = 30;
const WELCOME_BONUS = 25;

export type StoreUser = {
  id: number;
  public_id: number;
  username: string;
  first_name: string | null;
  wallet_balance: number;
  is_banned: boolean;
  is_admin: boolean;
};

function asUser(row: Record<string, unknown>): StoreUser {
  return {
    id: Number(row.id),
    public_id: Number(row.public_id),
    username: String(row.username),
    first_name: (row.first_name as string | null) ?? null,
    wallet_balance: Number(row.wallet_balance ?? 0),
    is_banned: Boolean(row.is_banned),
    is_admin: Boolean(row.is_admin),
  };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scrypt(password, salt, 32)) as Buffer;
  return `scrypt:${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hex] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const buf = (await scrypt(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  if (buf.length !== expected.length) return false;
  return timingSafeEqual(buf, expected);
}

export function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function generateUsername() {
  const adj = ["mint", "vault", "north", "quiet", "swift", "lunar", "cedar", "ridge"];
  const noun = ["otter", "harbor", "quartz", "falcon", "nova", "atlas", "willow", "ember"];
  const n = randomBytes(2);
  return `${adj[n[0]! % adj.length]}${noun[n[1]! % noun.length]}${100 + (n[0]! % 90)}`;
}

export async function uniquePublicId() {
  const sql = await getSql();
  for (let i = 0; i < 8; i += 1) {
    const id = 20_000_000 + (randomBytes(4).readUInt32BE(0) % 70_000_000);
    const rows = await sql<{ n: number }>`select 1 as n from store_users where public_id = ${id} limit 1`;
    if (rows.length === 0) return id;
  }
  return Date.now();
}

export async function uniqueUsername(base: string) {
  const sql = await getSql();
  const cleaned = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || generateUsername();
  let candidate = cleaned.toLowerCase();
  for (let i = 0; i < 12; i += 1) {
    const rows = await sql<{ n: number }>`select 1 as n from store_users where username = ${candidate} limit 1`;
    if (rows.length === 0) return candidate;
    candidate = `${cleaned.toLowerCase()}${10 + i}`;
  }
  return `${cleaned.toLowerCase()}${randomBytes(2).toString("hex")}`;
}

async function readCookieToken() {
  try {
    const { getCookie } = await import("@tanstack/react-start/server");
    return getCookie(COOKIE) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function writeSessionCookie(token: string) {
  try {
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(COOKIE, token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
  } catch {
    /* no request context */
  }
}

export async function clearSessionCookie() {
  try {
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(COOKIE, "", { path: "/", httpOnly: true, maxAge: 0 });
  } catch {
    /* no request context */
  }
}

export async function createSession(userId: number) {
  const sql = await getSql();
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`insert into store_sessions (token, user_id, expires_at) values (${token}, ${userId}, ${expires})`;
  await writeSessionCookie(token);
  return token;
}

export async function userFromToken(clientToken?: string | null): Promise<StoreUser | null> {
  const token = (await readCookieToken()) || clientToken || undefined;
  if (!token) return null;
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select u.*
    from store_sessions s
    join store_users u on u.id = s.user_id
    where s.token = ${token} and s.expires_at > now()
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  const user = asUser(row);
  if (user.is_banned) throw new Error("This account is suspended.");
  return user;
}

export async function requireUser(clientToken?: string | null) {
  const user = await userFromToken(clientToken);
  if (!user) throw new Error("Please sign in first.");
  return user;
}

export async function requireAdmin(clientToken?: string | null) {
  const user = await requireUser(clientToken);
  if (!user.is_admin) throw new Error("Forbidden");
  return user;
}

export async function adjustBalance(userId: number, amount: number, reason: string) {
  const sql = await getSql();
  const rows = await sql<{ wallet_balance: string | number }>`
    update store_users
    set wallet_balance = wallet_balance + ${amount}
    where id = ${userId}
    returning wallet_balance
  `;
  const balance = Number(rows[0]?.wallet_balance ?? 0);
  if (balance < -0.001) throw new Error("Insufficient balance.");
  await sql`
    insert into wallet_ledger (user_id, amount, balance_after, reason)
    values (${userId}, ${amount}, ${balance}, ${reason})
  `;
  return balance;
}

export async function createStoreUser(input: {
  username: string;
  publicId: number;
  password: string;
  firstName?: string | null;
  welcome?: boolean;
}) {
  const sql = await getSql();
  const hash = await hashPassword(input.password);
  const bonus = input.welcome === false ? 0 : WELCOME_BONUS;
  const rows = await sql<Record<string, unknown>>`
    insert into store_users (public_id, username, password_hash, first_name, wallet_balance)
    values (${input.publicId}, ${input.username}, ${hash}, ${input.firstName ?? null}, ${bonus})
    returning *
  `;
  const user = asUser(rows[0]!);
  if (bonus > 0) {
    await sql`
      insert into wallet_ledger (user_id, amount, balance_after, reason)
      values (${user.id}, ${bonus}, ${bonus}, 'Welcome credit')
    `;
  }
  return user;
}

export { WELCOME_BONUS };
