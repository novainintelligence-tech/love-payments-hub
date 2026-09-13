import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Boxes,
  Copy,
  Layers,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  Timer,
  Wallet,
} from "lucide-react";
import {
  accountOverview,
  addToCart,
  checkoutCart,
  createTopUp,
  loginAccount,
  markNotesRead,
  removeFromCart,
  shopCatalog,
  startAccount,
  storefrontData,
  submitHash,
} from "@/lib/store/functions";
import { getStoreToken } from "@/lib/store/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CategoryCard,
  ChannelStrip,
  ProductCard,
  SiteHeader,
  StatTile,
  StoreFooter,
  WhyGrid,
} from "@/components/store-chrome";
import { useStoreSession } from "@/components/store-session";
import { money } from "@/lib/utils";

type Tab = "home" | "shop" | "cart" | "wallet" | "orders" | "inbox";
type Creds = { username: string; public_id: number; password: string };

const ASSETS = [
  { id: "BTC" as const, label: "BTC" },
  { id: "USDT_TRC20" as const, label: "USDT" },
  { id: "USDC_ERC20" as const, label: "USDC" },
];

export const Route = createFileRoute("/app")({
  head: () => ({
    scripts: [{ src: "https://telegram.org/js/telegram-web-app.js" }],
  }),
  validateSearch: (search: Record<string, unknown>): { category?: number } => {
    const raw = search.category;
    if (raw === undefined || raw === null || raw === "") return {};
    const category = Number(raw);
    return Number.isFinite(category) ? { category } : {};
  },
  loader: () => Promise.all([storefrontData(), shopCatalog()]),
  component: MiniApp,
});

function MiniApp() {
  const [front, catalog] = Route.useLoaderData();
  const { category } = Route.useSearch();
  const { user, loading, signIn, refresh } = useStoreSession();
  const [tab, setTab] = useState<Tab>(category ? "shop" : "home");
  const [creds, setCreds] = useState<Creds | null>(null);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const token = getStoreToken();
  const overview = useQuery({
    queryKey: ["mini-overview", token, user?.id],
    queryFn: () => accountOverview({ data: { token } }),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (category) setTab("shop");
  }, [category]);

  useEffect(() => {
    if (user && user.unreadNotes > 0 && tab === "inbox") {
      void markNotesRead({ data: { token } }).then(() => refresh());
    }
  }, [user, tab, token, refresh]);

  async function run(action: () => Promise<string>) {
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
      const tg = (window as unknown as { Telegram?: { WebApp?: { ready?: () => void; expand?: () => void; initData?: string } } })
        .Telegram?.WebApp;
      tg?.ready?.();
      tg?.expand?.();
      const result = await startAccount({
        data: { token: getStoreToken(), initData: tg?.initData || undefined },
      });
      await signIn(result.token);
      if (result.created && result.password) {
        setCreds({
          username: result.user.username,
          public_id: result.user.public_id,
          password: result.password,
        });
      }
      toast.success(result.created ? "Account created." : `Welcome back, ${result.user.username}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start");
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await loginAccount({ data: { username, password } });
      await signIn(result.token);
      toast.success(`Welcome back, ${result.user.username}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  const products = useMemo(() => {
    return category
      ? catalog.products.filter((product) => product.category_id === category)
      : catalog.products;
  }, [catalog.products, category]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <ChannelStrip />
        <SiteHeader storeName={front.store.name} mini />
        <main className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading store…</main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <ChannelStrip handle={front.store.channel ?? "ebankenroll"} />
        <SiteHeader storeName={front.store.name} mini />
        <main className="mx-auto max-w-6xl px-4 pb-20">
          <section className="py-14 text-center sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Mini App
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-6xl">
              Premium digital products, delivered <span className="text-primary">instantly</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{front.store.welcome}</p>
            <div className="mx-auto mt-8 max-w-md">
              <Button size="lg" className="h-12 w-full text-base" disabled={busy} onClick={onStart}>
                {busy ? "Creating your account…" : "Start"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Press Start to register automatically with a username, user ID and password.
              </p>
            </div>
          </section>

          <div className="panel mx-auto max-w-md p-6">
            <h2 className="text-base font-semibold">Already registered?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with username and password.</p>
            <form className="mt-4 space-y-3" onSubmit={onLogin}>
              <div className="space-y-2">
                <Label htmlFor="mini-username">Username</Label>
                <Input id="mini-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mini-password">Password</Label>
                <Input
                  id="mini-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy} variant="secondary">
                Sign in
              </Button>
            </form>
          </div>

          <section className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile icon={Package} label="Products" value={front.stats.products} />
            <StatTile icon={Boxes} label="In stock" value={front.stats.inStock} />
            <StatTile icon={Layers} label="Categories" value={front.stats.categories} />
            <StatTile icon={ShoppingBag} label="Orders" value={front.stats.orders} />
            <StatTile icon={Star} label="Reviews" value={front.stats.reviews} />
            <StatTile icon={Timer} label="Support" value="24/7" />
          </section>
        </main>
        <StoreFooter name={front.store.name} />
      </div>
    );
  }

  const data = overview.data;

  return (
    <div className="min-h-screen pb-20">
      <ChannelStrip handle={front.store.channel ?? "ebankenroll"} />
      <SiteHeader storeName={front.store.name} mini />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {creds ? (
          <section className="panel mb-8 border-primary/30 p-5">
            <h2 className="text-lg font-semibold">Your account is ready</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Save these details. Sign in later with username and password on the website or Mini App.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <Credential label="Username" value={creds.username} />
              <Credential label="User ID" value={String(creds.public_id)} />
              <Credential label="Password" value={creds.password} />
            </dl>
            <Button className="mt-4" variant="secondary" onClick={() => setCreds(null)}>
              Continue to the store
            </Button>
          </section>
        ) : null}

        {tab === "home" ? (
          <>
            <section className="py-6 text-center sm:py-10">
              <h1 className="text-3xl font-bold text-balance sm:text-5xl">
                Hi {user.first_name || user.username}. Shop the live catalog.
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{front.store.welcome}</p>
            </section>
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile icon={Package} label="Products" value={front.stats.products} />
              <StatTile icon={Boxes} label="In stock" value={front.stats.inStock} />
              <StatTile icon={Layers} label="Categories" value={front.stats.categories} />
              <StatTile icon={ShoppingBag} label="Orders" value={front.stats.orders} />
              <StatTile icon={Wallet} label="Balance" value={money(user.wallet_balance)} />
              <StatTile icon={Bell} label="Notes" value={user.unreadNotes} />
            </section>
            <section className="mt-12">
              <h2 className="text-2xl font-bold">Shop by category</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {front.categories.length} categories. Product and stock numbers are live counts.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {front.categories.map((item) => (
                  <CategoryCard key={item.id} category={item} to="/app" />
                ))}
              </div>
            </section>
            <section className="mt-12">
              <h2 className="text-2xl font-bold">Featured</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {front.featured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    signedIn
                    busy={busy}
                    onAdd={(item) =>
                      run(async () => {
                        await addToCart({ data: { token, productId: item.id } });
                        return `${item.name} added to your cart.`;
                      })
                    }
                  />
                ))}
              </div>
            </section>
            <section className="mt-12">
              <h2 className="text-2xl font-bold">Why shop with us</h2>
              <div className="mt-6">
                <WhyGrid />
              </div>
            </section>
          </>
        ) : null}

        {tab === "shop" ? (
          <section>
            <h1 className="text-3xl font-bold">All products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live stock from unsold keys. File products are unlimited.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild size="sm" variant={category ? "outline" : "default"}>
                <Link to="/app">All</Link>
              </Button>
              {catalog.categories.map((item) => (
                <Button key={item.id} asChild size="sm" variant={category === item.id ? "default" : "outline"}>
                  <Link to="/app" search={{ category: item.id }}>
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  signedIn
                  busy={busy}
                  onAdd={(item) =>
                    run(async () => {
                      await addToCart({ data: { token, productId: item.id } });
                      return `${item.name} added to your cart.`;
                    })
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        {tab === "cart" ? (
          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold">Cart</h1>
            {(data?.cart.items ?? []).map((row) => (
              <div key={row.id} className="panel flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {row.product.name} × {row.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">{money(row.product.price * row.quantity)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await removeFromCart({ data: { token, cartItemId: row.id } });
                      return "Removed.";
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
            {data && data.cart.items.length > 0 ? (
              <>
                <p className="text-right font-semibold">Total {money(data.cart.total)}</p>
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const result = await checkoutCart({ data: { token } });
                      if (!result.ok) throw new Error(result.reason);
                      setTab("orders");
                      return `Order #${result.orderId} completed.`;
                    })
                  }
                >
                  Pay with balance
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            )}
          </section>
        ) : null}

        {tab === "wallet" ? (
          <WalletPanel balance={user.wallet_balance} busy={busy} run={run} token={token} />
        ) : null}

        {tab === "orders" ? (
          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold">Orders</h1>
            {(data?.orders ?? []).map((order) => (
              <article key={order.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">Order #{order.id}</span>
                  <Badge variant="secondary">{money(order.total)}</Badge>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className="mt-3 border-t border-border pt-3 text-sm">
                    <p>
                      {item.name} × {item.quantity}
                    </p>
                    {item.delivered_asset ? (
                      <code className="mt-1 block whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                        {item.delivered_asset}
                      </code>
                    ) : null}
                  </div>
                ))}
              </article>
            ))}
            {!(data?.orders ?? []).length ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : null}
          </section>
        ) : null}

        {tab === "inbox" ? (
          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold">Private notes</h1>
            {(data?.notes ?? []).map((note) => (
              <article key={note.id} className="panel p-4 text-sm">
                <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</p>
                <p className="mt-2 whitespace-pre-wrap">{note.body}</p>
              </article>
            ))}
            {!(data?.notes ?? []).length ? (
              <p className="text-sm text-muted-foreground">No notes from the operator yet.</p>
            ) : null}
          </section>
        ) : null}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
          {(
            [
              ["home", "Home"],
              ["shop", "Shop"],
              ["cart", `Cart${data?.cart.items.length ? ` (${data.cart.items.length})` : ""}`],
              ["wallet", "Wallet"],
              ["orders", "Orders"],
              ["inbox", user.unreadNotes ? `Notes (${user.unreadNotes})` : "Notes"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`min-h-11 rounded-lg px-3 py-2 text-xs font-medium ${
                tab === id ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
      <StoreFooter name={front.store.name} />
    </div>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-sm break-all">{value}</p>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
          }}
        >
          <Copy className="size-4" />
        </button>
      </div>
    </div>
  );
}

function WalletPanel({
  balance,
  busy,
  run,
  token,
}: {
  balance: number;
  busy: boolean;
  run: (action: () => Promise<string>) => Promise<void>;
  token: string | undefined;
}) {
  const [asset, setAsset] = useState<(typeof ASSETS)[number]["id"]>("BTC");
  const [amount, setAmount] = useState("20");
  const [invoice, setInvoice] = useState<Awaited<ReturnType<typeof createTopUp>> | null>(null);
  const [hash, setHash] = useState("");

  return (
    <section className="flex flex-col gap-4">
      <div className="panel vault-gradient p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Balance</p>
        <p className="font-display mt-2 text-3xl font-bold tabular-nums">{money(balance)}</p>
      </div>
      <div className="panel p-5">
        {invoice ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">
              Send exactly {invoice.amount} {invoice.assetLabel}
            </p>
            <button
              className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-left font-mono text-xs break-all"
              onClick={() => {
                void navigator.clipboard.writeText(invoice.address);
                toast.success("Address copied");
              }}
            >
              {invoice.address}
              <Copy className="size-4 shrink-0" />
            </button>
            <Input placeholder="Transaction hash" value={hash} onChange={(e) => setHash(e.target.value)} />
            <Button
              disabled={busy || hash.trim().length < 8}
              onClick={() =>
                run(async () => {
                  const result = await submitHash({ data: { token, txId: invoice.id, hash } });
                  setHash("");
                  return result.message;
                })
              }
            >
              Submit hash
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInvoice(null)}>
              New invoice
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Top up</p>
            <div className="flex gap-2">
              {ASSETS.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={asset === item.id ? "default" : "outline"}
                  onClick={() => setAsset(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const created = await createTopUp({
                    data: { token, asset, amountUsd: Number(amount) },
                  });
                  setInvoice(created);
                  return `Invoice ${created.code} created.`;
                })
              }
            >
              Create invoice
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
