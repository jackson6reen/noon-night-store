import Link from "next/link";
import { FDA_DISCLAIMER, getBusiness, getConcerns } from "@/lib/site";
import { Icon, Logo } from "./Icon";
import { PrivacyChoicesLink } from "./ConsentBanner";

type L = { label: string; href: string };

export function Footer() {
  const b = getBusiness();
  const shop: L[] = [{ label: "Shop all", href: "/shop" }, ...getConcerns(true).map((c) => ({ label: c.name, href: `/product-category/${c.slug}` }))];
  const help: L[] = [
    { label: "Our Story", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping-policy" },
    { label: "Refunds & Guarantee", href: "/refund-policy" },
  ];
  const legal: L[] = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Medical Disclaimer", href: "/medical-disclaimer" },
    { label: "Accessibility", href: "/accessibility" },
  ];
  const col = (title: string, items: L[]) => (
    <nav className="nn-footer__col" aria-label={title}>
      <p className="nn-footer__title">{title}</p>
      <ul>{items.map((i) => <li key={i.href}><Link href={i.href}>{i.label}</Link></li>)}</ul>
    </nav>
  );

  return (
    <>
      <section className="nn-trust-strip" aria-label="Why shop with us">
        <div className="nn-container nn-trust-strip__grid">
          <p><Icon name="shield" /> <span>{b.guarantee_days}-day money-back guarantee</span></p>
          <p><Icon name="truck" /> <span>Free US shipping over ${b.free_ship_min}</span></p>
          <p><Icon name="flask" /> <span>Made in the USA, cGMP facility</span></p>
          <p><Icon name="heart" /> <span>Real people answer support emails</span></p>
        </div>
      </section>
      <footer className="nn-footer">
        <div className="nn-container">
          <div className="nn-footer__grid">
            <div className="nn-footer__brand">
              <p className="nn-footer__logo"><Logo size={34} /></p>
              <p>Clean, honest formulas for sleep, cramps, bloating and stress. Made for women who are done just pushing through.</p>
              <p><a href={`mailto:${b.support_email}`}>{b.support_email}</a></p>
            </div>
            {col("Shop", shop)}
            {col("Help", help)}
            {col("Legal", legal)}
          </div>
          <p className="nn-fda nn-footer__fda">{FDA_DISCLAIMER}</p>
          <div className="nn-footer__bottom">
            <p>© 2026 {String(b.legal_entity)}. All rights reserved.</p>
            <p><PrivacyChoicesLink /></p>
          </div>
        </div>
      </footer>
    </>
  );
}
