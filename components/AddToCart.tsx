"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import type { Card } from "@/lib/site";

type Item = Pick<Card, "slug" | "sku" | "name" | "price" | "accent" | "image" | "isBundle">;

const toLine = (p: Item) => ({ slug: p.slug, sku: p.sku, name: p.name, price: p.price, line: p.accent, image: p.image, isBundle: p.isBundle });

export function AddToCartButton({ product, className = "", label = "Add to cart" }: { product: Item; className?: string; label?: string }) {
  const { add } = useCart();
  return (
    <button type="button" className={className} aria-label={`Add to cart: “${product.name}”`} onClick={() => add(toLine(product))}>
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

  const submit = () => add(toLine(product), qty);

  return (
    <>
      <form className="cart" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="quantity">
          <label className="screen-reader-text" htmlFor="nn-qty">Quantity</label>
          <input id="nn-qty" type="number" min={1} max={99} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} />
        </div>
        <button ref={btn} type="submit" className="single_add_to_cart_button button alt">Add to cart · {priceLabel}</button>
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

/** "Build your 3" picker: choose 3 formulas, the cheapest is free. */
export function BuildYour3({ products, label }: { products: Item[]; label: string }) {
  const { add } = useCart();
  const [picked, setPicked] = useState<string[]>([]);
  const chosen = picked.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);
  const sorted = [...chosen].sort((a, b) => a.price - b.price);
  const free = chosen.length === 3 ? sorted[0] : null;
  const value = chosen.reduce((n, p) => n + p.price, 0);
  const total = value - (free?.price ?? 0);
  const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const toggle = (slug: string) =>
    setPicked((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= 3 ? [...cur.slice(1), slug] : [...cur, slug]));

  return (
    <div className="ev-build__grid">
      <fieldset className="ev-build__options" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="screen-reader-text">Pick any 3 formulas</legend>
        {products.map((p) => (
          <label className="ev-pick" key={p.slug}>
            <input type="checkbox" checked={picked.includes(p.slug)} onChange={() => toggle(p.slug)} />
            <img src={p.image} alt="" loading="lazy" width={400} height={400} />
            <span className="ev-pick__check" aria-hidden="true">✓</span>
            <span className="ev-pick__name">{p.name.replace(/:.*$/, "")}</span>
            <span className="ev-pick__meta">{p.name.split(": ")[1]}</span>
            <span className="ev-pick__price">{usd(p.price)}</span>
          </label>
        ))}
      </fieldset>
      <aside className="ev-summary" aria-live="polite">
        <span className="nn-badge">{label}</span>
        <h3 style={{ marginTop: 14 }}>Your routine</h3>
        <div className="ev-summary__slots">
          {[0, 1, 2].map((i) => {
            const p = chosen[i];
            return (
              <div key={i} className={`ev-summary__slot${p && free && p.slug === free.slug ? " is-free" : ""}`}>
                {p ? <img src={p.image} alt={p.name} width={120} height={120} /> : `Pick ${i + 1}`}
              </div>
            );
          })}
        </div>
        <div className="ev-summary__row"><span>{chosen.length}/3 selected</span><span>{free ? "1 free" : `${3 - chosen.length} to go`}</span></div>
        <div className="ev-summary__row ev-summary__row--total">
          <span>Total</span>
          <span>{free && <s>{usd(value)}</s>}{usd(total)}</span>
        </div>
        <button
          type="button"
          className="nn-btn nn-btn--lg nn-btn--block"
          aria-disabled={chosen.length < 3}
          onClick={() => {
            if (chosen.length < 3) return;
            chosen.forEach((p, i) => add(toLine(p), 1, i === chosen.length - 1));
            setPicked([]);
          }}
        >
          {chosen.length < 3 ? `Pick ${3 - chosen.length} more` : "Add my 3 to cart"}
        </button>
        <p className="ev-summary__note">The cheapest formula is free. Mix and match any way you like. Covered by our 30-day guarantee.</p>
      </aside>
    </div>
  );
}
