import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { w as useStoreSession } from "./store-session-BNqMq0Da.mjs";
import { c as ShieldCheck, d as Package, f as Layers, h as Bell, i as Timer, l as Send, n as Truck, o as Sparkles, s as ShoppingBag, t as Wallet } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-chrome-D4rGdyql.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function money(value) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(Number(value) || 0);
}
function stockLabel(stock, unlimited) {
	if (unlimited) return "Unlimited";
	const count = Number(stock ?? 0);
	if (count <= 0) return "Out of stock";
	if (count === 1) return "1 in stock";
	return `${count} in stock`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var CHANNEL = "https://t.me/ebankenroll";
function ChannelStrip({ handle = "ebankenroll" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: `https://t.me/${handle}`,
		target: "_blank",
		rel: "noreferrer",
		className: "block border-b border-border bg-primary/10 px-4 py-2 text-center text-xs text-foreground transition-colors hover:bg-primary/15",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-1.5 inline size-3.5 text-primary" }),
			"Join the Telegram channel for daily drops and restock alerts — @",
			handle
		]
	});
}
function SiteHeader({ storeName, mini = false }) {
	const { user, loading } = useStoreSession();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: mini ? "/app" : "/",
					className: "font-display text-lg font-semibold tracking-tight",
					children: storeName
				}),
				mini ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline",
					children: "Mini App"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "ml-2 hidden items-center gap-4 text-sm text-muted-foreground sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: mini ? "/app" : "/shop",
							className: "hover:text-foreground",
							children: "Products"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: CHANNEL,
							target: "_blank",
							rel: "noreferrer",
							className: "hover:text-foreground",
							children: "Telegram"
						}),
						user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: mini ? "/app" : "/account",
							className: "hover:text-foreground",
							children: "Account"
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-24 animate-pulse rounded-md bg-muted" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs tabular-nums text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-3.5 text-primary" }), money(user.wallet_balance)]
						}),
						user.unreadNotes > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: mini ? "/app" : "/account",
							className: "relative inline-flex size-9 items-center justify-center rounded-md border border-border bg-card",
							"aria-label": "Unread notes",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground",
								children: user.unreadNotes
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: mini ? "/app" : "/account",
								children: "Dashboard"
							})
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							children: mini ? "Sign in" : "Sign in"
						})
					}), !mini ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							children: "Open Mini App"
						})
					}) : null]
				})
			]
		})
	});
}
function StoreFooter({ name }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border py-8 text-center text-xs text-muted-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			name,
			" · Website, Telegram bot and Mini App ·",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				className: "hover:text-foreground",
				href: CHANNEL,
				target: "_blank",
				rel: "noreferrer",
				children: "@ebankenroll"
			})
		] })
	});
}
function StatTile({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel vault-gradient p-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mx-auto size-5 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display mt-2 text-2xl font-bold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-muted-foreground",
				children: label
			})
		]
	});
}
function CategoryCard({ category, to = "/shop" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "panel overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "vault-gradient aspect-video w-full overflow-hidden",
			children: category.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: category.image_url,
				alt: `${category.name} category`,
				loading: "lazy",
				className: "size-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-full items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-8 text-primary/70" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: category.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-sm text-muted-foreground",
					children: category.description ?? "Verified items ready for instant delivery."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-border px-2 py-1 text-muted-foreground",
						children: [
							category.products,
							" ",
							category.products === 1 ? "product" : "products"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-border px-2 py-1 text-muted-foreground",
						children: category.fileProducts > 0 && category.stock === 0 ? "Unlimited" : `${category.stock} in stock`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					className: "mt-1 w-full",
					children: to === "/app" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						search: { category: category.id },
						children: "View products"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/shop",
						search: { category: category.id },
						children: "View products"
					})
				})
			]
		})]
	});
}
function ProductCard({ product, onAdd, busy, signedIn }) {
	const available = product.unlimited || product.stock > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "panel flex flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "vault-gradient aspect-video overflow-hidden",
			children: product.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: product.image_url,
				alt: product.name,
				loading: "lazy",
				className: "size-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-full items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-8 text-primary/70" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: product.name
					}), product.is_featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), " Featured"]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-3 text-sm text-muted-foreground",
					children: product.description ?? "Instant delivery after checkout."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center justify-between pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl tabular-nums",
						children: money(product.price)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: stockLabel(product.stock, product.unlimited)
					})]
				}),
				onAdd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: busy || !available,
					onClick: () => onAdd(product),
					children: !available ? "Out of stock" : signedIn ? "Add to cart" : "Sign in to buy"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					disabled: !available,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: !available ? "Out of stock" : "Sign in to buy"
					})
				})
			]
		})]
	});
}
function WhyGrid() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
		children: [
			{
				icon: Timer,
				title: "Instant delivery",
				body: "Keys and files land in your account seconds after checkout."
			},
			{
				icon: ShieldCheck,
				title: "Verified stock",
				body: "Every item is checked before it is listed for sale."
			},
			{
				icon: Truck,
				title: "Always restocked",
				body: "New inventory added daily across every category."
			},
			{
				icon: Send,
				title: "Real support",
				body: "Talk to a human on Telegram whenever you need help."
			},
			{
				icon: ShoppingBag,
				title: "Buy your way",
				body: "Use the website or the Mini App with the same catalog."
			},
			{
				icon: Wallet,
				title: "Crypto balance",
				body: "Top up with BTC, USDT or USDC and spend instantly."
			}
		].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-3 text-base font-semibold",
					children: item.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: item.body
				})
			]
		}, item.title))
	});
}
//#endregion
export { SiteHeader as a, WhyGrid as c, ProductCard as i, cn as l, CategoryCard as n, StatTile as o, ChannelStrip as r, StoreFooter as s, Button as t, money as u };
