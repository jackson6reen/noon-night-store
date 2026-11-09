# Noon Night for WordPress + WooCommerce

This folder is the production store: a **WooCommerce theme**, a **functionality plugin**, and a **content seeder**.
(The Next.js app in the repo root is the earlier prototype on Vercel. It isn't needed for the WordPress store.)

```
wordpress/
├── themes/noon-night/          ← presentation only (PHP templates, CSS, JS)
│   ├── functions.php           ← loads inc/*
│   ├── inc/                    ← setup, assets, icons, template-tags, woocommerce hooks
│   ├── template-parts/home/    ← one file per homepage section (reorder in front-page.php)
│   └── assets/css|js
├── plugins/noon-night-core/    ← business logic (survives a theme change)
│   └── includes/               ← one module per concern: security, compliance, product-fields,
│                                  concern-fields, bundles, schema, consent, commerce, settings
├── setup/
│   ├── data/products.json      ← THE catalog: SKUs, prices, copy, ingredients, warnings, supplier mapping
│   ├── content/concerns/*.html ← SEO hub articles for each product category
│   ├── content/posts/*.html    ← Journal articles (blog)
│   ├── content/pages/*.html    ← legal + support pages (use [nn_business] shortcodes)
│   └── seed.php                ← imports all of the above
└── playground/blueprint.json   ← one-command local test site
```

## Install on your WordPress site

1. **Back up the site** (your host's backup tool or UpdraftPlus).
2. Zip and upload:
   - `plugins/noon-night-core` → Plugins → Add New → Upload → Activate
   - `themes/noon-night` → Appearance → Themes → Add New → Upload → Activate
   (Try it on a **staging copy** first. Most hosts have one-click staging.)
3. Go to **Settings → Noon Night** and fill in your legal entity, address, support email, GA4 and Meta Pixel IDs.
4. Upload the `setup` folder to `wp-content/nn-setup/` (SFTP or the host's file manager), then import with WP-CLI (SSH, or your host's WP-CLI console):
   ```bash
   wp eval-file wp-content/nn-setup/seed.php
   ```
   Delete `wp-content/nn-setup/` afterwards. It's only needed for the import.
   - By default it **only adds what's missing**: existing pages, posts and products with the same slug or SKU are skipped, and your homepage, menus and permalinks are not touched.
   - `NN_SEED_OVERWRITE=1` updates existing items from the files.
   - `NN_SEED_FRESH_SITE=1` is for a **new** site only: it sets the homepage, menus, `/%postname%/` permalinks and US shipping (free over $50, $5.95 otherwise).
5. Install these plugins:
   - **WooCommerce Stripe Payment Gateway** (official, by WooCommerce). Connect your Stripe account, and enable Apple Pay, Google Pay and Link.
   - **Rank Math** or **Yoast SEO**. The seeder already filled in titles and descriptions for both.
   - Security: **Wordfence** (firewall + 2FA) or your host's WAF. See `docs/WORDPRESS-SECURITY.md`.

## Protecting existing organic traffic

If the site already gets organic traffic, **don't change existing URLs**. Keep the current permalink structure, and don't run with `NN_SEED_FRESH_SITE=1`. If any URL must change, add a 301 redirect (Rank Math → Redirections) before switching. After launch, watch Google Search Console → Pages and Performance for two weeks.

## Run it locally

Requires Node 18+. No PHP or Docker needed:
```bash
npx @wp-playground/cli@latest server --port=9400 --mount-dir ./wordpress/themes/noon-night /wordpress/wp-content/themes/noon-night --mount-dir ./wordpress/plugins/noon-night-core /wordpress/wp-content/plugins/noon-night-core --mount-dir ./wordpress/setup /wordpress/nn-setup --blueprint=./wordpress/playground/blueprint.json
```
Open http://localhost:9400. You're logged in as admin. Edits to theme and plugin files show up on refresh.

## Day-to-day editing

| Want to change | Where |
|---|---|
| Product copy, ingredients, warnings, FAQ | Products → Edit → **Noon Night** tab |
| Concern hub headline, SEO article, FAQ | Products → Categories → Edit |
| Homepage FAQ | Pages → Home → custom field `nn_faq` (Question \| Answer per line) |
| Homepage section order | `themes/noon-night/front-page.php` |
| Announcement bar, free-shipping amount, guarantee days | Settings → Noon Night |
| Colors and fonts | `themes/noon-night/assets/css/main.css` (tokens at the top) |

## Compliance rules for anyone writing copy

- Structure/function claims only: "supports", "helps relieve occasional". **Never** treat, cure, prevent, or disease names (insomnia, IBS, endometriosis, PMDD, anxiety disorder).
- Every claim gets an `*`. The FDA disclaimer prints automatically on product pages, hubs and the footer.
- **No fake reviews, ratings, "as seen on" logos, countdown timers or "only 3 left"** unless they're true. The FTC's 2024 rule on fake reviews allows civil penalties for each violation.
- WooCommerce is set so **only verified buyers can review**.
