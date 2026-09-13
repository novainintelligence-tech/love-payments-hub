import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { a as object, i as number, n as boolean, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-session-BNqMq0Da.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var token = object({ token: string().optional() });
var storefrontData = createServerFn({ method: "GET" }).handler(createSsrRpc("34be2fd4dc11fdd21e328e061438e78b17eaf8dd37856260da3b9937e6895a1d"));
var shopCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("1701f39049830289e2e5aa9a02e8177eea5fd4428d1e02a9502086815c3ed0d3"));
var currentAccount = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(createSsrRpc("f9884fb5d02259fdf1a3d9bdd702bf43c5bbd5e05bf1f3e442d981642ac26059"));
var startAccount = createServerFn({ method: "POST" }).validator((data) => token.extend({ initData: string().optional() }).parse(data ?? {})).handler(createSsrRpc("851a8ff8eb68fc9bddab3f200068c5a9ec556f43676c42db6894ec641cca4cef"));
var loginAccount = createServerFn({ method: "POST" }).validator((data) => object({
	username: string().min(2).max(64),
	password: string().min(4).max(128)
}).parse(data)).handler(createSsrRpc("2377a3ddcc369e75080ecbe5cdff5f633959519ca744d9afa1348b3c247df22a"));
var logoutAccount = createServerFn({ method: "POST" }).handler(createSsrRpc("5e23c63ee2215c5b03e7009c1bbf2e7aad6bedf201f9bcdf33d4d1f8b46b288d"));
var accountOverview = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(createSsrRpc("0da9a3115ad7b48581270b3519d8574384736d66d50083c108bc38d971fe22e7"));
var addToCart = createServerFn({ method: "POST" }).validator((data) => token.extend({ productId: number().int().positive() }).parse(data)).handler(createSsrRpc("d3169bc93461f2028df0744e33fb7bd78de0e5dc67335cd90ce3b160f419a50f"));
var removeFromCart = createServerFn({ method: "POST" }).validator((data) => token.extend({ cartItemId: number().int().positive() }).parse(data)).handler(createSsrRpc("39dc4cf51450dbf0e6b8a9b76b16508e7e50a7373a3c7f1f8121572430d0e250"));
var checkoutCart = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(createSsrRpc("a364e8baa8877a6b70b0bb0e5b91bd5d9b73a2e27ce4f6e4723167f4729e183c"));
var createTopUp = createServerFn({ method: "POST" }).validator((data) => token.extend({
	asset: _enum([
		"BTC",
		"USDT_TRC20",
		"USDC_ERC20"
	]),
	amountUsd: number().positive().max(1e5)
}).parse(data)).handler(createSsrRpc("af8049888dbc1e5ef54d2e68d7f709bb21249fe9852c4409468ef64f60138b5f"));
var submitHash = createServerFn({ method: "POST" }).validator((data) => token.extend({
	txId: number().int().positive(),
	hash: string().min(6).max(200)
}).parse(data)).handler(createSsrRpc("8f49de7baf87404faa2bf5c0750692b9872cbdcfc54a7e0193fd8a4b7aacf8e6"));
var markNotesRead = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(createSsrRpc("1b258195cd5c0ea3f6ab2b8dcc64318e678fe0a2c577cce31c024cee31895397"));
var claimAdmin = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(createSsrRpc("53a09b73c127245de54848119a3685ac6b10415dcd602cc276d22105d38ce494"));
var adminDashboard = createServerFn({ method: "POST" }).validator((data) => token.parse(data ?? {})).handler(createSsrRpc("d57a4fd495f9c73b242b6cd6b3efa9d03a1173192c5cb19abf0e4d5578dcc060"));
var sendPrivateNote = createServerFn({ method: "POST" }).validator((data) => token.extend({
	userId: number().int().positive(),
	body: string().min(2).max(4e3)
}).parse(data)).handler(createSsrRpc("1815d69635ca94e01165d0f475418ac595e43204df61c7e3bc387e2d6130c029"));
var adminAdjustBalance = createServerFn({ method: "POST" }).validator((data) => token.extend({
	userId: number().int().positive(),
	amount: number(),
	reason: string().max(200).optional()
}).parse(data)).handler(createSsrRpc("9f292d27b48006cda9aa2754529ad080ce01f9809508c5c03128bedacef54caf"));
var adminCreditPayment = createServerFn({ method: "POST" }).validator((data) => token.extend({ txId: number().int().positive() }).parse(data)).handler(createSsrRpc("0abd3cd6d69738c0f3e8bef8b05be921c11ed719cd8f3c5c1e6ae33a2cb111a7"));
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
}).parse(data)).handler(createSsrRpc("50ac8727abbc4b8df9f35ca85a1b0ea41143a69a613b308bab514ee16d5ede55"));
var addProductKeys = createServerFn({ method: "POST" }).validator((data) => token.extend({
	productId: number().int().positive(),
	keysText: string().min(1).max(2e4)
}).parse(data)).handler(createSsrRpc("934b6c58c2e5e5a0575be1d5a60889b7989e9c34865d4532e02760e97a9e3d08"));
var saveCategory = createServerFn({ method: "POST" }).validator((data) => token.extend({
	id: number().int().positive().optional(),
	name: string().min(2).max(80),
	description: string().max(400).optional(),
	image_url: string().max(500).optional(),
	sort_order: number().int().optional()
}).parse(data)).handler(createSsrRpc("7ec5278563804683536b1e651b7be39ea953f67823a861ec3d4a3f7420ed5dda"));
var saveSettings = createServerFn({ method: "POST" }).validator((data) => token.extend({
	store_name: string().min(2).max(80),
	welcome_message: string().min(2).max(1e3),
	channel_username: string().max(64).optional(),
	support_username: string().max(64).optional(),
	btc_address: string().max(128).optional(),
	usdt_trc20_address: string().max(128).optional(),
	usdc_erc20_address: string().max(128).optional(),
	min_topup_usd: number().nonnegative()
}).parse(data)).handler(createSsrRpc("f8431b92b4c05474f0fb4046ad92e1b6543e95ca06ef392b39ff059a437241df"));
var setBanned = createServerFn({ method: "POST" }).validator((data) => token.extend({
	userId: number().int().positive(),
	banned: boolean()
}).parse(data)).handler(createSsrRpc("aafd0267587f577a122754b441258d954a34a5fece6e2d648bad8aaa55c0c203"));
var TOKEN_KEY = "enroll.session";
function getStoreToken() {
	if (typeof window === "undefined") return void 0;
	try {
		return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(TOKEN_KEY) ?? void 0;
	} catch {
		return;
	}
}
function setStoreToken(token) {
	if (typeof window === "undefined") return;
	try {
		if (token) {
			window.sessionStorage.setItem(TOKEN_KEY, token);
			window.localStorage.setItem(TOKEN_KEY, token);
		} else {
			window.sessionStorage.removeItem(TOKEN_KEY);
			window.localStorage.removeItem(TOKEN_KEY);
		}
	} catch {}
}
getStoreToken();
var Context = (0, import_react.createContext)(null);
function StoreSessionProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const refresh = (0, import_react.useCallback)(async () => {
		try {
			const next = await currentAccount({ data: { token: getStoreToken() } });
			setUser(next);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
	}, [refresh]);
	const signIn = (0, import_react.useCallback)(async (token) => {
		setStoreToken(token);
		setLoading(true);
		await refresh();
	}, [refresh]);
	const signOut = (0, import_react.useCallback)(async () => {
		setStoreToken(null);
		try {
			await logoutAccount();
		} catch {}
		setUser(null);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		loading,
		refresh,
		signIn,
		signOut
	}), [
		user,
		loading,
		refresh,
		signIn,
		signOut
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Context.Provider, {
		value,
		children
	});
}
function useStoreSession() {
	const ctx = (0, import_react.useContext)(Context);
	if (!ctx) throw new Error("StoreSessionProvider missing");
	return ctx;
}
//#endregion
export { submitHash as C, storefrontData as S, saveSettings as _, adminAdjustBalance as a, shopCatalog as b, checkoutCart as c, getStoreToken as d, loginAccount as f, saveProduct as g, saveCategory as h, addToCart as i, claimAdmin as l, removeFromCart as m, accountOverview as n, adminCreditPayment as o, markNotesRead as p, addProductKeys as r, adminDashboard as s, StoreSessionProvider as t, createTopUp as u, sendPrivateNote as v, useStoreSession as w, startAccount as x, setBanned as y };
