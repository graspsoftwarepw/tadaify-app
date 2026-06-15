/**
 * Typed mock seam for the System Health admin pane. Mirrors the service grid,
 * live traffic charts, recent errors and latency table in
 * mockups/tadaify-mvp/admin-panel.html so the section graduates by swapping
 * these factories for real Workers Analytics Engine / status-probe data.
 * @implements fr-admin-panel
 */

export type HealthServiceStatus = "green" | "yellow" | "red";

export type HealthService = {
  status: HealthServiceStatus;
  name: string;
  meta: string;
  /** External status page; `null` renders a non-navigating mock link. */
  href: string | null;
  /** Whether the status-page icon carries the diagonal "external" arrow. */
  external: boolean;
};

export type HealthError = {
  message: string;
  title: string;
  count: string;
  time: string;
};

export type HealthLatencyRow = {
  endpoint: string;
  rpm: string;
  p50: string;
  p95: string;
  p99: string;
  errors: string;
  /** Tint for the error cell: success (green) or warning (amber). */
  errorTone: "success" | "warning";
};

export const healthServicesFixture = (): HealthService[] => [
  {
    status: "green",
    name: "Cloudflare Workers",
    meta: "142ms p95 · 0.04% errors",
    href: "https://www.cloudflarestatus.com/",
    external: true,
  },
  { status: "green", name: "D1 (Cloudflare)", meta: "8.4ms p95 · 0% errors", href: null, external: true },
  { status: "green", name: "Workers Analytics Engine", meta: "events/s: 47 · 0% drops", href: null, external: false },
  { status: "green", name: "R2 (object storage)", meta: "12ms p95 · 0.01% errors", href: null, external: false },
  {
    status: "green",
    name: "Supabase (auth + RLS)",
    meta: "38ms p95 · 0.02% errors",
    href: "https://status.supabase.com",
    external: true,
  },
  {
    status: "green",
    name: "Stripe (payments)",
    meta: "192ms p95 · webhook lag 1.2s",
    href: "https://status.stripe.com",
    external: true,
  },
  {
    status: "green",
    name: "Resend (email)",
    meta: "delivery 99.7% · bounce 0.3%",
    href: "https://status.resend.com",
    external: false,
  },
  { status: "yellow", name: "Cloudflare for SaaS", meta: "6 domains pending SSL", href: null, external: false },
];

/** Requests/sec polyline points (x,y) over the 800×180 viewBox from the mockup. */
export const healthRpsSeriesFixture = (): Array<[number, number]> => [
  [60, 90], [80, 84], [100, 72], [120, 80], [140, 76], [160, 82], [180, 68],
  [200, 72], [220, 60], [240, 68], [260, 56], [280, 52], [300, 60], [320, 68],
  [340, 72], [360, 84], [380, 76], [400, 68], [420, 72], [440, 80], [460, 76],
  [480, 68], [500, 72], [520, 80], [540, 76], [560, 68], [580, 72], [600, 76],
  [620, 80], [640, 72], [660, 68], [680, 72], [700, 76], [720, 68],
];

/** Error-rate polyline points (x,y) over the 800×180 viewBox from the mockup. */
export const healthErrorSeriesFixture = (): Array<[number, number]> => [
  [60, 140], [100, 138], [140, 142], [180, 138], [220, 134], [260, 140],
  [300, 138], [340, 128], [380, 108], [420, 124], [460, 138], [500, 140],
  [540, 138], [580, 140], [620, 138], [660, 142], [700, 140], [720, 142],
];

export const healthErrorsFixture = (): HealthError[] => [
  {
    message: "POST /api/stripe/webhook — Invalid signature on event evt_3K8jX",
    title: "POST /api/stripe/webhook — Invalid signature on event evt_3K8jX (idempotency conflict)",
    count: "12",
    time: "14m ago",
  },
  {
    message: "GET /api/page/{handle}/blocks — D1 timeout after 5s",
    title: "GET /api/page/{handle}/blocks — D1 timeout after 5s on handle 'crypto_alpha_xxx_long_handle_test'",
    count: "3",
    time: "1h 8m ago",
  },
  {
    message: "POST /api/auth/signup — Resend 429 rate-limit",
    title: "POST /api/auth/signup — Resend 429 rate-limit (back-off)",
    count: "2",
    time: "3h 22m ago",
  },
];

export const healthLatencyFixture = (): HealthLatencyRow[] => [
  { endpoint: "GET /:handle", rpm: "14,820", p50: "28ms", p95: "142ms", p99: "312ms", errors: "0.01%", errorTone: "success" },
  { endpoint: "POST /api/click/track", rpm: "8,144", p50: "12ms", p95: "38ms", p99: "94ms", errors: "0%", errorTone: "success" },
  { endpoint: "GET /app/dashboard", rpm: "1,288", p50: "62ms", p95: "218ms", p99: "524ms", errors: "0.02%", errorTone: "success" },
  { endpoint: "POST /api/auth/signup", rpm: "12", p50: "340ms", p95: "820ms", p99: "1.4s", errors: "0.16%", errorTone: "warning" },
  { endpoint: "POST /api/stripe/webhook", rpm: "186", p50: "88ms", p95: "192ms", p99: "408ms", errors: "6.4%", errorTone: "warning" },
];
