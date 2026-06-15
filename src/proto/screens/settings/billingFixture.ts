/**
 * Typed mock seam for the Settings · Billing tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-billing.html (current plan, payment method,
 * recent invoices, custom-domain add-ons, billing email) so the tab graduates
 * by swapping this factory for the real loader.
 *
 * @implements fr-settings
 */

export type InvoiceStatus = "paid" | "open" | "void" | "failed";

export type BillingInvoice = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: InvoiceStatus;
};

export type ComparePlan = {
  id: "free" | "creator" | "pro" | "business";
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  /** The currently active plan renders its CTA disabled. */
  current?: boolean;
};

export type DomainAddon = {
  domain: string;
  price: string;
};

export type BillingFixture = {
  planName: string;
  planIcon: string;
  planPriceMonthly: string;
  planPriceYearly: string;
  renews: string;
  cardBrand: string;
  cardLast4: string;
  cardExpiry: string;
  billingEmail: string;
  comparePlans: ComparePlan[];
  invoices: BillingInvoice[];
  invoiceShown: number;
  invoiceTotal: number;
  domains: DomainAddon[];
};

export const billingFixture = (): BillingFixture => ({
  planName: "Creator",
  planIcon: "✨",
  planPriceMonthly: "$7.99/mo",
  planPriceYearly: "$79.90/yr",
  renews: "Dec 1, 2026",
  cardBrand: "VISA",
  cardLast4: "4242",
  cardExpiry: "12 / 27",
  billingEmail: "alexandra@example.com",
  comparePlans: [
    {
      id: "free",
      name: "Free",
      price: "$0",
      priceNote: "forever",
      features: ["1 page · custom theme", "Unlimited blocks", "Full analytics dataset", "No custom domain"],
    },
    {
      id: "creator",
      name: "Creator ⭐",
      price: "$7.99/mo",
      priceNote: "locked for life",
      current: true,
      features: ["Everything in Free", "Sell products + communities", "Verified ✓ creator badge", "Schedule visibility", "20 AI credits / mo"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19.99/mo",
      priceNote: "locked for life",
      features: ["Everything in Creator", "Per-page custom domain", "Password protection", "REST API + MCP", "100 AI credits / mo"],
    },
    {
      id: "business",
      name: "Business",
      price: "$49.99/mo",
      priceNote: "locked for life",
      features: ["Everything in Pro", "A/B testing", "Team seats + roles", "Parquet R2 monthly archive", "Unlimited AI credits"],
    },
  ],
  invoices: [
    { id: "in_1", date: "2026-04-01", description: "Creator plan · monthly", amount: "$7.99", status: "paid" },
    { id: "in_2", date: "2026-03-01", description: "Creator plan · monthly", amount: "$7.99", status: "paid" },
    { id: "in_3", date: "2026-03-01", description: "Custom domains · 2 × $1.99", amount: "$3.98", status: "paid" },
    { id: "in_4", date: "2026-02-01", description: "Creator plan · monthly", amount: "$7.99", status: "paid" },
    { id: "in_5", date: "2026-01-15", description: "Creator plan · monthly (retry)", amount: "$7.99", status: "failed" },
    { id: "in_6", date: "2026-01-01", description: "Pro plan · monthly (prorated)", amount: "$2.40", status: "void" },
    { id: "in_7", date: "2025-12-01", description: "Creator plan · monthly", amount: "$7.99", status: "paid" },
    { id: "in_8", date: "2025-11-01", description: "Creator plan · monthly", amount: "$7.99", status: "open" },
  ],
  invoiceShown: 8,
  invoiceTotal: 47,
  domains: [
    { domain: "alexandra.com", price: "$1.99/mo" },
    { domain: "silva.studio", price: "$1.99/mo" },
  ],
});
