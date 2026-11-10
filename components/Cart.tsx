"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart, wooCheckoutUrl } from "@/lib/cart";
import { toItem, track } from "@/lib/analytics";
import { Bottle, Icon } from "./Icon";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function ShippingBar({ min }: { min: number }) {
  const { total } = useCart();
  const left = Math.max(0, min - total);
  const pct = Math.min(100, Math.round((total / min) * 100));
  return (
    <div className="nn-ship-bar" role="status">
      <p>{left > 0 ? <>You&apos;re {usd(left)} away from free US shipping</> : <>You unlocked free US shipping</>}</p>
      <div className="nn-ship-bar__track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/** Progress toward the free formula. Informative only: one formula is a complete order too. */
export function OfferNudge() {
  const { lines, freeCount } = useCart();
  const singles = lines.filter((l) => !l.isBundle).reduce((n, l) => n + l.qty, 0);
  const toNext = 3 - (singles % 3);
  if (singles === 0) return null;
  return (
    <p className="ev-offer-note" role="status">
      {freeCount > 0 && toNext === 3
        ? <><strong>The lowest-priced formula is free.</strong> Buy 2, get 1 free is applied.</>
        : <>Add <strong>{toNext} more formula{toNext > 1 ? "s" : ""}</strong> and the lowest-priced one is free. Optional.</>}
    </p>
  );
}

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { lines, setQty, remove } = useCart();
  return (
    <ul className="nn-cart-lines">
      {lines.map((l) => (
        <li key={l.slug}>
          <span className="nn-cart-lines__img">{l.image ? <img src={l.image} alt="" width={80} height={80} /> : <Bottle label={l.name} accent={l.line} />}</span>
          <div className="nn-cart-lines__body">
            <div className="nn-cart-lines__top">
              <Link href={`/product/${l.slug}/`} onClick={onNavigate}>{l.name}</Link>
              <span>{usd(l.price * l.qty)}</span>
            </div>
            <div className="nn-cart-lines__qty">
              <button type="button" aria-label={`Decrease quantity of ${l.name}`} onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
              <span aria-live="polite" aria-label={`Quantity ${l.qty}`}>{l.qty}</span>
              <button type="button" aria-label={`Increase quantity of ${l.name}`} onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
              <button type="button" className="nn-link-btn" onClick={() => remove(l.slug)}>Remove<span className="screen-reader-text"> {l.name}</span></button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Totals({ shipping }: { shipping?: number | null }) {
  const { subtotal, discount, total } = useCart();
  return (
    <dl className="ev-totals">
      <div><dt>Subtotal</dt><dd>{usd(subtotal)}</dd></div>
      {discount > 0 && <div className="ev-totals__discount"><dt>Buy 2, get 1 free</dt><dd>−{usd(discount)}</dd></div>}
      {shipping !== undefined && <div><dt>Shipping (US)</dt><dd>{shipping ? usd(shipping) : "Free"}</dd></div>}
      <div className="ev-totals__total"><dt>Total</dt><dd>{usd(total + (shipping ?? 0))}</dd></div>
    </dl>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Side cart. Closes with the close button, Escape, a click on the backdrop, or any navigation
 * (so clicking a product inside the cart never leaves an open drawer behind). Focus is trapped
 * while open and returns to the element that opened it.
 */
export function CartDrawer({ freeShipMin }: { freeShipMin: number }) {
  const { open, setOpen, lines } = useCart();
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Close on any route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Focus management + Escape + focus trap.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const o = opener.current;
      const back = o && o !== document.body && document.contains(o) ? o : document.getElementById("ev-cart-button");
      back?.focus();
    };
  }, [open, setOpen]);

  return (
    <div className={`nn-drawer${open ? " is-open" : ""}`} inert={!open}>
      <button type="button" className="nn-drawer__backdrop" aria-label="Close cart" tabIndex={-1} onClick={close} />
      <aside ref={panel} className="nn-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="ev-cart-title">
        <div className="nn-drawer__head">
          <h2 id="ev-cart-title">Your cart</h2>
          <button type="button" className="nn-icon-btn" onClick={close}><Icon name="close" /><span className="screen-reader-text">Close cart</span></button>
        </div>
        {lines.length === 0 ? (
          <div className="nn-drawer__empty">
            <p>Your cart is empty.</p>
            <Link href="/shop/" className="nn-btn" onClick={close}>Shop all formulas</Link>
          </div>
        ) : (
          <>
            <ShippingBar min={freeShipMin} />
            <OfferNudge />
            <div className="nn-drawer__lines"><CartLines onNavigate={close} /></div>
            <div className="nn-drawer__foot">
              <Totals />
              <Link href="/checkout/" className="nn-btn nn-btn--lg nn-btn--block" onClick={close}>Checkout</Link>
              <Link href="/cart/" className="nn-drawer__view" onClick={close}>View cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function CartSummary({ freeShipMin }: { freeShipMin: number }) {
  return (
    <>
      <ShippingBar min={freeShipMin} />
      <OfferNudge />
      <CartLines />
      <Totals />
    </>
  );
}

export function CheckoutPanel({ wooBase, freeShipMin, flat }: { wooBase: string | null; freeShipMin: number; flat: number }) {
  const { lines, total, ready } = useCart();
  const [ack, setAck] = useState(false);
  const [error, setError] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ready || !lines.length || tracked.current) return;
    tracked.current = true;
    track("begin_checkout", { value: total, items: lines.map((l) => toItem(l, l.qty)) });
  }, [ready, lines, total]);

  if (!ready) return null;
  if (!lines.length) return <div className="nn-drawer__empty"><p>Your cart is empty.</p><Link href="/shop/" className="nn-btn">Shop all formulas</Link></div>;
  const shipping = total >= freeShipMin ? 0 : flat;

  return (
    <div className="nn-checkout">
      <div><h2>Order summary</h2><OfferNudge /><CartLines /></div>
      <aside className="nn-checkout__box">
        <Totals shipping={shipping} />
        <label className="nn-safety-ack">
          <input type="checkbox" checked={ack} onChange={(e) => { setAck(e.target.checked); setError(false); }} />{" "}
          I have read the product warnings and the <a href="/medical-disclaimer/" target="_blank">health disclaimer</a>. I will check with my doctor if I am pregnant, nursing, taking medication or have a medical condition.
        </label>
        {error && <p className="nn-form-error" role="alert">Please confirm you have read the product warnings.</p>}
        {wooBase ? (
          <button type="button" className="nn-btn nn-btn--lg nn-btn--block" onClick={() => (ack ? (window.location.href = wooCheckoutUrl(wooBase, lines)) : setError(true))}>
            Continue to secure payment
          </button>
        ) : (
          <div className="nn-callout">
            <p><strong>Preview store.</strong> Payment runs on the WooCommerce site. Set <code>WOOCOMMERCE_URL</code> in Vercel to send this cart there.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
