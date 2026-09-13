import { Link } from "@tanstack/react-router";
import {
  Bell,
  Layers,
  Package,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreSession } from "@/components/store-session";
import { money, stockLabel } from "@/lib/utils";
import type { PublicCategory, PublicProduct } from "@/lib/store/types";

const CHANNEL = "https://t.me/ebankenroll";

export function ChannelStrip({ handle = "ebankenroll" }: { handle?: string }) {
  return (
    <a
      href={`https://t.me/${handle}`}
      target="_blank"
      rel="noreferrer"
      className="block border-b border-border bg-primary/10 px-4 py-2 text-center text-xs text-foreground transition-colors hover:bg-primary/15"
    >
      <Send className="mr-1.5 inline size-3.5 text-primary" />
      Join the Telegram channel for daily drops and restock alerts — @{handle}
    </a>
  );
}

export function SiteHeader({
  storeName,
  mini = false,
}: {
  storeName: string;
  mini?: boolean;
}) {
  const { user, loading } = useStoreSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to={mini ? "/app" : "/"} className="font-display text-lg font-semibold tracking-tight">
          {storeName}
        </Link>
        {mini ? (
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            Mini App
          </span>
        ) : null}
        <nav className="ml-2 hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
          <Link to={mini ? "/app" : "/shop"} className="hover:text-foreground">
            Products
          </Link>
          <a href={CHANNEL} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Telegram
          </a>
          {user ? (
            <Link to={mini ? "/app" : "/account"} className="hover:text-foreground">
              Account
            </Link>
          ) : null}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs tabular-nums text-foreground">
                <Wallet className="size-3.5 text-primary" />
                {money(user.wallet_balance)}
              </span>
              {user.unreadNotes > 0 ? (
                <Link
                  to={mini ? "/app" : "/account"}
                  className="relative inline-flex size-9 items-center justify-center rounded-md border border-border bg-card"
                  aria-label="Unread notes"
                >
                  <Bell className="size-4 text-primary" />
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
                    {user.unreadNotes}
                  </span>
                </Link>
              ) : null}
              <Button asChild size="sm" variant="secondary">
                <Link to={mini ? "/app" : "/account"}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link to="/login">{mini ? "Sign in" : "Sign in"}</Link>
            </Button>
          )}
          {!mini ? (
            <Button asChild size="sm">
              <Link to="/app">Open Mini App</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function StoreFooter({ name }: { name: string }) {
  return (
    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      <p>
        {name} · Website, Telegram bot and Mini App ·{" "}
        <a className="hover:text-foreground" href={CHANNEL} target="_blank" rel="noreferrer">
          @ebankenroll
        </a>
      </p>
    </footer>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
}) {
  return (
    <div className="panel vault-gradient p-4 text-center">
      <Icon className="mx-auto size-5 text-primary" />
      <p className="font-display mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

export function CategoryCard({
  category,
  to = "/shop",
}: {
  category: PublicCategory;
  to?: "/shop" | "/app";
}) {
  return (
    <article className="panel overflow-hidden">
      <div className="vault-gradient aspect-video w-full overflow-hidden">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={`${category.name} category`}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Layers className="size-8 text-primary/70" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {category.description ?? "Verified items ready for instant delivery."}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">
            {category.products} {category.products === 1 ? "product" : "products"}
          </span>
          <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">
            {category.fileProducts > 0 && category.stock === 0
              ? "Unlimited"
              : `${category.stock} in stock`}
          </span>
        </div>
        <Button asChild size="sm" className="mt-1 w-full">
          {to === "/app" ? (
            <Link to="/app" search={{ category: category.id }}>
              View products
            </Link>
          ) : (
            <Link to="/shop" search={{ category: category.id }}>
              View products
            </Link>
          )}
        </Button>
      </div>
    </article>
  );
}

export function ProductCard({
  product,
  onAdd,
  busy,
  signedIn,
}: {
  product: PublicProduct;
  onAdd?: (product: PublicProduct) => void;
  busy?: boolean;
  signedIn?: boolean;
}) {
  const available = product.unlimited || product.stock > 0;
  return (
    <article className="panel flex flex-col overflow-hidden">
      <div className="vault-gradient aspect-video overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Package className="size-8 text-primary/70" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold">{product.name}</h2>
          {product.is_featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
              <Sparkles className="size-3" /> Featured
            </span>
          ) : null}
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {product.description ?? "Instant delivery after checkout."}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl tabular-nums">{money(product.price)}</span>
          <span className="text-xs text-muted-foreground">
            {stockLabel(product.stock, product.unlimited)}
          </span>
        </div>
        {onAdd ? (
          <Button size="sm" disabled={busy || !available} onClick={() => onAdd(product)}>
            {!available ? "Out of stock" : signedIn ? "Add to cart" : "Sign in to buy"}
          </Button>
        ) : (
          <Button asChild size="sm" disabled={!available}>
            <Link to="/login">{!available ? "Out of stock" : "Sign in to buy"}</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

export function WhyGrid() {
  const items = [
    { icon: Timer, title: "Instant delivery", body: "Keys and files land in your account seconds after checkout." },
    { icon: ShieldCheck, title: "Verified stock", body: "Every item is checked before it is listed for sale." },
    { icon: Truck, title: "Always restocked", body: "New inventory added daily across every category." },
    { icon: Send, title: "Real support", body: "Talk to a human on Telegram whenever you need help." },
    { icon: ShoppingBag, title: "Buy your way", body: "Use the website or the Mini App with the same catalog." },
    { icon: Wallet, title: "Crypto balance", body: "Top up with BTC, USDT or USDC and spend instantly." },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="panel p-5">
          <item.icon className="size-5 text-primary" />
          <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
