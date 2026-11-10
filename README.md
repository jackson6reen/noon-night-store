# Evenly: supplement store

**EVENLY**: relief-first supplements for US women (sleep, period comfort, bloating and stress). Brand system: heavy extended display type (Archivo Expanded), black / off-white with a coral accent (#F0503F), and a "=" mark meaning "even". Label colors per formula are in `products.json`.

Code note: PHP functions and CSS classes keep the `nn_` / `nn-` prefix from the original project name. New brand-specific pieces use `ev-`.

This repo has **one set of content and design, and two front ends**:

| | What | Where |
|---|---|---|
| **WordPress + WooCommerce** | The real store: payments (Stripe), orders, supplier, SEO | [`wordpress/`](wordpress/README.md) |
| **Vercel preview** | The same design and content as a fast static site, for reviewing changes | Next.js app in this folder, auto-deployed from `main` |

Launch steps: [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) · Security: [`docs/WORDPRESS-SECURITY.md`](docs/WORDPRESS-SECURITY.md)

## How to make a change

| Change | Edit this | Shows up in |
|---|---|---|
| Product name, price, copy, ingredients, warnings, FAQ | `wordpress/setup/data/products.json` | Vercel on push · WordPress after re-running the seeder (or edit in wp-admin) |
| Concern hub article + FAQ | `wordpress/setup/content/concerns/*.html` | both |
| Journal article | `wordpress/setup/content/posts/*.html` (add a file = new article) | both |
| Legal / support pages | `wordpress/setup/content/pages/*.html` | both |
| Business details (entity, email, shipping threshold) | `wordpress/setup/data/business.json` (Vercel) and Settings → Evenly (WordPress) | each |
| Colors, fonts, spacing, layout | `wordpress/themes/evenly/assets/css/main.css` | both |
| Homepage sections | `wordpress/themes/evenly/template-parts/home/*.php` **and** `app/page.tsx` | each (keep in sync) |

Push to `main` and Vercel redeploys in about a minute. Push to any other branch and Vercel creates a private preview URL first.

## The Vercel preview
- Next.js 16, fully static (every page is prerendered from `wordpress/setup` at build time).
- Same URLs as WordPress: `/product/<slug>/`, `/product-category/<slug>/`, `/<page-or-post>/`.
- **Hidden from Google** (`noindex` + `robots.txt`), so it never competes with the real site's rankings. Set `SITE_INDEXABLE=1` in Vercel only if this ever becomes the live store.
- Checkout: set `WOOCOMMERCE_URL` in Vercel. The cart is handed to WooCommerce's Stripe checkout through the `evenly-core` plugin (`/?nn_cart=SKU:QTY,...`). Without it, checkout shows a preview notice.
- **Buy 2, get 1 free** runs in both front ends with the same rule: every 3rd single formula is free (the cheapest), and bundles are excluded. On WordPress it's a server-side cart fee (`evenly-core/includes/offer.php`); turn it on or off and rename it in Settings → Evenly.

## Images
All product and lifestyle photos live in `wordpress/themes/evenly/assets/img/` as optimized WebP. The Vercel build copies them to `public/img/`, and the WordPress seeder imports them into the Media Library.
To add or replace photos: put the PNG/JPG files in a folder and run `npm run images -- <folder>`. Keep the file names in `products.json` in sync.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Path | What |
|---|---|
| `lib/site.ts` | Reads the catalog and content from `wordpress/setup` |
| `app/` | Routes mirroring the WordPress templates |
| `components/` | Header, footer, product grid/tabs, cart drawer, quiz, consent banner |
| `app/preview.css` | The few styles WooCommerce provides on the WordPress side |
| `docs/BRAND-BLUEPRINT.md` | Avatar, hooks, offer, compliance rules |

## Environment variables (Vercel)
| Name | Effect |
|---|---|
| `WOOCOMMERCE_URL` | e.g. `https://shop.yourdomain.com`: checkout hands the cart to WooCommerce |
| `SITE_INDEXABLE` | `1` = allow search engines (leave unset for a preview) |
