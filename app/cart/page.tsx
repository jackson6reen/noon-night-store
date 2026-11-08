"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { CartLines, ShippingMeter } from "@/components/CartDrawer";

export default function CartPage() {
  const { lines, subtotal, ready } = useCart();
  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl">Your cart</h1>
      {!ready ? null : lines.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-sand p-10 text-center">
          <p className="text-ink/70">Your cart is empty.</p>
          <Link href="/shop" className="btn btn-night mt-6">Shop the lines</Link>
        </div>
      ) : (
        <>
          <div className="mt-8"><ShippingMeter /></div>
          <div className="mt-4"><CartLines /></div>
          <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-6 text-xl">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn btn-night mt-6 w-full">Continue to checkout</Link>
        </>
      )}
    </section>
  );
}
