"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { toItem, track } from "@/lib/analytics";
import type { Card } from "@/lib/site";

type Item = Pick<Card, "slug" | "sku" | "name" | "price" | "accent" | "image" | "isBundle">;

const toLine = (p: Item) => ({ slug: p.slug, sku: p.sku, name: p.name, price: p.price, line: p.accent, image: p.image, isBundle: p.isBundle });
const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const shortName = (name: string) => name.replace(/:.*$/, "");

export function AddToCartButton({ product, className = "", label = "Add to cart" }: { product: Item; className?: string; label?: string }) {
  const { add } = useCart();
  return (
    <button type="button" className={className} aria-label={`Add ${product.name} to cart`} onClick={() => add(toLine(product))}>
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
          <input id="nn-qty" type="number" inputMode="numeric" min={1} max={99} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} />
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

/** Fires view_item once per product page view. */
export function TrackViewItem({ product }: { product: { sku: string; name: string; price: number } }) {
  useEffect(() => {
    track("view_item", { value: product.price, items: [toItem(product)] });
  }, [product.sku, product.name, product.price]);
  return null;
}

/**
 * "Build your 3": pick any three single formulas, the lowest-priced is free.
 * Same rule as the cart (lib/cart.tsx) and WordPress (evenly-core/includes/offer.php).
 */
export function BuildYour3({ products, label }: { products: Item[]; label: string }) {
  const { add } = useCart();
  const [picked, setPicked] = useState<string[]>([]);
  const chosen = picked.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Item[];
  const complete = chosen.length === 3;
  const free = complete ? [...chosen].sort((a, b) => a.price - b.price)[0] : null;
  const subtotal = chosen.reduce((n, p) => n + p.price, 0);
  const saving = free?.price ?? 0;
  const total = subtotal - saving;

  const progress = complete
    ? `3 of 3 selected. ${shortName(free!.name)} is free. You save ${usd(saving)}.`
    : `${chosen.length} of 3 selected. ${chosen.length === 0 ? "Pick any three formulas." : `Pick ${3 - chosen.length} more to get the lowest-priced one free.`}`;

  const toggle = (p: Item) => {
    if (picked.includes(p.slug)) {
      setPicked(picked.filter((s) => s !== p.slug));
    } else if (picked.length < 3) {
      track("bundle_select_item", { value: p.price, items: [toItem(p)] });
      setPicked([...picked, p.slug]);
    }
  };

  return (
    <div className="ev-build__grid">
      <fieldset className="ev-build__options">
        <legend className="screen-reader-text">Pick any 3 formulas</legend>
        {products.map((p) => {
          const isOn = picked.includes(p.slug);
          const locked = !isOn && picked.length >= 3;
          return (
            <label className="ev-pick" key={p.slug} style={locked ? { opacity: 0.55 } : undefined}>
              <input type="checkbox" checked={isOn} disabled={locked} onChange={() => toggle(p)} aria-describedby="ev-build-progress" />
              <img src={p.image} alt="" loading="lazy" decoding="async" width={400} height={400} />
              <span className="ev-pick__check" aria-hidden="true">✓</span>
              <span className="ev-pick__name">{shortName(p.name)}</span>
              <span className="ev-pick__meta">{p.name.split(": ")[1]}</span>
              <span className="ev-pick__price">{usd(p.price)}</span>
              <span className="ev-pick__state">{isOn ? "✓ Selected" : locked ? "Remove one to swap" : "+ Add to my 3"}</span>
            </label>
          );
        })}
      </fieldset>

      <aside className="ev-summary" aria-labelledby="ev-build-summary">
        <span className="nn-badge">{label}</span>
        <h3 id="ev-build-summary">Your routine</h3>
        <p className="ev-summary__rule">The lowest-priced formula is free.</p>
        <ul className="ev-summary__slots">
          {[0, 1, 2].map((i) => {
            const p = chosen[i];
            return (
              <li key={i} className={`ev-summary__slot${p && free?.slug === p.slug ? " is-free" : ""}`}>
                {p ? (
                  <>
                    <img src={p.image} alt={shortName(p.name)} width={120} height={120} />
                    <button type="button" className="ev-summary__remove" onClick={() => toggle(p)} aria-label={`Remove ${shortName(p.name)}`}>×</button>
                  </>
                ) : (
                  <span>Pick {i + 1}</span>
                )}
              </li>
            );
          })}
        </ul>
        <p id="ev-build-progress" className="ev-summary__progress" aria-live="polite">{progress}</p>
        {chosen.length > 0 && (
          <dl className="ev-summary__totals">
            <div><dt>Subtotal</dt><dd>{usd(subtotal)}</dd></div>
            {complete && <div className="ev-summary__save"><dt>You save</dt><dd>−{usd(saving)}</dd></div>}
            <div className="ev-summary__total"><dt>Total</dt><dd>{usd(total)}</dd></div>
          </dl>
        )}
        <button
          type="button"
          className="nn-btn nn-btn--lg nn-btn--block"
          aria-disabled={!complete}
          onClick={() => {
            if (!complete) return;
            track("bundle_complete", { value: total, items: chosen.map((p) => toItem(p)) });
            chosen.forEach((p, i) => add(toLine(p), 1, i === chosen.length - 1));
            setPicked([]);
          }}
        >
          {complete ? `Add my 3 to cart · ${usd(total)}` : `Pick ${3 - chosen.length} more`}
        </button>
        <p className="ev-summary__note">
          Just want one? <Link href="/shop/">Every formula is sold on its own.</Link>
        </p>
      </aside>
    </div>
  );
}
