import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bundleInfo, FDA_DISCLAIMER, getBusiness, getConcern, getOffer, getProduct, getProducts, img, labelVerified, manufacturingVerified, toCard, verifiedFormat } from "@/lib/site";
import { AddToCartForm, TrackViewItem } from "@/components/AddToCart";
import { ProductGrid, usd } from "@/components/ProductGrid";
import { Faq } from "@/components/Faq";

/** Only the slugs from wordpress/setup exist; anything else is a real 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.short.replace(/\*/g, ""),
    alternates: { canonical: `/product/${p.slug}/` },
    openGraph: { title: p.name, description: p.short.replace(/\*/g, ""), images: [{ url: img(p.image), width: 1000, height: 1000, alt: `${p.name} (packaging render)` }] },
  };
}

const PENDING = <span className="ev-pending">Pending final label</span>;

/** Product page: decision info above the fold, full transparency in accordions below. */
export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const b = getBusiness();
  const card = toCard(p);
  const verified = labelVerified(p);
  const format = verifiedFormat(p);
  const bundle = p.isBundle ? bundleInfo(p) : null;
  const cats = p.concerns.map(getConcern).filter(Boolean);
  const needs = cats.filter((c) => c!.slug !== "bundles");
  const primary = needs[0] ?? cats[0];
  const offer = getOffer();
  const related = getProducts()
    .filter((x) => x.slug !== p.slug && x.isBundle === p.isBundle && x.concerns.some((c) => p.concerns.includes(c) && c !== "bundles"))
    .slice(0, 3)
    .map(toCard);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    image: img(p.image),
    description: p.short.replace(/\*/g, ""),
    brand: { "@type": "Brand", name: "evenly" },
    offers: { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock" },
  };

  return (
    <main id="main" className="nn-main nn-shop woocommerce single-product">
      <TrackViewItem product={{ sku: p.sku, name: p.name, price: p.price }} />
      <div className="nn-container">
        <nav className="nn-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true"> / </span>
          {primary && <><Link href={`/product-category/${primary.slug}/`}>{primary.name}</Link><span aria-hidden="true"> / </span></>}
          <span aria-current="page">{p.name}</span>
        </nav>
        <div className="product">
          <div className="woocommerce-product-gallery">
            <div className="ev-gallery">
              <img src={card.image} alt={`${p.name} (packaging render)`} width={1000} height={1000} fetchPriority="high" />
              {bundle?.items.slice(0, 2).map((i) => <img key={i.sku} src={img(i.image)} alt={`${i.name} (packaging render)`} width={500} height={500} loading="lazy" decoding="async" />)}
              {!bundle && primary && <img src={img(primary.image)} alt="" width={500} height={500} loading="lazy" decoding="async" />}
              {!bundle && <img src={img("lineup-960.webp")} alt="The evenly range (packaging render)" width={500} height={500} loading="lazy" decoding="async" />}
              <p className="ev-render-note">Bottle images are packaging renders. The final printed label is still in approval.</p>
            </div>
          </div>

          <div className="summary entry-summary">
            <h1 className="product_title entry-title">{p.name}</h1>
            <p className="nn-tagline">{p.tagline}</p>
            <p className="price">{usd(p.price)}</p>
            {format && <p className="nn-format">{format}</p>}
            {bundle && bundle.items.length > 0 && (
              <div className="nn-bundle">
                <p className="nn-bundle__title">What&apos;s in the kit</p>
                <ul>{bundle.items.map((i) => <li key={i.sku}><Link href={`/product/${i.slug}/`}>{i.name}</Link> <span>{usd(i.price)}</span></li>)}</ul>
                {bundle.saving > 0 && <p className="nn-bundle__save">Worth {usd(bundle.value)} separately. <strong>You save {usd(bundle.saving)}.</strong></p>}
              </div>
            )}
            <ul className="nn-benefits">{p.benefits.slice(0, 3).map((x) => <li key={x}>{x}</li>)}</ul>
            {!p.isBundle && offer.enabled && (
              <p className="ev-offer-note"><span className="nn-badge">{offer.label}</span> <span>Add any 3 formulas and <strong>the lowest-priced one is free</strong>. Applied in your cart.</span></p>
            )}
            <AddToCartForm product={card} priceLabel={usd(p.price)} />
            <ul className="ev-ship-note">
              <li>Free US shipping over ${b.free_ship_min}. Otherwise ${Number(b.flat_shipping).toFixed(2)}.</li>
              <li>First order covered by our <Link href="/refund-policy/">{b.guarantee_days}-day money-back guarantee</Link>.</li>
            </ul>
            <p className="nn-fda nn-fda--product">{FDA_DISCLAIMER}</p>
          </div>

          <div className="ev-details">
            {(p.who_for?.length || needs.length > 0) && (
              <details open>
                <summary>Who it&apos;s for</summary>
                <div className="ev-details__body">
                  {p.who_for?.length ? <ul className="nn-benefits">{p.who_for.map((x) => <li key={x}>{x}</li>)}</ul> : null}
                  {needs.length > 0 && (
                    <p className="nn-small">Part of: {needs.map((c, i) => <span key={c!.slug}>{i ? ", " : ""}<Link href={`/product-category/${c!.slug}/`}>{c!.name}</Link></span>)}</p>
                  )}
                </div>
              </details>
            )}

            <details open={!p.isBundle}>
              <summary>{bundle ? "What's in the kit" : "Ingredients & amounts"}</summary>
              <div className="ev-details__body">
                {bundle ? (
                  <ul>{bundle.items.map((i) => <li key={i.sku}><Link href={`/product/${i.slug}/`}>{i.name}</Link>: see its page for ingredients and amounts.</li>)}</ul>
                ) : (
                  <>
                    <table className="nn-ingredients">
                      <thead><tr><th scope="col">Ingredient</th><th scope="col">Per serving</th><th scope="col">Why it&apos;s here</th></tr></thead>
                      <tbody>
                        {p.ingredients?.map(([n, d, w]) => (
                          <tr key={n}><td>{n}</td><td>{verified ? d : PENDING}</td><td>{w}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="nn-small">
                      <strong>Supplement Facts:</strong> a photo of the printed panel will be added with the final label.
                      {!verified && " Amounts are published only from the verified label."}
                      {manufacturingVerified() && " Made in the USA in a cGMP-certified facility."}
                    </p>
                  </>
                )}
              </div>
            </details>

            <details>
              <summary>How to take</summary>
              <div className="ev-details__body">
                {verified ? <p>{p.how_to_use}</p> : <p>{PENDING} Directions will match the printed label exactly.</p>}
              </div>
            </details>

            <details>
              <summary>Safety & who should not take it</summary>
              <div className="ev-details__body">
                {bundle ? (
                  <p>Each formula in this kit has its own warnings. Please read the Safety section on each product page before starting.</p>
                ) : (
                  <p>{p.warnings}</p>
                )}
                <p className="nn-small">Supplements are not a substitute for medical care. If your symptoms are severe, sudden, or getting worse, please see a doctor.</p>
              </div>
            </details>

            <details>
              <summary>About this {bundle ? "kit" : "formula"}</summary>
              <div className="ev-details__body" dangerouslySetInnerHTML={{ __html: p.description }} />
            </details>

            {p.faq?.length ? (
              <details>
                <summary>FAQ</summary>
                <div className="ev-details__body"><Faq items={p.faq} schema={false} /></div>
              </details>
            ) : null}
          </div>

          {related.length > 0 && primary && (
            <section className="related products" aria-labelledby="ev-related">
              <h2 id="ev-related">More in {primary.name}</h2>
              <p className="nn-small">Browsing suggestions, not a recommendation to combine supplements. Ask your doctor before taking more than one.</p>
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
