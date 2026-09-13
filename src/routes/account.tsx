import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Wallet, Receipt, Bell, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  accountOverview,
  addToCart,
  checkoutCart,
  createTopUp,
  markNotesRead,
  removeFromCart,
  shopCatalog,
  submitHash,
} from "@/lib/store/functions";
import { getStoreToken } from "@/lib/store/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChannelStrip, ProductCard, SiteHeader, StoreFooter } from "@/components/store-chrome";
import { useStoreSession } from "@/components/store-session";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

const ASSETS = [
  { id: "BTC" as const, label: "BTC" },
  { id: "USDT_TRC20" as const, label: "USDT" },
  { id: "USDC_ERC20" as const, label: "USDC" },
];

function AccountPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { user, loading, signOut, refresh } = useStoreSession();
  const token = getStoreToken();
  const overview = useQuery({
    queryKey: ["account-overview", token],
    queryFn: () => accountOverview({ data: { token } }),
    enabled: Boolean(user),
  });
  const catalog = useQuery({
    queryKey: ["shop-catalog"],
    queryFn: () => shopCatalog(),
  });
  const [asset, setAsset] = useState<(typeof ASSETS)[number]["id"]>("BTC");
  const [amount, setAmount] = useState("20");
  const [invoice, setInvoice] = useState<Awaited<ReturnType<typeof createTopUp>> | null>(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user && user.unreadNotes > 0) {
      void markNotesRead({ data: { token } }).then(() => refresh());
    }
  }, [user, token, refresh]);

  async function run(action: () => Promise<string>) {
    setBusy(true);
    try {
      toast.success(await action());
      await Promise.all([overview.refetch(), refresh(), client.invalidateQueries()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <ChannelStrip />
        <SiteHeader storeName="Enroll Log" />
        <main className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">Loading your account…</main>
      </div>
    );
  }

  const data = overview.data;

  return (
    <div className="min-h-screen">
      <ChannelStrip />
      <SiteHeader storeName="Enroll Log" />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Your account</p>
            <h1 className="font-display mt-1 text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Same catalog and wallet as the Mini App — sign in with your username and password.
            </p>
          </div>
          <div className="flex gap-2">
            {user.is_admin ? (
              <Button asChild variant="outline">
                <Link to="/ops">Command center</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/ops">Operator</Link>
              </Button>
            )}
            <Button variant="secondary" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
              Sign out
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="panel vault-gradient p-4">
            <Wallet className="size-4 text-primary" />
            <p className="font-display mt-2 text-2xl font-bold tabular-nums">{money(user.wallet_balance)}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Balance</p>
          </div>
          <div className="panel p-4">
            <Receipt className="size-4 text-primary" />
            <p className="font-display mt-2 text-2xl font-bold tabular-nums">{data?.orders.length ?? 0}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Orders</p>
          </div>
          <div className="panel p-4">
            <ShoppingBag className="size-4 text-primary" />
            <p className="font-display mt-2 text-2xl font-bold tabular-nums">{data?.cart.items.length ?? 0}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Cart items</p>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Username</dt>
              <dd className="mt-1 font-medium">{user.username}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">User ID</dt>
              <dd className="mt-1 font-mono tabular-nums">{user.public_id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Name</dt>
              <dd className="mt-1">{user.first_name ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="size-4 text-primary" /> Private notes
          </h2>
          {(data?.notes ?? []).map((note) => (
            <article key={note.id} className="panel p-4 text-sm">
              <p className="text-xs text-muted-foreground">
                {new Date(note.created_at).toLocaleString()}
                {note.read ? "" : " · New"}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{note.body}</p>
            </article>
          ))}
          {!(data?.notes ?? []).length ? (
            <p className="text-sm text-muted-foreground">No private notes yet. Operators can send you updates here.</p>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cart</h2>
            {data && data.cart.items.length > 0 ? (
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const result = await checkoutCart({ data: { token } });
                    if (!result.ok) throw new Error(result.reason);
                    return `Order #${result.orderId} completed.`;
                  })
                }
              >
                Pay {money(data.cart.total)}
              </Button>
            ) : null}
          </div>
          {(data?.cart.items ?? []).map((row) => (
            <div key={row.id} className="panel flex items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium">
                  {row.product.name} × {row.quantity}
                </p>
                <p className="text-muted-foreground">{money(row.product.price * row.quantity)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await removeFromCart({ data: { token, cartItemId: row.id } });
                    return "Removed from cart.";
                  })
                }
              >
                Remove
              </Button>
            </div>
          ))}
          {!(data?.cart.items ?? []).length ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : null}
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Top up</h2>
          {invoice ? (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm">
                Send exactly {invoice.amount} {invoice.assetLabel} to the address below.
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
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
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
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in USD"
              />
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
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Purchases</h2>
          {(data?.orders ?? []).map((order) => (
            <article key={order.id} className="panel flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">Order #{order.id}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{order.status}</Badge>
                  <Badge variant="secondary">{money(order.total)}</Badge>
                </div>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="rounded-md border border-border bg-background/60 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">{money(item.price)}</span>
                  </div>
                  {item.delivered_asset ? (
                    <div className="mt-2 flex items-start gap-2">
                      <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs">
                        {item.delivered_asset}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void navigator.clipboard.writeText(item.delivered_asset ?? "");
                          toast.success("Copied");
                        }}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </article>
          ))}
          {!(data?.orders ?? []).length ? (
            <p className="text-sm text-muted-foreground">No purchases yet.</p>
          ) : null}
        </section>

        <section>
          <h2 className="text-lg font-semibold">Continue shopping</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(catalog.data?.products ?? []).slice(0, 6).map((product) => (
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
      </main>
      <StoreFooter name="Enroll Log" />
    </div>
  );
}
