import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { concernColor, FDA_DISCLAIMER, getConcern, getConcerns, getProductsInConcern, toCard } from "@/lib/site";
import { ProductGrid } from "@/components/ProductGrid";
import { Faq } from "@/components/Faq";
import { Icon } from "@/components/Icon";

/** Only the slugs from wordpress/setup exist; anything else is a real 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getConcerns(true).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product-category/[slug]">): Promise<Metadata> {
  const c = getConcern((await params).slug);
  return c ? { title: { absolute: c.seoTitle }, description: c.description } : {};
}

/** Concern hub: same layout as the WooCommerce category archive + noon-night-core concern fields. */
export default async function ConcernPage({ params }: PageProps<"/product-category/[slug]">) {
  const { slug } = await params;
  const c = getConcern(slug);
  if (!c) notFound();
  const products = getProductsInConcern(slug).map(toCard);

  return (
    <main id="main" className="nn-main nn-shop">
      <div className="nn-container">
        <nav className="nn-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> / </span>{c.name}</nav>
        <header className="woocommerce-products-header">
          <h1 className="woocommerce-products-header__title page-title">{c.headline}</h1>
          <p className="nn-hub-tagline" style={{ ["--accent" as string]: concernColor(c.slug) }}><Icon name={c.icon} size={20} /> {c.tagline}</p>
          <div className="term-description"><p>{c.intro}</p></div>
        </header>
        <nav className="nn-chips" aria-label="Shop by concern">
          <Link href="/shop">All</Link>
          {getConcerns(true).map((x) => (
            <Link key={x.slug} href={`/product-category/${x.slug}`} aria-current={x.slug === slug ? "page" : undefined}>{x.name}</Link>
          ))}
        </nav>
        <ProductGrid products={products} />
        <section className="nn-hub-article" aria-label="Guide">
          <div className="nn-prose" dangerouslySetInnerHTML={{ __html: c.body }} />
          {c.faq.length > 0 && <><h2>Frequently asked questions</h2><Faq items={c.faq} /></>}
          <p className="nn-fda">{FDA_DISCLAIMER}</p>
        </section>
      </div>
    </main>
  );
}
