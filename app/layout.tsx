import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
// The design is shared with WordPress: one stylesheet, two front ends.
import "../wordpress/themes/evenly/assets/css/main.css";
import "../wordpress/plugins/evenly-core/assets/consent.css";
import "./preview.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/Cart";
import { ConsentBanner } from "@/components/ConsentBanner";
import { getBusiness, getConcerns, getOffer } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Heavy, extended display face (the "wdth" axis gives the wide Korrect-style look).
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" });

/**
 * The Vercel site is a PREVIEW of the WordPress store. It is kept out of Google
 * by default so it never competes with the real site's organic rankings.
 * Set SITE_INDEXABLE=1 in Vercel only if this ever becomes the live store.
 */
const indexable = process.env.SITE_INDEXABLE === "1";

export const metadata: Metadata = {
  title: { default: "Evenly | Supplements for Sleep, Period Cramps & Bloating", template: "%s – Evenly" },
  description:
    "Clean, honest supplements for sleep, period cramps, bloating and stress, made for women. Buy 2, get 1 free. 30-day money-back guarantee.",
  robots: indexable ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const business = getBusiness();
  const nav = [
    ...getConcerns(true).map((c) => ({ label: c.menu_label, href: `/product-category/${c.slug}/` })),
    { label: "Journal", href: "/journal/" },
  ];
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body>
        <CartProvider offer={getOffer().enabled}>
          <Header nav={nav} announcement={String(business.announcement)} />
          {children}
          <Footer />
          <CartDrawer freeShipMin={Number(business.free_ship_min)} />
          <ConsentBanner />
        </CartProvider>
      </body>
    </html>
  );
}
