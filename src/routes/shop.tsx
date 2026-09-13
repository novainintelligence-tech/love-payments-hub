import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { addToCart, shopCatalog } from "@/lib/store/functions";
import { getStoreToken } from "@/lib/store/session";
import { Button } from "@/components/ui/button";
import { ChannelStrip, ProductCard, SiteHeader, StoreFooter } from "@/components/store-chrome";
import { useStoreSession } from "@/components/store-session";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { category?: number } => {
    const raw = search.category;
    if (raw === undefined || raw === null || raw === "") return {};
    const category = Number(raw);
    return Number.isFinite(category) ? { category } : {};
  },
  loader: () => shopCatalog(),
  component: Shop,
});

function Shop() {
  const data = Route.useLoaderData();
  const { category } = Route.useSearch();
  const { user, refresh } = useStoreSession();
  const [busy, setBusy] = useState(false);
  const products = category
    ? data.products.filter((product) => product.category_id === category)
    : data.products;

  return (
    <div className="min-h-screen">
      <ChannelStrip />
      <SiteHeader storeName="Enroll Log" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">All products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live stock counts from unsold keys. File products show as unlimited.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="sm" variant={category ? "outline" : "default"}>
            <Link to="/shop">All</Link>
          </Button>
          {data.categories.map((item) => (
            <Button key={item.id} asChild size="sm" variant={category === item.id ? "default" : "outline"}>
              <Link to="/shop" search={{ category: item.id }}>
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
              signedIn={Boolean(user)}
              busy={busy}
              onAdd={async (item) => {
                if (!user) {
                  window.location.href = "/login";
                  return;
                }
                setBusy(true);
                try {
                  await addToCart({ data: { token: getStoreToken(), productId: item.id } });
                  await refresh();
                  toast.success(`${item.name} added to your cart.`);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not add to cart");
                } finally {
                  setBusy(false);
                }
              }}
            />
          ))}
          {!products.length ? (
            <p className="text-sm text-muted-foreground">Nothing listed in this category yet.</p>
          ) : null}
        </div>
      </main>
      <StoreFooter name="Enroll Log" />
    </div>
  );
}
