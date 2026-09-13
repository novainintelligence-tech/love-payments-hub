import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
//#region node_modules/.nitro/vite/services/ssr/assets/store.server-CJ-dpXhc.js
var _0002_store_default = "create table if not exists store_settings (\n  id integer primary key check (id = 1),\n  store_name text not null default 'Enroll Log',\n  welcome_message text not null default 'Buy verified digital products instantly.',\n  support_username text,\n  channel_username text,\n  mini_app_url text,\n  banner_image_url text,\n  btc_address text,\n  usdt_trc20_address text,\n  usdc_erc20_address text,\n  min_topup_usd numeric(14,2) not null default 5,\n  payment_expiry_minutes integer not null default 60,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists store_users (\n  id serial primary key,\n  public_id bigint not null unique,\n  username text not null unique,\n  password_hash text not null,\n  first_name text,\n  wallet_balance numeric(14,2) not null default 0,\n  is_banned boolean not null default false,\n  is_admin boolean not null default false,\n  created_at timestamptz not null default now()\n);\ncreate index if not exists store_users_username_idx on store_users (username);\n\ncreate table if not exists store_sessions (\n  token text primary key,\n  user_id integer not null references store_users(id) on delete cascade,\n  expires_at timestamptz not null,\n  created_at timestamptz not null default now()\n);\ncreate index if not exists store_sessions_user_idx on store_sessions (user_id);\n\ncreate table if not exists categories (\n  id serial primary key,\n  name text not null,\n  description text,\n  image_url text,\n  sort_order integer not null default 0,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists products (\n  id serial primary key,\n  name text not null,\n  description text,\n  price numeric(14,2) not null check (price >= 0),\n  product_type text not null default 'key' check (product_type in ('key', 'file')),\n  category_id integer references categories(id) on delete set null,\n  image_url text,\n  download_link text,\n  is_active boolean not null default true,\n  is_featured boolean not null default false,\n  created_at timestamptz not null default now()\n);\ncreate index if not exists products_category_idx on products (category_id);\n\ncreate table if not exists product_keys (\n  id serial primary key,\n  product_id integer not null references products(id) on delete cascade,\n  key_value text not null,\n  is_sold boolean not null default false,\n  order_id integer,\n  created_at timestamptz not null default now(),\n  sold_at timestamptz\n);\ncreate index if not exists product_keys_stock_idx on product_keys (product_id, is_sold);\n\ncreate table if not exists cart_items (\n  id serial primary key,\n  user_id integer not null references store_users(id) on delete cascade,\n  product_id integer not null references products(id) on delete cascade,\n  quantity integer not null default 1 check (quantity > 0),\n  created_at timestamptz not null default now(),\n  unique (user_id, product_id)\n);\n\ncreate table if not exists orders (\n  id serial primary key,\n  user_id integer not null references store_users(id) on delete cascade,\n  total_amount numeric(14,2) not null,\n  status text not null default 'completed',\n  created_at timestamptz not null default now()\n);\ncreate index if not exists orders_user_idx on orders (user_id);\n\ncreate table if not exists order_items (\n  id serial primary key,\n  order_id integer not null references orders(id) on delete cascade,\n  product_id integer references products(id) on delete set null,\n  product_name text not null,\n  quantity integer not null default 1,\n  price numeric(14,2) not null,\n  delivered_asset text\n);\n\ncreate table if not exists transactions (\n  id serial primary key,\n  invoice_code text not null unique,\n  user_id integer not null references store_users(id) on delete cascade,\n  amount_usd numeric(14,2) not null check (amount_usd > 0),\n  asset text not null,\n  pay_address text not null,\n  expected_amount numeric(30,8) not null default 0,\n  tx_hash text,\n  status text not null default 'pending',\n  created_at timestamptz not null default now(),\n  submitted_at timestamptz,\n  completed_at timestamptz\n);\ncreate index if not exists transactions_user_idx on transactions (user_id);\n\ncreate table if not exists wallet_ledger (\n  id serial primary key,\n  user_id integer not null references store_users(id) on delete cascade,\n  amount numeric(14,2) not null,\n  balance_after numeric(14,2) not null,\n  reason text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists user_notes (\n  id serial primary key,\n  user_id integer not null references store_users(id) on delete cascade,\n  author_id integer references store_users(id) on delete set null,\n  body text not null,\n  created_at timestamptz not null default now(),\n  read_at timestamptz\n);\ncreate index if not exists user_notes_user_idx on user_notes (user_id, created_at desc);\n\ncreate table if not exists store_reviews (\n  id serial primary key,\n  author text not null,\n  initials text not null,\n  product_label text,\n  rating integer not null check (rating between 1 and 5),\n  body text not null,\n  is_published boolean not null default true,\n  created_at timestamptz not null default now()\n);\n\ninsert into store_settings (\n  id, store_name, welcome_message, support_username, channel_username,\n  banner_image_url, btc_address, usdt_trc20_address, usdc_erc20_address, min_topup_usd\n) values (\n  1,\n  'Enroll Log',\n  'Buy verified digital products instantly — keys and files land in your account the moment payment clears.',\n  'ebankenroll',\n  'ebankenroll',\n  '/catalog/banner.jpg',\n  '1EqgNKJMmnnWpGjYZJAapDEyyXruXxLCYj',\n  'TZADiUxhu9Y5bvJUMbMtBgFW43KqQ1hzaD',\n  '0xfe601096668c46d4bb0bd4e3c93751a3a8f4b3e5',\n  5\n) on conflict (id) do nothing;\n\ninsert into categories (id, name, description, image_url, sort_order) values\n  (1, 'Streaming', 'Premium video and music access, delivered as ready-to-use codes.', '/catalog/streaming.jpg', 1),\n  (2, 'Gaming', 'Wallet credit, chat boosts and season passes for live games.', '/catalog/gaming.jpg', 2),\n  (3, 'Productivity', 'Office suites and OS keys checked before they are listed.', '/catalog/productivity.jpg', 3),\n  (4, 'Creative', 'Design kits and file packs with instant download delivery.', '/catalog/creative.jpg', 4),\n  (5, 'Security', 'VPN seats and vault tools with live remaining stock.', '/catalog/security.jpg', 5)\non conflict (id) do nothing;\n\ninsert into products (id, name, description, price, product_type, category_id, image_url, download_link, is_featured) values\n  (1, 'Stream Plus 12-month', 'Full-catalog 4K streaming seat. Code delivered the moment checkout clears.', 12.99, 'key', 1, '/catalog/streaming.jpg', null, true),\n  (2, 'Music Family', 'Six-seat audio plan. Family invite code, instant delivery.', 8.49, 'key', 1, '/catalog/streaming.jpg', null, false),\n  (3, 'Anime Pass', 'Seasonal anime library access for twelve months.', 6.99, 'key', 1, '/catalog/streaming.jpg', null, false),\n  (4, 'Game Wallet 50', 'Fifty dollars of store credit for a major game platform.', 47.00, 'key', 2, '/catalog/gaming.jpg', null, true),\n  (5, 'Chat Boost', 'One-year boosted chat features for communities.', 9.99, 'key', 2, '/catalog/gaming.jpg', null, false),\n  (6, 'Season Pass', 'Current competitive season pass. Restocking this week.', 11.50, 'key', 2, '/catalog/gaming.jpg', null, false),\n  (7, 'Office Suite', 'Desktop productivity suite key, verified before listing.', 29.00, 'key', 3, '/catalog/productivity.jpg', null, false),\n  (8, 'OS Pro Key', 'Professional desktop OS license, one device activation.', 19.00, 'key', 3, '/catalog/productivity.jpg', null, true),\n  (9, 'Design Toolkit', 'Layered templates and brush pack. File delivery, unlimited copies.', 15.00, 'file', 4, '/catalog/creative.jpg', 'https://example.com/files/design-toolkit.zip', true),\n  (10, 'Canvas Pack', 'Poster and social templates. Instant file download.', 9.00, 'file', 4, '/catalog/creative.jpg', 'https://example.com/files/canvas-pack.zip', false),\n  (11, 'Shield VPN 1-Year', 'Twelve months of encrypted VPN on ten devices.', 22.00, 'key', 5, '/catalog/security.jpg', null, true),\n  (12, 'Vault Guard', 'Password vault seat with shared family spaces.', 7.50, 'key', 5, '/catalog/security.jpg', null, false)\non conflict (id) do nothing;\n\ninsert into product_keys (product_id, key_value)\nselect 1, 'STRM-PLUS-' || lpad(gs::text, 4, '0') from generate_series(1, 7) gs\nwhere not exists (select 1 from product_keys where product_id = 1);\n\ninsert into product_keys (product_id, key_value)\nselect 2, 'MUSIC-FAM-' || lpad(gs::text, 4, '0') from generate_series(1, 12) gs\nwhere not exists (select 1 from product_keys where product_id = 2);\n\ninsert into product_keys (product_id, key_value)\nselect 3, 'ANIME-PASS-' || lpad(gs::text, 4, '0') from generate_series(1, 6) gs\nwhere not exists (select 1 from product_keys where product_id = 3);\n\ninsert into product_keys (product_id, key_value)\nselect 4, 'GAME-WALLET-' || lpad(gs::text, 4, '0') from generate_series(1, 5) gs\nwhere not exists (select 1 from product_keys where product_id = 4);\n\ninsert into product_keys (product_id, key_value)\nselect 5, 'CHAT-BOOST-' || lpad(gs::text, 4, '0') from generate_series(1, 3) gs\nwhere not exists (select 1 from product_keys where product_id = 5);\n\ninsert into product_keys (product_id, key_value)\nselect 7, 'OFFICE-SUITE-' || lpad(gs::text, 4, '0') from generate_series(1, 8) gs\nwhere not exists (select 1 from product_keys where product_id = 7);\n\ninsert into product_keys (product_id, key_value)\nselect 8, 'OS-PRO-' || lpad(gs::text, 4, '0') from generate_series(1, 9) gs\nwhere not exists (select 1 from product_keys where product_id = 8);\n\ninsert into product_keys (product_id, key_value)\nselect 11, 'SHIELD-VPN-' || lpad(gs::text, 4, '0') from generate_series(1, 15) gs\nwhere not exists (select 1 from product_keys where product_id = 11);\n\ninsert into product_keys (product_id, key_value)\nselect 12, 'VAULT-GUARD-' || lpad(gs::text, 4, '0') from generate_series(1, 4) gs\nwhere not exists (select 1 from product_keys where product_id = 12);\n\ninsert into store_reviews (author, initials, product_label, rating, body) values\n  ('Mara K.', 'MK', 'Stream Plus 12-month', 5, 'Code arrived in under a minute and activated on the first try. Restocked exactly as listed.'),\n  ('Jonah P.', 'JP', 'Shield VPN 1-Year', 5, 'Live stock number matched what I received. Support replied the same hour I asked about devices.'),\n  ('Rina S.', 'RS', 'Game Wallet 50', 4, 'Paid from my balance after a BTC top-up. Wallet credit showed up immediately.'),\n  ('Eli N.', 'EN', 'OS Pro Key', 5, 'Needed a replacement after a hardware swap — they issued one without a fuss.'),\n  ('Pia V.', 'PV', 'Design Toolkit', 5, 'File download was waiting in My orders the second checkout finished.'),\n  ('Chris L.', 'CL', 'Music Family', 4, 'Family invite worked for all six seats. The in-stock count was accurate, which I appreciated.');\n\nselect setval('categories_id_seq', (select max(id) from categories));\nselect setval('products_id_seq', (select max(id) from products));\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_store.sql": _0002_store_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var scrypt$1 = promisify(scrypt);
var COOKIE = "el_session";
function asUser(row) {
	return {
		id: Number(row.id),
		public_id: Number(row.public_id),
		username: String(row.username),
		first_name: row.first_name ?? null,
		wallet_balance: Number(row.wallet_balance ?? 0),
		is_banned: Boolean(row.is_banned),
		is_admin: Boolean(row.is_admin)
	};
}
async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	return `scrypt:${salt}:${(await scrypt$1(password, salt, 32)).toString("hex")}`;
}
async function verifyPassword(password, stored) {
	const [scheme, salt, hex] = stored.split(":");
	if (scheme !== "scrypt" || !salt || !hex) return false;
	const buf = await scrypt$1(password, salt, 32);
	const expected = Buffer.from(hex, "hex");
	if (buf.length !== expected.length) return false;
	return timingSafeEqual(buf, expected);
}
function generatePassword() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
	const bytes = randomBytes(10);
	return Array.from(bytes, (b) => alphabet[b % 56]).join("");
}
function generateUsername() {
	const adj = [
		"mint",
		"vault",
		"north",
		"quiet",
		"swift",
		"lunar",
		"cedar",
		"ridge"
	];
	const noun = [
		"otter",
		"harbor",
		"quartz",
		"falcon",
		"nova",
		"atlas",
		"willow",
		"ember"
	];
	const n = randomBytes(2);
	return `${adj[n[0] % adj.length]}${noun[n[1] % noun.length]}${100 + n[0] % 90}`;
}
async function uniquePublicId() {
	const sql = await getSql();
	for (let i = 0; i < 8; i += 1) {
		const id = 2e7 + randomBytes(4).readUInt32BE(0) % 7e7;
		if ((await sql`select 1 as n from store_users where public_id = ${id} limit 1`).length === 0) return id;
	}
	return Date.now();
}
async function uniqueUsername(base) {
	const sql = await getSql();
	const cleaned = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || generateUsername();
	let candidate = cleaned.toLowerCase();
	for (let i = 0; i < 12; i += 1) {
		if ((await sql`select 1 as n from store_users where username = ${candidate} limit 1`).length === 0) return candidate;
		candidate = `${cleaned.toLowerCase()}${10 + i}`;
	}
	return `${cleaned.toLowerCase()}${randomBytes(2).toString("hex")}`;
}
async function readCookieToken() {
	try {
		const { getCookie } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
		return getCookie(COOKIE) ?? void 0;
	} catch {
		return;
	}
}
async function writeSessionCookie(token) {
	try {
		const { setCookie } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
		setCookie(COOKIE, token, {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: 2592e3
		});
	} catch {}
}
async function clearSessionCookie() {
	try {
		const { setCookie } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
		setCookie(COOKIE, "", {
			path: "/",
			httpOnly: true,
			maxAge: 0
		});
	} catch {}
}
async function createSession(userId) {
	const sql = await getSql();
	const token = randomBytes(24).toString("hex");
	await sql`insert into store_sessions (token, user_id, expires_at) values (${token}, ${userId}, ${new Date(Date.now() + 2592e6).toISOString()})`;
	await writeSessionCookie(token);
	return token;
}
async function userFromToken(clientToken) {
	const token = await readCookieToken() || clientToken || void 0;
	if (!token) return null;
	const row = (await (await getSql())`
    select u.*
    from store_sessions s
    join store_users u on u.id = s.user_id
    where s.token = ${token} and s.expires_at > now()
    limit 1
  `)[0];
	if (!row) return null;
	const user = asUser(row);
	if (user.is_banned) throw new Error("This account is suspended.");
	return user;
}
async function requireUser(clientToken) {
	const user = await userFromToken(clientToken);
	if (!user) throw new Error("Please sign in first.");
	return user;
}
async function requireAdmin(clientToken) {
	const user = await requireUser(clientToken);
	if (!user.is_admin) throw new Error("Forbidden");
	return user;
}
async function adjustBalance(userId, amount, reason) {
	const sql = await getSql();
	const rows = await sql`
    update store_users
    set wallet_balance = wallet_balance + ${amount}
    where id = ${userId}
    returning wallet_balance
  `;
	const balance = Number(rows[0]?.wallet_balance ?? 0);
	if (balance < -.001) throw new Error("Insufficient balance.");
	await sql`
    insert into wallet_ledger (user_id, amount, balance_after, reason)
    values (${userId}, ${amount}, ${balance}, ${reason})
  `;
	return balance;
}
async function createStoreUser(input) {
	const sql = await getSql();
	const hash = await hashPassword(input.password);
	const bonus = input.welcome === false ? 0 : 25;
	const user = asUser((await sql`
    insert into store_users (public_id, username, password_hash, first_name, wallet_balance)
    values (${input.publicId}, ${input.username}, ${hash}, ${input.firstName ?? null}, ${bonus})
    returning *
  `)[0]);
	if (bonus > 0) await sql`
      insert into wallet_ledger (user_id, amount, balance_after, reason)
      values (${user.id}, ${bonus}, ${bonus}, 'Welcome credit')
    `;
	return user;
}
function num(value) {
	return Number(value ?? 0);
}
async function stockMap(productIds) {
	const map = /* @__PURE__ */ new Map();
	if (productIds.length === 0) return map;
	const rows = await (await getSql())`
    select product_id, count(*)::int as stock
    from product_keys
    where is_sold = false
    group by product_id
  `;
	for (const row of rows) map.set(Number(row.product_id), Number(row.stock));
	return map;
}
function toProduct(row, stock) {
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
		unlimited
	};
}
async function getSettings() {
	const row = (await (await getSql())`select * from store_settings where id = 1`)[0] ?? {};
	return {
		store_name: String(row.store_name ?? "Enroll Log"),
		welcome_message: String(row.welcome_message ?? ""),
		support_username: row.support_username ?? "ebankenroll",
		channel_username: row.channel_username ?? "ebankenroll",
		banner_image_url: row.banner_image_url ?? "/catalog/banner.jpg",
		mini_app_url: row.mini_app_url ?? "/app",
		btc_address: row.btc_address ?? "",
		usdt_trc20_address: row.usdt_trc20_address ?? "",
		usdc_erc20_address: row.usdc_erc20_address ?? "",
		min_topup_usd: num(row.min_topup_usd ?? 5)
	};
}
async function storefront() {
	const sql = await getSql();
	const [settings, categories, products, reviews, orderCount] = await Promise.all([
		getSettings(),
		sql`select * from categories order by sort_order, name`,
		sql`select id, name, description, price, image_url, category_id, is_featured, product_type from products where is_active = true order by name`,
		sql`select id, author, initials, product_label, rating, body from store_reviews where is_published = true order by created_at desc limit 12`,
		sql`select count(*)::int as n from orders`
	]);
	const stocks = await stockMap(products.map((p) => Number(p.id)));
	const mapped = products.map((p) => toProduct(p, stocks.get(Number(p.id)) ?? 0));
	const cats = categories.map((c) => {
		const own = mapped.filter((p) => p.category_id === Number(c.id));
		return {
			id: Number(c.id),
			name: String(c.name),
			description: c.description ?? null,
			image_url: c.image_url ?? null,
			products: own.length,
			stock: own.reduce((sum, p) => sum + (p.unlimited ? 0 : p.stock), 0),
			fileProducts: own.filter((p) => p.unlimited).length
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
			miniApp: settings.mini_app_url
		},
		stats: {
			products: mapped.length,
			inStock,
			categories: cats.length,
			orders: Number(orderCount[0]?.n ?? 0),
			reviews: reviews.length
		},
		categories: cats,
		featured: mapped.filter((p) => p.is_featured),
		reviews
	};
}
async function shopCatalog() {
	const sql = await getSql();
	const [categories, products] = await Promise.all([sql`
      select id, name, description, image_url from categories order by sort_order, name
    `, sql`select id, name, description, price, image_url, category_id, is_featured, product_type from products where is_active = true order by name`]);
	const stocks = await stockMap(products.map((p) => Number(p.id)));
	return {
		categories: categories.map((c) => ({
			id: Number(c.id),
			name: c.name,
			description: c.description,
			image_url: c.image_url
		})),
		products: products.map((p) => toProduct(p, stocks.get(Number(p.id)) ?? 0))
	};
}
function parseTelegramUser(initData) {
	try {
		const params = new URLSearchParams(initData);
		const hash = params.get("hash");
		const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
		if (hash && token) {
			const copy = new URLSearchParams(initData);
			copy.delete("hash");
			const dataCheckString = [...copy.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
			const secret = createHmac("sha256", "WebAppData").update(token).digest();
			if (createHmac("sha256", secret).update(dataCheckString).digest("hex") !== hash) throw new Error("Invalid Telegram signature");
		}
		const raw = params.get("user");
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.id) return null;
		return parsed;
	} catch {
		return null;
	}
}
async function startAccount(input) {
	const existing = await userFromToken(input.token);
	if (existing) return {
		created: false,
		token: await createSession(existing.id),
		user: publicUser(existing),
		password: null
	};
	const telegram = input.initData ? parseTelegramUser(input.initData) : null;
	const sql = await getSql();
	if (telegram) {
		const found = await sql`
      select * from store_users where public_id = ${telegram.id} limit 1
    `;
		if (found[0]) {
			const user = {
				id: Number(found[0].id),
				public_id: Number(found[0].public_id),
				username: String(found[0].username),
				first_name: found[0].first_name ?? null,
				wallet_balance: num(found[0].wallet_balance),
				is_banned: Boolean(found[0].is_banned),
				is_admin: Boolean(found[0].is_admin)
			};
			if (user.is_banned) throw new Error("This account is suspended.");
			return {
				created: false,
				token: await createSession(user.id),
				user: publicUser(user),
				password: null
			};
		}
	}
	const password = generatePassword();
	const user = await createStoreUser({
		username: await uniqueUsername(telegram?.username || generateUsername()),
		publicId: telegram?.id ?? await uniquePublicId(),
		password,
		firstName: telegram?.first_name ?? null
	});
	return {
		created: true,
		token: await createSession(user.id),
		user: publicUser(user),
		password
	};
}
async function loginAccount(username, password) {
	const row = (await (await getSql())`
    select * from store_users where lower(username) = ${username.replace(/^@/, "").trim().toLowerCase()} limit 1
  `)[0];
	if (!row) throw new Error("Unknown username or password.");
	if (!await verifyPassword(password, String(row.password_hash))) throw new Error("Unknown username or password.");
	if (row.is_banned) throw new Error("This account is suspended.");
	const user = {
		id: Number(row.id),
		public_id: Number(row.public_id),
		username: String(row.username),
		first_name: row.first_name ?? null,
		wallet_balance: num(row.wallet_balance),
		is_banned: Boolean(row.is_banned),
		is_admin: Boolean(row.is_admin)
	};
	return {
		token: await createSession(user.id),
		user: publicUser(user)
	};
}
async function logoutAccount() {
	await clearSessionCookie();
	return { ok: true };
}
function publicUser(user) {
	return {
		id: user.id,
		public_id: user.public_id,
		username: user.username,
		first_name: user.first_name,
		wallet_balance: user.wallet_balance,
		is_admin: user.is_admin
	};
}
async function currentAccount(token) {
	const user = await userFromToken(token);
	if (!user) return null;
	const unread = await (await getSql())`
    select count(*)::int as n from user_notes where user_id = ${user.id} and read_at is null
  `;
	return {
		...publicUser(user),
		unreadNotes: Number(unread[0]?.n ?? 0)
	};
}
async function addToCart(token, productId) {
	const user = await requireUser(token);
	const sql = await getSql();
	const product = (await sql`
    select id, product_type from products where id = ${productId} and is_active = true
  `)[0];
	if (!product) throw new Error("Product not found.");
	if (product.product_type !== "file") {
		if (((await stockMap([productId])).get(productId) ?? 0) <= 0) throw new Error("That product is out of stock.");
	}
	const existing = await sql`
    select id, quantity from cart_items where user_id = ${user.id} and product_id = ${productId}
  `;
	if (existing[0]) await sql`update cart_items set quantity = quantity + 1 where id = ${existing[0].id}`;
	else await sql`insert into cart_items (user_id, product_id, quantity) values (${user.id}, ${productId}, 1)`;
	return { ok: true };
}
async function removeFromCart(token, cartItemId) {
	const user = await requireUser(token);
	await (await getSql())`delete from cart_items where id = ${cartItemId} and user_id = ${user.id}`;
	return { ok: true };
}
async function getCart(userId) {
	const rows = await (await getSql())`
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
		product: toProduct({
			id: Number(row.product_id),
			name: row.name,
			description: null,
			price: row.price,
			image_url: row.image_url,
			category_id: null,
			is_featured: false,
			product_type: row.product_type
		}, stocks.get(Number(row.product_id)) ?? 0)
	}));
	return {
		items,
		total: items.reduce((sum, row) => sum + row.product.price * row.quantity, 0)
	};
}
async function checkoutCart(token) {
	const user = await requireUser(token);
	const sql = await getSql();
	const { items, total } = await getCart(user.id);
	if (items.length === 0) return {
		ok: false,
		reason: "Your cart is empty."
	};
	const balance = num((await sql`
    select wallet_balance from store_users where id = ${user.id}
  `)[0]?.wallet_balance);
	if (balance + .001 < total) return {
		ok: false,
		reason: `Insufficient balance. Total is $${total.toFixed(2)} and you have $${balance.toFixed(2)}.`
	};
	for (const item of items) if (!item.product.unlimited && item.product.stock < item.quantity) return {
		ok: false,
		reason: `${item.product.name} does not have enough stock.`
	};
	const orderRows = await sql`
    insert into orders (user_id, total_amount, status)
    values (${user.id}, ${total}, 'completed')
    returning id
  `;
	const orderId = Number(orderRows[0].id);
	for (const item of items) {
		let delivered = "";
		if (item.product.unlimited) delivered = (await sql`
        select download_link from products where id = ${item.product.id}
      `)[0]?.download_link || "Download link will be sent by support.";
		else {
			const keys = await sql.query(`select id, key_value from product_keys
         where product_id = $1 and is_sold = false
         order by id
         limit $2`, [item.product.id, item.quantity]);
			if (keys.length < item.quantity) throw new Error(`${item.product.name} does not have enough stock.`);
			for (const key of keys) await sql`
          update product_keys
          set is_sold = true, order_id = ${orderId}, sold_at = now()
          where id = ${key.id} and is_sold = false
        `;
			delivered = keys.map((k) => k.key_value).join("\n");
		}
		await sql`
      insert into order_items (order_id, product_id, product_name, quantity, price, delivered_asset)
      values (${orderId}, ${item.product.id}, ${item.product.name}, ${item.quantity}, ${item.product.price}, ${delivered})
    `;
	}
	const newBalance = await adjustBalance(user.id, -total, `Order #${orderId}`);
	await sql`delete from cart_items where user_id = ${user.id}`;
	return {
		ok: true,
		orderId,
		total,
		balance: newBalance
	};
}
var ASSET_META = {
	BTC: {
		label: "Bitcoin (BTC)",
		network: "Bitcoin",
		key: "btc_address"
	},
	USDT_TRC20: {
		label: "USDT · TRC20",
		network: "Tron",
		key: "usdt_trc20_address"
	},
	USDC_ERC20: {
		label: "USDC · Ethereum",
		network: "Ethereum",
		key: "usdc_erc20_address"
	}
};
async function createTopUp(token, asset, amountUsd) {
	const user = await requireUser(token);
	const settings = await getSettings();
	if (!Number.isFinite(amountUsd) || amountUsd < settings.min_topup_usd) throw new Error(`Minimum top-up is $${settings.min_topup_usd.toFixed(2)}`);
	const meta = ASSET_META[asset];
	const address = String(settings[meta.key] ?? "").trim();
	if (!address) throw new Error("That coin is not configured yet.");
	const sql = await getSql();
	const code = `INV-${randomBytes(4).toString("hex").toUpperCase()}`;
	const expected = asset === "BTC" ? +(amountUsd / 65e3).toFixed(8) : +amountUsd.toFixed(2);
	const rows = await sql`
    insert into transactions (invoice_code, user_id, amount_usd, asset, pay_address, expected_amount, status)
    values (${code}, ${user.id}, ${amountUsd}, ${asset}, ${address}, ${expected}, 'pending')
    returning id
  `;
	return {
		id: Number(rows[0].id),
		code,
		asset,
		assetLabel: meta.label,
		network: meta.network,
		address,
		amount: expected.toString(),
		amountUsd
	};
}
async function submitHash(token, txId, hash) {
	const user = await requireUser(token);
	const sql = await getSql();
	const tx = (await sql`
    select * from transactions where id = ${txId} and user_id = ${user.id}
  `)[0];
	if (!tx) throw new Error("Invoice not found.");
	if (String(tx.status) === "completed") return {
		status: "credited",
		message: "Already credited."
	};
	const cleaned = hash.trim();
	if (cleaned.length < 8) throw new Error("That does not look like a transaction hash.");
	await sql`
    update transactions
    set tx_hash = ${cleaned}, status = 'submitted', submitted_at = now()
    where id = ${txId}
  `;
	return {
		status: "submitted",
		message: "Hash received. An operator will credit your balance after confirmation."
	};
}
async function accountOverview(token) {
	const user = await requireUser(token);
	const sql = await getSql();
	const [orders, deposits, notes, cart] = await Promise.all([
		sql`
      select id, status, total_amount, created_at from orders
      where user_id = ${user.id}
      order by id desc
      limit 25
    `,
		sql`
      select id, invoice_code, asset, amount_usd, status, created_at
      from transactions where user_id = ${user.id}
      order by id desc limit 15
    `,
		sql`
      select id, body, created_at, read_at from user_notes
      where user_id = ${user.id}
      order by id desc limit 40
    `,
		getCart(user.id)
	]);
	const items = orders.map((o) => Number(o.id)).length === 0 ? [] : await sql`select id, order_id, product_name, quantity, price, delivered_asset from order_items order by id`;
	return {
		user: publicUser(user),
		cart,
		orders: orders.map((order) => ({
			id: Number(order.id),
			status: String(order.status),
			total: num(order.total_amount),
			created_at: String(order.created_at),
			items: items.filter((item) => Number(item.order_id) === Number(order.id)).map((item) => ({
				id: Number(item.id),
				name: item.product_name,
				quantity: Number(item.quantity),
				price: num(item.price),
				delivered_asset: item.delivered_asset
			}))
		})),
		deposits: deposits.map((d) => ({
			id: Number(d.id),
			code: String(d.invoice_code),
			asset: String(d.asset),
			amount: num(d.amount_usd),
			status: String(d.status),
			created_at: String(d.created_at)
		})),
		notes: notes.map((n) => ({
			id: Number(n.id),
			body: String(n.body),
			created_at: String(n.created_at),
			read: Boolean(n.read_at)
		}))
	};
}
async function markNotesRead(token) {
	const user = await requireUser(token);
	await (await getSql())`update user_notes set read_at = now() where user_id = ${user.id} and read_at is null`;
	return { ok: true };
}
async function claimAdmin(token) {
	const user = await requireUser(token);
	const sql = await getSql();
	const existing = await sql`select count(*)::int as n from store_users where is_admin = true`;
	if (Number(existing[0]?.n ?? 0) > 0) {
		if (user.is_admin) return {
			granted: true,
			reason: "You already have operator access."
		};
		return {
			granted: false,
			reason: "An operator already exists."
		};
	}
	await sql`update store_users set is_admin = true where id = ${user.id}`;
	return {
		granted: true,
		reason: "You are now the store operator."
	};
}
async function adminDashboard(token) {
	await requireAdmin(token);
	const sql = await getSql();
	const [users, orders, pending, revenue, products, categories, notes, txs] = await Promise.all([
		sql`select * from store_users order by created_at desc limit 250`,
		sql`
      select o.*, u.username, u.public_id
      from orders o join store_users u on u.id = o.user_id
      order by o.id desc limit 100
    `,
		sql`select count(*)::int as n from transactions where status in ('pending','submitted')`,
		sql`select coalesce(sum(total_amount),0) as s from orders where status = 'completed'`,
		sql`select * from products order by name`,
		sql`select * from categories order by sort_order, name`,
		sql`
      select n.*, u.username as to_username
      from user_notes n join store_users u on u.id = n.user_id
      order by n.id desc limit 50
    `,
		sql`
      select t.*, u.username
      from transactions t join store_users u on u.id = t.user_id
      order by t.id desc limit 80
    `
	]);
	const mappedProducts = products.map((p) => ({
		id: Number(p.id),
		name: String(p.name),
		description: p.description ?? null,
		price: num(p.price),
		product_type: String(p.product_type),
		category_id: p.category_id == null ? null : Number(p.category_id),
		image_url: p.image_url ?? null,
		download_link: p.download_link ?? null,
		is_active: Boolean(p.is_active),
		is_featured: Boolean(p.is_featured)
	}));
	const stocks = await stockMap(mappedProducts.map((p) => p.id));
	const liability = users.reduce((sum, u) => sum + num(u.wallet_balance), 0);
	return {
		stats: {
			customers: users.length,
			orders: orders.length,
			pendingPayments: Number(pending[0]?.n ?? 0),
			revenue: num(revenue[0]?.s),
			liability
		},
		settings: await getSettings(),
		customers: users.map((u) => ({
			id: Number(u.id),
			public_id: Number(u.public_id),
			username: String(u.username),
			first_name: u.first_name ?? null,
			wallet_balance: num(u.wallet_balance),
			is_banned: Boolean(u.is_banned),
			is_admin: Boolean(u.is_admin),
			created_at: String(u.created_at)
		})),
		orders: orders.map((o) => ({
			id: Number(o.id),
			username: String(o.username),
			public_id: Number(o.public_id),
			total: num(o.total_amount),
			status: String(o.status),
			created_at: String(o.created_at)
		})),
		products: mappedProducts.map((p) => ({
			...p,
			stock: p.product_type === "file" ? null : stocks.get(p.id) ?? 0
		})),
		categories: categories.map((c) => ({
			id: Number(c.id),
			name: String(c.name),
			description: c.description ?? null,
			image_url: c.image_url ?? null,
			sort_order: Number(c.sort_order ?? 0)
		})),
		notes: notes.map((n) => ({
			id: Number(n.id),
			user_id: Number(n.user_id),
			to_username: String(n.to_username),
			body: String(n.body),
			created_at: String(n.created_at)
		})),
		payments: txs.map((t) => ({
			id: Number(t.id),
			code: String(t.invoice_code),
			username: String(t.username),
			asset: String(t.asset),
			amount: num(t.amount_usd),
			status: String(t.status),
			tx_hash: t.tx_hash ?? null,
			created_at: String(t.created_at)
		}))
	};
}
async function sendPrivateNote(token, userId, body) {
	const admin = await requireAdmin(token);
	const text = body.trim();
	if (text.length < 2) throw new Error("Write a note first.");
	const sql = await getSql();
	if (!(await sql`select id from store_users where id = ${userId}`)[0]) throw new Error("Customer not found.");
	await sql`
    insert into user_notes (user_id, author_id, body)
    values (${userId}, ${admin.id}, ${text})
  `;
	return {
		ok: true,
		message: "Private note delivered."
	};
}
async function adminAdjustBalance(token, userId, amount, reason) {
	await requireAdmin(token);
	if (!Number.isFinite(amount) || amount === 0) throw new Error("Enter a non-zero amount.");
	return {
		ok: true,
		message: `Balance is now $${(await adjustBalance(userId, amount, reason.trim() || "Operator adjustment")).toFixed(2)}.`
	};
}
async function adminCreditPayment(token, txId) {
	await requireAdmin(token);
	const sql = await getSql();
	const tx = (await sql`select * from transactions where id = ${txId}`)[0];
	if (!tx) throw new Error("Invoice not found.");
	if (String(tx.status) === "completed") return { message: "Already credited." };
	const amount = num(tx.amount_usd);
	await adjustBalance(Number(tx.user_id), amount, `Top-up ${tx.invoice_code}`);
	await sql`
    update transactions set status = 'completed', completed_at = now() where id = ${txId}
  `;
	return { message: `Credited $${amount.toFixed(2)}.` };
}
async function saveProduct(token, input) {
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
async function addProductKeys(token, productId, keysText) {
	await requireAdmin(token);
	const keys = keysText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	if (keys.length === 0) throw new Error("Paste at least one key.");
	const sql = await getSql();
	for (const key of keys) await sql`insert into product_keys (product_id, key_value) values (${productId}, ${key})`;
	return { message: `Added ${keys.length} key${keys.length === 1 ? "" : "s"}.` };
}
async function saveCategory(token, input) {
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
async function saveSettings(token, input) {
	await requireAdmin(token);
	await (await getSql())`
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
async function setBanned(token, userId, banned) {
	await requireAdmin(token);
	await (await getSql())`update store_users set is_banned = ${banned} where id = ${userId}`;
	return { message: banned ? "Customer suspended." : "Customer reinstated." };
}
//#endregion
export { accountOverview, addProductKeys, addToCart, adminAdjustBalance, adminCreditPayment, adminDashboard, checkoutCart, claimAdmin, createTopUp, currentAccount, loginAccount, logoutAccount, markNotesRead, removeFromCart, saveCategory, saveProduct, saveSettings, sendPrivateNote, setBanned, shopCatalog, startAccount, storefront, submitHash };
