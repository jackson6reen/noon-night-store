import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site generated from wordpress/setup, so Cache Components isn't needed
  // (and it would block `dynamicParams = false`, which gives unknown URLs a real 404).
  trailingSlash: true, // Same URL shape as WordPress (/product/slug/).
  async redirects() {
    // Old prototype URLs → the new WordPress-matching ones.
    const moved: Record<string, string> = {
      "noon-digest": "noon-digest-digestive-enzymes",
      "noon-flora": "noon-flora-probiotic-40-billion",
      "noon-steady": "noon-steady-ashwagandha",
      "night-calm": "night-calm-magnesium-glycinate",
      "night-deep-rest": "night-deep-rest-sleep-gummies",
      "night-restore": "night-restore-l-glutamine",
      "the-24-hour-reset": "the-24-hour-reset",
    };
    return [
      ...Object.entries(moved).map(([from, to]) => ({ source: `/products/${from}`, destination: `/product/${to}/`, permanent: true })),
      { source: "/reset", destination: "/product/the-24-hour-reset/", permanent: true },
    ];
  },
};

export default nextConfig;
