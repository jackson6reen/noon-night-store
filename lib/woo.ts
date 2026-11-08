import { cacheLife } from "next/cache";
import { PRODUCTS, type Product } from "./products";

/**
 * WooCommerce compatibility layer.
 *
 * With WOOCOMMERCE_URL unset, the store runs on the local catalog in lib/products.ts.
 * Once it is set (e.g. https://shop.noonnight.com), prices, stock and images come
 * from WooCommerce's public Store API, matched to local products by SKU.
 * Rich copy (benefits, how-to-use) stays in lib/products.ts.
 * Import woocommerce/products.csv into WooCommerce so the SKUs match.
 */
const WOO_URL = process.env.WOOCOMMERCE_URL?.replace(/\/$/, "");

type WooStoreProduct = {
  id: number;
  sku: string;
  name: string;
  prices: { price: string; regular_price: string; currency_minor_unit: number };
  images: { src: string }[];
  is_in_stock: boolean;
};

async function fetchWooProducts(): Promise<WooStoreProduct[]> {
  if (!WOO_URL) return [];
  try {
    const res = await fetch(`${WOO_URL}/wp-json/wc/store/v1/products?per_page=100`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    return (await res.json()) as WooStoreProduct[];
  } catch {
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");

  const woo = await fetchWooProducts();
  if (!woo.length) return PRODUCTS;

  const bySku = new Map(woo.map((w) => [w.sku, w]));
  return PRODUCTS.map((p) => {
    const w = bySku.get(p.sku);
    if (!w) return p;
    const unit = 10 ** (w.prices.currency_minor_unit ?? 2);
    const price = Number(w.prices.price) / unit;
    const regular = Number(w.prices.regular_price) / unit;
    return {
      ...p,
      name: w.name || p.name,
      price: price || p.price,
      compareAt: regular > price ? regular : p.compareAt,
      image: w.images?.[0]?.src ?? p.image,
      inStock: w.is_in_stock,
    };
  });
}

/** Public base URL of the WooCommerce site, used by the checkout hand-off. */
export const WOO_CHECKOUT_BASE = WOO_URL ?? null;
