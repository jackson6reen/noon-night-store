import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Reads the SAME catalog and content files the WordPress seeder imports
 * (wordpress/setup). Edit content there once; WordPress and this Vercel
 * preview both pick it up.
 */
const ROOT = path.join(process.cwd(), "wordpress", "setup");

export type Faq = [string, string][];

export type Concern = {
  slug: string;
  name: string;
  menu_label: string;
  icon: string;
  headline: string;
  tagline: string;
  content_file: string;
  image: string;
  color: string;
};

export type ConcernPage = Concern & {
  intro: string;
  description: string;
  seoTitle: string;
  body: string;
  faq: Faq;
};

export type Product = {
  sku: string;
  slug: string;
  name: string;
  concerns: string[];
  price: number;
  format?: string;
  tagline: string;
  short: string;
  description: string;
  benefits: string[];
  how_to_use: string;
  ingredients?: [string, string, string][];
  warnings?: string;
  faq?: Faq;
  includes?: string[];
  image: string;
  color: string;
  short_name: string;
  isBundle: boolean;
};

export type ContentDoc = {
  type: "page" | "post";
  slug: string;
  title: string;
  description: string;
  seoTitle?: string;
  excerpt?: string;
  category?: string;
  faq: Faq;
  body: string;
};

export type Business = Record<string, string | number | boolean>;

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function parseDoc(raw: string): { meta: Record<string, unknown>; body: string } {
  const m = raw.match(/^\s*<!--meta\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return { meta: {}, body: raw.trim() };
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length).trim() };
}

let cache: {
  business: Business;
  concerns: ConcernPage[];
  products: Product[];
  docs: ContentDoc[];
} | null = null;

function load() {
  if (cache) return cache;

  const business = JSON.parse(read("data/business.json")) as Business;
  const data = JSON.parse(read("data/products.json"));

  const concerns: ConcernPage[] = (data.concerns as Concern[]).map((c) => {
    const { meta, body } = parseDoc(read(`content/${c.content_file}`));
    return {
      ...c,
      intro: String(meta.intro ?? ""),
      description: String(meta.description ?? ""),
      seoTitle: String(meta.seo_title ?? c.name),
      body: fillShortcodes(body, business),
      faq: (meta.faq as Faq) ?? [],
    };
  });

  const products: Product[] = [
    ...data.products.map((p: Product) => ({ ...p, isBundle: false })),
    ...data.bundles.map((p: Product) => ({ ...p, isBundle: true })),
  ];

  const docs: ContentDoc[] = [];
  for (const type of ["pages", "posts"] as const) {
    for (const file of fs.readdirSync(path.join(ROOT, "content", type))) {
      if (!file.endsWith(".html")) continue;
      const { meta, body } = parseDoc(read(`content/${type}/${file}`));
      docs.push({
        type: type === "pages" ? "page" : "post",
        slug: String(meta.slug ?? file.replace(/\.html$/, "")),
        title: String(meta.title ?? file),
        description: String(meta.description ?? ""),
        seoTitle: meta.seo_title ? String(meta.seo_title) : undefined,
        excerpt: meta.excerpt ? String(meta.excerpt) : undefined,
        category: meta.category ? String(meta.category) : undefined,
        faq: (meta.faq as Faq) ?? [],
        body: fillShortcodes(body.replace(/<!--[\s\S]*?-->/g, ""), business),
      });
    }
  }

  cache = { business, concerns, products, docs };
  return cache;
}

/** Same output as the WordPress [nn_business field="..."] shortcode. */
function fillShortcodes(html: string, business: Business) {
  return html.replace(/\[nn_business field="([a-z_]+)"\]/g, (_, key: string) => {
    const value = String(business[key] ?? "");
    return key === "support_email" ? `<a href="mailto:${value}">${value}</a>` : escapeHtml(value);
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export const getBusiness = () => load().business;
export const getConcerns = (includeBundles = false) =>
  load().concerns.filter((c) => includeBundles || c.slug !== "bundles");
export const getConcern = (slug: string) => load().concerns.find((c) => c.slug === slug);
export const getProducts = () => load().products;
export const getProduct = (slug: string) => load().products.find((p) => p.slug === slug);
export const getProductBySku = (sku: string) => load().products.find((p) => p.sku === sku);
export const getProductsInConcern = (slug: string) => load().products.filter((p) => p.concerns.includes(slug));
export const getDocs = (type?: ContentDoc["type"]) => load().docs.filter((d) => !type || d.type === type);
export const getDoc = (slug: string) => load().docs.find((d) => d.slug === slug);

/** Bundle contents and how much the bundle saves vs. buying separately. */
export function bundleInfo(p: Product) {
  const items = (p.includes ?? []).map(getProductBySku).filter(Boolean) as Product[];
  const value = items.reduce((n, i) => n + i.price, 0);
  return { items, value, saving: Math.max(0, value - p.price) };
}

/** Public URL of a theme image (synced to /public/img by scripts/sync-assets.mjs). */
export const img = (file: string) => `/img/${file}`;

/** Light-weight card data for client components. */
export function toCard(p: Product) {
  return {
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortName: p.short_name,
    price: p.price,
    tagline: p.tagline,
    image: img(p.image),
    accent: p.color,
    isBundle: p.isBundle,
  };
}
export type Card = ReturnType<typeof toCard>;

export function concernColor(slug: string) {
  return getConcern(slug)?.color ?? "#0B0B0C";
}

/** The site-wide offer: every 3rd single formula is free (cheapest one). Bundles excluded. */
export function getOffer() {
  const b = getBusiness();
  return { enabled: Boolean(b.offer_enabled), label: String(b.offer_label ?? "Buy 2, get 1 free") };
}

export const FDA_DISCLAIMER =
  "*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";
