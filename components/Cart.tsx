"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, wooCheckoutUrl } from "@/lib/cart";
import { Bottle, Icon } from "./Icon";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function ShippingBar({ min }: { min: number }) {
  const { subtotal } = useCart();
  const left = Math.max(0, min - subtotal);
  const pct = Math.min(100, Math.round((subtotal / min) * 100));
  return (
    <div className="nn-ship-bar" role="status">
      <p>{left > 0 ? <>You&apos;re {usd(left)} away from free shipping</> : <>You unlocked free US shipping</>}</p>
      <div className="nn-ship-bar__track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function CartLines() {
  const { lines, setQty, remove } = useCart();
  return (
    <ul className="nn-cart-lines">
      {lines.map((l) => (
        <li key={l.slug}>
          <span className="nn-cart-lines__img"><Bottle label={l.name} accent={l.line} /></span>
          <div className="nn-cart-lines__body">
            <div className="nn-cart-lines__top">
              <Link href={`/product/${l.slug}`}>{l.name}</Link>
              <span>{usd(l.price * l.qty)}</span>
            </div>
            <div className="nn-cart-lines__qty">
              <button type="button" aria-label={`Decrease ${l.name}`} onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
              <span aria-live="polite">{l.qty}</span>
              <button type="button" aria-label={`Increase ${l.name}`} onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
              <button type="button" className="nn-link-btn" onClick={() => remove(l.slug)}>Remove</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer({ freeShipMin }: { freeShipMin: number }) {
  const { open, setOpen, lines, subtotal } = useCart();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className={`nn-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="nn-drawer__backdrop" onClick={() => setOpen(false)} />
      <aside className="nn-drawer__panel" role="dialog" aria-label="Your cart">
        <div className="nn-drawer__head">
          <h2>Your cart</h2>
          <button type="button" className="nn-icon-btn" onClick={() => setOpen(false)}><Icon name="close" /><span className="screen-reader-text">Close cart</span></button>
        </div>
        {lines.length === 0 ? (
          <div className="nn-drawer__empty">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="nn-btn" onClick={() => setOpen(false)}>Shop all</Link>
          </div>
        ) : (
          <>
            <ShippingBar min={freeShipMin} />
            <div className="nn-drawer__lines"><CartLines /></div>
            <div className="nn-drawer__foot">
              <p className="nn-drawer__total"><span>Subtotal</span><span>{usd(subtotal)}</span></p>
              <Link href="/checkout" className="nn-btn nn-btn--lg nn-btn--block" onClick={() => setOpen(false)}>Checkout</Link>
              <Link href="/cart" className="nn-drawer__view" onClick={() => setOpen(false)}>View cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function CheckoutPanel({ wooBase, freeShipMin, flat }: { wooBase: string | null; freeShipMin: number; flat: number }) {
  const { lines, subtotal, ready } = useCart();
  const [ack, setAck] = useState(false);
  const [error, setError] = useState(false);
  if (!ready) return null;
  if (!lines.length) return <div className="nn-drawer__empty"><p>Your cart is empty.</p><Link href="/shop" className="nn-btn">Shop all</Link></div>;
  const shipping = subtotal >= freeShipMin ? 0 : flat;

  return (
    <div className="nn-checkout">
      <div><h2>Order summary</h2><CartLines /></div>
      <aside className="nn-checkout__box">
        <dl>
          <div><dt>Subtotal</dt><dd>{usd(subtotal)}</dd></div>
          <div><dt>Shipping (US)</dt><dd>{shipping ? usd(shipping) : "Free"}</dd></div>
          <div><dt>Tax</dt><dd>At payment</dd></div>
          <div className="nn-checkout__total"><dt>Estimated total</dt><dd>{usd(subtotal + shipping)}</dd></div>
        </dl>
        <label className="nn-safety-ack">
          <input type="checkbox" checked={ack} onChange={(e) => { setAck(e.target.checked); setError(false); }} />{" "}
          I have read the product warnings and the <a href="/medical-disclaimer" target="_blank">health disclaimer</a>. I will check with my doctor if I am pregnant, nursing, taking medication or have a medical condition.
        </label>
        {error && <p className="nn-form-error" role="alert">Please confirm you have read the product warnings.</p>}
        {wooBase ? (
          <button type="button" className="nn-btn nn-btn--lg nn-btn--block" onClick={() => (ack ? (window.location.href = wooCheckoutUrl(wooBase, lines)) : setError(true))}>
            Secure checkout
          </button>
        ) : (
          <div className="nn-callout">
            <p><strong>Preview store.</strong> Payments run on the WooCommerce site. Set <code>WOOCOMMERCE_URL</code> in Vercel to send this cart there.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
