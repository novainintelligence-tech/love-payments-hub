import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as submitHash, b as shopCatalog, c as checkoutCart, d as getStoreToken, i as addToCart, m as removeFromCart, n as accountOverview, p as markNotesRead, u as createTopUp, w as useStoreSession } from "./store-session-BNqMq0Da.mjs";
import { h as Bell, p as Copy, s as ShoppingBag, t as Wallet, u as Receipt } from "../_libs/lucide-react.mjs";
import { a as SiteHeader, i as ProductCard, r as ChannelStrip, s as StoreFooter, t as Button, u as money } from "./store-chrome-D4rGdyql.mjs";
import { t as Input } from "./input-DdqcWFT2.mjs";
import { t as Badge } from "./badge-DMJndAto.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-RYfEYZ33.js
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
function AccountPage() {
	const navigate = useNavigate();
	const client = useQueryClient();
	const { user, loading, signOut, refresh } = useStoreSession();
	const token = getStoreToken();
	const overview = useQuery({
		queryKey: ["account-overview", token],
		queryFn: () => accountOverview({ data: { token } }),
		enabled: Boolean(user)
	});
	const catalog = useQuery({
		queryKey: ["shop-catalog"],
		queryFn: () => shopCatalog()
	});
	const [asset, setAsset] = (0, import_react.useState)("BTC");
	const [amount, setAmount] = (0, import_react.useState)("20");
	const [invoice, setInvoice] = (0, import_react.useState)(null);
	const [hash, setHash] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({ to: "/login" });
	}, [
		loading,
		user,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (user && user.unreadNotes > 0) markNotesRead({ data: { token } }).then(() => refresh());
	}, [
		user,
		token,
		refresh
	]);
	async function run(action) {
		setBusy(true);
		try {
			toast.success(await action());
			await Promise.all([
				overview.refetch(),
				refresh(),
				client.invalidateQueries()
			]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	}
	if (loading || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: "Enroll Log" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground",
				children: "Loading your account…"
			})
		]
	});
	const data = overview.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: "Enroll Log" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-widest text-primary",
								children: "Your account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display mt-1 text-3xl font-bold",
								children: "Dashboard"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Same catalog and wallet as the Mini App — sign in with your username and password."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [user.is_admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/ops",
									children: "Command center"
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/ops",
									children: "Operator"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => signOut().then(() => navigate({ to: "/" })),
								children: "Sign out"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel vault-gradient p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display mt-2 text-2xl font-bold tabular-nums",
										children: money(user.wallet_balance)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Balance"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display mt-2 text-2xl font-bold tabular-nums",
										children: data?.orders.length ?? 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Orders"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display mt-2 text-2xl font-bold tabular-nums",
										children: data?.cart.items.length ?? 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Cart items"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "Profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid gap-3 text-sm sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs uppercase tracking-widest text-muted-foreground",
									children: "Username"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 font-medium",
									children: user.username
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs uppercase tracking-widest text-muted-foreground",
									children: "User ID"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 font-mono tabular-nums",
									children: user.public_id
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs uppercase tracking-widest text-muted-foreground",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1",
									children: user.first_name ?? "—"
								})] })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-2 text-lg font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }), " Private notes"]
							}),
							(data?.notes ?? []).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "panel p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [new Date(note.created_at).toLocaleString(), note.read ? "" : " · New"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 whitespace-pre-wrap",
									children: note.body
								})]
							}, note.id)),
							!(data?.notes ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No private notes yet. Operators can send you updates here."
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: "Cart"
								}), data && data.cart.items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									disabled: busy,
									onClick: () => run(async () => {
										const result = await checkoutCart({ data: { token } });
										if (!result.ok) throw new Error(result.reason);
										return `Order #${result.orderId} completed.`;
									}),
									children: ["Pay ", money(data.cart.total)]
								}) : null]
							}),
							(data?.cart.items ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel flex items-center justify-between gap-3 p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										row.product.name,
										" × ",
										row.quantity
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: money(row.product.price * row.quantity)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									disabled: busy,
									onClick: () => run(async () => {
										await removeFromCart({ data: {
											token,
											cartItemId: row.id
										} });
										return "Removed from cart.";
									}),
									children: "Remove"
								})]
							}, row.id)),
							!(data?.cart.items ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Your cart is empty."
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "Top up"
						}), invoice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm",
									children: [
										"Send exactly ",
										invoice.amount,
										" ",
										invoice.assetLabel,
										" to the address below."
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
							className: "mt-4 flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
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
									onChange: (e) => setAmount(e.target.value),
									placeholder: "Amount in USD"
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
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Purchases"
							}),
							(data?.orders ?? []).map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "panel flex flex-col gap-3 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: ["Order #", order.id]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: order.status
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											children: money(order.total)
										})]
									})]
								}), order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-border bg-background/60 p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											item.name,
											" × ",
											item.quantity
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: money(item.price)
										})]
									}), item.delivered_asset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs",
											children: item.delivered_asset
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => {
												navigator.clipboard.writeText(item.delivered_asset ?? "");
												toast.success("Copied");
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
										})]
									}) : null]
								}, item.id))]
							}, order.id)),
							!(data?.orders ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No purchases yet."
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Continue shopping"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: (catalog.data?.products ?? []).slice(0, 6).map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
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
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreFooter, { name: "Enroll Log" })
		]
	});
}
//#endregion
export { AccountPage as component };
