import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts } from "@/lib/woo";
import { FDA_DISCLAIMER, PRODUCTS, findProduct, formatPrice } from "@/lib/products";
import { ProductVisual } from "@/components/ProductVisual";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = findProduct(slug);
  return p ? { title: p.name, description: p.shortDescription } : {};
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const products = await getProducts();
  const product = findProduct(slug, products);
  if (!product) notFound();

  const included = product.includes?.map((s) => findProduct(s, products)).filter(Boolean) ?? [];
  const related = products
    .filter((p) => p.slug !== product.slug && p.needs.some((n) => product.needs.includes(n)))
    .slice(0, 3);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-2">
        <ProductVisual product={product} large />
        <div>
          <nav className="text-sm text-ink/50">
            <Link href="/shop" className="hover:underline">Shop</Link> /{" "}
            <Link href={`/shop?line=${product.line}`} className="capitalize hover:underline">{product.line === "bundle" ? "Kits" : `${product.line} line`}</Link>
          </nav>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-lg text-ink/70">{product.tagline}</p>
          <p className="mt-6 text-3xl tabular-nums">
            {product.compareAt && <s className="mr-3 text-xl text-ink/40">{formatPrice(product.compareAt)}</s>}
            {formatPrice(product.price)}
            <span className="ml-3 text-sm text-ink/50">{product.format}</span>
          </p>
          <p className="mt-6 leading-relaxed text-ink/80">{product.description}</p>
          <ul className="mt-6 space-y-2">
            {product.benefits.map((b) => (
              <li key={b} className="flex gap-2"><span className="text-sun-deep">✓</span>{b}</li>
            ))}
          </ul>
          <AddToCart product={product} withQty className="mt-8" />
          <p className="mt-4 text-sm text-ink/60">Free U.S. shipping over $50 · 30-Night Rest-Easy Guarantee</p>

          <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
            <details className="group py-4" open>
              <summary className="cursor-pointer list-none font-semibold">How to use</summary>
              <p className="mt-3 text-ink/75">{product.howToUse}</p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer list-none font-semibold">Key ingredients</summary>
              <ul className="mt-3 list-disc pl-5 text-ink/75">
                {product.ingredients.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer list-none font-semibold">Quality &amp; shipping</summary>
              <p className="mt-3 text-ink/75">
                Made in FDA-registered, cGMP-certified facilities and shipped from the U.S., usually within 1–3 business days.
                Check with your doctor before use if you&apos;re pregnant, nursing, on medication or have a medical condition.
              </p>
            </details>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-ink/50">{FDA_DISCLAIMER}</p>
        </div>
      </section>

      {included.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="font-display text-3xl">What&apos;s in the kit</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((p) => <ProductCard key={p!.slug} product={p!} />)}
          </div>
        </section>
      )}

      {related.length > 0 && !included.length && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="font-display text-3xl">Pairs well with</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
