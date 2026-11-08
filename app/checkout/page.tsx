import type { Metadata } from "next";
import { WOO_CHECKOUT_BASE } from "@/lib/woo";
import { CheckoutView } from "@/components/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">Checkout</h1>
      <CheckoutView wooBase={WOO_CHECKOUT_BASE} />
    </section>
  );
}
