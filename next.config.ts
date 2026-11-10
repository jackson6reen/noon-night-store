import type { NextConfig } from "next";

/** Previous product URLs (prototype and pre-rebrand) → current EVENLY URLs. */
const MOVED: Record<string, string> = {
  // Noon Night prototype (/products/...)
  "/products/noon-digest": "evenly-digest-digestive-enzymes",
  "/products/noon-flora": "evenly-flora-probiotic-40-billion",
  "/products/noon-steady": "evenly-calm-ashwagandha",
  "/products/night-calm": "evenly-unwind-magnesium-glycinate",
  "/products/night-deep-rest": "evenly-sleep-low-dose-sleep-formula",
  "/products/night-restore": "evenly-restore-l-glutamine",
  "/products/the-24-hour-reset": "the-full-reset",
  "/reset": "the-full-reset",
  // Noon Night WordPress-style URLs (/product/...)
  "/product/night-calm-magnesium-glycinate": "evenly-unwind-magnesium-glycinate",
  "/product/night-deep-rest-sleep-gummies": "evenly-sleep-low-dose-sleep-formula",
  "/product/cycle-ease-womens-balance": "evenly-cycle-womens-balance",
  "/product/noon-digest-digestive-enzymes": "evenly-digest-digestive-enzymes",
  "/product/noon-flora-probiotic-40-billion": "evenly-flora-probiotic-40-billion",
  "/product/night-restore-l-glutamine": "evenly-restore-l-glutamine",
  "/product/noon-steady-ashwagandha": "evenly-calm-ashwagandha",
  "/product/cycle-comfort-kit": "the-cycle-kit",
  "/product/the-night-reset": "the-sleep-stack",
  "/product/calm-gut-bundle": "the-gut-reset",
  "/product/the-24-hour-reset": "the-full-reset",
};

const nextConfig: NextConfig = {
  // Fully static site generated from wordpress/setup, so Cache Components isn't needed
  // (and it would block `dynamicParams = false`, which gives unknown URLs a real 404).
  trailingSlash: true, // Same URL shape as WordPress (/product/slug/).
  async redirects() {
    return Object.entries(MOVED).map(([source, slug]) => ({ source, destination: `/product/${slug}/`, permanent: true }));
  },
};

export default nextConfig;
