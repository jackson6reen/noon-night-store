# Noon Night: supplement store

> **Production store = WordPress + WooCommerce.** Theme, plugin, catalog, SEO content and the seeder are in [`wordpress/`](wordpress/README.md).
> Launch steps: [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) · Security: [`docs/WORDPRESS-SECURITY.md`](docs/WORDPRESS-SECURITY.md).
> The Next.js app below is the earlier prototype (still deployed on Vercel).

Day-and-night supplements for U.S. customers dealing with gas/bloating and poor sleep.
**Noon line** (digestion, daytime) · **Night line** (sleep, recovery) · **The 24-Hour Reset** kit.

- Next.js 16 + Tailwind 4, deployed on Vercel
- Product catalog, product pages, shop filters (by line and by need), cart drawer, cart, checkout
- Long-form sales page at `/reset`, built on the Master Prompt framework
- **WooCommerce-compatible**: runs headless on WooCommerce when `WOOCOMMERCE_URL` is set

## Run locally
```bash
npm install
npm run dev
```

## Key files
| Path | What |
|---|---|
| `lib/products.ts` | The catalog: names, prices, copy, ingredients, SKUs |
| `lib/woo.ts` | Pulls live price/stock/images from the WooCommerce Store API by SKU |
| `woocommerce/products.csv` | WooCommerce import file (`npm run woo:csv` regenerates it) |
| `woocommerce/noon-night-bridge/` | WordPress plugin: hands the cart to Woo checkout |
| `docs/BRAND-BLUEPRINT.md` | Avatar, hooks, offer, compliance rules |
| `docs/SUPPLIER-AND-WOOCOMMERCE.md` | White-label dropship supplier + Woo setup steps |
| `docs/EPIC-EMAILS.md` | Email sequence |

## Environment variables
| Name | Example | Effect |
|---|---|---|
| `WOOCOMMERCE_URL` | `https://shop.noonnight.com` | Live prices/stock from Woo, and checkout goes to Woo |
