import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as saveSettings, a as adminAdjustBalance, d as getStoreToken, g as saveProduct, h as saveCategory, l as claimAdmin, o as adminCreditPayment, r as addProductKeys, s as adminDashboard, v as sendPrivateNote, w as useStoreSession, y as setBanned } from "./store-session-BNqMq0Da.mjs";
import { a as SiteHeader, l as cn, r as ChannelStrip, t as Button, u as money } from "./store-chrome-D4rGdyql.mjs";
import { t as Input } from "./input-DdqcWFT2.mjs";
import { t as Badge } from "./badge-DMJndAto.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ops-DGt5gSlb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
function OpsPage() {
	const navigate = useNavigate();
	const { user, loading, refresh } = useStoreSession();
	const token = getStoreToken();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const query = useQuery({
		queryKey: [
			"admin-dashboard",
			token,
			user?.is_admin
		],
		queryFn: () => adminDashboard({ data: { token } }),
		enabled: Boolean(user),
		retry: false
	});
	async function run(action) {
		setBusy(true);
		try {
			toast.success(await action());
			await Promise.all([query.refetch(), refresh()]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center text-sm text-muted-foreground",
		children: "Loading command center…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel max-w-md p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "Operator sign in required"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Create an account in the Mini App, then return here to claim operator access."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Sign in"
					})
				})
			]
		})
	});
	if (query.error || !query.data && !query.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: "Enroll Log" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-lg px-4 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold",
							children: "Claim operator access"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "The first signed-in customer can become the store operator. After that, only that account can manage catalog, customers and private notes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy,
								onClick: () => run(async () => {
									const result = await claimAdmin({ data: { token } });
									if (!result.granted) throw new Error(result.reason);
									return result.reason;
								}),
								children: "Claim operator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => navigate({ to: "/account" }),
								children: "Back"
							})]
						})
					]
				})
			})
		]
	});
	if (!query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center text-sm text-muted-foreground",
		children: "Loading command center…"
	});
	const data = query.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: data.settings.store_name }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-widest text-primary",
								children: "Operations / live"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-bold",
								children: "Store command center"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Catalog, customers, payments and private notes — stock numbers come from unsold keys."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => query.refetch(),
							children: "Refresh"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
						children: [
							["Customers", data.stats.customers],
							["Orders", data.stats.orders],
							["Pending", data.stats.pendingPayments],
							["Revenue", money(data.stats.revenue)],
							["Balances", money(data.stats.liability)]
						].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-2xl font-semibold tabular-nums",
								children: value
							})]
						}, String(label)))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "customers",
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "h-auto flex-wrap justify-start",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "customers",
										children: "Customers"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "products",
										children: "Products"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "categories",
										children: "Categories"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "payments",
										children: "Payments"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "orders",
										children: "Orders"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "settings",
										children: "Settings"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "customers",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersTab, {
									data,
									busy,
									run,
									token
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "products",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsTab, {
									data,
									busy,
									run,
									token
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "categories",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriesTab, {
									data,
									busy,
									run,
									token
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "payments",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-3",
									children: [data.payments.map((payment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "panel flex flex-wrap items-center justify-between gap-3 p-4 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-medium",
												children: [
													payment.code,
													" · @",
													payment.username
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-muted-foreground",
												children: [
													payment.asset,
													" · ",
													money(payment.amount),
													" · ",
													payment.status
												]
											}),
											payment.tx_hash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-mono text-xs break-all",
												children: payment.tx_hash
											}) : null
										] }), payment.status !== "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: busy,
											onClick: () => run(async () => {
												return (await adminCreditPayment({ data: {
													token,
													txId: payment.id
												} })).message;
											}),
											children: "Credit"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Paid" })]
									}, payment.id)), !data.payments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "No invoices yet."
									}) : null]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "orders",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-3",
									children: [data.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "panel flex flex-wrap justify-between gap-2 p-4 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"#",
											order.id,
											" · @",
											order.username,
											" · ID ",
											order.public_id
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											money(order.total),
											" · ",
											order.status
										] })]
									}, order.id)), !data.orders.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "No orders yet."
									}) : null]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsForm, {
									data,
									busy,
									run,
									token
								})
							})
						]
					})
				]
			})
		]
	});
}
function CustomersTab({ data, busy, run, token }) {
	const [selected, setSelected] = (0, import_react.useState)(data.customers[0]?.id ?? "");
	const [note, setNote] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("5");
	const customer = data.customers.find((item) => item.id === Number(selected));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-3",
			children: data.customers.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setSelected(item.id),
				className: `panel p-4 text-left ${item.id === customer?.id ? "border-primary/40" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: ["@", item.username]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm tabular-nums",
						children: money(item.wallet_balance)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [
						"User ID ",
						item.public_id,
						item.is_admin ? " · operator" : "",
						item.is_banned ? " · suspended" : ""
					]
				})]
			}, item.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel p-5",
			children: customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-semibold",
						children: ["@", customer.username]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"User ID ",
							customer.public_id,
							" · ",
							money(customer.wallet_balance)
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Send a private note"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 4,
								placeholder: "Only this customer will see this message.",
								value: note,
								onChange: (e) => setNote(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy || note.trim().length < 2,
								onClick: () => run(async () => {
									const result = await sendPrivateNote({ data: {
										token,
										userId: customer.id,
										body: note
									} });
									setNote("");
									return result.message;
								}),
								children: "Send note"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "max-w-32",
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								inputMode: "decimal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: busy,
								onClick: () => run(async () => {
									return (await adminAdjustBalance({ data: {
										token,
										userId: customer.id,
										amount: Number(amount),
										reason: "Operator credit"
									} })).message;
								}),
								children: "Adjust balance"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: busy,
								onClick: () => run(async () => {
									return (await setBanned({ data: {
										token,
										userId: customer.id,
										banned: !customer.is_banned
									} })).message;
								}),
								children: customer.is_banned ? "Reinstate" : "Suspend"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Recent notes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-col gap-2",
						children: data.notes.filter((item) => item.user_id === customer.id).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-md border border-border p-3 text-sm",
							children: item.body
						}, item.id))
					})] })
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Select a customer to send a private note."
			})
		})]
	});
}
function ProductsTab({ data, busy, run, token }) {
	const [keysFor, setKeysFor] = (0, import_react.useState)(null);
	const [keysText, setKeysText] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("9.99");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "panel grid gap-3 p-4 sm:grid-cols-4",
			onSubmit: (event) => {
				event.preventDefault();
				run(async () => {
					const result = await saveProduct({ data: {
						token,
						name,
						price: Number(price),
						product_type: "key",
						is_active: true
					} });
					setName("");
					return result.message;
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "New product name",
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Price",
					value: price,
					onChange: (e) => setPrice(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: "Add product"
				})
			]
		}), data.products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "panel p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: product.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						money(product.price),
						" ·",
						" ",
						product.product_type === "file" ? "Unlimited file" : `${product.stock ?? 0} unsold keys`
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => setKeysFor(product.id),
					children: "Add keys"
				})]
			}), keysFor === product.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 4,
					placeholder: "One key per line",
					value: keysText,
					onChange: (e) => setKeysText(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: busy,
					onClick: () => run(async () => {
						const result = await addProductKeys({ data: {
							token,
							productId: product.id,
							keysText
						} });
						setKeysText("");
						setKeysFor(null);
						return result.message;
					}),
					children: "Save keys"
				})]
			}) : null]
		}, product.id))]
	});
}
function CategoriesTab({ data, busy, run, token }) {
	const [name, setName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-wrap gap-2",
			onSubmit: (event) => {
				event.preventDefault();
				run(async () => {
					const result = await saveCategory({ data: {
						token,
						name
					} });
					setName("");
					return result.message;
				});
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "max-w-xs",
				placeholder: "New category",
				value: name,
				onChange: (e) => setName(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: busy,
				children: "Add"
			})]
		}), data.categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: category.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: category.description
			})]
		}, category.id))]
	});
}
function SettingsForm({ data, busy, run, token }) {
	const [form, setForm] = (0, import_react.useState)(data.settings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "panel grid gap-3 p-5 sm:grid-cols-2",
		onSubmit: (event) => {
			event.preventDefault();
			run(async () => {
				return (await saveSettings({ data: {
					token,
					store_name: form.store_name,
					welcome_message: form.welcome_message,
					channel_username: form.channel_username ?? void 0,
					support_username: form.support_username ?? void 0,
					btc_address: form.btc_address,
					usdt_trc20_address: form.usdt_trc20_address,
					usdc_erc20_address: form.usdc_erc20_address,
					min_topup_usd: Number(form.min_topup_usd)
				} })).message;
			});
		},
		children: [[
			["store_name", "Store name"],
			["welcome_message", "Welcome message"],
			["channel_username", "Channel"],
			["btc_address", "BTC address"],
			["usdt_trc20_address", "USDT TRC20"],
			["usdc_erc20_address", "USDC ERC20"]
		].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex flex-col gap-1 text-sm sm:col-span-2",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: String(form[key] ?? ""),
				onChange: (e) => setForm({
					...form,
					[key]: e.target.value
				})
			})]
		}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			disabled: busy,
			className: "sm:col-span-2",
			children: "Save settings"
		})]
	});
}
//#endregion
export { OpsPage as component };
