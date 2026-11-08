// Generates woocommerce/products.csv from lib/products.ts.
// Run: npm run woo:csv   (Node 22.6+ runs TypeScript directly)
import { writeFileSync } from "node:fs";
import { PRODUCTS, FDA_DISCLAIMER } from "../lib/products.ts";

const cols = [
  "Type", "SKU", "Name", "Published", "Is featured?", "Visibility in catalog",
  "Short description", "Description", "Tax status", "In stock?", "Backorders allowed?",
  "Sold individually?", "Allow customer reviews?", "Sale price", "Regular price",
  "Categories", "Tags", "Images",
];

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
const cat = { noon: "Noon Line (Day)", night: "Night Line (Sleep)", bundle: "Kits" } as const;

const rows = PRODUCTS.map((p) => {
  const html =
    `<p>${p.description}</p><ul>${p.benefits.map((b) => `<li>${b}</li>`).join("")}</ul>` +
    `<p><strong>How to use:</strong> ${p.howToUse}</p>` +
    `<p><strong>Key ingredients:</strong> ${p.ingredients.join(", ")}</p>` +
    `<p><small>${FDA_DISCLAIMER}</small></p>`;
  const regular = p.compareAt ?? p.price;
  const sale = p.compareAt ? p.price : "";
  return [
    "simple", p.sku, p.name, 1, p.line === "bundle" ? 1 : 0, "visible",
    p.shortDescription, html, "taxable", p.inStock ? 1 : 0, 0,
    0, 1, sale, regular,
    cat[p.line], p.needs.join(", "), p.image ?? "",
  ].map(esc).join(",");
});

writeFileSync(new URL("../woocommerce/products.csv", import.meta.url), [cols.map(esc).join(","), ...rows].join("\n") + "\n");
console.log(`Wrote ${rows.length} products to woocommerce/products.csv`);
