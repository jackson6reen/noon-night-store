# White-label dropshipping + WooCommerce setup

> **Update 2026-11-09:** the catalog moved to `wordpress/setup/data/products.json`.
> Confirmed in Supliful's public catalog: Probiotic 40 Billion with Prebiotics, Digestive Enzyme Pro Blend, L-Glutamine, Women's Vitality Formula (chasteberry/black cohosh/dong quai), Ashwagandha. Not yet confirmed: magnesium glycinate, sleep formula.
> Supliful's site advertises Shopify and ClickFunnels sync only, so **confirm WooCommerce support before paying**. Options are in `docs/LAUNCH-CHECKLIST.md` §1.

## 1. Supplier: recommended start

**Supliful** (supliful.com): white-label supplements with your own label, **no minimum order**, made in FDA-registered, cGMP facilities, and shipped from the U.S. per order, so you don't hold stock. Plans have been listed at roughly $29–$69/month. Check current pricing and confirm the **WooCommerce** connection directly with them: review sites say they connect to WooCommerce, but their main app is Shopify-first. If the WooCommerce connection isn't available on your plan, their help center describes an API option for other storefronts.

Map each Evenly product to a catalog item:

| Evenly | Look for in the supplier catalog |
|---|---|
| Evenly Digest | Digestive enzymes |
| Evenly Flora | Probiotic 40B CFU |
| Evenly Calm | Ashwagandha |
| Evenly Unwind | Magnesium glycinate |
| Evenly Sleep | Sleep / melatonin gummies |
| Evenly Restore | L-glutamine powder |

When you pick them, **update `lib/products.ts`** so ingredients, doses and capsule counts match the supplier's real labels exactly, then run `npm run woo:csv`. Order a sample of every product before launch.

**Backups to compare:** Productifi (U.S., FDA-registered and GMP labs, Shopify-first). For WooCommerce-native fulfillment of stock you've bought, E-Commerce Express.

Margin check (example): Evenly Unwind sells for $29. If the supplier's cost plus shipping is about $11–13, you keep about $16 before ads and payment fees. Know your numbers before you spend on ads.

## 2. WooCommerce: how this store connects

The Next.js site (on Vercel) is the storefront. WooCommerce (WordPress) runs **payments, orders, tax and the supplier connection**.

1. Install WordPress + WooCommerce on any host (e.g. `shop.yourdomain.com`).
2. **Products → Import** → upload `woocommerce/products.csv`. SKUs match the site.
3. Install the `wordpress/plugins/evenly-core` plugin (it now includes the cart hand-off).
   It accepts `/?nn_cart=SKU:QTY,...` from the storefront, fills the Woo cart and opens Woo checkout.
4. Set up payments in WooCommerce (WooCommerce Payments / Stripe / PayPal) and connect the supplier so orders get forwarded for fulfillment.
5. In **Vercel → Project → Settings → Environment Variables** add:
   `WOOCOMMERCE_URL = https://shop.yourdomain.com` and redeploy.
   - Prices, sale prices, stock and product photos now come live from WooCommerce (refreshed every minute).
   - The checkout button sends the cart to WooCommerce's secure checkout.

Until `WOOCOMMERCE_URL` is set, the site runs on the built-in catalog, and checkout shows "opening soon".
