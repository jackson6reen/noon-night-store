import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
// The design system is shared with WordPress: one stylesheet, two front ends.
import "../wordpress/themes/evenly/assets/css/main.css";
import "../wordpress/plugins/evenly-core/assets/consent.css";
import "./preview.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/Cart";
import { ConsentBanner } from "@/components/ConsentBanner";
import { getBusiness, getConcerns, getOffer } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["400", "500", "600", "700", "800"] });

/**
 * The Vercel site is a PREVIEW of the WordPress store. It is kept out of Google
 * by default so it never competes with the real site's organic rankings.
 * Set SITE_INDEXABLE=1 in Vercel only if this ever becomes the live store.
 */
const indexable = process.env.SITE_INDEXABLE === "1";
const siteUrl = process.env.SITE_URL ?? "https://noon-night-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "evenly | Supplements for Sleep, Period Cramps & Bloating", template: "%s – evenly" },
  description:
    "Supplements for sleep, period comfort, bloating and stress, made for women. Buy 2, get 1 free. 30-day money-back guarantee on your first order.",
  robots: indexable ? undefined : { index: false, follow: false },
  openGraph: {
    siteName: "evenly",
    type: "website",
    images: [{ url: "/img/lineup.webp", width: 1920, height: 1088, alt: "evenly formulas (packaging render)" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const business = getBusiness();
  const nav = [
    ...getConcerns(true).map((c) => ({ label: c.menu_label, href: `/product-category/${c.slug}/` })),
    { label: "Journal", href: "/journal/" },
  ];
  return (
    <html lang="en" className={jakarta.variable}>
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
