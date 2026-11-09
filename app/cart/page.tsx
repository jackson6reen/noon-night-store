import type { Metadata } from "next";
import { getBusiness } from "@/lib/site";
import { CartPageView } from "@/components/CartPageView";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <main id="main" className="nn-main">
      <div className="nn-container nn-container--narrow">
        <header className="nn-page-head"><h1>Cart</h1></header>
        <CartPageView freeShipMin={Number(getBusiness().free_ship_min)} />
      </div>
    </main>
  );
}
