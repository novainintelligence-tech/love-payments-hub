import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star, c as ShieldCheck, d as Package, f as Layers, i as Timer, m as Boxes, s as ShoppingBag } from "../_libs/lucide-react.mjs";
import { a as SiteHeader, c as WhyGrid, n as CategoryCard, o as StatTile, r as ChannelStrip, s as StoreFooter, t as Button } from "./store-chrome-D4rGdyql.mjs";
import { i as Route$5 } from "./router-5aXeDBdu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-c6MX0XHG.js
var import_jsx_runtime = require_jsx_runtime();
var DESCRIPTION = "Buy verified digital products instantly — browse the catalog, top up your balance and get your keys and files delivered the moment payment clears.";
function Index() {
	const data = Route$5.useLoaderData();
	const tiles = [
		{
			icon: Package,
			label: "Products",
			value: data.stats.products
		},
		{
			icon: Boxes,
			label: "In stock",
			value: data.stats.inStock
		},
		{
			icon: Layers,
			label: "Categories",
			value: data.stats.categories
		},
		{
			icon: ShoppingBag,
			label: "Orders",
			value: data.stats.orders
		},
		{
			icon: Star,
			label: "Reviews",
			value: data.stats.reviews
		},
		{
			icon: Timer,
			label: "Support",
			value: "24/7"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, { handle: data.store.channel ?? "ebankenroll" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: data.store.name }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 pb-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "py-14 text-center sm:py-20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-primary" }), " Trusted digital marketplace"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mx-auto mt-6 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-6xl",
								children: [
									"Premium digital products, delivered ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-primary",
										children: "instantly"
									}),
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-5 max-w-2xl text-lg text-muted-foreground",
								children: DESCRIPTION
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap justify-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/shop",
										children: "Browse products"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									variant: "secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/app",
										children: "Open Mini App"
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
						children: tiles.map((tile) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
							icon: tile.icon,
							label: tile.label,
							value: tile.value
						}, tile.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold",
								children: "Shop by category"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [data.categories.length, " categories, restocked daily. Counts match live unsold inventory."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
								children: data.categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, { category }, category.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold",
							children: "Why shop with us"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhyGrid, {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold",
							children: "What customers say"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
							children: data.reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "panel flex flex-col gap-3 p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm text-primary",
											children: review.initials
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: review.author
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: review.product_label ?? "Verified buyer"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex gap-0.5",
										children: Array.from({ length: review.rating }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-primary text-primary" }, index))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: review.body
									})
								]
							}, review.id))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFooter, { name: data.store.name })
		]
	});
}
//#endregion
export { Index as component };
