/**
 * Typed mock seam for the Settings · API keys tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-apikeys.html (the API keys table, the
 * scope-permission reference, the webhook delivery log, and the rate-limit
 * panel) so the tab graduates by swapping this factory for the real loader.
 *
 * @implements fr-settings
 */

export type ApiScope =
  | "read:pages"
  | "read:blocks"
  | "write:pages"
  | "write:blocks"
  | "read:analytics"
  | "read:subscribers"
  | "write:subscribers"
  | "webhooks";

export type ApiKey = {
  id: string;
  name: string;
  desc: string;
  scopes: ApiScope[];
  created: string;
  lastUsed: string;
  last4: string;
  /** Revoked keys show a muted row with no actions. */
  revoked?: boolean;
};

export type ScopeRef = {
  scope: ApiScope;
  desc: string;
  /** Read scopes vs write scopes get a different tag colour. */
  write?: boolean;
};

export type WebhookCode = "2xx" | "4xx" | "5xx" | "pending";

export type WebhookDelivery = {
  id: string;
  when: string;
  endpoint: string;
  event: string;
  status: string;
  code: WebhookCode;
  rt: string;
  retries: number;
};

export type RateCard = {
  label: string;
  used: string;
  limit: string;
  sub: string;
  /** Bar fill percentage 0–100. */
  pct: number;
};

export type RateTier = {
  name: string;
  limit: string;
  note: string;
  /** Render the row muted (the Free / Creator "no access" row). */
  muted?: boolean;
};

export type ApiKeysFixture = {
  /** The scopes offered when generating a key (drives the modal checkbox list). */
  scopeRef: ScopeRef[];
  keys: ApiKey[];
  /** Active-key cap copy. */
  keysCap: string;
  webhooks: WebhookDelivery[];
  webhookTotal: number;
  rateCards: RateCard[];
  rateTiers: RateTier[];
};

export function apiKeysFixture(): ApiKeysFixture {
  return {
    scopeRef: [
      { scope: "read:pages", desc: "List your pages, read settings, layout, theme, and SEO meta. No PII." },
      { scope: "read:blocks", desc: "Read every block on every page (link / video / form / shop / FAQ / portfolio / blog)." },
      { scope: "write:pages", write: true, desc: "Create new pages, change page settings (title, slug, theme), publish or unpublish. Renames trigger redirects." },
      { scope: "write:blocks", write: true, desc: "Add, edit, reorder, delete blocks. Bulk-publish a draft. Counts against AI credits when ✨ Suggest is invoked." },
      { scope: "read:analytics", desc: "Pull views, click counts, conversion KPIs, time-series. 1 hour cache window — fresh data costs more requests." },
      { scope: "read:subscribers", desc: "List your email subscribers (creator-side). PII access — appears in your audit log on every call." },
      { scope: "write:subscribers", write: true, desc: "Add or unsubscribe people from your list. Honours double opt-in flag and GDPR consent state." },
      { scope: "webhooks", write: true, desc: "Register endpoints to receive event callbacks (page.published, subscriber.added, …). Required for the live webhook log below." },
    ],
    keys: [
      {
        id: "ak_001",
        name: "Production",
        desc: "Live integration · main pipeline",
        scopes: ["read:pages", "read:blocks", "write:blocks", "webhooks"],
        created: "Mar 2, 2026",
        lastUsed: "12 min ago",
        last4: "x9k2",
      },
      {
        id: "ak_002",
        name: "Staging",
        desc: "Used by staging.tadaify.example for QA",
        scopes: ["read:pages", "read:blocks", "write:pages", "write:blocks"],
        created: "Feb 18, 2026",
        lastUsed: "4 hours ago",
        last4: "mPq7",
      },
      {
        id: "ak_003",
        name: "Webhook receiver",
        desc: "Zapier — page.published → email blast",
        scopes: ["webhooks"],
        created: "Jan 11, 2026",
        lastUsed: "Yesterday",
        last4: "jL3v",
      },
      {
        id: "ak_004",
        name: "GPT integration",
        desc: "My Custom GPT on chatgpt.com",
        scopes: ["read:pages", "read:blocks", "read:analytics"],
        created: "Dec 22, 2025",
        lastUsed: "2 hours ago",
        last4: "fA8t",
      },
      {
        id: "ak_005",
        name: "Make.com automation",
        desc: "New form submission → Notion + Klaviyo · revoked Apr 8",
        scopes: ["read:subscribers", "write:subscribers", "webhooks"],
        created: "Nov 4, 2025",
        lastUsed: "6 days ago",
        last4: "wK1n",
        revoked: true,
      },
    ],
    keysCap: "25 active keys per account",
    webhooks: [
      { id: "wh1", when: "2 min ago", endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc", event: "page.published", status: "200", code: "2xx", rt: "412 ms", retries: 0 },
      { id: "wh2", when: "14 min ago", endpoint: "https://hooks.make.com/r/x9KQpZ", event: "subscriber.added", status: "200", code: "2xx", rt: "184 ms", retries: 0 },
      { id: "wh3", when: "38 min ago", endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc", event: "block.created", status: "200", code: "2xx", rt: "298 ms", retries: 0 },
      { id: "wh4", when: "1 h ago", endpoint: "https://my-api.alexandra.com/webhooks/tadaify", event: "form.submitted", status: "500", code: "5xx", rt: "5,003 ms", retries: 3 },
      { id: "wh5", when: "2 h ago", endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc", event: "page.unpublished", status: "200", code: "2xx", rt: "356 ms", retries: 0 },
      { id: "wh6", when: "3 h ago", endpoint: "https://my-api.alexandra.com/webhooks/tadaify", event: "subscriber.removed", status: "404", code: "4xx", rt: "129 ms", retries: 1 },
      { id: "wh7", when: "5 h ago", endpoint: "https://hooks.make.com/r/x9KQpZ", event: "block.created", status: "pending", code: "pending", rt: "—", retries: 2 },
      { id: "wh8", when: "8 h ago", endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc", event: "page.published", status: "200", code: "2xx", rt: "267 ms", retries: 0 },
      { id: "wh9", when: "11 h ago", endpoint: "https://my-api.alexandra.com/webhooks/tadaify", event: "form.submitted", status: "200", code: "2xx", rt: "412 ms", retries: 1 },
      { id: "wh10", when: "Yesterday", endpoint: "https://hooks.make.com/r/x9KQpZ", event: "subscriber.added", status: "200", code: "2xx", rt: "202 ms", retries: 0 },
    ],
    webhookTotal: 348,
    rateCards: [
      { label: "This hour · Pro tier", used: "423", limit: "1,000", sub: "42% used · resets in 38 min at the top of the hour (UTC)", pct: 42 },
      { label: "Today · all keys combined", used: "3,184", limit: "/ day", sub: "Across 4 active keys · Production 71% / GPT integration 19% / Make.com 9% / others 1%", pct: 33 },
    ],
    rateTiers: [
      { name: "Pro", limit: "1,000 req/h", note: "Per key. Resets on the clock hour. 8 webhook retries per failed delivery." },
      { name: "Business", limit: "5,000 req/h", note: "Per key. Higher webhook concurrency (16 in flight). Fair-use cap ~50,000/day account-wide." },
      { name: "Free / Creator", limit: "— no API access", note: "Upgrade to Pro to unlock keys.", muted: true },
    ],
  };
}
