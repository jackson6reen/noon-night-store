import type { Metadata } from "next";
import { getBusiness } from "@/lib/site";
import { CheckoutPanel } from "@/components/Cart";
import { shopifyEnabled } from "@/lib/shopify";

export const metadata: Metadata = { title: "Checkout" };

/**
 * Payments: Shopify hosted checkout (Shopify Payments → Supliful fulfillment) when
 * SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN are set in Vercel (see lib/shopify.ts).
 * Legacy fallback: WooCommerce hand-off when WOOCOMMERCE_URL is set.
 */
const WOO = process.env.WOOCOMMERCE_URL?.replace(/\/$/, "") ?? null;
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const b = getBusiness();
  return (
    <main id="main" className="nn-main">
      <div className="nn-container">
        <header className="nn-page-head"><h1>Checkout</h1></header>
        <CheckoutPanel shopify={shopifyEnabled()} wooBase={WOO} freeShipMin={Number(b.free_ship_min)} flat={Number(b.flat_shipping)} />
      </div>
    </main>
  );
}
