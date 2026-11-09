import type { MetadataRoute } from "next";

/** Preview site: blocked from search engines unless SITE_INDEXABLE=1 (see layout.tsx). */
export default function robots(): MetadataRoute.Robots {
  return process.env.SITE_INDEXABLE === "1"
    ? { rules: { userAgent: "*", allow: "/" } }
    : { rules: { userAgent: "*", disallow: "/" } };
}
