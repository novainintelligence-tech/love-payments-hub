import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as getStoreToken, i as addToCart, w as useStoreSession } from "./store-session-BNqMq0Da.mjs";
import { a as SiteHeader, i as ProductCard, r as ChannelStrip, s as StoreFooter, t as Button } from "./store-chrome-D4rGdyql.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route } from "./router-5aXeDBdu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-KWG2F3Hr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Shop() {
	const data = Route.useLoaderData();
	const { category } = Route.useSearch();
	const { user, refresh } = useStoreSession();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const products = category ? data.products.filter((product) => product.category_id === category) : data.products;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: "Enroll Log" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold",
						children: "All products"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Live stock counts from unsold keys. File products show as unlimited."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: category ? "outline" : "default",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/shop",
								children: "All"
							})
						}), data.categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: category === item.id ? "default" : "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/shop",
								search: { category: item.id },
								children: item.name
							})
						}, item.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: [products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
							product,
							signedIn: Boolean(user),
							busy,
							onAdd: async (item) => {
								if (!user) {
									window.location.href = "/login";
									return;
								}
								setBusy(true);
								try {
									await addToCart({ data: {
										token: getStoreToken(),
										productId: item.id
									} });
									await refresh();
									toast.success(`${item.name} added to your cart.`);
								} catch (error) {
									toast.error(error instanceof Error ? error.message : "Could not add to cart");
								} finally {
									setBusy(false);
								}
							}
						}, product.id)), !products.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Nothing listed in this category yet."
						}) : null]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFooter, { name: "Enroll Log" })
		]
	});
}
//#endregion
export { Shop as component };
