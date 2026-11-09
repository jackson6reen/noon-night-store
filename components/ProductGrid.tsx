import Link from "next/link";
import type { Card } from "@/lib/site";
import { Bottle } from "./Icon";
import { AddToCartButton } from "./AddToCart";

export const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/** Same structure/classes as WooCommerce's product loop, so the theme CSS applies. */
export function ProductGrid({ products, columns = 3 }: { products: Card[]; columns?: number }) {
  return (
    <div className="woocommerce">
      <ul className={`products columns-${columns}`}>
        {products.map((p) => (
          <li className="product" key={p.slug}>
            <Link href={`/product/${p.slug}`} className="woocommerce-LoopProduct-link">
              <span className="nn-placeholder"><Bottle label={p.name} accent={p.accent} /></span>
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
