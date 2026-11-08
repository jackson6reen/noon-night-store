"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, wooCheckoutUrl } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/products";
import { CartLines } from "./CartDrawer";

const FLAT_SHIPPING = 5.95;

export function CheckoutView({ wooBase }: { wooBase: string | null }) {
  const { lines, subtotal, ready } = useCart();
  const [going, setGoing] = useState(false);

  if (!ready) return null;
  if (lines.length === 0)
    return (
      <div className="mt-10 rounded-3xl bg-sand p-10 text-center">
        <p className="text-ink/70">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-night mt-6">Shop the lines</Link>
      </div>
    );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  return (
    <div className="mt-8 grid gap-10 md:grid-cols-[1fr_380px]">
      <div>
        <h2 className="font-display text-2xl">Order summary</h2>
        <CartLines />
      </div>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping (U.S.)</dt><dd className="tabular-nums">{shipping ? formatPrice(shipping) : "Free"}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd className="text-ink/50">Calculated at payment</dd></div>
          <div className="flex justify-between border-t border-ink/10 pt-3 text-lg font-semibold"><dt>Estimated total</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
        </dl>

        {wooBase ? (
          <button
            className="btn btn-night mt-6 w-full"
            disabled={going}
            onClick={() => {
              setGoing(true);
              window.location.href = wooCheckoutUrl(wooBase, lines);
            }}
          >
            {going ? "Opening secure checkout…" : "Secure checkout"}
          </button>
        ) : (
          <div className="mt-6 rounded-2xl bg-sand p-4 text-sm">
            <p className="font-semibold">Checkout is opening soon.</p>
            <p className="mt-1 text-ink/70">We&apos;re finishing payment setup. Your cart is saved on this device, so you can come back and complete your order.</p>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-ink/50">Covered by the 30-Night Rest-Easy Guarantee</p>
      </aside>
    </div>
  );
}
