"use client";

import { useSearchParams } from "next/navigation";
import type { Card } from "@/lib/site";
import { ProductGrid } from "./ProductGrid";

export function ShopSearch({ cards }: { cards: Card[] }) {
  const q = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  const list = q ? cards.filter((c) => `${c.name} ${c.tagline}`.toLowerCase().includes(q)) : cards;
  return (
    <>
      {q && <p className="woocommerce-result-count">{list.length} result{list.length === 1 ? "" : "s"} for &quot;{q}&quot;</p>}
      {list.length ? <ProductGrid products={list} /> : <p>No products match. Try &quot;sleep&quot;, &quot;cramps&quot; or &quot;bloating&quot;.</p>}
    </>
  );
}
