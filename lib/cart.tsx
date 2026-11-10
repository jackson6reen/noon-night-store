"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  slug: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  /** Accent color (label color of the bottle). */
  line: string;
  image?: string;
  /** Bundles are already discounted, so they don't count toward "buy 2, get 1 free". */
  isBundle?: boolean;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** Value of the free formulas (every 3rd single formula, cheapest first). */
  discount: number;
  freeCount: number;
  total: number;
  ready: boolean;
  add: (item: Omit<CartLine, "qty">, qty?: number, openDrawer?: boolean) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "evenly-cart-v1";

/**
 * Same rule as the WordPress plugin (evenly-core/includes/offer.php):
 * for every 3 single formulas in the cart, the cheapest one is free.
 */
export function offerDiscount(lines: Pick<CartLine, "price" | "qty" | "isBundle">[]) {
  const units = lines.filter((l) => !l.isBundle).flatMap((l) => Array(l.qty).fill(l.price) as number[]).sort((a, b) => a - b);
  const freeCount = Math.floor(units.length / 3);
  return { freeCount, discount: units.slice(0, freeCount).reduce((n, p) => n + p, 0) };
}

export function CartProvider({ children, offer = true }: { children: React.ReactNode; offer?: boolean }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // The saved cart lives in localStorage, which only exists after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((item: Omit<CartLine, "qty">, qty = 1, openDrawer = true) => {
    setLines((prev) => {
      const hit = prev.find((l) => l.slug === item.slug);
      if (hit) return prev.map((l) => (l.slug === item.slug ? { ...l, ...item, qty: l.qty + qty } : l));
      return [...prev, { ...item, qty }];
    });
    if (openDrawer) setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.slug !== slug) : prev.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((slug: string) => setLines((p) => p.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
    const { discount, freeCount } = offer ? offerDiscount(lines) : { discount: 0, freeCount: 0 };
    return { lines, count, subtotal, discount, freeCount, total: subtotal - discount, ready, add, setQty, remove, clear, open, setOpen };
  }, [lines, ready, add, setQty, remove, clear, open, offer]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

/** WooCommerce hand-off URL, handled by the evenly-core plugin (includes/offer.php). */
export function wooCheckoutUrl(base: string, lines: CartLine[]) {
  const items = lines.map((l) => `${encodeURIComponent(l.sku)}:${l.qty}`).join(",");
  return `${base}/?nn_cart=${items}`;
}
