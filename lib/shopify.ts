/**
 * Shopify headless checkout (server only).
 *
 * The Vercel site stays the storefront. Shopify runs payment (Shopify Payments),
 * orders, and the Supliful connection. Products are matched by SKU, so the SKUs
 * in Shopify must match the ones in wordpress/setup/data/products.json (EV-CYCLE, EV-KIT-GUT, ...).
 *
 * Env vars (Vercel → Project → Settings → Environment Variables):
 *   SHOPIFY_STORE_DOMAIN       e.g. evenly-xxxx.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN   Storefront API public access token (Headless channel)
 */

const API_VERSION = "2025-10";

export const shopifyEnabled = () => Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);

type GqlError = { message: string };

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify responded ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: GqlError[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

type VariantNode = { id: string; sku: string | null; availableForSale: boolean };
type ProductsPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: { variants: { nodes: VariantNode[] } }[];
  };
};

/** SKU → variant, for every product published to the Headless channel. Cached for 60 s. */
let cache: { at: number; map: Map<string, VariantNode> } | null = null;

export async function variantsBySku(): Promise<Map<string, VariantNode>> {
  if (cache && Date.now() - cache.at < 60_000) return cache.map;
  const map = new Map<string, VariantNode>();
  let after: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data: ProductsPage = await storefront<ProductsPage>(
      `query ($after: String) {
        products(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { variants(first: 20) { nodes { id sku availableForSale } } }
        }
      }`,
      { after },
    );
    for (const p of data.products.nodes) for (const v of p.variants.nodes) if (v.sku) map.set(v.sku.trim().toUpperCase(), v);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  cache = { at: Date.now(), map };
  return map;
}

export class CheckoutError extends Error {
  constructor(message: string, public missing: string[] = []) {
    super(message);
  }
}

/** Creates a Shopify cart for the given SKUs and returns its hosted checkout URL. */
export async function createCheckout(items: { sku: string; qty: number }[]): Promise<string> {
  const variants = await variantsBySku();
  const missing: string[] = [];
  const lines = items.map(({ sku, qty }) => {
    const v = variants.get(sku.trim().toUpperCase());
    if (!v || !v.availableForSale) missing.push(sku);
    return { merchandiseId: v?.id ?? "", quantity: qty };
  });
  if (missing.length) throw new CheckoutError("Some items are not available right now.", missing);

  type CartCreate = {
    cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { field: string[] | null; message: string }[] };
  };
  const data = await storefront<CartCreate>(
    `mutation ($input: CartInput!) {
      cartCreate(input: $input) {
        cart { checkoutUrl }
        userErrors { field message }
      }
    }`,
    { input: { lines, buyerIdentity: { countryCode: "US" } } },
  );
  const err = data.cartCreate.userErrors;
  if (err.length || !data.cartCreate.cart) throw new CheckoutError(err.map((e) => e.message).join("; ") || "Could not create the cart.");
  return data.cartCreate.cart.checkoutUrl;
}
