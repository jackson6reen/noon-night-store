"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NEEDS, type Need, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

const LINES = [
  { key: "", label: "All" },
  { key: "noon", label: "☀ Noon (day)" },
  { key: "night", label: "☾ Night (sleep)" },
  { key: "bundle", label: "Kits" },
];

export function ShopGrid({ products }: { products: Product[] }) {
  const sp = useSearchParams();
  const line = sp.get("line") ?? "";
  const need = (sp.get("need") ?? "") as Need | "";

  const shown = products.filter((p) => (!line || p.line === line) && (!need || p.needs.includes(need)));

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${active ? "border-night bg-night text-cream" : "border-ink/15 bg-white hover:border-ink/40"}`;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {LINES.map((l) => (
          <Link key={l.key} href={l.key ? `/shop?line=${l.key}` : "/shop"} className={chip(line === l.key && !need)} scroll={false}>
            {l.label}
          </Link>
        ))}
        <span className="mx-2 hidden w-px bg-ink/15 sm:block" />
        {(Object.keys(NEEDS) as Need[]).map((n) => (
          <Link key={n} href={`/shop?need=${n}`} className={chip(need === n)} scroll={false}>
            {NEEDS[n].label}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
      {shown.length === 0 && <p className="mt-10 text-ink/60">Nothing here yet. <Link href="/shop" className="underline">See everything</Link>.</p>}
    </>
  );
}
