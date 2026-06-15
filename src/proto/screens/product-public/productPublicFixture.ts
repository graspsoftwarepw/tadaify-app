/**
 * Typed mock seam for the public single Product page. Mirrors
 * mockups/tadaify-mvp/product-public.html so the screen graduates by swapping
 * these factories for the real product loader. Defines the FR's rendered data
 * contract: the hero banner, creator strip, price (current + struck-through),
 * the Instagram social-proof embed, sales copy + outcomes, reviews, and the
 * inline checkout (opt-in upsell, fields, order summary, secure-checkout note).
 *
 * @implements fr-product-public
 */
export type ProductReview = { text: string; who: string };

export type ProductContent = {
  creator: { name: string; initial: string; handle: string; role: string };
  /** URL slug appended to /p/. */
  slug: string;
  badge: string;
  heroTitle: string;
  heroSub: string;
  subtitle: string;
  /** Price in whole dollars (the upsell math uses these). */
  price: number;
  strikePrice: number;
  discountLabel: string;
  ig: { handle: string; stats: string; tiles: number };
  copy: string[];
  outcomesHeading: string;
  outcomes: string[];
  reviewsHeading: string;
  reviews: ProductReview[];
  upsell: { label: string; price: number; strikePrice: number; sub: string };
  reviewsLocation: string;
};

export function productContentFixture(): ProductContent {
  return {
    creator: {
      name: "Alexandra Silva",
      initial: "AS",
      handle: "alexandrasilva",
      role: "Fitness coach",
    },
    slug: "ultimate-fitness-course",
    badge: "🔥 50% off · ends Friday 11:59pm UTC",
    heroTitle: "Ultimate Fitness Course",
    heroSub: "Build strength without burning out. 12 weeks. Lifetime access.",
    subtitle: "12 weeks. 60 lessons. Lifetime access.",
    price: 127,
    strikePrice: 197,
    discountLabel: "50% off",
    reviewsLocation: "Lisbon, Portugal",
    ig: { handle: "@alexandrasilva_fit", stats: "50.2k followers · 1,284 posts", tiles: 6 },
    copy: [
      "I spent 8 years in fitness before I realised the industry sells one big lie: “no pain, no gain.” The women I coach are smart, successful, and completely burned out from programs designed for 21-year-old men. I built this course for them. For you.",
      "The Ultimate Fitness Course is 12 weeks of progressive strength training, metabolic conditioning, and recovery protocols — the exact same system I use with my 1:1 clients who pay $1,800/quarter. Every lesson is under 15 minutes. Every workout fits in a tiny home gym or a hotel room.",
      "You get 60 video lessons, a private Discord community of 2,000+ women training alongside you, a 12-week PDF workbook, and lifetime access to every future update. No recurring charge. No hidden upsells. One payment, forever yours.",
    ],
    outcomesHeading: "What you'll learn",
    outcomes: [
      "Build measurable strength (avg +40% on compound lifts by week 12)",
      "Master progressive overload without gym equipment",
      "Eat for energy + recovery (includes a custom macro calculator)",
      "Build a sustainable morning routine that survives travel + kids",
      "Recover smarter: sleep, mobility, stress management",
      "Plan the next 12 months of training after the course ends",
    ],
    reviewsHeading: "What creators are saying",
    reviews: [
      {
        text: "I was skeptical — another fitness course, right? Wrong. Alexandra's program is the first one I actually finished. Down 8kg, up 40kg on deadlifts.",
        who: "— Marta, 34 · Kraków",
      },
      {
        text: "The Discord community is worth the $127 alone. 2k women who actually answer when you post at 6am panicking about form.",
        who: "— Priya, 29 · London",
      },
      {
        text: "I hate workouts over 30 minutes. Every lesson here is 10-15. I got more done in 12 weeks than 2 years of F45.",
        who: "— Jess, 41 · Melbourne",
      },
      {
        text: "Finally a fitness coach who doesn't peddle cortisol-fear BS. Evidence-based, kind delivery, works.",
        who: "— Dr. Sarah Chen · NYC",
      },
      {
        text: "Lifetime access = no anxiety about pausing for my wedding week. Came back 3 months later, continued where I left off.",
        who: "— Ana, 32 · Lisbon",
      },
    ],
    upsell: {
      label: "Add: Digital Product Starter Kit",
      price: 47,
      strikePrice: 87,
      sub: "Templates + macro calculator + shopping list PDFs. Ships instantly with your course.",
    },
  };
}
