/**
 * Typed mock seam for the Administration → Store (v2 placeholder) screen.
 * Mirrors the data shown in mockups/tadaify-mvp/app-admin-store.html so the
 * screen graduates by swapping this factory for the real loader.
 *
 * Store ships in v2 (native commerce: Stripe Connect, product CRUD, checkout,
 * orders). MVP only renders this empty/coming-soon state plus the cross-link to
 * the Product block, regardless of any "Store" affordance the creator added.
 *
 * @implements fr-admin-store
 */

export type AdminStoreFeature = {
  id: string;
  icon: string;
  name: string;
  sub: string;
};

export type AdminStoreFixture = {
  /** Page header. */
  title: string;
  emoji: string;
  description: string;
  /** v2 hero. */
  timelinePill: string;
  heroHeadline: string;
  heroBody: string;
  /** Notify-me signup card. */
  signup: {
    label: string;
    sub: string;
    emailPlaceholder: string;
  };
  /** "What's coming in v2" cards. */
  featuresHeading: string;
  features: AdminStoreFeature[];
  /** Cross-link to the Product block. */
  crosslink: {
    icon: string;
    name: string;
    sub: string;
  };
};

export const adminStoreFixture = (): AdminStoreFixture => ({
  title: "Store",
  emoji: "🛍",
  description:
    "Native commerce, products, inventory, and orders ship in tadaify v2.",
  timelinePill: "⏱ Targeting v2 · later this year",
  heroHeadline: "Native Store comes in v2",
  heroBody:
    "tadaify MVP doesn't include a native commerce platform. For now, sell via your existing store — Shopify, Stripe Payment Links, Etsy, Gumroad, Lemon Squeezy, or any URL — by adding a Product block to your home page. The block links visitors directly to your checkout.",
  signup: {
    label: "Get notified when Store ships",
    sub: "One email when v2 launches with native commerce. No promo, no spam.",
    emailPlaceholder: "alexandra@example.com",
  },
  featuresHeading: "What's coming in v2",
  features: [
    {
      id: "product-crud",
      icon: "📦",
      name: "Product CRUD",
      sub: "Create, edit, archive products. Cover, gallery, variants (size/color), inventory tracking, SKU.",
    },
    {
      id: "stripe-connect",
      icon: "💳",
      name: "Stripe Connect checkout",
      sub: "Native checkout with Stripe Connect. Payouts to your bank, Apple Pay / Google Pay, EU tax handling.",
    },
    {
      id: "orders-inbox",
      icon: "📋",
      name: "Orders inbox",
      sub: "All orders in one view. Mark fulfilled, print packing slips, refund, contact buyer.",
    },
    {
      id: "sales-analytics",
      icon: "📊",
      name: "Sales analytics",
      sub: "Revenue per product, cart abandonment, top referrer, monthly snapshots.",
    },
    {
      id: "shipping-digital",
      icon: "🚚",
      name: "Shipping & digital",
      sub: "Physical (rates by zone) + digital (auto-deliver download link on payment).",
    },
    {
      id: "discount-codes",
      icon: "🎁",
      name: "Discount codes",
      sub: "Percentage + flat-amount codes, expiry, usage limits. Free Stripe automatic taxes.",
    },
  ],
  crosslink: {
    icon: "🔗",
    name: "In the meantime — use the Product block",
    sub: "The Product block on your home page can link to ANY external store URL — Shopify, Etsy, Gumroad, Stripe Payment Link. Visitors click → land on your existing checkout. Zero migration needed.",
  },
});
