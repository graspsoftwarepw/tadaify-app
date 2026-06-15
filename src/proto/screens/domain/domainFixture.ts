/**
 * Typed mock seam for the Configuration > Domain screen. Mirrors the data shown
 * in mockups/tadaify-mvp/app-domain.html (connected-domain list, DNS records,
 * registrar paths, billing notes, and best-practice tips) so the screen
 * graduates by swapping these factories for the real loader.
 */

export type DomainStatus = "active" | "provisioning" | "error";

export type ConnectedDomain = {
  id: string;
  name: string;
  status: DomainStatus;
  /** Marks the domain visitors are routed to first. */
  primary: boolean;
  /** Short status words rendered in the meta row. */
  meta: string[];
  /** When true the SSL provisioning line shows a pulsing dot. */
  provisioning?: boolean;
  /** Days left on the current billing period, used by the remove confirm. */
  daysLeft: number;
};

export type DnsRecord = {
  type: string;
  value: string;
  /** Name / Host column. */
  name: string;
  ttl: string;
};

export type RegistrarPath = {
  registrar: string;
  note?: string;
  path: string;
};

export type DomainTier = "free" | "creator" | "pro" | "business";

export type BillingNote = {
  tier: DomainTier;
  headline: string;
  body: string;
};

export type DomainTip = {
  icon: string;
  title: string;
  body: string;
};

export const domainProfileFixture = () => ({
  handle: "alexandra",
  pageUrl: "tadaify.com/alexandra",
});

export const connectedDomainsFixture = (): ConnectedDomain[] => [
  {
    id: "d1",
    name: "alexandra.com",
    status: "active",
    primary: true,
    meta: ["Connected", "SSL active", "47 days"],
    daysLeft: 28,
  },
  {
    id: "d2",
    name: "store.alexandra.com",
    status: "provisioning",
    primary: false,
    meta: ["DNS verified", "SSL provisioning…", "Updates every 30s"],
    provisioning: true,
    daysLeft: 27,
  },
];

export const dnsRecordsFixture = (dnsName: string): DnsRecord[] => [
  { type: "CNAME", value: "tadaify.com", name: dnsName, ttl: "Auto (or 3600)" },
];

export const dnsTxtRecordFixture = (): DnsRecord[] => [
  { type: "TXT", value: "tadaify-verify=a8f3e1b2", name: "@", ttl: "Auto" },
];

export const registrarPathsFixture = (): RegistrarPath[] => [
  {
    registrar: "Namecheap",
    path: "Domain List → Manage → Advanced DNS → Add New Record → CNAME",
  },
  {
    registrar: "GoDaddy",
    path: "My Products → DNS → Add → CNAME; set Name to @ and Value to tadaify.com",
  },
  {
    registrar: "Cloudflare",
    path: "Dashboard → DNS → Records → Add record. Important: set proxy status to DNS Only (grey cloud) — not proxied.",
  },
  {
    registrar: "Porkbun",
    path: "Manage → DNS → Quick DNS → CNAME to tadaify.com",
  },
  {
    registrar: "Google Domains",
    note: "(now Squarespace)",
    path: "DNS → Manage custom records → Create new record → CNAME",
  },
];

export const registrarChipsFixture = (): string[] => [
  "Namecheap",
  "Porkbun",
  "Cloudflare Registrar",
];

export const billingNotesFixture = (): BillingNote[] => [
  {
    tier: "free",
    headline: "Billing: 2 domains × $1.99/mo = $4/mo",
    body: "No domains are included on Free — this $4/mo covers both.",
  },
  {
    tier: "creator",
    headline: "Billing: 1 domain included · 1 extra × $1.99/mo = $1.99/mo",
    body: "Creator includes 1 domain. You're paying for 1 extra.",
  },
  {
    tier: "pro",
    headline: "Billing: 1 domain included · 1 extra × $1.99/mo = $1.99/mo",
    body: "Pro includes 1 domain. You're paying for 1 extra.",
  },
  {
    tier: "business",
    headline: "Billing: 10 domains included · both covered",
    body: "Business includes 10 domains. Both of yours are on your plan.",
  },
];

export const domainTipsFixture = (): DomainTip[] => [
  {
    icon: "📈",
    title: "SEO benefit",
    body: "Your own domain signals authority to search engines. Links pointing to yourdomain.com build equity you own — not tadaify.com's.",
  },
  {
    icon: "📧",
    title: "Email forwarding",
    body: "We don't provide email. For hello@yourdomain.com forwarding try ImprovMX (free tier) or Cloudflare Email Routing.",
  },
  {
    icon: "🔗",
    title: "Subdomain vs apex",
    body: "links.yourdomain.com works great if you want your main site on the root. Apex (yourdomain.com) looks cleanest.",
  },
  {
    icon: "🌐",
    title: "Existing website?",
    body: "Yes — you can use a subdomain like links.yourdomain.com while your main site stays on Webflow, Squarespace, etc.",
  },
];
