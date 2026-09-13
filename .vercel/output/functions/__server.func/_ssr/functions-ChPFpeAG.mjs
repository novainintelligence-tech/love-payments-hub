import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { a as object, i as number, n as boolean, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-ChPFpeAG.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var token = object({ token: string().optional() });
var storefrontData_createServerFn_handler = createServerRpc({
	id: "34be2fd4dc11fdd21e328e061438e78b17eaf8dd37856260da3b9937e6895a1d",
	name: "storefrontData",
	filename: "src/lib/store/functions.ts"
}, (opts) => storefrontData.__executeServer(opts));
var storefrontData = createServerFn({ method: "GET" }).handler(storefrontData_createServerFn_handler, async () => {
	const { storefront } = await import("./store.server-CJ-dpXhc.mjs");
	return storefront();
});
var shopCatalog_createServerFn_handler = createServerRpc({
	id: "1701f39049830289e2e5aa9a02e8177eea5fd4428d1e02a9502086815c3ed0d3",
	name: "shopCatalog",
	filename: "src/lib/store/functions.ts"
}, (opts) => shopCatalog.__executeServer(opts));
var shopCatalog = createServerFn({ method: "GET" }).handler(shopCatalog_createServerFn_handler, async () => {
	const { shopCatalog: load } = await import("./store.server-CJ-dpXhc.mjs");
	return load();
});
var currentAccount_createServerFn_handler = createServerRpc({
	id: "f9884fb5d02259fdf1a3d9bdd702bf43c5bbd5e05bf1f3e442d981642ac26059",
	name: "currentAccount",
	filename: "src/lib/store/functions.ts"
}, (opts) => currentAccount.__executeServer(opts));
var currentAccount = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(currentAccount_createServerFn_handler, async ({ data }) => {
	const { currentAccount: load } = await import("./store.server-CJ-dpXhc.mjs");
	return load(data.token);
});
var startAccount_createServerFn_handler = createServerRpc({
	id: "851a8ff8eb68fc9bddab3f200068c5a9ec556f43676c42db6894ec641cca4cef",
	name: "startAccount",
	filename: "src/lib/store/functions.ts"
}, (opts) => startAccount.__executeServer(opts));
var startAccount = createServerFn({ method: "POST" }).validator((data) => token.extend({ initData: string().optional() }).parse(data ?? {})).handler(startAccount_createServerFn_handler, async ({ data }) => {
	const { startAccount: start } = await import("./store.server-CJ-dpXhc.mjs");
	return start(data);
});
var loginAccount_createServerFn_handler = createServerRpc({
	id: "2377a3ddcc369e75080ecbe5cdff5f633959519ca744d9afa1348b3c247df22a",
	name: "loginAccount",
	filename: "src/lib/store/functions.ts"
}, (opts) => loginAccount.__executeServer(opts));
var loginAccount = createServerFn({ method: "POST" }).validator((data) => object({
	username: string().min(2).max(64),
	password: string().min(4).max(128)
}).parse(data)).handler(loginAccount_createServerFn_handler, async ({ data }) => {
	const { loginAccount: login } = await import("./store.server-CJ-dpXhc.mjs");
	return login(data.username, data.password);
});
var logoutAccount_createServerFn_handler = createServerRpc({
	id: "5e23c63ee2215c5b03e7009c1bbf2e7aad6bedf201f9bcdf33d4d1f8b46b288d",
	name: "logoutAccount",
	filename: "src/lib/store/functions.ts"
}, (opts) => logoutAccount.__executeServer(opts));
var logoutAccount = createServerFn({ method: "POST" }).handler(logoutAccount_createServerFn_handler, async () => {
	const { logoutAccount: logout } = await import("./store.server-CJ-dpXhc.mjs");
	return logout();
});
var accountOverview_createServerFn_handler = createServerRpc({
	id: "0da9a3115ad7b48581270b3519d8574384736d66d50083c108bc38d971fe22e7",
	name: "accountOverview",
	filename: "src/lib/store/functions.ts"
}, (opts) => accountOverview.__executeServer(opts));
var accountOverview = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(accountOverview_createServerFn_handler, async ({ data }) => {
	const { accountOverview: load } = await import("./store.server-CJ-dpXhc.mjs");
	return load(data.token);
});
var addToCart_createServerFn_handler = createServerRpc({
	id: "d3169bc93461f2028df0744e33fb7bd78de0e5dc67335cd90ce3b160f419a50f",
	name: "addToCart",
	filename: "src/lib/store/functions.ts"
}, (opts) => addToCart.__executeServer(opts));
var addToCart = createServerFn({ method: "POST" }).validator((data) => token.extend({ productId: number().int().positive() }).parse(data)).handler(addToCart_createServerFn_handler, async ({ data }) => {
	const { addToCart: add } = await import("./store.server-CJ-dpXhc.mjs");
	return add(data.token, data.productId);
});
var removeFromCart_createServerFn_handler = createServerRpc({
	id: "39dc4cf51450dbf0e6b8a9b76b16508e7e50a7373a3c7f1f8121572430d0e250",
	name: "removeFromCart",
	filename: "src/lib/store/functions.ts"
}, (opts) => removeFromCart.__executeServer(opts));
var removeFromCart = createServerFn({ method: "POST" }).validator((data) => token.extend({ cartItemId: number().int().positive() }).parse(data)).handler(removeFromCart_createServerFn_handler, async ({ data }) => {
	const { removeFromCart: remove } = await import("./store.server-CJ-dpXhc.mjs");
	return remove(data.token, data.cartItemId);
});
var checkoutCart_createServerFn_handler = createServerRpc({
	id: "a364e8baa8877a6b70b0bb0e5b91bd5d9b73a2e27ce4f6e4723167f4729e183c",
	name: "checkoutCart",
	filename: "src/lib/store/functions.ts"
}, (opts) => checkoutCart.__executeServer(opts));
var checkoutCart = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(checkoutCart_createServerFn_handler, async ({ data }) => {
	const { checkoutCart: pay } = await import("./store.server-CJ-dpXhc.mjs");
	return pay(data.token);
});
var createTopUp_createServerFn_handler = createServerRpc({
	id: "af8049888dbc1e5ef54d2e68d7f709bb21249fe9852c4409468ef64f60138b5f",
	name: "createTopUp",
	filename: "src/lib/store/functions.ts"
}, (opts) => createTopUp.__executeServer(opts));
var createTopUp = createServerFn({ method: "POST" }).validator((data) => token.extend({
	asset: _enum([
		"BTC",
		"USDT_TRC20",
		"USDC_ERC20"
	]),
	amountUsd: number().positive().max(1e5)
}).parse(data)).handler(createTopUp_createServerFn_handler, async ({ data }) => {
	const { createTopUp: create } = await import("./store.server-CJ-dpXhc.mjs");
	return create(data.token, data.asset, data.amountUsd);
});
var submitHash_createServerFn_handler = createServerRpc({
	id: "8f49de7baf87404faa2bf5c0750692b9872cbdcfc54a7e0193fd8a4b7aacf8e6",
	name: "submitHash",
	filename: "src/lib/store/functions.ts"
}, (opts) => submitHash.__executeServer(opts));
var submitHash = createServerFn({ method: "POST" }).validator((data) => token.extend({
	txId: number().int().positive(),
	hash: string().min(6).max(200)
}).parse(data)).handler(submitHash_createServerFn_handler, async ({ data }) => {
	const { submitHash: submit } = await import("./store.server-CJ-dpXhc.mjs");
	return submit(data.token, data.txId, data.hash);
});
var markNotesRead_createServerFn_handler = createServerRpc({
	id: "1b258195cd5c0ea3f6ab2b8dcc64318e678fe0a2c577cce31c024cee31895397",
	name: "markNotesRead",
	filename: "src/lib/store/functions.ts"
}, (opts) => markNotesRead.__executeServer(opts));
var markNotesRead = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(markNotesRead_createServerFn_handler, async ({ data }) => {
	const { markNotesRead: mark } = await import("./store.server-CJ-dpXhc.mjs");
	return mark(data.token);
});
var claimAdmin_createServerFn_handler = createServerRpc({
	id: "53a09b73c127245de54848119a3685ac6b10415dcd602cc276d22105d38ce494",
	name: "claimAdmin",
	filename: "src/lib/store/functions.ts"
}, (opts) => claimAdmin.__executeServer(opts));
var claimAdmin = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(claimAdmin_createServerFn_handler, async ({ data }) => {
	const { claimAdmin: claim } = await import("./store.server-CJ-dpXhc.mjs");
	return claim(data.token);
});
var adminDashboard_createServerFn_handler = createServerRpc({
	id: "d57a4fd495f9c73b242b6cd6b3efa9d03a1173192c5cb19abf0e4d5578dcc060",
	name: "adminDashboard",
	filename: "src/lib/store/functions.ts"
}, (opts) => adminDashboard.__executeServer(opts));
var adminDashboard = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(adminDashboard_createServerFn_handler, async ({ data }) => {
	const { adminDashboard: load } = await import("./store.server-CJ-dpXhc.mjs");
	return load(data.token);
});
var sendPrivateNote_createServerFn_handler = createServerRpc({
	id: "1815d69635ca94e01165d0f475418ac595e43204df61c7e3bc387e2d6130c029",
	name: "sendPrivateNote",
	filename: "src/lib/store/functions.ts"
}, (opts) => sendPrivateNote.__executeServer(opts));
var sendPrivateNote = createServerFn({ method: "POST" }).validator((data) => token.extend({
	userId: number().int().positive(),
	body: string().min(2).max(4e3)
}).parse(data)).handler(sendPrivateNote_createServerFn_handler, async ({ data }) => {
	const { sendPrivateNote: send } = await import("./store.server-CJ-dpXhc.mjs");
	return send(data.token, data.userId, data.body);
});
var adminAdjustBalance_createServerFn_handler = createServerRpc({
	id: "9f292d27b48006cda9aa2754529ad080ce01f9809508c5c03128bedacef54caf",
	name: "adminAdjustBalance",
	filename: "src/lib/store/functions.ts"
}, (opts) => adminAdjustBalance.__executeServer(opts));
var adminAdjustBalance = createServerFn({ method: "POST" }).validator((data) => token.extend({
	userId: number().int().positive(),
	amount: number(),
	reason: string().max(200).optional()
}).parse(data)).handler(adminAdjustBalance_createServerFn_handler, async ({ data }) => {
	const { adminAdjustBalance: adj } = await import("./store.server-CJ-dpXhc.mjs");
	return adj(data.token, data.userId, data.amount, data.reason ?? "Operator adjustment");
});
var adminCreditPayment_createServerFn_handler = createServerRpc({
	id: "0abd3cd6d69738c0f3e8bef8b05be921c11ed719cd8f3c5c1e6ae33a2cb111a7",
	name: "adminCreditPayment",
	filename: "src/lib/store/functions.ts"
}, (opts) => adminCreditPayment.__executeServer(opts));
var adminCreditPayment = createServerFn({ method: "POST" }).validator((data) => token.extend({ txId: number().int().positive() }).parse(data)).handler(adminCreditPayment_createServerFn_handler, async ({ data }) => {
	const { adminCreditPayment: credit } = await import("./store.server-CJ-dpXhc.mjs");
	return credit(data.token, data.txId);
});
var saveProduct_createServerFn_handler = createServerRpc({
	id: "50ac8727abbc4b8df9f35ca85a1b0ea41143a69a613b308bab514ee16d5ede55",
	name: "saveProduct",
	filename: "src/lib/store/functions.ts"
}, (opts) => saveProduct.__executeServer(opts));
var saveProduct = createServerFn({ method: "POST" }).validator((data) => token.extend({
	id: number().int().positive().optional(),
	name: string().min(2).max(120),
	description: string().max(2e3).optional(),
	price: number().nonnegative(),
	product_type: _enum(["key", "file"]),
	category_id: number().int().positive().nullable().optional(),
	image_url: string().max(500).nullable().optional(),
	download_link: string().max(500).nullable().optional(),
	is_active: boolean().optional(),
	is_featured: boolean().optional()
}).parse(data)).handler(saveProduct_createServerFn_handler, async ({ data }) => {
	const { saveProduct: save } = await import("./store.server-CJ-dpXhc.mjs");
	const { token: sessionToken, ...input } = data;
	return save(sessionToken, input);
});
var addProductKeys_createServerFn_handler = createServerRpc({
	id: "934b6c58c2e5e5a0575be1d5a60889b7989e9c34865d4532e02760e97a9e3d08",
	name: "addProductKeys",
	filename: "src/lib/store/functions.ts"
}, (opts) => addProductKeys.__executeServer(opts));
var addProductKeys = createServerFn({ method: "POST" }).validator((data) => token.extend({
	productId: number().int().positive(),
	keysText: string().min(1).max(2e4)
}).parse(data)).handler(addProductKeys_createServerFn_handler, async ({ data }) => {
	const { addProductKeys: add } = await import("./store.server-CJ-dpXhc.mjs");
	return add(data.token, data.productId, data.keysText);
});
var saveCategory_createServerFn_handler = createServerRpc({
	id: "7ec5278563804683536b1e651b7be39ea953f67823a861ec3d4a3f7420ed5dda",
	name: "saveCategory",
	filename: "src/lib/store/functions.ts"
}, (opts) => saveCategory.__executeServer(opts));
var saveCategory = createServerFn({ method: "POST" }).validator((data) => token.extend({
	id: number().int().positive().optional(),
	name: string().min(2).max(80),
	description: string().max(400).optional(),
	image_url: string().max(500).optional(),
	sort_order: number().int().optional()
}).parse(data)).handler(saveCategory_createServerFn_handler, async ({ data }) => {
	const { saveCategory: save } = await import("./store.server-CJ-dpXhc.mjs");
	const { token: sessionToken, ...input } = data;
	return save(sessionToken, input);
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "f8431b92b4c05474f0fb4046ad92e1b6543e95ca06ef392b39ff059a437241df",
	name: "saveSettings",
	filename: "src/lib/store/functions.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).validator((data) => token.extend({
	store_name: string().min(2).max(80),
	welcome_message: string().min(2).max(1e3),
	channel_username: string().max(64).optional(),
	support_username: string().max(64).optional(),
	btc_address: string().max(128).optional(),
	usdt_trc20_address: string().max(128).optional(),
	usdc_erc20_address: string().max(128).optional(),
	min_topup_usd: number().nonnegative()
}).parse(data)).handler(saveSettings_createServerFn_handler, async ({ data }) => {
	const { saveSettings: save } = await import("./store.server-CJ-dpXhc.mjs");
	const { token: sessionToken, ...input } = data;
	return save(sessionToken, input);
});
var setBanned_createServerFn_handler = createServerRpc({
	id: "aafd0267587f577a122754b441258d954a34a5fece6e2d648bad8aaa55c0c203",
	name: "setBanned",
	filename: "src/lib/store/functions.ts"
}, (opts) => setBanned.__executeServer(opts));
var setBanned = createServerFn({ method: "POST" }).validator((data) => token.extend({
	userId: number().int().positive(),
	banned: boolean()
}).parse(data)).handler(setBanned_createServerFn_handler, async ({ data }) => {
	const { setBanned: set } = await import("./store.server-CJ-dpXhc.mjs");
	return set(data.token, data.userId, data.banned);
});
//#endregion
export { accountOverview_createServerFn_handler, addProductKeys_createServerFn_handler, addToCart_createServerFn_handler, adminAdjustBalance_createServerFn_handler, adminCreditPayment_createServerFn_handler, adminDashboard_createServerFn_handler, checkoutCart_createServerFn_handler, claimAdmin_createServerFn_handler, createTopUp_createServerFn_handler, currentAccount_createServerFn_handler, loginAccount_createServerFn_handler, logoutAccount_createServerFn_handler, markNotesRead_createServerFn_handler, removeFromCart_createServerFn_handler, saveCategory_createServerFn_handler, saveProduct_createServerFn_handler, saveSettings_createServerFn_handler, sendPrivateNote_createServerFn_handler, setBanned_createServerFn_handler, shopCatalog_createServerFn_handler, startAccount_createServerFn_handler, storefrontData_createServerFn_handler, submitHash_createServerFn_handler };
