# Launch checklist: from code to first sale

## 1. Supplier (blocking)
Supliful's site lists **Shopify and ClickFunnels** sync. WooCommerce isn't mentioned (checked 2026-11-09). Before paying for a plan:
- [ ] Ask Supliful support: *"Do you support WooCommerce order sync or an API for automatic fulfillment?"*
- [ ] If **yes**: connect it, then map every SKU in `wordpress/setup/data/products.json` to their product. Bundles need one line per item, so map each bundle SKU to its components.
- [ ] If **no**, the options are:
  - a) a WooCommerce-native supplement dropshipper (ask about white-label, a US cGMP facility, a WooCommerce plugin, no MOQ), or
  - b) Supliful through Zapier/Make (Woo "order paid" → create order via their API), if they offer API access, or
  - c) run checkout on Shopify and keep WordPress for content/SEO (the "Buy" button links to Shopify).
- [ ] Order **samples of every product**. Photograph them (white background + lifestyle) and upload in Products → Edit. Real photos replace the drawn bottles automatically.
- [ ] Check each product's label against the **Noon Night** tab (doses, counts, warnings) and tick "Label checked". Products marked `label_verified: false` in `products.json` (Night Calm, Night Deep Rest, Noon Steady) need it most.
- [ ] Confirm wholesale cost + shipping per product. Prices are set for about 65% gross margin on a typical $10–13 landed cost. Adjust if needed.

## 2. Business and legal
- [ ] Legal entity (LLC) + EIN, and a business bank account connected to Stripe.
- [ ] **Settings → Noon Night**: legal entity, address, support email (a domain email like support@yourdomain.com), governing state.
- [ ] Have a lawyer review Privacy, Terms and Refund (they're solid templates, not legal advice).
- [ ] Sales tax: enable WooCommerce Tax (automated) or TaxJar. Register in your home state, and in others as you pass their economic-nexus thresholds.
- [ ] Product liability insurance (common for supplement sellers, and some suppliers require it).
- [ ] California Prop 65: ask the supplier whether any product needs a warning, and if so add it to that product's Safety field.

## 3. Payments
- [ ] Install **WooCommerce Stripe Payment Gateway** and connect your Stripe account.
- [ ] Turn on test mode → place a test order with card 4242 4242 4242 4242 → confirm the order email arrives and the supplier receives it.
- [ ] Turn on Apple Pay / Google Pay / Link (these lift mobile conversion).
- [ ] Stripe Radar: block if CVC fails, block if postal code fails.
- [ ] Switch to live mode.
- Stripe allows dietary supplements, but avoid disease claims, "free trial" negative-option offers without clear terms, and anything that resembles a weight-loss "miracle" claim. Those trigger account reviews.

## 4. SEO (protecting existing traffic)
- [ ] Install on a **staging copy** first, then compare old vs. new for your top 50 landing pages (Search Console → Performance → Pages).
- [ ] Keep every existing URL that ranks. Add 301 redirects for anything that changes.
- [ ] Install Rank Math (or Yoast). The seeder already filled titles and descriptions for both.
- [ ] Submit the sitemap in Google Search Console.
- [ ] Set a **real author** on Journal posts (name, photo, short bio; a credentialed reviewer such as an RD or MD is a strong E-E-A-T signal for health content).
- [ ] Link from your existing high-traffic articles to the matching concern hub (e.g. sleep articles → /product-category/sleep/). That's the fastest way to pass existing authority to the shop.
- [ ] Publish 2–4 new articles a month in the same format (key takeaways → body → product callout → when to see a doctor → sources → FAQ).

## 5. Tracking
- [ ] GA4 Measurement ID and Meta Pixel ID in **Settings → Noon Night** (they load only after consent).
- [ ] Optional: Meta Conversions API through the official "Meta for WooCommerce" plugin.

## 6. Final pre-launch pass
- [ ] Lighthouse mobile ≥ 90 for Performance and Accessibility on the home, hub and product pages.
- [ ] Test the full checkout on a real phone.
- [ ] Check every footer link.
- [ ] Turn on WooCommerce → Settings → Site visibility → **Live**.
