import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bundleInfo, FDA_DISCLAIMER, getBusiness, getConcern, getOffer, getProduct, getProducts, img, toCard } from "@/lib/site";
import { AddToCartForm } from "@/components/AddToCart";
import { ProductTabs } from "@/components/ProductTabs";
import { ProductGrid, usd } from "@/components/ProductGrid";
import { Faq } from "@/components/Faq";

/** Only the slugs from wordpress/setup exist; anything else is a real 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** Mirrors the WooCommerce single product + evenly-core product fields and tabs. */
export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const b = getBusiness();
  const card = toCard(p);
  const bundle = p.isBundle ? bundleInfo(p) : null;
  const cats = p.concerns.map(getConcern).filter(Boolean);
  const primary = cats[0];
  const offer = getOffer();
  const lifestyle = (primary && primary.slug !== "bundles" ? primary : cats.find((c) => c && c.slug !== "bundles")) ?? primary;
  const related = getProducts().filter((x) => x.slug !== p.slug && x.concerns.some((c) => p.concerns.includes(c))).slice(0, 3).map(toCard);

  const tabs = [
    { id: "description", title: "Description", content: <><h2>Description</h2><div dangerouslySetInnerHTML={{ __html: p.description }} /></> },
    { id: "how", title: "How to take", content: <><h2>How to take</h2><p>{p.how_to_use}</p></> },
    ...(p.ingredients?.length ? [{ id: "ingredients", title: "Ingredients", content: (
      <>
        <h2>What&apos;s inside, and why</h2>
        <table className="nn-ingredients">
          <thead><tr><th scope="col">Ingredient</th><th scope="col">Per serving</th><th scope="col">Why it&apos;s here</th></tr></thead>
          <tbody>{p.ingredients.map(([n, d, w]) => <tr key={n}><td>{n}</td><td>{d}</td><td>{w}</td></tr>)}</tbody>
        </table>
        <p className="nn-small">Made in the USA in an FDA-registered, cGMP-certified facility. See the Supplement Facts panel in the product photos for the full label.</p>
      </>
    ) }] : []),
    ...(p.warnings ? [{ id: "safety", title: "Safety", content: (
      <>
        <h2>Safety &amp; who should not take it</h2>
        <p>{p.warnings}</p>
        <p>Supplements are not a substitute for medical care. If your symptoms are severe, sudden, or getting worse, please see a doctor.</p>
      </>
    ) }] : []),
    ...(p.faq?.length ? [{ id: "faq", title: "FAQ", content: <><h2>Questions women ask us</h2><Faq items={p.faq} schema={false} /></> }] : []),
  ];

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.short,
    brand: { "@type": "Brand", name: "Evenly" },
    offers: { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock" },
  };

  return (
    <main id="main" className="nn-main nn-shop woocommerce single-product">
      <div className="nn-container">
        <nav className="nn-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true"> / </span>
          {primary && <><Link href={`/product-category/${primary.slug}`}>{primary.name}</Link><span aria-hidden="true"> / </span></>}
          {p.name}
        </nav>
        <div className="product">
          <div className="woocommerce-product-gallery">
            <div className="ev-gallery">
              <img src={card.image} alt={p.name} width={1000} height={1000} fetchPriority="high" />
              {bundle?.items.slice(0, 2).map((i) => <img key={i.sku} src={img(i.image)} alt={i.name} width={500} height={500} loading="lazy" />)}
              {!bundle && lifestyle && <img src={img(lifestyle.image)} alt="" width={500} height={500} loading="lazy" />}
              {!bundle && <img src={img("lineup-960.webp")} alt="The Evenly range" width={500} height={500} loading="lazy" />}
            </div>
          </div>
          <div className="summary entry-summary">
            <h1 className="product_title entry-title">{p.name}</h1>
            <p className="price">{usd(p.price)}</p>
            <p className="nn-tagline">{p.tagline}</p>
            <ul className="nn-benefits">{p.benefits.map((x) => <li key={x}>{x}</li>)}</ul>
            {bundle && bundle.items.length > 0 && (
              <div className="nn-bundle">
                <p className="nn-bundle__title">What&apos;s inside</p>
                <ul>{bundle.items.map((i) => <li key={i.sku}><Link href={`/product/${i.slug}`}>{i.name}</Link> <span>{usd(i.price)}</span></li>)}</ul>
                {bundle.saving > 0 && <p className="nn-bundle__save">Worth {usd(bundle.value)} separately. <strong>You save {usd(bundle.saving)}.</strong></p>}
              </div>
            )}
            {p.format && <p className="nn-format">{p.format}</p>}
            <div className="woocommerce-product-details__short-description"><p>{p.short}</p></div>
            {!p.isBundle && offer.enabled && (
              <p className="ev-offer-note"><span className="nn-badge">{offer.label}</span> <span>Add any 3 formulas and <strong>the cheapest is free</strong>. Applied in your cart.</span></p>
            )}
            <AddToCartForm product={card} priceLabel={usd(p.price)} />
            <ul className="nn-trust-row">
              <li>{b.guarantee_days}-day money-back guarantee</li>
              <li>Free US shipping over ${b.free_ship_min}</li>
              <li>Made in the USA · cGMP facility</li>
              <li>Secure checkout by Stripe</li>
            </ul>
            <div className="product_meta">
              SKU: {p.sku} · Categories:{" "}
              {cats.map((c, i) => <span key={c!.slug}>{i ? ", " : ""}<Link href={`/product-category/${c!.slug}`}>{c!.name}</Link></span>)}
            </div>
            <p className="nn-fda nn-fda--product">{FDA_DISCLAIMER}</p>
          </div>
          <ProductTabs tabs={tabs} />
          {related.length > 0 && (
            <section className="related products">
              <h2>You may also like</h2>
              <ProductGrid products={related} />
            </section>
          )}
        </div>
      </div>
      {p.faq?.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }).replace(/</g, "\\u003c") }} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
