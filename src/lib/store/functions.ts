import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const token = z.object({ token: z.string().optional() });

export const storefrontData = createServerFn({ method: "GET" }).handler(async () => {
  const { storefront } = await import("./store.server");
  return storefront();
});

export const shopCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { shopCatalog: load } = await import("./store.server");
  return load();
});

export const currentAccount = createServerFn({ method: "POST" })
  .validator((data) => token.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { currentAccount: load } = await import("./store.server");
    return load(data.token);
  });

export const startAccount = createServerFn({ method: "POST" })
  .validator((data) => token.extend({ initData: z.string().optional() }).parse(data ?? {}))
  .handler(async ({ data }) => {
    const { startAccount: start } = await import("./store.server");
    return start(data);
  });

export const loginAccount = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ username: z.string().min(2).max(64), password: z.string().min(4).max(128) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { loginAccount: login } = await import("./store.server");
    return login(data.username, data.password);
  });

export const logoutAccount = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutAccount: logout } = await import("./store.server");
  return logout();
});

export const accountOverview = createServerFn({ method: "POST" })
  .validator((data) => token.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { accountOverview: load } = await import("./store.server");
    return load(data.token);
  });

export const addToCart = createServerFn({ method: "POST" })
  .validator((data) => token.extend({ productId: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const { addToCart: add } = await import("./store.server");
    return add(data.token, data.productId);
  });

export const removeFromCart = createServerFn({ method: "POST" })
  .validator((data) => token.extend({ cartItemId: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const { removeFromCart: remove } = await import("./store.server");
    return remove(data.token, data.cartItemId);
  });

export const checkoutCart = createServerFn({ method: "POST" })
  .validator((data) => token.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { checkoutCart: pay } = await import("./store.server");
    return pay(data.token);
  });

export const createTopUp = createServerFn({ method: "POST" })
  .validator((data) =>
    token
      .extend({
        asset: z.enum(["BTC", "USDT_TRC20", "USDC_ERC20"]),
        amountUsd: z.number().positive().max(100000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createTopUp: create } = await import("./store.server");
    return create(data.token, data.asset, data.amountUsd);
  });

export const submitHash = createServerFn({ method: "POST" })
  .validator((data) =>
    token.extend({ txId: z.number().int().positive(), hash: z.string().min(6).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { submitHash: submit } = await import("./store.server");
    return submit(data.token, data.txId, data.hash);
  });

export const markNotesRead = createServerFn({ method: "POST" })
  .validator((data) => token.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { markNotesRead: mark } = await import("./store.server");
    return mark(data.token);
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .validator((data) => token.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { claimAdmin: claim } = await import("./store.server");
    return claim(data.token);
  });

export const adminDashboard = createServerFn({ method: "POST" })
  .validator((data) => token.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { adminDashboard: load } = await import("./store.server");
    return load(data.token);
  });

export const sendPrivateNote = createServerFn({ method: "POST" })
  .validator((data) =>
    token.extend({ userId: z.number().int().positive(), body: z.string().min(2).max(4000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { sendPrivateNote: send } = await import("./store.server");
    return send(data.token, data.userId, data.body);
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .validator((data) =>
    token
      .extend({
        userId: z.number().int().positive(),
        amount: z.number(),
        reason: z.string().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { adminAdjustBalance: adj } = await import("./store.server");
    return adj(data.token, data.userId, data.amount, data.reason ?? "Operator adjustment");
  });

export const adminCreditPayment = createServerFn({ method: "POST" })
  .validator((data) => token.extend({ txId: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const { adminCreditPayment: credit } = await import("./store.server");
    return credit(data.token, data.txId);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .validator((data) =>
    token
      .extend({
        id: z.number().int().positive().optional(),
        name: z.string().min(2).max(120),
        description: z.string().max(2000).optional(),
        price: z.number().nonnegative(),
        product_type: z.enum(["key", "file"]),
        category_id: z.number().int().positive().nullable().optional(),
        image_url: z.string().max(500).nullable().optional(),
        download_link: z.string().max(500).nullable().optional(),
        is_active: z.boolean().optional(),
        is_featured: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { saveProduct: save } = await import("./store.server");
    const { token: sessionToken, ...input } = data;
    return save(sessionToken, input);
  });

export const addProductKeys = createServerFn({ method: "POST" })
  .validator((data) =>
    token.extend({ productId: z.number().int().positive(), keysText: z.string().min(1).max(20000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { addProductKeys: add } = await import("./store.server");
    return add(data.token, data.productId, data.keysText);
  });

export const saveCategory = createServerFn({ method: "POST" })
  .validator((data) =>
    token
      .extend({
        id: z.number().int().positive().optional(),
        name: z.string().min(2).max(80),
        description: z.string().max(400).optional(),
        image_url: z.string().max(500).optional(),
        sort_order: z.number().int().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { saveCategory: save } = await import("./store.server");
    const { token: sessionToken, ...input } = data;
    return save(sessionToken, input);
  });

export const saveSettings = createServerFn({ method: "POST" })
  .validator((data) =>
    token
      .extend({
        store_name: z.string().min(2).max(80),
        welcome_message: z.string().min(2).max(1000),
        channel_username: z.string().max(64).optional(),
        support_username: z.string().max(64).optional(),
        btc_address: z.string().max(128).optional(),
        usdt_trc20_address: z.string().max(128).optional(),
        usdc_erc20_address: z.string().max(128).optional(),
        min_topup_usd: z.number().nonnegative(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { saveSettings: save } = await import("./store.server");
    const { token: sessionToken, ...input } = data;
    return save(sessionToken, input);
  });

export const setBanned = createServerFn({ method: "POST" })
  .validator((data) =>
    token.extend({ userId: z.number().int().positive(), banned: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { setBanned: set } = await import("./store.server");
    return set(data.token, data.userId, data.banned);
  });
