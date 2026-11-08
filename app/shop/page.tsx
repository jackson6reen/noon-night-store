import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/woo";
import { ShopGrid } from "@/components/ShopGrid";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">Shop</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Noon by day. Night by night.</h1>
      <p className="mt-4 max-w-2xl text-ink/70">
        Pick by need, or let the 24-Hour Reset cover both ends of the clock.
      </p>
      <Suspense
        fallback={
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        }
      >
        <ShopGrid products={products} />
      </Suspense>
    </section>
  );
}
