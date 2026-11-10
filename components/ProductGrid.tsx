import Link from "next/link";
import type { Card } from "@/lib/site";
import { AddToCartButton } from "./AddToCart";

export const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/** Same structure/classes as WooCommerce's product loop, so the theme CSS applies. */
export function ProductGrid({ products, columns = 3, offerLabel }: { products: Card[]; columns?: number; offerLabel?: string }) {
  return (
    <div className="woocommerce">
      <ul className={`products columns-${columns}`}>
        {products.map((p) => (
          <li className="product" key={p.slug}>
            {p.isBundle ? <span className="nn-badge nn-badge--ink ev-card-badge">Bundle</span> : offerLabel ? <span className="nn-badge ev-card-badge">{offerLabel}</span> : null}
            <Link href={`/product/${p.slug}/`} className="woocommerce-LoopProduct-link">
              <img className="ev-card-img" src={p.image} alt={p.name} loading="lazy" width={600} height={600} />
              <h2 className="woocommerce-loop-product__title">{p.name}</h2>
            </Link>
            <p className="nn-card-tagline">{p.tagline}</p>
            <span className="price">{usd(p.price)}</span>
            <AddToCartButton product={p} className="button" />
          </li>
        ))}
      </ul>
    </div>
  );
}
