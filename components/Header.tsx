"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-display text-xl tracking-tight ${light ? "text-cream" : "text-ink"}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#1F2150" />
        <path d="M16 1a15 15 0 0 1 0 30z" fill="#E9A23B" />
        <circle cx="16" cy="16" r="6" fill="#FBF6EE" />
      </svg>
      Noon<span className="text-sun-deep">·</span>Night
    </span>
  );
}

export function Header() {
  const { count, ready, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <div className="bg-night px-4 py-2 text-center text-xs tracking-wide text-cream">
        Free U.S. shipping over $50 · 30-Night Rest-Easy Guarantee
      </div>
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" aria-label="Noon Night home">
          <Logo />
        </Link>
        <div className="flex items-center gap-5 text-sm sm:gap-8">
          <Link href="/shop" className="hover:text-sun-deep">Shop</Link>
          <Link href="/reset" className="hidden hover:text-sun-deep sm:inline">The 24-Hour Reset</Link>
          <button
            onClick={() => setOpen(true)}
            className="relative rounded-full bg-ink px-4 py-2 text-cream"
            aria-label={`Open cart, ${count} items`}
          >
            Cart
            {ready && count > 0 && (
              <span className="ml-2 rounded-full bg-sun px-2 py-0.5 text-xs font-semibold text-ink tabular-nums">{count}</span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
