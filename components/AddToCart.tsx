"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

export function AddToCart({
  product,
  withQty = false,
  label = "Add to cart",
  className = "",
}: {
  product: Pick<Product, "slug" | "sku" | "name" | "price" | "line" | "inStock">;
  withQty?: boolean;
  label?: string;
  className?: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (!product.inStock)
    return (
      <button disabled className={`btn btn-muted ${className}`}>
        Sold out
      </button>
    );

  return (
    <div className={`flex items-stretch gap-3 ${className}`}>
      {withQty && (
        <div className="flex items-center rounded-full border border-ink/15 bg-white">
          <button aria-label="Decrease quantity" className="px-4 py-3 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-6 text-center tabular-nums" aria-live="polite">{qty}</span>
          <button aria-label="Increase quantity" className="px-4 py-3 text-lg" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
      )}
      <button
        className={`btn ${product.line === "noon" ? "btn-sun" : "btn-night"} flex-1`}
        onClick={() =>
          add({ slug: product.slug, sku: product.sku, name: product.name, price: product.price, line: product.line }, qty)
        }
      >
        {label}
      </button>
    </div>
  );
}
