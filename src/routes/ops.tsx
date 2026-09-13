import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  addProductKeys,
  adminAdjustBalance,
  adminCreditPayment,
  adminDashboard,
  claimAdmin,
  saveCategory,
  saveProduct,
  saveSettings,
  sendPrivateNote,
  setBanned,
} from "@/lib/store/functions";
import { getStoreToken } from "@/lib/store/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelStrip, SiteHeader } from "@/components/store-chrome";
import { useStoreSession } from "@/components/store-session";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/ops")({
  component: OpsPage,
});

function OpsPage() {
  const navigate = useNavigate();
  const { user, loading, refresh } = useStoreSession();
  const token = getStoreToken();
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["admin-dashboard", token, user?.is_admin],
    queryFn: () => adminDashboard({ data: { token } }),
    enabled: Boolean(user),
    retry: false,
  });

  async function run(action: () => Promise<string>) {
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

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading command center…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">Operator sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account in the Mini App, then return here to claim operator access.
          </p>
          <Button asChild className="mt-4">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (query.error || (!query.data && !query.isLoading)) {
    return (
      <div className="min-h-screen">
        <ChannelStrip />
        <SiteHeader storeName="Enroll Log" />
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="panel p-8">
            <h1 className="text-2xl font-bold">Claim operator access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The first signed-in customer can become the store operator. After that, only that account can
              manage catalog, customers and private notes.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const result = await claimAdmin({ data: { token } });
                    if (!result.granted) throw new Error(result.reason);
                    return result.reason;
                  })
                }
              >
                Claim operator
              </Button>
              <Button variant="secondary" onClick={() => navigate({ to: "/account" })}>
                Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!query.data) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading command center…
      </main>
    );
  }

  const data = query.data;

  return (
    <div className="min-h-screen">
      <ChannelStrip />
      <SiteHeader storeName={data.settings.store_name} />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Operations / live</p>
            <h1 className="font-display text-3xl font-bold">Store command center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Catalog, customers, payments and private notes — stock numbers come from unsold keys.
            </p>
          </div>
          <Button variant="outline" onClick={() => query.refetch()}>
            Refresh
          </Button>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Customers", data.stats.customers],
            ["Orders", data.stats.orders],
            ["Pending", data.stats.pendingPayments],
            ["Revenue", money(data.stats.revenue)],
            ["Balances", money(data.stats.liability)],
          ].map(([label, value]) => (
            <div className="panel p-4" key={String(label)}>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </section>

        <Tabs defaultValue="customers" className="flex flex-col gap-4">
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <CustomersTab data={data} busy={busy} run={run} token={token} />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab data={data} busy={busy} run={run} token={token} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab data={data} busy={busy} run={run} token={token} />
          </TabsContent>
          <TabsContent value="payments">
            <div className="flex flex-col gap-3">
              {data.payments.map((payment) => (
                <div key={payment.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <p className="font-medium">
                      {payment.code} · @{payment.username}
                    </p>
                    <p className="text-muted-foreground">
                      {payment.asset} · {money(payment.amount)} · {payment.status}
                    </p>
                    {payment.tx_hash ? (
                      <p className="mt-1 font-mono text-xs break-all">{payment.tx_hash}</p>
                    ) : null}
                  </div>
                  {payment.status !== "completed" ? (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const result = await adminCreditPayment({ data: { token, txId: payment.id } });
                          return result.message;
                        })
                      }
                    >
                      Credit
                    </Button>
                  ) : (
                    <Badge>Paid</Badge>
                  )}
                </div>
              ))}
              {!data.payments.length ? <p className="text-sm text-muted-foreground">No invoices yet.</p> : null}
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <div className="flex flex-col gap-3">
              {data.orders.map((order) => (
                <div key={order.id} className="panel flex flex-wrap justify-between gap-2 p-4 text-sm">
                  <span>
                    #{order.id} · @{order.username} · ID {order.public_id}
                  </span>
                  <span>
                    {money(order.total)} · {order.status}
                  </span>
                </div>
              ))}
              {!data.orders.length ? <p className="text-sm text-muted-foreground">No orders yet.</p> : null}
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <SettingsForm data={data} busy={busy} run={run} token={token} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function CustomersTab({
  data,
  busy,
  run,
  token,
}: {
  data: Awaited<ReturnType<typeof adminDashboard>>;
  busy: boolean;
  run: (action: () => Promise<string>) => Promise<void>;
  token: string | undefined;
}) {
  const [selected, setSelected] = useState<number | "">(data.customers[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("5");
  const customer = data.customers.find((item) => item.id === Number(selected));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-3">
        {data.customers.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            className={`panel p-4 text-left ${item.id === customer?.id ? "border-primary/40" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">@{item.username}</p>
              <span className="font-mono text-sm tabular-nums">{money(item.wallet_balance)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              User ID {item.public_id}
              {item.is_admin ? " · operator" : ""}
              {item.is_banned ? " · suspended" : ""}
            </p>
          </button>
        ))}
      </div>
      <div className="panel p-5">
        {customer ? (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">@{customer.username}</h2>
              <p className="text-sm text-muted-foreground">
                User ID {customer.public_id} · {money(customer.wallet_balance)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Send a private note</p>
              <Textarea
                rows={4}
                placeholder="Only this customer will see this message."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                disabled={busy || note.trim().length < 2}
                onClick={() =>
                  run(async () => {
                    const result = await sendPrivateNote({
                      data: { token, userId: customer.id, body: note },
                    });
                    setNote("");
                    return result.message;
                  })
                }
              >
                Send note
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-32"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const result = await adminAdjustBalance({
                      data: {
                        token,
                        userId: customer.id,
                        amount: Number(amount),
                        reason: "Operator credit",
                      },
                    });
                    return result.message;
                  })
                }
              >
                Adjust balance
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const result = await setBanned({
                      data: { token, userId: customer.id, banned: !customer.is_banned },
                    });
                    return result.message;
                  })
                }
              >
                {customer.is_banned ? "Reinstate" : "Suspend"}
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium">Recent notes</p>
              <ul className="mt-2 flex flex-col gap-2">
                {data.notes
                  .filter((item) => item.user_id === customer.id)
                  .map((item) => (
                    <li key={item.id} className="rounded-md border border-border p-3 text-sm">
                      {item.body}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a customer to send a private note.</p>
        )}
      </div>
    </div>
  );
}

function ProductsTab({
  data,
  busy,
  run,
  token,
}: {
  data: Awaited<ReturnType<typeof adminDashboard>>;
  busy: boolean;
  run: (action: () => Promise<string>) => Promise<void>;
  token: string | undefined;
}) {
  const [keysFor, setKeysFor] = useState<number | null>(null);
  const [keysText, setKeysText] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("9.99");

  return (
    <div className="flex flex-col gap-6">
      <form
        className="panel grid gap-3 p-4 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const result = await saveProduct({
              data: {
                token,
                name,
                price: Number(price),
                product_type: "key",
                is_active: true,
              },
            });
            setName("");
            return result.message;
          });
        }}
      >
        <Input placeholder="New product name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Button type="submit" disabled={busy}>
          Add product
        </Button>
      </form>
      {data.products.map((product) => (
        <article key={product.id} className="panel p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {money(product.price)} ·{" "}
                {product.product_type === "file"
                  ? "Unlimited file"
                  : `${product.stock ?? 0} unsold keys`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setKeysFor(product.id)}>
              Add keys
            </Button>
          </div>
          {keysFor === product.id ? (
            <div className="mt-3 flex flex-col gap-2">
              <Textarea
                rows={4}
                placeholder="One key per line"
                value={keysText}
                onChange={(e) => setKeysText(e.target.value)}
              />
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const result = await addProductKeys({
                      data: { token, productId: product.id, keysText },
                    });
                    setKeysText("");
                    setKeysFor(null);
                    return result.message;
                  })
                }
              >
                Save keys
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function CategoriesTab({
  data,
  busy,
  run,
  token,
}: {
  data: Awaited<ReturnType<typeof adminDashboard>>;
  busy: boolean;
  run: (action: () => Promise<string>) => Promise<void>;
  token: string | undefined;
}) {
  const [name, setName] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const result = await saveCategory({ data: { token, name } });
            setName("");
            return result.message;
          });
        }}
      >
        <Input className="max-w-xs" placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" disabled={busy}>
          Add
        </Button>
      </form>
      {data.categories.map((category) => (
        <div key={category.id} className="panel p-4">
          <p className="font-medium">{category.name}</p>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      ))}
    </div>
  );
}

function SettingsForm({
  data,
  busy,
  run,
  token,
}: {
  data: Awaited<ReturnType<typeof adminDashboard>>;
  busy: boolean;
  run: (action: () => Promise<string>) => Promise<void>;
  token: string | undefined;
}) {
  const [form, setForm] = useState(data.settings);
  return (
    <form
      className="panel grid gap-3 p-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void run(async () => {
          const result = await saveSettings({
            data: {
              token,
              store_name: form.store_name,
              welcome_message: form.welcome_message,
              channel_username: form.channel_username ?? undefined,
              support_username: form.support_username ?? undefined,
              btc_address: form.btc_address,
              usdt_trc20_address: form.usdt_trc20_address,
              usdc_erc20_address: form.usdc_erc20_address,
              min_topup_usd: Number(form.min_topup_usd),
            },
          });
          return result.message;
        });
      }}
    >
      {(
        [
          ["store_name", "Store name"],
          ["welcome_message", "Welcome message"],
          ["channel_username", "Channel"],
          ["btc_address", "BTC address"],
          ["usdt_trc20_address", "USDT TRC20"],
          ["usdc_erc20_address", "USDC ERC20"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="flex flex-col gap-1 text-sm sm:col-span-2">
          {label}
          <Input
            value={String(form[key] ?? "")}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </label>
      ))}
      <Button type="submit" disabled={busy} className="sm:col-span-2">
        Save settings
      </Button>
    </form>
  );
}
