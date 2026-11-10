# Launching EVENLY on a new WordPress site

About 60–90 minutes from zero to a store that can take payments. No coding or SSH needed.

## 1. Domain + hosting (about 20 min)
- **Domain:** `evenlylife.com` was unregistered on 2026-11-10. Register it today (any registrar, or through the host below).
- **Hosting:** use managed WordPress hosting with US servers, free SSL, daily backups and staging. Proven options for small WooCommerce stores: **SiteGround** (GrowBig plan or higher), **Hostinger** (Business plan or higher), or **Cloudways** if you want more control. Compare current prices yourself.
- Choose **"Install WordPress"** during signup and pick a **US data center**.
- Turn on **SSL/HTTPS** in the host's panel (usually one click).

## 2. Install WooCommerce (5 min)
WordPress admin → Plugins → Add New → search **WooCommerce** → Install → Activate. You can skip the setup wizard.

## 3. Upload EVENLY (5 min)
Download the two files from the latest release: https://github.com/jackson6reen/noon-night-store/releases
1. **Appearance → Themes → Add New → Upload Theme** → `evenly-theme.zip` → Install → **Activate**.
2. **Plugins → Add New → Upload Plugin** → `evenly-core.zip` → Install → **Activate**.

## 4. One-click import (2 min)
**Tools → Evenly Setup** → leave "This is a new site" ticked → **Import the Evenly store**.
This creates 11 products with photos, 5 concern pages, legal pages, 4 articles, the homepage, menus, permalinks and US shipping (free over $50, $5.95 otherwise).

## 5. Business details (5 min)
**Settings → Evenly:** legal entity, business address, support email (use a domain address such as support@evenlylife.com), governing-law state. These flow into every legal page automatically.

## 6. Payments: Stripe (15 min)
1. Plugins → Add New → **WooCommerce Stripe Payment Gateway** (by WooCommerce) → Install → Activate.
2. WooCommerce → Settings → Payments → Stripe → **Connect** your Stripe account.
3. Turn on Apple Pay / Google Pay / Link.
4. **Test mode** first: place an order with card `4242 4242 4242 4242`, any future date, any CVC.
5. Stripe → Radar: block payments when the CVC check or postal code check fails.
6. Switch to **live mode**.

## 7. Security (10 min)
Plugins → Add New → **Wordfence** (firewall + 2FA). Turn on 2FA for your admin user. See [WORDPRESS-SECURITY.md](WORDPRESS-SECURITY.md).

## 8. SEO + tracking (10 min)
- Install **Rank Math** and run its setup. The import already filled in titles and descriptions.
- Add the site to **Google Search Console** and submit `/sitemap_index.xml`.
- Settings → Evenly: add your **GA4** and **Meta Pixel** IDs (they load only after cookie consent).

## 9. Go live
WooCommerce → Settings → **Site visibility → Live**. Place one real order to yourself and refund it.

## Before taking real orders
- [ ] Supplier connected and a **sample of every product** received (see [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) §1).
- [ ] Product labels at the supplier use the same EVENLY design as the site photos, so what customers receive matches what they saw.
- [ ] Doses on each product page match the real label (Products → Edit → **Evenly** tab).
