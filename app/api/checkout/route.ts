import { NextResponse } from "next/server";
import { CheckoutError, createCheckout, shopifyEnabled } from "@/lib/shopify";

/** POST { items: [{ sku, qty }] } → { url } (Shopify hosted checkout). */
export async function POST(req: Request) {
  if (!shopifyEnabled()) return NextResponse.json({ error: "Checkout is not connected yet." }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const raw = (body as { items?: unknown })?.items;
  const items = Array.isArray(raw)
    ? raw
        .map((i) => ({ sku: String((i as { sku?: unknown })?.sku ?? ""), qty: Math.floor(Number((i as { qty?: unknown })?.qty)) }))
        .filter((i) => /^[A-Z0-9-]{2,40}$/i.test(i.sku) && i.qty > 0 && i.qty <= 20)
    : [];
  if (!items.length || items.length > 30) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  try {
    return NextResponse.json({ url: await createCheckout(items) });
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message, missing: e.missing }, { status: 409 });
    console.error("[checkout]", e);
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
