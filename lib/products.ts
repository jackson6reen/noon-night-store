export type Line = "noon" | "night" | "bundle";

export type Product = {
  slug: string;
  sku: string;
  name: string;
  line: Line;
  /** Short format label shown on the bottle, e.g. "60 capsules" */
  format: string;
  tagline: string;
  /** Which complaint this product is for: used to filter by need */
  needs: Need[];
  price: number; // USD
  compareAt?: number;
  shortDescription: string;
  description: string;
  benefits: string[];
  howToUse: string;
  ingredients: string[];
  /** Optional photo (from the supplier or WooCommerce). Falls back to the drawn bottle. */
  image?: string;
  inStock: boolean;
  includes?: string[]; // bundle contents (slugs)
};

export type Need = "bloating" | "sleep" | "stress" | "gut";

export const NEEDS: Record<Need, { label: string; blurb: string }> = {
  bloating: { label: "Gas & bloating", blurb: "For the 3 p.m. button-pop." },
  sleep: { label: "Sleep", blurb: "For the 2 a.m. ceiling stare." },
  stress: { label: "Stress & focus", blurb: "For the wired-but-tired days." },
  gut: { label: "Gut health", blurb: "For a calmer, more regular belly." },
};

export const PRODUCTS: Product[] = [
  {
    slug: "noon-digest",
    sku: "NN-NOON-DIGEST",
    name: "Noon Digest",
    line: "noon",
    format: "60 capsules",
    tagline: "Digestive enzyme complex for the after-lunch bloat.",
    needs: ["bloating", "gut"],
    price: 34,
    shortDescription:
      "A broad-spectrum enzyme blend you take with your first bite, so lunch doesn't sit in your stomach all afternoon.",
    description:
      "You know the feeling: you eat a normal lunch, and by 3 p.m. your waistband is fighting you. Noon Digest pairs enzymes that break down protein, fat, carbs, dairy and fiber with your meal, so food moves along instead of fermenting into gas.",
    benefits: [
      "Helps break down protein, fats, carbs and dairy*",
      "Helps relieve occasional gas and bloating*",
      "Supports comfortable digestion after big meals*",
    ],
    howToUse: "Take 1 capsule with the first bite of your two largest meals.",
    ingredients: ["Amylase", "Protease", "Lipase", "Lactase", "Cellulase", "Bromelain", "Papain"],
    inStock: true,
  },
  {
    slug: "noon-flora",
    sku: "NN-NOON-FLORA",
    name: "Noon Flora",
    line: "noon",
    format: "30 capsules",
    tagline: "40 billion CFU daily probiotic.",
    needs: ["gut", "bloating"],
    price: 39,
    shortDescription:
      "A multi-strain daily probiotic to support a balanced gut, taken once in the morning.",
    description:
      "Your gut runs on a crew of trillions of bacteria. Antibiotics, stress, travel and takeout throw that crew off balance, and you feel it as irregularity and bloating. Noon Flora adds 10 well-studied strains back in, every morning.",
    benefits: [
      "Supports a balanced gut microbiome*",
      "Supports regularity and digestive comfort*",
      "Delayed-release capsule designed to get past stomach acid",
    ],
    howToUse: "Take 1 capsule each morning with water.",
    ingredients: [
      "Lactobacillus acidophilus",
      "Bifidobacterium lactis",
      "Lactobacillus plantarum",
      "Lactobacillus rhamnosus",
      "+ 6 more strains (40B CFU)",
    ],
    inStock: true,
  },
  {
    slug: "noon-steady",
    sku: "NN-NOON-STEADY",
    name: "Noon Steady",
    line: "noon",
    format: "60 capsules",
    tagline: "Ashwagandha for calm daytime focus.",
    needs: ["stress", "sleep"],
    price: 29,
    shortDescription:
      "An adaptogen that takes the edge off busy days, so you're not still wound up at bedtime.",
    description:
      "Bad nights often start at noon: the inbox, the commute, the cortisol spike that never quite comes down. Noon Steady uses ashwagandha root extract to help your body handle everyday stress, so evening wind-down comes easier.",
    benefits: [
      "Helps the body adapt to everyday stress*",
      "Supports calm focus without drowsiness*",
      "Supports a healthy evening wind-down*",
    ],
    howToUse: "Take 2 capsules daily with lunch.",
    ingredients: ["Ashwagandha root extract", "Black pepper extract"],
    inStock: true,
  },
  {
    slug: "night-calm",
    sku: "NN-NIGHT-CALM",
    name: "Night Calm",
    line: "night",
    format: "120 capsules",
    tagline: "Magnesium glycinate, the gentle kind.",
    needs: ["sleep", "stress"],
    price: 29,
    shortDescription:
      "Highly absorbable magnesium glycinate to help muscles and mind relax before bed. Easy on the stomach.",
    description:
      "Many U.S. adults fall short on magnesium, and it shows up as tight shoulders, restless legs and a busy brain at night. Glycinate is the form that's gentle on digestion (no 'magnesium sprint' to the bathroom), so it's the one we put in the Night line.",
    benefits: [
      "Supports muscle relaxation*",
      "Supports a calm mood and restful sleep*",
      "Gentle on the stomach, non-laxative form",
    ],
    howToUse: "Take 2 capsules 30–60 minutes before bed.",
    ingredients: ["Magnesium (as magnesium bisglycinate chelate)"],
    inStock: true,
  },
  {
    slug: "night-deep-rest",
    sku: "NN-NIGHT-REST",
    name: "Night Deep Rest",
    line: "night",
    format: "60 gummies",
    tagline: "Low-dose sleep gummies with L-theanine and chamomile.",
    needs: ["sleep"],
    price: 32,
    shortDescription:
      "A low-dose melatonin gummy with L-theanine and chamomile, to help you fall asleep and stay asleep.",
    description:
      "Most drugstore melatonin is dosed like a sledgehammer, then you wake up groggy. Night Deep Rest keeps melatonin low and pairs it with L-theanine and chamomile, so you drift off and wake up clear. Berry flavored.",
    benefits: [
      "Helps you fall asleep faster*",
      "Supports staying asleep through the night*",
      "Low dose, designed to avoid morning grogginess",
    ],
    howToUse: "Chew 1–2 gummies 30 minutes before bed.",
    ingredients: ["Melatonin (1.5 mg)", "L-theanine", "Chamomile extract", "Lemon balm"],
    inStock: true,
  },
  {
    slug: "night-restore",
    sku: "NN-NIGHT-RESTORE",
    name: "Night Restore",
    line: "night",
    format: "30 servings · powder",
    tagline: "L-glutamine to support your gut lining while you sleep.",
    needs: ["gut", "bloating"],
    price: 35,
    shortDescription:
      "Unflavored L-glutamine powder. Stir it into water or tea at night to support the gut lining overnight.",
    description:
      "Your gut does its repair work while you sleep. L-glutamine is the main fuel for the cells that line your intestines. One scoop in evening tea, no taste, no fuss.",
    benefits: [
      "Supports a healthy intestinal lining*",
      "Supports digestive comfort*",
      "Unflavored, mixes into any drink",
    ],
    howToUse: "Mix 1 scoop (5 g) into water or herbal tea in the evening.",
    ingredients: ["L-glutamine (5 g per serving)"],
    inStock: true,
  },
  {
    slug: "the-24-hour-reset",
    sku: "NN-RESET-BUNDLE",
    name: "The 24-Hour Reset",
    line: "bundle",
    format: "Day + night kit · 30 days",
    tagline: "The full day-and-night system for bloating and bad sleep.",
    needs: ["bloating", "sleep", "gut", "stress"],
    price: 119,
    compareAt: 134,
    shortDescription:
      "Noon Digest + Noon Flora by day, Night Calm + Night Deep Rest by night. One kit that works around the clock.",
    description:
      "Bloating and bad sleep feed each other. A gut that's struggling all day keeps you up at night, and a short night makes your gut worse the next day. The 24-Hour Reset works on both ends of the clock at once.",
    benefits: [
      "Daytime: helps relieve occasional gas and bloating*",
      "Nighttime: supports falling and staying asleep*",
      "Save $15 compared with buying separately",
      "Covered by the 30-Night Rest-Easy Guarantee",
    ],
    howToUse:
      "Morning: 1 Noon Flora. Meals: 1 Noon Digest. Bedtime: 2 Night Calm + 1–2 Night Deep Rest.",
    ingredients: ["See each product for full ingredients"],
    inStock: true,
    includes: ["noon-digest", "noon-flora", "night-calm", "night-deep-rest"],
  },
];

export function findProduct(slug: string, list: Product[] = PRODUCTS) {
  return list.find((p) => p.slug === slug);
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const FREE_SHIPPING_THRESHOLD = 50;

export const FDA_DISCLAIMER =
  "*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";
