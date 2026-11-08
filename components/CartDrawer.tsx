"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";
import { Bottle } from "./Bottle";

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lines, setQty, remove } = useCart();
  return (
    <ul className="divide-y divide-ink/10">
      {lines.map((l) => (
        <li key={l.slug} className="flex gap-4 py-4">
          <div className={`flex shrink-0 items-center justify-center rounded-xl ${l.line === "noon" ? "bg-[#FCE9C4]" : "bg-[#2E3170]"} ${compact ? "h-16 w-16" : "h-20 w-20"}`}>
            <Bottle name={l.name} line={l.line as "noon"} format="" className="h-4/5" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex justify-between gap-2">
              <Link href={`/products/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>
              <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
            </div>
            <div className="mt-auto flex items-center gap-3 pt-2 text-sm">
              <div className="flex items-center rounded-full border border-ink/15">
                <button aria-label={`Decrease ${l.name}`} className="px-3 py-1" onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
                <span className="w-5 text-center tabular-nums">{l.qty}</span>
                <button aria-label={`Increase ${l.name}`} className="px-3 py-1" onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
              </div>
              <button className="text-ink/50 underline-offset-2 hover:underline" onClick={() => remove(l.slug)}>Remove</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ShippingMeter() {
  const { subtotal } = useCart();
  const left = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  return (
    <div className="rounded-2xl bg-sand p-4 text-sm">
      <p>{left > 0 ? <>You&apos;re <b>{formatPrice(left)}</b> away from free shipping.</> : <>You&apos;ve unlocked <b>free U.S. shipping</b>.</>}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-sun-deep transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, subtotal } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-label="Your cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream p-6 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Your cart</h2>
          <button onClick={() => setOpen(false)} className="text-2xl leading-none" aria-label="Close cart">×</button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-ink/60">Your cart is empty.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-night">Shop the lines</Link>
          </div>
        ) : (
          <>
            <div className="mt-4"><ShippingMeter /></div>
            <div className="mt-2 flex-1 overflow-y-auto"><CartLines compact /></div>
            <div className="border-t border-ink/10 pt-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">Shipping and taxes calculated at checkout.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-night mt-4 w-full">Checkout</Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-sm underline underline-offset-4">View full cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
