import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getConcerns, getProducts, toCard } from "@/lib/site";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopSearch } from "@/components/ShopSearch";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  const cards = getProducts().map(toCard);
  return (
    <main id="main" className="nn-main nn-shop">
      <div className="nn-container">
        <nav className="nn-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> / </span>Shop</nav>
        <header className="woocommerce-products-header"><h1 className="woocommerce-products-header__title">Shop</h1></header>
        <nav className="nn-chips" aria-label="Shop by concern">
          <Link href="/shop" aria-current="page">All</Link>
          {getConcerns(true).map((c) => <Link key={c.slug} href={`/product-category/${c.slug}`}>{c.name}</Link>)}
        </nav>
        <Suspense fallback={<ProductGrid products={cards} />}>
          <ShopSearch cards={cards} />
        </Suspense>
      </div>
    </main>
  );
}
