import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as loginAccount, w as useStoreSession } from "./store-session-BNqMq0Da.mjs";
import { a as SiteHeader, r as ChannelStrip, t as Button } from "./store-chrome-D4rGdyql.mjs";
import { t as Input } from "./input-DdqcWFT2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-D5Uk-fPr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Br08p_89.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const { signIn } = useStoreSession();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		try {
			const result = await loginAccount({ data: {
				username,
				password
			} });
			await signIn(result.token);
			toast.success(`Welcome back, ${result.user.username}.`);
			navigate({ to: "/account" });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not sign in");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { storeName: "Enroll Log" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto flex max-w-md flex-col px-4 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-widest text-primary",
							children: "Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-2xl font-bold",
							children: "Sign in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Use the username and password created when you pressed Start in the Mini App."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-6 space-y-4",
							onSubmit: submit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "username",
										children: "Username"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "username",
										autoComplete: "username",
										required: true,
										value: username,
										onChange: (event) => setUsername(event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password",
										type: "password",
										autoComplete: "current-password",
										required: true,
										minLength: 4,
										value: password,
										onChange: (event) => setPassword(event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "w-full",
									disabled: busy,
									children: busy ? "Signing in…" : "Sign in"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-5 text-sm text-muted-foreground",
							children: [
								"New here?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app",
									className: "text-foreground underline-offset-4 hover:underline",
									children: "Open the Mini App and press Start"
								}),
								" ",
								"to create a username, user ID and password automatically."
							]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Login as component };
