import type { Metadata } from "next";
import { getBusiness } from "@/lib/site";
import { CheckoutPanel } from "@/components/Cart";

export const metadata: Metadata = { title: "Checkout" };

/**
 * Payments happen on WooCommerce (Stripe). When WOOCOMMERCE_URL is set in Vercel,
 * the cart is handed to WooCommerce via the noon-night-bridge plugin (/?nn_cart=SKU:QTY,...).
 */
const WOO = process.env.WOOCOMMERCE_URL?.replace(/\/$/, "") ?? null;

export default function CheckoutPage() {
  const b = getBusiness();
  return (
    <main id="main" className="nn-main">
      <div className="nn-container">
        <header className="nn-page-head"><h1>Checkout</h1></header>
        <CheckoutPanel wooBase={WOO} freeShipMin={Number(b.free_ship_min)} flat={Number(b.flat_shipping)} />
      </div>
    </main>
  );
}
