import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { AddToCart } from "./AddToCart";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductVisual product={product} />
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl">{product.name}</h3>
          <p className="shrink-0 tabular-nums">
            {product.compareAt && <s className="mr-2 text-ink/40">{formatPrice(product.compareAt)}</s>}
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="mt-1 text-sm text-ink/65">{product.tagline}</p>
      </Link>
      <AddToCart product={product} className="mt-4" />
    </article>
  );
}
