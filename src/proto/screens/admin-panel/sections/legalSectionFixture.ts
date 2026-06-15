/**
 * Typed mock seam for the Legal versioning admin pane. Mirrors the live
 * documents, draft, diff preview, and version-history rows in
 * mockups/tadaify-mvp/admin-panel.html so the section graduates by swapping
 * these factories for real legal_documents / acceptance data.
 */

export type LegalDocument = {
  title: string;
  status: string;
  version: string;
  slug: string;
  effective: string;
  daysLive: string;
  publishedBy: string;
  acceptancePct: string;
  acceptanceNote: string;
};

export type LegalDraft = {
  title: string;
  slug: string;
  lastEdited: string;
  chips: { label: string; variant: "warn" | "" }[];
};

export type LegalDiffLine = {
  text: string;
  kind: "" | "add" | "rem";
};

export type LegalDiff = {
  fromVersion: string;
  toVersion: string;
  added: string;
  removed: string;
  before: LegalDiffLine[];
  after: LegalDiffLine[];
};

export type LegalHistoryRow = {
  version: string;
  current: boolean;
  kind: string;
  effective: string;
  daysLive: string;
  forcedReacceptance: string;
};

export const legalDocumentsFixture = (): LegalDocument[] => [
  {
    title: "Terms of service",
    status: "Live",
    version: "Version v3.3",
    slug: "tos-v3.3",
    effective: "2026-02-18",
    daysLive: "67 days live",
    publishedBy: "founder@",
    acceptancePct: "98.4%",
    acceptanceNote: "833 of 847 active users · 14 on previous version",
  },
  {
    title: "Privacy policy",
    status: "Live",
    version: "Version v2.1",
    slug: "pp-v2.1",
    effective: "2025-12-01",
    daysLive: "146 days live",
    publishedBy: "founder@",
    acceptancePct: "100%",
    acceptanceNote: "847 of 847 active users · cookieless analytics described in §3",
  },
];

export const legalDraftFixture = (): LegalDraft => ({
  title: "ToS v3.4 — refund policy clarifications",
  slug: "tos-v3.4-draft",
  lastEdited: "last edited 2h ago by founder@",
  chips: [
    { label: "Material change", variant: "warn" },
    { label: "3 sections modified", variant: "" },
    { label: "+ §7.4 added", variant: "" },
  ],
});

export const legalDiffFixture = (): LegalDiff => ({
  fromVersion: "v3.3",
  toVersion: "v3.4",
  added: "+12 lines",
  removed: "−4 lines",
  before: [
    { text: "§7.3 — Refunds are issued at our sole discretion.", kind: "" },
    {
      text: "No automatic refunds outside the 14-day cool-off period.",
      kind: "rem",
    },
    { text: "Subscriptions cancel at end of billing period.", kind: "" },
    { text: "", kind: "" },
    { text: "§8 — Termination of account.", kind: "" },
  ],
  after: [
    { text: "§7.3 — Refunds are issued at our sole discretion.", kind: "" },
    {
      text: "If a service outage exceeds 4 hours in a billing cycle, you may request a pro-rated refund within 30 days.",
      kind: "add",
    },
    { text: "Subscriptions cancel at end of billing period.", kind: "" },
    {
      text: "§7.4 — Service-credit policy. Outages between 1-4 hours grant a service-credit equal to 1/30 of the current month's fee, applied to the next invoice automatically.",
      kind: "add",
    },
    { text: "§8 — Termination of account.", kind: "" },
  ],
});

export const legalHistoryFixture = (): LegalHistoryRow[] => [
  {
    version: "v3.3",
    current: true,
    kind: "ToS",
    effective: "2026-02-18",
    daysLive: "67 (current)",
    forcedReacceptance: "Yes — Stripe checkout terms",
  },
  {
    version: "v3.2",
    current: false,
    kind: "ToS",
    effective: "2025-11-01",
    daysLive: "109",
    forcedReacceptance: "No",
  },
  {
    version: "v3.1",
    current: false,
    kind: "ToS",
    effective: "2025-08-14",
    daysLive: "79",
    forcedReacceptance: "Yes — GDPR clarification",
  },
  {
    version: "v2.1",
    current: true,
    kind: "PP",
    effective: "2025-12-01",
    daysLive: "146 (current)",
    forcedReacceptance: "Yes — cookieless analytics §3",
  },
  {
    version: "v2.0",
    current: false,
    kind: "PP",
    effective: "2025-06-22",
    daysLive: "162",
    forcedReacceptance: "Yes — initial",
  },
];
