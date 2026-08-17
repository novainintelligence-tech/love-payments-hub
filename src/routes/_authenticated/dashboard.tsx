import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adjustCustomerBalance,
  addProductKeys,
  broadcastMessage,
  claimAdmin,
  dashboardStats,
  reviewPayment,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Store console — Crypto Store Bot" },
      { name: "description", content: "Approve crypto payments, manage stock and message customers of your Telegram store." },
      { property: "og:title", content: "Store console — Crypto Store Bot" },
      { property: "og:description", content: "Approve crypto payments, manage stock and message customers." },
    ],
  }),
  component: Dashboard,
});

type Tx = {
  id: number;
  invoice_code: string;
  user_id: number;
  amount_usd: number;
  crypto_amount: number | null;
  currency: string;
  status: string;
  tx_hash: string | null;
  verification_note: string | null;
  created_at: string;
};

type Customer = {
  id: number;
  telegram_id: number;
  username: string | null;
  wallet_balance: number;
  is_banned: boolean;
};

type Product = { id: number; name: string; price: number; stock_count: number; is_active: boolean };

function money(value: number) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getStats = useServerFn(dashboardStats);
  const review = useServerFn(reviewPayment);
  const adjust = useServerFn(adjustCustomerBalance);
  const broadcast = useServerFn(broadcastMessage);
  const addKeys = useServerFn(addProductKeys);
  const claim = useServerFn(claimAdmin);
  const [busy, setBusy] = useState(false);

  const stats = useQuery({ queryKey: ["stats"], queryFn: () => getStats({}) });
  const payments = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Tx[];
    },
  });
  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_users")
        .select("id, telegram_id, username, wallet_balance, is_banned")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Customer[];
    },
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock_count, is_active")
        .order("id");
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  async function run(action: () => Promise<string>) {
    setBusy(true);
    try {
      toast.success(await action());
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const isForbidden = stats.error instanceof Error && /forbidden/i.test(stats.error.message);

  if (isForbidden) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="panel max-w-md space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            This account has no admin role yet. If your store has no admin, claim it now.
          </p>
          <Button
            disabled={busy}
            onClick={() => run(async () => (await claim({})).reason)}
            className="w-full"
          >
            Claim admin access
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Store console</h1>
          <p className="text-sm text-muted-foreground">Manual crypto checkout for @Enroll_Logsbot</p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Customers", value: stats.data?.customers ?? 0 },
          { label: "Completed orders", value: stats.data?.orders ?? 0 },
          { label: "Pending payments", value: stats.data?.pendingPayments ?? 0 },
          { label: "Revenue", value: money(stats.data?.revenue ?? 0) },
          { label: "Held balances", value: money(stats.data?.liability ?? 0) },
        ].map((card) => (
          <div key={card.label} className="panel p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{card.label}</p>
            <p className="font-display mt-2 text-2xl">{card.value}</p>
          </div>
        ))}
      </section>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-3">
          {(payments.data ?? []).map((tx) => (
            <div key={tx.id} className="panel flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-display text-sm">
                  {tx.invoice_code} · {money(tx.amount_usd)} · {tx.currency}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {tx.tx_hash ? `hash ${tx.tx_hash}` : "no hash submitted"}
                  {tx.verification_note ? ` — ${tx.verification_note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tx.status === "completed" ? "default" : tx.status === "failed" ? "destructive" : "secondary"}>
                  {tx.status}
                </Badge>
                {tx.status !== "completed" && (
                  <>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(async () => (await review({ data: { id: tx.id, action: "recheck" } })).message)}>
                      Re-check
                    </Button>
                    <Button size="sm" disabled={busy} onClick={() => run(async () => (await review({ data: { id: tx.id, action: "approve" } })).message)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" disabled={busy} onClick={() => run(async () => (await review({ data: { id: tx.id, action: "reject" } })).message)}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {payments.data?.length === 0 && <p className="text-sm text-muted-foreground">No invoices yet.</p>}
        </TabsContent>

        <TabsContent value="customers" className="mt-4 space-y-3">
          {(customers.data ?? []).map((customer) => (
            <CustomerRow key={customer.id} customer={customer} busy={busy} onAdjust={(amount, reason) => run(async () => {
              const result = await adjust({ data: { userId: customer.id, amount, reason } });
              return `New balance: ${money(result.balance)}`;
            })} />
          ))}
          {customers.data?.length === 0 && <p className="text-sm text-muted-foreground">No customers yet.</p>}
        </TabsContent>

        <TabsContent value="products" className="mt-4 space-y-3">
          {(products.data ?? []).map((product) => (
            <ProductRow key={product.id} product={product} busy={busy} onAddKeys={(keys) => run(async () => {
              const result = await addKeys({ data: { productId: product.id, keys } });
              return `Added ${result.added} keys · stock ${result.stock}`;
            })} />
          ))}
          {products.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No products yet — add them from the bot admin panel.</p>
          )}
        </TabsContent>

        <TabsContent value="broadcast" className="mt-4">
          <BroadcastPanel busy={busy} onSend={(text) => run(async () => `Broadcast sent to ${(await broadcast({ data: { text } })).sent} customers`)} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function CustomerRow({
  customer,
  busy,
  onAdjust,
}: {
  customer: Customer;
  busy: boolean;
  onAdjust: (amount: number, reason: string) => void;
}) {
  const [amount, setAmount] = useState("");
  return (
    <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <p className="font-display text-sm">
          {customer.username ? `@${customer.username}` : `id ${customer.telegram_id}`}
        </p>
        <p className="text-xs text-muted-foreground">
          Balance {money(customer.wallet_balance)} {customer.is_banned ? "· banned" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="w-28"
          placeholder="±10.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <Button
          size="sm"
          disabled={busy}
          onClick={() => {
            const parsed = Number(amount);
            if (!parsed) return;
            onAdjust(parsed, "Console adjustment");
            setAmount("");
          }}
        >
          Adjust
        </Button>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  busy,
  onAddKeys,
}: {
  product: Product;
  busy: boolean;
  onAddKeys: (keys: string) => void;
}) {
  const [keys, setKeys] = useState("");
  return (
    <div className="panel space-y-3 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-sm">
          {product.name} · {money(product.price)}
        </p>
        <Badge variant="secondary">{product.stock_count} in stock</Badge>
      </div>
      <Textarea
        rows={3}
        placeholder="One key or account per line"
        value={keys}
        onChange={(event) => setKeys(event.target.value)}
      />
      <Button
        size="sm"
        disabled={busy || !keys.trim()}
        onClick={() => {
          onAddKeys(keys);
          setKeys("");
        }}
      >
        Add stock
      </Button>
    </div>
  );
}

function BroadcastPanel({ busy, onSend }: { busy: boolean; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="panel space-y-3 p-4">
      <Textarea rows={5} placeholder="Message to all customers…" value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        disabled={busy || text.trim().length < 2}
        onClick={() => {
          onSend(text);
          setText("");
        }}
      >
        Send broadcast
      </Button>
    </div>
  );
}