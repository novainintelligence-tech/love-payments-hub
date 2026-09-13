import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as submitHash, c as checkoutCart, d as getStoreToken, f as loginAccount, i as addToCart, m as removeFromCart, n as accountOverview, p as markNotesRead, u as createTopUp, w as useStoreSession, x as startAccount } from "./store-session-BNqMq0Da.mjs";
import { a as Star, c as ShieldCheck, d as Package, f as Layers, h as Bell, i as Timer, m as Boxes, p as Copy, s as ShoppingBag, t as Wallet } from "../_libs/lucide-react.mjs";
import { a as SiteHeader, c as WhyGrid, i as ProductCard, n as CategoryCard, o as StatTile, r as ChannelStrip, s as StoreFooter, t as Button, u as money } from "./store-chrome-D4rGdyql.mjs";
import { t as Input } from "./input-DdqcWFT2.mjs";
import { t as Badge } from "./badge-DMJndAto.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$3 } from "./router-5aXeDBdu.mjs";
import { t as Label } from "./label-D5Uk-fPr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-B9TsXq3I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ASSETS = [
	{
		id: "BTC",
		label: "BTC"
	},
	{
		id: "USDT_TRC20",
		label: "USDT"
	},
	{
		id: "USDC_ERC20",
		label: "USDC"
	}
];
function MiniApp() {
	const [front, catalog] = Route$3.useLoaderData();
	const { category } = Route$3.useSearch();
	const { user, loading, signIn, refresh } = useStoreSession();
	const [tab, setTab] = (0, import_react.useState)(category ? "shop" : "home");
	const [creds, setCreds] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const token = getStoreToken();
	const overview = useQuery({
		queryKey: [
			"mini-overview",
			token,
			user?.id
		],
		queryFn: () => accountOverview({ data: { token } }),
		enabled: Boolean(user)
	});
	(0, import_react.useEffect)(() => {
		if (category) setTab("shop");
	}, [category]);
	(0, import_react.useEffect)(() => {
		if (user && user.unreadNotes > 0 && tab === "inbox") markNotesRead({ data: { token } }).then(() => refresh());
	}, [
		user,
		tab,
		token,
		refresh
	]);
	async function run(action) {
		setBusy(true);
		try {
			toast.success(await action());
			await Promise.all([overview.refetch(), refresh()]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	}
	async function onStart() {
		setBusy(true);
		try {
			const tg = window.Telegram?.WebApp;
			tg?.ready?.();
			tg?.expand?.();
			const result = await startAccount({ data: {
				token: getStoreToken(),
				initData: tg?.initData || void 0
			} });
			await signIn(result.token);
			if (result.created && result.password) setCreds({
				username: result.user.username,
				public_id: result.user.public_id,
				password: result.password
			});
			toast.success(result.created ? "Account created." : `Welcome back, ${result.user.username}.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not start");
		} finally {
			setBusy(false);
		}
	}
	async function onLogin(event) {
		event.preventDefault();
		setBusy(true);
		try {
			const result = await loginAccount({ data: {
				username,
				password
			} });
			await signIn(result.token);
			toast.success(`Welcome back, ${result.user.username}.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not sign in");
		} finally {
			setBusy(false);
		}
	}
	const products = (0, import_react.useMemo)(() => {
		return category ? catalog.products.filter((product) => product.category_id === category) : catalog.products;
	}, [catalog.products, category]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				storeName: front.store.name,
				mini: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "grid min-h-[60vh] place-items-center text-sm text-muted-foreground",
				children: "Loading store…"
			})
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, { handle: front.store.channel ?? "ebankenroll" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				storeName: front.store.name,
				mini: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 pb-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "py-14 text-center sm:py-20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-primary" }), " Mini App"]
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
								children: front.store.welcome
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto mt-8 max-w-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									className: "h-12 w-full text-base",
									disabled: busy,
									onClick: onStart,
									children: busy ? "Creating your account…" : "Start"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: "Press Start to register automatically with a username, user ID and password."
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel mx-auto max-w-md p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-semibold",
								children: "Already registered?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Sign in with username and password."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 space-y-3",
								onSubmit: onLogin,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "mini-username",
											children: "Username"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "mini-username",
											value: username,
											onChange: (e) => setUsername(e.target.value),
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "mini-password",
											children: "Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "mini-password",
											type: "password",
											value: password,
											onChange: (e) => setPassword(e.target.value),
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full",
										disabled: busy,
										variant: "secondary",
										children: "Sign in"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
								icon: Package,
								label: "Products",
								value: front.stats.products
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
								icon: Boxes,
								label: "In stock",
								value: front.stats.inStock
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
								icon: Layers,
								label: "Categories",
								value: front.stats.categories
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
								icon: ShoppingBag,
								label: "Orders",
								value: front.stats.orders
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
								icon: Star,
								label: "Reviews",
								value: front.stats.reviews
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
								icon: Timer,
								label: "Support",
								value: "24/7"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFooter, { name: front.store.name })
		]
	});
	const data = overview.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, { handle: front.store.channel ?? "ebankenroll" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				storeName: front.store.name,
				mini: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-8",
				children: [
					creds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "panel mb-8 border-primary/30 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Your account is ready"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Save these details. Sign in later with username and password on the website or Mini App."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Credential, {
										label: "Username",
										value: creds.username
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Credential, {
										label: "User ID",
										value: String(creds.public_id)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Credential, {
										label: "Password",
										value: creds.password
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								variant: "secondary",
								onClick: () => setCreds(null),
								children: "Continue to the store"
							})
						]
					}) : null,
					tab === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "py-6 text-center sm:py-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-3xl font-bold text-balance sm:text-5xl",
								children: [
									"Hi ",
									user.first_name || user.username,
									". Shop the live catalog."
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-3 max-w-2xl text-muted-foreground",
								children: front.store.welcome
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
									icon: Package,
									label: "Products",
									value: front.stats.products
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
									icon: Boxes,
									label: "In stock",
									value: front.stats.inStock
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
									icon: Layers,
									label: "Categories",
									value: front.stats.categories
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
									icon: ShoppingBag,
									label: "Orders",
									value: front.stats.orders
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
									icon: Wallet,
									label: "Balance",
									value: money(user.wallet_balance)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
									icon: Bell,
									label: "Notes",
									value: user.unreadNotes
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-12",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-2xl font-bold",
									children: "Shop by category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [front.categories.length, " categories. Product and stock numbers are live counts."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
									children: front.categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
										category: item,
										to: "/app"
									}, item.id))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-12",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold",
								children: "Featured"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
								children: front.featured.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
									product,
									signedIn: true,
									busy,
									onAdd: (item) => run(async () => {
										await addToCart({ data: {
											token,
											productId: item.id
										} });
										return `${item.name} added to your cart.`;
									})
								}, product.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-12",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold",
								children: "Why shop with us"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhyGrid, {})
							})]
						})
					] }) : null,
					tab === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-bold",
							children: "All products"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Live stock from unsold keys. File products are unlimited."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: category ? "outline" : "default",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app",
									children: "All"
								})
							}), catalog.categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: category === item.id ? "default" : "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app",
									search: { category: item.id },
									children: item.name
								})
							}, item.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
							children: products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
								product,
								signedIn: true,
								busy,
								onAdd: (item) => run(async () => {
									await addToCart({ data: {
										token,
										productId: item.id
									} });
									return `${item.name} added to your cart.`;
								})
							}, product.id))
						})
					] }) : null,
					tab === "cart" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-bold",
								children: "Cart"
							}),
							(data?.cart.items ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel flex items-center justify-between gap-3 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										row.product.name,
										" × ",
										row.quantity
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: money(row.product.price * row.quantity)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									disabled: busy,
									onClick: () => run(async () => {
										await removeFromCart({ data: {
											token,
											cartItemId: row.id
										} });
										return "Removed.";
									}),
									children: "Remove"
								})]
							}, row.id)),
							data && data.cart.items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-right font-semibold",
								children: ["Total ", money(data.cart.total)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy,
								onClick: () => run(async () => {
									const result = await checkoutCart({ data: { token } });
									if (!result.ok) throw new Error(result.reason);
									setTab("orders");
									return `Order #${result.orderId} completed.`;
								}),
								children: "Pay with balance"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Your cart is empty."
							})
						]
					}) : null,
					tab === "wallet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletPanel, {
						balance: user.wallet_balance,
						busy,
						run,
						token
					}) : null,
					tab === "orders" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-bold",
								children: "Orders"
							}),
							(data?.orders ?? []).map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "panel p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: ["Order #", order.id]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: money(order.total)
									})]
								}), order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 border-t border-border pt-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										item.name,
										" × ",
										item.quantity
									] }), item.delivered_asset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "mt-1 block whitespace-pre-wrap font-mono text-xs text-muted-foreground",
										children: item.delivered_asset
									}) : null]
								}, item.id))]
							}, order.id)),
							!(data?.orders ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No orders yet."
							}) : null
						]
					}) : null,
					tab === "inbox" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-bold",
								children: "Private notes"
							}),
							(data?.notes ?? []).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "panel p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: new Date(note.created_at).toLocaleString()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 whitespace-pre-wrap",
									children: note.body
								})]
							}, note.id)),
							!(data?.notes ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No notes from the operator yet."
							}) : null
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-around px-2 py-2",
					children: [
						["home", "Home"],
						["shop", "Shop"],
						["cart", `Cart${data?.cart.items.length ? ` (${data.cart.items.length})` : ""}`],
						["wallet", "Wallet"],
						["orders", "Orders"],
						["inbox", user.unreadNotes ? `Notes (${user.unreadNotes})` : "Notes"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `min-h-11 rounded-lg px-3 py-2 text-xs font-medium ${tab === id ? "bg-primary/15 text-primary" : "text-muted-foreground"}`,
						onClick: () => setTab(id),
						children: label
					}, id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFooter, { name: front.store.name })
		]
	});
}
function Credential({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-background/50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm break-all",
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-muted-foreground hover:text-foreground",
				onClick: () => {
					navigator.clipboard.writeText(value);
					toast.success(`${label} copied`);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
			})]
		})]
	});
}
function WalletPanel({ balance, busy, run, token }) {
	const [asset, setAsset] = (0, import_react.useState)("BTC");
	const [amount, setAmount] = (0, import_react.useState)("20");
	const [invoice, setInvoice] = (0, import_react.useState)(null);
	const [hash, setHash] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel vault-gradient p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-muted-foreground",
				children: "Balance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display mt-2 text-3xl font-bold tabular-nums",
				children: money(balance)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel p-5",
			children: invoice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-semibold",
						children: [
							"Send exactly ",
							invoice.amount,
							" ",
							invoice.assetLabel
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-left font-mono text-xs break-all",
						onClick: () => {
							navigator.clipboard.writeText(invoice.address);
							toast.success("Address copied");
						},
						children: [invoice.address, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4 shrink-0" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Transaction hash",
						value: hash,
						onChange: (e) => setHash(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy || hash.trim().length < 8,
						onClick: () => run(async () => {
							const result = await submitHash({ data: {
								token,
								txId: invoice.id,
								hash
							} });
							setHash("");
							return result.message;
						}),
						children: "Submit hash"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setInvoice(null),
						children: "New invoice"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Top up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: ASSETS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: asset === item.id ? "default" : "outline",
							onClick: () => setAsset(item.id),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: amount,
						onChange: (e) => setAmount(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy,
						onClick: () => run(async () => {
							const created = await createTopUp({ data: {
								token,
								asset,
								amountUsd: Number(amount)
							} });
							setInvoice(created);
							return `Invoice ${created.code} created.`;
						}),
						children: "Create invoice"
					})
				]
			})
		})]
	});
}
//#endregion
export { MiniApp as component };
