# Noon Night: supplement store

Relief-first supplements for US women: sleep, period comfort, bloating and stress.

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
| Business details (entity, email, shipping threshold) | `wordpress/setup/data/business.json` (Vercel) and Settings → Noon Night (WordPress) | each |
| Colors, fonts, spacing, layout | `wordpress/themes/noon-night/assets/css/main.css` | both |
| Homepage sections | `wordpress/themes/noon-night/template-parts/home/*.php` **and** `app/page.tsx` | each (keep in sync) |

Push to `main` and Vercel redeploys in about a minute. Push to any other branch and Vercel creates a private preview URL first.

## The Vercel preview
- Next.js 16, fully static (every page is prerendered from `wordpress/setup` at build time).
- Same URLs as WordPress: `/product/<slug>/`, `/product-category/<slug>/`, `/<page-or-post>/`.
- **Hidden from Google** (`noindex` + `robots.txt`), so it never competes with the real site's rankings. Set `SITE_INDEXABLE=1` in Vercel only if this ever becomes the live store.
- Checkout: set `WOOCOMMERCE_URL` in Vercel and install `woocommerce/noon-night-bridge` on the WordPress site. The cart is then handed to WooCommerce's Stripe checkout. Without it, checkout shows a preview notice.

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
