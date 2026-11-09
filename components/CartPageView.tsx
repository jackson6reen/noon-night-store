"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CartLines, ShippingBar } from "./Cart";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function CartPageView({ freeShipMin }: { freeShipMin: number }) {
  const { lines, subtotal, ready } = useCart();
  if (!ready) return null;
  if (!lines.length)
    return <div className="nn-drawer__empty"><p>Your cart is empty.</p><Link href="/shop" className="nn-btn">Shop all</Link></div>;
  return (
    <div className="nn-store-page">
      <ShippingBar min={freeShipMin} />
      <CartLines />
      <p className="nn-drawer__total" style={{ marginTop: 20 }}><span>Subtotal</span><span>{usd(subtotal)}</span></p>
      <Link href="/checkout" className="nn-btn nn-btn--lg nn-btn--block">Proceed to checkout</Link>
    </div>
  );
}
