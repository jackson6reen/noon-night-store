"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CartSummary } from "./Cart";

export function CartPageView({ freeShipMin }: { freeShipMin: number }) {
  const { lines, ready } = useCart();
  if (!ready) return null;
  if (!lines.length)
    return <div className="nn-drawer__empty"><p>Your cart is empty.</p><Link href="/shop/" className="nn-btn">Shop all</Link></div>;
  return (
    <div className="nn-store-page">
      <CartSummary freeShipMin={freeShipMin} />
      <Link href="/checkout/" className="nn-btn nn-btn--accent nn-btn--lg nn-btn--block" style={{ marginTop: 20 }}>Proceed to checkout</Link>
    </div>
  );
}
