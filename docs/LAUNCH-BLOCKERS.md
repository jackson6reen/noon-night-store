# Launch blockers: evenly (Sunlit Balance)

Status as of 2026-11-10. Nothing here is guessed in the code: each item is either hidden or labeled as pending until it's verified.

## Brand assets
| Item | Status | Where it's handled |
|---|---|---|
| **Vector logo (SVG/AI/PDF)** | Missing. The site uses a raster extraction of the approved wordmark from `brand/reference/evenly_logo_concepts.webp` (`scripts/brand/extract-logo.mjs`). It's sharp up to about 1400px wide, but print and large formats need the vector. | Replace `logo-green.*`, `logo-cream.*`, `icon-e.png` in `wordpress/themes/evenly/assets/img/` |
| **Approved packaging** | Concepts only. Product images are renders of the Sunlit Balance label system made with real product data (`scripts/brand/render-packaging.mjs`), captioned "Packaging render" on every image, with a note on product pages. | Swap in real photos when labels are printed, then remove the caption and note |
| **Supplement Facts photos** | Missing for all products. The product pages say the photo will be added with the final label. | Product page → Ingredients |

## Product data (supplier label not verified)
Amounts, counts and directions are hidden and shown as "Pending final label" until `supplier.label_verified` is `true` in `products.json`.
| Product | Missing |
|---|---|
| Evenly Unwind (magnesium glycinate) | Supliful SKU unconfirmed; dose, count, directions |
| Evenly Sleep (melatonin formula) | Supliful SKU unconfirmed; melatonin dose, other ingredients, count, directions. The name was changed from "Low-Dose…" because the dose isn't verified. The URL slug is unchanged. |
| Evenly Calm (ashwagandha) | Plain Ashwagandha vs. "Ashwagandha Plus" (adds maca, ginseng, shatavari, vitamins); dose, count, directions |
| Kits containing the above (Sleep Stack, Cycle Kit, Full Reset, Gut Reset*) | Directions pending until all items are verified. *Gut Reset items are verified. |

## Business + legal
- [x] **Support email** set to `support@evenlylife.com` (business.json + WordPress default). Confirm the domain is registered and the mailbox receives mail before launch.
- [ ] Sleep formula decision: Supliful "Sleep Support" contains melatonin 10 mg, 5-HTP and St. John's Wort (interactions with antidepressants and hormonal birth control). Choose another formula, or update the site copy and warnings. Label artwork: `brand/labels/out/evenly-sleep-support-label.pdf`.
- [ ] **Legal entity**, **mailing address** and **governing-law state** (placeholders in brackets)
- [ ] **Manufacturing claims** ("Made in the USA", "cGMP"): hidden until the supplier confirms them for every product. Then set `manufacturing_claim_verified` to `true` / `1`.
- [ ] Shipping promises (1–2 day processing, 3–5 day delivery) must match the supplier's real SLA
- [ ] Refund policy (first-order guarantee, no return needed) must be confirmed as affordable
- [ ] Lawyer review of the Privacy, Terms and Refund pages

## Commerce
- [x] WooCommerce → Supliful order forwarding built (evenly-core 1.2.0: headless Shopify bridge, tracking back via webhook; 23/23 local tests with mocked Shopify)
- [ ] Shopify store + Supliful Pro + Dev Dashboard app connected and SKUs mapped (WooCommerce > Supliful). Step-by-step: `docs/FIRST-SALE-PLAN.md`
- [ ] First real order placed by the owner to confirm the full chain (Stripe → Shopify → Supliful → tracking)
- [ ] Stripe connected in WooCommerce, test order placed with a test card, then switched to live
- [ ] "Buy 2, get 1 free" confirmed as approved: margin with the lowest-priced formula free is roughly $29–36 gross on a 3-pack before ads
- [ ] GA4 / Meta Pixel IDs added (events are wired and consent-gated, but no IDs are configured)

## Not tested
- Real payment flow (Stripe isn't connected; no real orders by design)
- Real devices (tested in an emulated browser at 375 / 390 / 768 / 1440)
- Screen readers (keyboard, focus and ARIA were checked in code and in the DOM)
