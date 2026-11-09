"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import type { Card } from "@/lib/site";

type Item = Pick<Card, "slug" | "sku" | "name" | "price" | "accent">;

export function AddToCartButton({ product, className = "", label = "Add to cart" }: { product: Item; className?: string; label?: string }) {
  const { add } = useCart();
  return (
    <button type="button" className={className} aria-label={`Add to cart: “${product.name}”`}
      onClick={() => add({ slug: product.slug, sku: product.sku, name: product.name, price: product.price, line: product.accent })}>
      {label}
    </button>
  );
}

/** Product-page form: quantity + add to cart, plus a mobile sticky bar while the button is off-screen. */
export function AddToCartForm({ product, priceLabel }: { product: Item; priceLabel: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [sticky, setSticky] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!btn.current || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(btn.current);
    return () => io.disconnect();
  }, []);

  const submit = () => add({ slug: product.slug, sku: product.sku, name: product.name, price: product.price, line: product.accent }, qty);

  return (
    <>
      <form className="cart" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="quantity">
          <label className="screen-reader-text" htmlFor="nn-qty">Quantity</label>
          <input id="nn-qty" type="number" min={1} max={99} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} />
        </div>
        <button ref={btn} type="submit" className="single_add_to_cart_button button alt">Add to cart</button>
      </form>
      {sticky && (
        <div className="nn-sticky-atc">
          <span className="nn-sticky-atc__name">{product.name}</span>
          <span className="nn-sticky-atc__price">{priceLabel}</span>
          <button type="button" className="nn-btn" onClick={submit}>Add to cart</button>
        </div>
      )}
    </>
  );
}
