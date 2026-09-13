import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Layers, Package, ShoppingBag, Star, Timer } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { storefrontData } from "@/lib/store/functions";
import { Button } from "@/components/ui/button";
import {
  CategoryCard,
  ChannelStrip,
  SiteHeader,
  StatTile,
  StoreFooter,
  WhyGrid,
} from "@/components/store-chrome";

const DESCRIPTION =
  "Buy verified digital products instantly — browse the catalog, top up your balance and get your keys and files delivered the moment payment clears.";

export const Route = createFileRoute("/")({
  loader: () => storefrontData(),
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  const tiles = [
    { icon: Package, label: "Products", value: data.stats.products },
    { icon: Boxes, label: "In stock", value: data.stats.inStock },
    { icon: Layers, label: "Categories", value: data.stats.categories },
    { icon: ShoppingBag, label: "Orders", value: data.stats.orders },
    { icon: Star, label: "Reviews", value: data.stats.reviews },
    { icon: Timer, label: "Support", value: "24/7" },
  ];

  return (
    <div className="min-h-screen">
      <ChannelStrip handle={data.store.channel ?? "ebankenroll"} />
      <SiteHeader storeName={data.store.name} />

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" /> Trusted digital marketplace
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-6xl">
            Premium digital products, delivered <span className="text-primary">instantly</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{DESCRIPTION}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/shop">Browse products</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/app">Open Mini App</Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <StatTile key={tile.label} icon={tile.icon} label={tile.label} value={tile.value} />
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">Shop by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.categories.length} categories, restocked daily. Counts match live unsold inventory.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">Why shop with us</h2>
          <div className="mt-6">
            <WhyGrid />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">What customers say</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((review) => (
              <article key={review.id} className="panel flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm text-primary">
                    {review.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.product_label ?? "Verified buyer"}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <StoreFooter name={data.store.name} />
    </div>
  );
}
