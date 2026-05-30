/**
 * SettingsBilling — Billing sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-billing.html (1731 LOC)
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real Stripe wiring — all handlers are stubs or local state.
 *
 * Sections (in order):
 *   1. State banners (past-due / card-expiring / trial / cancel-scheduled)
 *   2. Current plan card + pricelock note + compare-plans expander
 *   3. Payment method (card on file / no card)
 *   4. Recent invoices table (filterable) + footer
 *   5. Manage in Stripe CTAs
 *   6. Custom domain add-ons (DEC-PRICELOCK-02)
 *   7. Billing email (read-only, cross-link to Account)
 *   8. Cancel cross-link → Danger zone (AP-010 canonical path)
 *   9. Help footer
 *  10. Modals (centered, NEVER drawers):
 *       - Stripe Portal redirect (spinner + success states)
 *       - Change plan confirm (prorate + pricelock)
 *       - Cancel flow (3-step: reason → confirm → done)
 *
 * All Stripe portal / change plan / payment method / invoice download actions
 * are stubs — each carries a TODO comment for the real implementation.
 *
 * DEC trail honoured:
 *   DEC-073  hybrid Stripe-portal architecture
 *   DEC-PRICELOCK-01  price-lock-for-life amber pill
 *   DEC-PRICELOCK-02  $1.99/mo custom-domain add-on line items
 *   AP-010   cancel canonical path = Danger zone (NOT portal)
 *   AP-029   pages stay live during dunning / cancel grace period
 *   AP-031   no sticky upsell banners — only the upgrade CTA card
 *
 * Story: F-APP-SETTINGS-BILLING-001 (#34)
 */

import { useState, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SubState =
  | "creator-active"
  | "free"
  | "creator-trial"
  | "past-due"
  | "cancel-scheduled"
  | "card-expiring"
  | "zero-invoices"
  | "eur-currency"
  | "multi-sub-items"
  | "business-yearly";

type Cadence = "monthly" | "yearly";

type InvoiceStatus = "paid" | "open" | "void" | "failed";
type InvoiceFilter = "all" | InvoiceStatus;

type PortalFlow = "billing" | "payment_method_update" | "invoices";

type CancelStep = "reason" | "confirm" | "done";

interface SampleInvoice {
  date: string;
  desc: string;
  amount: number;
  status: InvoiceStatus;
  id: string;
  credit?: boolean;
}

// ─── Stub data (verbatim from mockup) ────────────────────────────────────────

const SAMPLE_INVOICES: SampleInvoice[] = [
  { date: "Apr 15, 2026", desc: "Creator subscription · Apr",       amount: 8.00,  status: "paid",   id: "in_1Q9aLE" },
  { date: "Apr 15, 2026", desc: "Custom domain · alexandra.com",    amount: 2.00,  status: "paid",   id: "in_1Q9aLF" },
  { date: "Apr 15, 2026", desc: "Custom domain · silva.studio",     amount: 2.00,  status: "paid",   id: "in_1Q9aLG" },
  { date: "Mar 15, 2026", desc: "Creator subscription · Mar",       amount: 8.00,  status: "paid",   id: "in_1Q9aJX" },
  { date: "Mar 15, 2026", desc: "Custom domain · alexandra.com",    amount: 2.00,  status: "paid",   id: "in_1Q9aJY" },
  { date: "Mar 15, 2026", desc: "Custom domain · silva.studio",     amount: 2.00,  status: "paid",   id: "in_1Q9aJZ" },
  { date: "Feb 15, 2026", desc: "Creator subscription · Feb",       amount: 8.00,  status: "paid",   id: "in_1Q9aHk" },
  { date: "Feb 15, 2026", desc: "Custom domain · alexandra.com",    amount: 2.00,  status: "paid",   id: "in_1Q9aHl" },
  { date: "Jan 15, 2026", desc: "Creator subscription · Jan",       amount: 8.00,  status: "paid",   id: "in_1Q9aGm" },
  { date: "Jan 15, 2026", desc: "Refund · tier downgrade prorate",  amount: -3.00, status: "paid",   id: "in_1Q9aGn", credit: true },
  { date: "Dec 15, 2025", desc: "Pro subscription · Dec",           amount: 19.00, status: "paid",   id: "in_1Q8aFn" },
  { date: "Dec 15, 2025", desc: "Pro subscription · Nov retry",     amount: 19.00, status: "failed", id: "in_1Q8aFo" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusChipClass(s: InvoiceStatus): string {
  return ({ paid: "status-paid", open: "status-open", void: "status-void", failed: "status-failed" } as const)[s];
}

function statusChipLabel(s: InvoiceStatus): string {
  return ({ paid: "✓ Paid", open: "· Open", void: "∅ Void", failed: "✗ Failed" } as const)[s];
}

function fmtAmount(n: number, currency: "usd" | "eur"): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n).toFixed(2);
  if (currency === "eur") return `${sign}€${abs} EUR`;
  return `${sign}$${abs}`;
}

// ─── Plan card data by state ──────────────────────────────────────────────────

interface PlanCardData {
  icon: string;
  name: string;
  priceHtml: string;
  badgesHtml: string;
  showPricelock: boolean;
  showChangeBtn: boolean;
  showDowngradeBtn: boolean;
  changeBtnLabel: string;
  currency: "usd" | "eur";
  showInvoiceTable: boolean;
  showPmEmpty: boolean;
  showStripeCtas: boolean;
  showDomainsFailed: boolean;
  showDomainsEmpty: boolean;
  currentPlan: "free" | "creator" | "pro" | "business";
  cancelScheduled: boolean;
}

function getPlanData(state: SubState, cadence: Cadence): PlanCardData {
  const yearly = cadence === "yearly";
  const base = {
    showChangeBtn: true,
    showDowngradeBtn: true,
    showPmEmpty: false,
    showStripeCtas: true,
    showDomainsFailed: false,
    showDomainsEmpty: false,
    cancelScheduled: false,
  };

  switch (state) {
    case "free":
      return {
        ...base,
        icon: "🌱",
        name: "Free",
        priceHtml: "<b>$0</b> · you're on Free forever",
        badgesHtml: '<span class="chip">Free</span>',
        showPricelock: false,
        changeBtnLabel: "Upgrade →",
        showDowngradeBtn: false,
        currency: "usd",
        showInvoiceTable: false,
        showPmEmpty: true,
        showStripeCtas: false,
        currentPlan: "free",
      };

    case "creator-trial":
      return {
        ...base,
        icon: "🎁",
        name: "Creator (trial)",
        priceHtml: "<b>$7.99/mo</b> · trial ends <b>May 1, 2026</b>",
        badgesHtml:
          '<span class="chip info">5 days left in trial</span>' +
          '<span class="chip locked-life">🔒 Will lock at $7.99/mo</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        currentPlan: "creator",
      };

    case "past-due":
      return {
        ...base,
        icon: "⚠️",
        name: "Creator",
        priceHtml: "<b>$7.99/mo</b> · last attempt failed Apr 15, 2026",
        badgesHtml:
          '<span class="chip danger">Past due</span>' +
          '<span class="chip locked-life">🔒 $7.99/mo locked</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        showDomainsFailed: true,
        currentPlan: "creator",
      };

    case "cancel-scheduled":
      return {
        ...base,
        icon: "🟠",
        name: "Creator",
        priceHtml: "<b>$7.99/mo</b> · access ends <b>Dec 1, 2026</b>",
        badgesHtml:
          '<span class="chip warn">Active until Dec 1, 2026 (cancellation scheduled)</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        cancelScheduled: true,
        currentPlan: "creator",
      };

    case "card-expiring":
      return {
        ...base,
        icon: "✨",
        name: "Creator",
        priceHtml: "<b>$7.99/mo</b> · renews <b>Dec 1, 2026</b>",
        badgesHtml:
          '<span class="chip locked-life">🔒 Locked for life at $7.99/mo</span>' +
          '<span class="chip warn">Card expires soon</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        currentPlan: "creator",
      };

    case "zero-invoices":
      return {
        ...base,
        icon: "✨",
        name: "Creator",
        priceHtml: "<b>$7.99/mo</b> · first charge on <b>May 1, 2026</b>",
        badgesHtml:
          '<span class="chip locked-life">🔒 Locked for life at $7.99/mo</span>' +
          '<span class="chip success">Active</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: false,
        currentPlan: "creator",
      };

    case "eur-currency":
      return {
        ...base,
        icon: "✨",
        name: "Creator",
        priceHtml: "<b>€8.00 EUR / mo</b> · renews <b>Dec 1, 2026</b>",
        badgesHtml:
          '<span class="chip locked-life">🔒 Locked for life at €8/mo</span>' +
          '<span class="chip success">Active</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "eur",
        showInvoiceTable: true,
        currentPlan: "creator",
      };

    case "multi-sub-items":
      return {
        ...base,
        icon: "✨",
        name: "Creator",
        priceHtml:
          "<b>$7.99/mo Creator</b> + <b>$25/mo Workshop add-on</b> · renews Dec 1, 2026",
        badgesHtml:
          '<span class="chip locked-life">🔒 Creator $7.99/mo locked</span>' +
          '<span class="chip info">+ Workshop add-on</span>' +
          '<span class="chip success">Active</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        currentPlan: "creator",
      };

    case "business-yearly": {
      const priceHtml = yearly
        ? "<b>$599.88/yr</b> · renews <b>Dec 1, 2026</b> <span class=\"cadence-savings\">save 2 mo</span>"
        : "<b>$599.88/yr</b> · renews <b>Dec 1, 2026</b> <span class=\"cadence-savings\">save 2 mo</span>";
      return {
        ...base,
        icon: "🔒",
        name: "Business",
        priceHtml,
        badgesHtml:
          '<span class="chip locked-life">🔒 Locked for life at $49.99/mo</span>' +
          '<span class="chip success">Active · yearly</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        currentPlan: "business",
      };
    }

    default: // creator-active
      return {
        ...base,
        icon: "✨",
        name: "Creator",
        priceHtml: yearly
          ? "<b>$95.88/yr</b> · renews <b>Dec 1, 2026</b> <span class=\"cadence-savings\">save 2 mo</span>"
          : "<b>$7.99/mo</b> · renews <b>Dec 1, 2026</b>",
        badgesHtml:
          '<span class="chip locked-life">🔒 Locked for life at $7.99/mo</span>' +
          '<span class="chip success">Active</span>',
        showPricelock: true,
        changeBtnLabel: "Change plan",
        currency: "usd",
        showInvoiceTable: true,
        currentPlan: "creator",
      };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsBilling() {
  // ── Local demo state (mirrors mockup demo toolbar) ────────────────────────
  const [subState] = useState<SubState>("creator-active"); // TODO: wire to billing API
  const [cadence, setCadenceState] = useState<Cadence>("monthly");

  const planData = getPlanData(subState, cadence);
  const invoiceCurrency = planData.currency;

  // ── Invoice filter ────────────────────────────────────────────────────────
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>("all");
  const filteredInvoices = SAMPLE_INVOICES.filter(
    (inv) => invoiceFilter === "all" || inv.status === invoiceFilter
  );

  // ── Compare plans expander ────────────────────────────────────────────────
  const [compareOpen, setCompareOpen] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  type ModalId = "portal" | "change-plan" | "cancel" | null;
  const [openModal, setOpenModal] = useState<ModalId>(null);

  // Portal modal state
  const [portalFlow, setPortalFlow] = useState<PortalFlow>("billing");
  const [portalDone, setPortalDone] = useState(false);
  const portalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Change-plan modal state
  const [cpDirection, setCpDirection] = useState<"upgrade" | "downgrade">("upgrade");

  // Cancel modal step
  const [cancelStep, setCancelStepState] = useState<CancelStep>("reason");

  // ── Cadence toggle ────────────────────────────────────────────────────────
  const handleSetCadence = useCallback((c: Cadence) => {
    setCadenceState(c);
  }, []);

  // ── Stripe Portal stub ────────────────────────────────────────────────────
  const openStripePortal = useCallback((flow: PortalFlow) => {
    // TODO: wire to Stripe portal session
    // Real impl: POST /api/billing/portal-session { flow }
    // → window.location.href = res.url
    setPortalFlow(flow);
    setPortalDone(false);
    setOpenModal("portal");
    if (portalTimer.current) clearTimeout(portalTimer.current);
    portalTimer.current = setTimeout(() => {
      if (flow === "payment_method_update") {
        setPortalDone(true);
      }
    }, 1100);
  }, []);

  const closePortalModal = useCallback(() => {
    if (portalTimer.current) clearTimeout(portalTimer.current);
    setPortalDone(false);
    setOpenModal(null);
  }, []);

  // ── Change plan stub ──────────────────────────────────────────────────────
  const openChangePlan = useCallback((direction: "upgrade" | "downgrade") => {
    // TODO: wire to Stripe portal session
    setCpDirection(direction);
    setOpenModal("change-plan");
  }, []);

  const confirmChangePlan = useCallback(() => {
    // TODO: wire to Stripe portal session
    // Real impl: stripe.subscriptions.update + persist price_locked_at metadata
    setOpenModal(null);
  }, []);

  // ── Cancel flow stubs ─────────────────────────────────────────────────────
  const openCancel = useCallback(() => {
    // TODO: wire to Stripe portal session (portal cancel is DISABLED per DEC-073; use this AP-010 path)
    setCancelStepState("reason");
    setOpenModal("cancel");
  }, []);

  const reactivateSubscription = useCallback(() => {
    // TODO: wire to Stripe portal session
    // Real impl: stripe.subscriptions.update({ cancel_at_period_end: false })
    setOpenModal(null);
  }, []);

  // ── Invoice PDF stub ──────────────────────────────────────────────────────
  const openStripeInvoice = useCallback((id: string) => {
    // TODO: wire to Stripe portal session
    // Real impl: window.open(invoice.hosted_invoice_url, '_blank', 'noopener')
    void id;
  }, []);

  // ── Select plan from compare grid ─────────────────────────────────────────
  const selectPlan = useCallback((plan: string) => {
    // TODO: wire to Stripe portal session
    void plan;
    setOpenModal("change-plan");
  }, []);

  // ── Cadence price display ─────────────────────────────────────────────────
  function fmtYearly(monthly: number): string {
    if (cadence === "monthly") return `$${monthly}/mo`;
    const yearly = (monthly * 12).toFixed(0);
    return `$${yearly}/yr · save 2 months`;
  }

  const cpTarget = cpDirection === "upgrade" ? "Pro" : "Free";
  const cpTargetPrice = cpDirection === "upgrade" ? "$19.99/mo" : "$0";
  const cpProrate = cpDirection === "upgrade" ? "$7.33" : "$0.00";

  const isCardExpiring = subState === "card-expiring";
  const pmExpHtml = isCardExpiring
    ? '<b style="color:var(--brand-warm-dark)">Expires 05 / 26</b> · billing email <b>alexandra@example.com</b>'
    : "Expires 12 / 27 · billing email <b>alexandra@example.com</b>";

  return (
    <>
      {/* ============================================================
           SETTINGS CONTENT: BILLING
           ============================================================ */}
      <div className="settings-content" id="pane-billing" data-tab="billing">

        {/* =====================================================
             STATE BANNERS — visible only for certain states
             ===================================================== */}

        {/* Past due */}
        {subState === "past-due" && (
          <div className="sb-billing state-banner danger" role="alert">
            <span className="sb-ico" aria-hidden="true">⚠️</span>
            <div className="sb-body">
              <strong>Payment failed — update your card to keep your features</strong>
              We tried to charge $7.99 on Apr 15, 2026 and the bank declined.
              Your pages stay live for 7 more days while we retry — update your card now to avoid interruption.
            </div>
            <div className="sb-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openStripePortal("payment_method_update")}
              >
                Update card
              </button>
            </div>
          </div>
        )}

        {/* Card expiring */}
        {subState === "card-expiring" && (
          <div className="sb-billing state-banner warn" role="alert">
            <span className="sb-ico" aria-hidden="true">💳</span>
            <div className="sb-body">
              <strong>Card expires May 2026 — update before then</strong>
              Your Visa ending 4242 will expire next month. Update it now and your renewals keep flowing.
            </div>
            <div className="sb-actions">
              <button
                className="btn btn-warm btn-sm"
                onClick={() => openStripePortal("payment_method_update")}
              >
                Update card
              </button>
            </div>
          </div>
        )}

        {/* Trial */}
        {subState === "creator-trial" && (
          <div className="sb-billing state-banner info">
            <span className="sb-ico" aria-hidden="true">🎁</span>
            <div className="sb-body">
              <strong>5 days left in your free Creator trial</strong>
              Your card on file gets charged $7.99 on May 1, 2026 — cancel anytime before then in{" "}
              <button
                className="cl-link"
                style={{ color: "#1E40AF" }}
                onClick={openCancel}
              >
                Danger zone
              </button>.
            </div>
          </div>
        )}

        {/* Cancel scheduled */}
        {subState === "cancel-scheduled" && (
          <div className="sb-billing state-banner warn">
            <span className="sb-ico" aria-hidden="true">🟠</span>
            <div className="sb-body">
              <strong>Cancellation scheduled for Dec 1, 2026</strong>
              Your pages stay live until then. Reactivate any time before that date and nothing changes.
            </div>
            <div className="sb-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={reactivateSubscription}
              >
                Reactivate at $7.99/mo
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
             SECTION 1 — Current plan
             ===================================================== */}
        <div className="settings-section">
          <div className="settings-section-title with-action">
            <span>Current plan</span>
            <span className="cadence-toggle" role="tablist" aria-label="Billing cadence">
              <button
                id="cad-monthly"
                className={cadence === "monthly" ? "active" : ""}
                onClick={() => handleSetCadence("monthly")}
              >
                Monthly
              </button>
              <button
                id="cad-yearly"
                className={cadence === "yearly" ? "active" : ""}
                onClick={() => handleSetCadence("yearly")}
              >
                Yearly <span className="cadence-savings">save 2 mo</span>
              </button>
            </span>
          </div>

          {/* Plan card */}
          <div
            className="plan-card"
            id="plan-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(245,158,11,0.04))",
            }}
          >
            <div className="plan-icon" id="plan-icon">
              {planData.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="plan-name" id="plan-name">
                {planData.name}
              </div>
              <div
                className="plan-price"
                id="plan-price"
                dangerouslySetInnerHTML={{ __html: planData.priceHtml }}
              />
              <div
                className="plan-badges"
                id="plan-badges"
                dangerouslySetInnerHTML={{ __html: planData.badgesHtml }}
              />
            </div>
            <div className="plan-actions">
              {planData.showChangeBtn && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openChangePlan("upgrade")}
                  id="btn-change-plan"
                >
                  {planData.changeBtnLabel}
                </button>
              )}
              {planData.showDowngradeBtn && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => openChangePlan("downgrade")}
                  id="btn-downgrade"
                >
                  Downgrade
                </button>
              )}
            </div>
          </div>

          {/* Pricelock note (DEC-PRICELOCK-01) */}
          {planData.showPricelock && (
            <div className="pricelock-note" id="pricelock-note">
              <span className="pn-ico" aria-hidden="true">🔒</span>
              <div>
                Your <b>$7.99/mo</b> price is locked forever as long as your subscription stays active —
                we never raise it. Read the{" "}
                <a href="/pricing#guarantee" style={{ color: "var(--brand-warm-dark)", textDecoration: "underline" }}>
                  price-lock-for-life guarantee
                </a>.
                Upgrading to a higher tier locks your new price.
              </div>
            </div>
          )}

          {/* Compare-plans expander */}
          <button
            type="button"
            className={`compare-toggle${compareOpen ? " open" : ""}`}
            id="compare-toggle"
            onClick={() => setCompareOpen((v) => !v)}
            aria-expanded={compareOpen}
            aria-controls="compare-grid"
          >
            <span className="ct-caret">›</span> Compare plans
          </button>

          <div
            className={`compare-grid${compareOpen ? " open" : ""}`}
            id="compare-grid"
            role="region"
            aria-label="Plan comparison"
          >
            <div
              className={`compare-card${planData.currentPlan === "free" ? " is-current" : ""}`}
              data-plan="free"
            >
              <div className="cc-name">Free</div>
              <div className="cc-price"><b>$0</b> forever</div>
              <ul className="cc-features">
                <li>1 page · custom theme</li>
                <li>Unlimited blocks</li>
                <li>Full analytics dataset</li>
                <li className="muted">No custom domain</li>
              </ul>
              <button
                className="cc-cta"
                onClick={() => selectPlan("free")}
              >
                {planData.currentPlan === "free" ? "Current plan" : "Switch to Free"}
              </button>
            </div>

            <div
              className={`compare-card${planData.currentPlan === "creator" ? " is-current" : ""}`}
              data-plan="creator"
            >
              <div className="cc-name">Creator ⭐</div>
              <div className="cc-price">
                <b>{fmtYearly(7.99)}</b> · locked for life
              </div>
              <ul className="cc-features">
                <li>Everything in Free</li>
                <li>Sell products + communities</li>
                <li>Verified ✓ creator badge</li>
                <li>Schedule visibility</li>
                <li>20 AI credits / mo</li>
              </ul>
              <button
                className="cc-cta"
                onClick={() => selectPlan("creator")}
              >
                {planData.currentPlan === "creator" ? "Current plan" : "Pick Creator"}
              </button>
            </div>

            <div
              className={`compare-card${planData.currentPlan === "pro" ? " is-current" : ""}`}
              data-plan="pro"
            >
              <div className="cc-name">Pro</div>
              <div className="cc-price">
                <b>{fmtYearly(19.99)}</b> · locked for life
              </div>
              <ul className="cc-features">
                <li>Everything in Creator</li>
                <li>Per-page custom domain</li>
                <li>Password protection</li>
                <li>REST API + MCP</li>
                <li>100 AI credits / mo</li>
              </ul>
              <button
                className="cc-cta"
                onClick={() => selectPlan("pro")}
              >
                {planData.currentPlan === "pro" ? "Current plan" : "Pick Pro"}
              </button>
            </div>

            <div
              className={`compare-card${planData.currentPlan === "business" ? " is-current" : ""}`}
              data-plan="business"
            >
              <div className="cc-name">Business</div>
              <div className="cc-price">
                <b>{fmtYearly(49.99)}</b> · locked for life
              </div>
              <ul className="cc-features">
                <li>Everything in Pro</li>
                <li>A/B testing</li>
                <li>Team seats + roles</li>
                <li>Parquet R2 monthly archive</li>
                <li>Unlimited AI credits</li>
              </ul>
              <button
                className="cc-cta"
                onClick={() => selectPlan("business")}
              >
                {planData.currentPlan === "business" ? "Current plan" : "Pick Business"}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
             SECTION 2 — Payment method
             ===================================================== */}
        <div className="settings-section">
          <div className="settings-section-title with-action">
            <span>Payment method</span>
            <span className="stripe-trust-strip">
              <span className="sts-ico">🔒</span> PCI scope 0 · we never see your card
            </span>
          </div>

          {/* Card on file (visible when state ≠ free) */}
          {!planData.showPmEmpty && (
            <div id="pm-on-file">
              <div className="pm-card">
                <div className="pm-brand">VISA</div>
                <div className="pm-meta">
                  <div className="pm-num" id="pm-num">
                    {isCardExpiring ? "•••• •••• •••• 4242" : "•••• •••• •••• 4242"}
                  </div>
                  <div
                    className="pm-exp"
                    id="pm-exp"
                    dangerouslySetInnerHTML={{ __html: pmExpHtml }}
                  />
                </div>
                <div className="pm-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openStripePortal("payment_method_update")}
                  >
                    Update card
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 10, lineHeight: 1.5 }}>
                Card details live in Stripe — clicking <b>Update card</b> opens the
                Stripe-hosted Customer Portal in a redirect. We get back the last 4 digits and brand only.
              </p>
            </div>
          )}

          {/* No payment method on file (Free tier) */}
          {planData.showPmEmpty && (
            <div id="pm-empty">
              <div className="no-pm-card">
                <span className="npm-ico" aria-hidden="true">💳</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--fg)" }}>No card on file</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                    You&apos;re on the Free plan — no card needed unless you upgrade.
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => selectPlan("creator")}
                >
                  Upgrade to Creator
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
             SECTION 3 — Recent invoices
             ===================================================== */}
        <div className="settings-section" id="invoices-section">
          <div className="settings-section-title with-action">
            <span>Recent invoices</span>
            <span className="invoice-toolbar" style={{ marginBottom: 0 }}>
              <span className="it-label">Filter:</span>
              <select
                id="invoice-filter"
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value as InvoiceFilter)}
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="open">Open</option>
                <option value="void">Void</option>
                <option value="failed">Failed</option>
              </select>
            </span>
          </div>
          <p className="section-help">
            Last 12 charges. Click any row to open the Stripe-hosted PDF in a new tab — invoices are stored on Stripe, not in our database.
          </p>

          {/* Invoice table (state ≠ free + has invoices) */}
          {planData.showInvoiceTable && (
            <div id="invoices-table-wrap">
              <div style={{ overflowX: "auto" }}>
                <table className="invoice-table" id="invoice-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="invoice-tbody">
                    {filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openStripeInvoice(inv.id)}
                      >
                        <td>{inv.date}</td>
                        <td>
                          {inv.desc}
                          {inv.credit && (
                            <span className="chip info" style={{ marginLeft: 4 }}>credit</span>
                          )}
                        </td>
                        <td className="amount">{fmtAmount(inv.amount, invoiceCurrency)}</td>
                        <td>
                          <span className={statusChipClass(inv.status)}>
                            {statusChipLabel(inv.status)}
                          </span>
                        </td>
                        <td>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openStripeInvoice(inv.id);
                              // TODO: wire to Stripe portal session
                            }}
                            className="btn btn-ghost btn-xs"
                          >
                            PDF ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoices-footer">
                <span className="it-count">
                  Showing <b>{filteredInvoices.length}</b> of <b>47</b>
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => openStripePortal("invoices")}
                >
                  Open Stripe Portal for full history ↗
                </button>
              </div>
            </div>
          )}

          {/* Empty state — zero invoices */}
          {!planData.showInvoiceTable && subState === "zero-invoices" && (
            <div id="invoices-empty" className="invoices-empty">
              <div className="ie-ico" aria-hidden="true">📭</div>
              <div>No invoices yet — your first charge will be on <b>May 1, 2026</b>.</div>
            </div>
          )}

          {/* Empty state — free tier */}
          {!planData.showInvoiceTable && subState === "free" && (
            <div id="invoices-empty" className="invoices-empty">
              <div className="ie-ico" aria-hidden="true">🧾</div>
              <div>
                No invoices — you&apos;re on Free. Upgrade to Creator and your first invoice posts on day 1.
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
             SECTION 4 — Manage in Stripe
             ===================================================== */}
        {planData.showStripeCtas && (
          <div className="settings-section" id="stripe-section">
            <div className="settings-section-title">Manage in Stripe</div>
            <p className="section-help">
              Card update, full invoice history (PDF), tax IDs and address all live inside the
              Stripe-hosted Customer Portal — we never see or store your card details.
              You&apos;ll be redirected to Stripe and brought right back here when you&apos;re done.
              <br /><br />
              <b>Cancel subscription is not in the portal</b> on purpose — its canonical home is the{" "}
              <button className="cl-link" onClick={openCancel}>Danger zone</button>{" "}
              so we can capture feedback and offer a friendly retry.
            </p>

            <div className="stripe-cta-row">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openStripePortal("billing")}
              >
                Manage billing in Stripe ↗
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openStripePortal("payment_method_update")}
              >
                Update card
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openStripePortal("invoices")}
              >
                All invoices
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
             SECTION 5 — Custom domain add-ons (DEC-PRICELOCK-02)
             ===================================================== */}
        <div className="settings-section" id="domains-section">
          <div className="settings-section-title with-action">
            <span>Custom domain add-ons</span>
            <a href="/app?tab=domain" className="btn btn-ghost btn-sm">Manage domains →</a>
          </div>
          <p className="section-help">
            Universal <b>$1.99/mo per domain</b> — every tier. Verified domains charge as a separate line item on your next invoice.
          </p>

          {/* Domain rows (state ≠ free + has domains) */}
          {!planData.showDomainsEmpty && (
            <div id="domains-list">
              <div className="domain-addon-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="da-name">alexandra.com</span>
                <span className="chip success">Active</span>
                <span className="da-price">$1.99/mo</span>
              </div>

              {!planData.showDomainsFailed && (
                <div className="domain-addon-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="da-name">silva.studio</span>
                  <span className="chip success">Active</span>
                  <span className="da-price">$1.99/mo</span>
                </div>
              )}

              {/* Domain renewal failed (only visible in past-due state) */}
              {planData.showDomainsFailed && (
                <div className="domain-addon-row is-failed" id="domain-row-failed">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="da-name">silva.studio</span>
                  <span className="chip danger">Renewal failed</span>
                  <button
                    className="btn btn-danger-ghost btn-xs"
                    onClick={() => openStripePortal("payment_method_update")}
                  >
                    Update card
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No domains empty state */}
          {planData.showDomainsEmpty && (
            <div id="domains-empty" className="domains-empty">
              No domains yet — <a href="/app?tab=domain" style={{ color: "var(--brand-primary)" }}>add one for $1.99/mo →</a>
            </div>
          )}
        </div>

        {/* =====================================================
             SECTION 6 — Billing email (read-only; edit in Account tab)
             ===================================================== */}
        <div className="settings-section">
          <div className="settings-section-title">Billing email</div>
          <p className="section-help">
            Receipts and invoices go to this address. Changing it updates Stripe too.
          </p>
          <div className="pm-card" style={{ background: "var(--bg-elevated)" }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--bg-muted)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="pm-meta">
              <div style={{ fontWeight: 600, fontSize: "13.5px" }}>alexandra@example.com</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                Billing receipts go here · same as account email
              </div>
            </div>
            <a href="/app?tab=settings&subtab=account" className="btn btn-ghost btn-sm">
              Change in Account →
            </a>
          </div>
        </div>

        {/* =====================================================
             SECTION 7 — Cancel cross-link (canonical AP-010 path)
             ===================================================== */}
        {!planData.cancelScheduled && (
          <div className="cross-link-row" id="cancel-cross-link">
            <span className="cl-ico" aria-hidden="true">↘</span>
            <span style={{ flex: 1 }}>
              Need to cancel your subscription?{" "}
              <button className="cl-link" onClick={openCancel}>Go to Danger zone →</button>
              <br />
              <span style={{ fontSize: "11.5px", color: "var(--fg-subtle)" }}>
                Cancellation lives there so we can capture quick feedback and offer a friendly retry.
                Stripe Portal cancel is intentionally disabled (DEC-073).
              </span>
            </span>
          </div>
        )}

        {/* Help footer */}
        <div className="help-footer">
          Questions about your invoice?{" "}
          <a href="mailto:support@tadaify.com?subject=Billing%20question" style={{ color: "var(--brand-primary)" }}>
            Contact billing support
          </a>{" "}
          · all charges shown in USD unless noted.
          <br />
          Powered by Stripe · GDPR-compliant · 30-day money-back guarantee on first charge.
        </div>
      </div>

      {/* ============================================================
           MODAL — Stripe Portal redirect
           ============================================================ */}
      {openModal === "portal" && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="portal-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closePortalModal(); }}
        >
          <div className="modal" style={{ textAlign: "center" }}>
            {!portalDone && (
              <div className="portal-spinner" aria-hidden="true" />
            )}
            {!portalDone ? (
              <>
                <h3 id="portal-modal-title">Opening Stripe…</h3>
                <p className="modal-sub">
                  Redirecting you to the Stripe-hosted Customer Portal in a new tab.
                  <br />
                  We never see or store your card details.
                </p>
              </>
            ) : (
              <div id="portal-success">
                <div style={{ fontSize: 42, marginBottom: 6 }}>✅</div>
                <h3 style={{ marginTop: 0 }}>Card updated</h3>
                <p className="modal-sub">
                  Your new card on file ends in <b>0511</b>. Renewals will use this card going forward.
                </p>
              </div>
            )}
            {portalFlow !== "payment_method_update" && !portalDone && (
              <p className="modal-sub" style={{ fontSize: 12 }}>
                Mockup: real implementation calls /api/billing/portal-session with flow=&quot;{portalFlow}&quot; and redirects to the returned Stripe URL.
                {/* TODO: wire to Stripe portal session */}
              </p>
            )}
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-ghost btn-sm" onClick={closePortalModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Change plan confirm (TierGate-style)
           ============================================================ */}
      {openModal === "change-plan" && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="change-plan-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal modal-md">
            <h3 id="change-plan-title">
              Change to <span id="cp-target-name">{cpTarget}</span>
            </h3>
            <p className="modal-sub" id="change-plan-sub">
              You&apos;ll be charged the prorated difference now, then your new monthly price locks in for life as long as your subscription stays active.
            </p>

            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 14, marginBottom: 14,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--fg-muted)" }}>Current plan</span>
                <span><b id="cp-current">Creator</b> · $7.99/mo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--fg-muted)" }}>New plan</span>
                <span><b id="cp-target">{cpTarget}</b> · <span id="cp-target-price">{cpTargetPrice}</span></span>
              </div>
              <div style={{
                borderTop: "1px dashed var(--border)", marginTop: 10, paddingTop: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14,
              }}>
                <span style={{ fontWeight: 600 }}>Charged today</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }} id="cp-prorate">{cpProrate}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 4 }}>
                Prorated for 11 days remaining in current cycle
              </div>
            </div>

            <div className="pricelock-note" style={{ marginTop: 0 }}>
              <span className="pn-ico" aria-hidden="true">🔒</span>
              <div>
                Your new <b id="cp-new-price-lock">{cpTargetPrice}</b> price will be locked for life as long as your subscription stays active.
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={confirmChangePlan}>
                Confirm &amp; charge
                {/* TODO: wire to Stripe portal session */}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Cancel-flow (centered, multi-step, NEVER a drawer).
           Canonical AP-010 entry point.
           ============================================================ */}
      {openModal === "cancel" && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="cancel-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenModal(null);
              setCancelStepState("reason");
            }
          }}
        >
          <div className="modal modal-md">

            {/* Step 1: Reason */}
            {cancelStep === "reason" && (
              <div className="cancel-step active" data-step="reason">
                <h3 id="cancel-modal-title">Sure you want to cancel?</h3>
                <p className="modal-sub">
                  Your work stays saved. Your pages stay live until <b>Dec 1, 2026</b> — the end of your current billing cycle (AP-029).
                  <br />
                  Tell us why — leaving feedback helps us improve.
                </p>

                <div className="reason-list" role="radiogroup" aria-label="Cancellation reason">
                  <label className="reason-item">
                    <input type="radio" name="cancel-reason" value="too-expensive" />
                    <span className="ri-body">
                      <span className="ri-title">Too expensive</span>
                      <span className="ri-sub">$7.99/mo isn&apos;t right for me right now</span>
                    </span>
                  </label>
                  <label className="reason-item">
                    <input type="radio" name="cancel-reason" value="missing-feature" />
                    <span className="ri-body">
                      <span className="ri-title">Missing a feature I need</span>
                      <span className="ri-sub">Tell us which one in the box below</span>
                    </span>
                  </label>
                  <label className="reason-item">
                    <input type="radio" name="cancel-reason" value="not-using" />
                    <span className="ri-body">
                      <span className="ri-title">Not using it enough</span>
                      <span className="ri-sub">My audience isn&apos;t on a bio link site yet</span>
                    </span>
                  </label>
                  <label className="reason-item">
                    <input type="radio" name="cancel-reason" value="switching" />
                    <span className="ri-body">
                      <span className="ri-title">Switching to another tool</span>
                      <span className="ri-sub">Linktree / Beacons / Carrd / Bento / other</span>
                    </span>
                  </label>
                  <label className="reason-item">
                    <input type="radio" name="cancel-reason" value="bug" />
                    <span className="ri-body">
                      <span className="ri-title">Hit a bug or technical issue</span>
                      <span className="ri-sub">Sorry — please tell us so we can fix it</span>
                    </span>
                  </label>
                  <label className="reason-item">
                    <input type="radio" name="cancel-reason" value="other" />
                    <span className="ri-body">
                      <span className="ri-title">Other</span>
                      <span className="ri-sub">Help us understand</span>
                    </span>
                  </label>
                </div>

                <label htmlFor="cancel-feedback" style={{ fontSize: "12.5px", color: "var(--fg-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>
                  More details (optional but helpful)
                </label>
                <textarea
                  id="cancel-feedback"
                  className="field-input"
                  rows={3}
                  placeholder="What could we have done better?"
                  style={{ display: "block", width: "100%", padding: "10px 14px", fontSize: 14, background: "var(--bg)", border: "1px solid var(--border-strong)", borderRadius: 10, color: "var(--fg)", fontFamily: "inherit" }}
                />

                <div className="modal-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setOpenModal(null); setCancelStepState("reason"); }}
                  >
                    Keep my subscription
                  </button>
                  <button
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => setCancelStepState("confirm")}
                  >
                    Continue to cancel →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {cancelStep === "confirm" && (
              <div className="cancel-step active" data-step="confirm">
                <h3>Confirm cancellation</h3>
                <p className="modal-sub">
                  We&apos;ll cancel at the end of your current billing cycle. Until then nothing changes — your pages stay live, your features stay on.
                </p>

                <div className="cancel-summary">
                  <b>What happens after Dec 1, 2026:</b><br />
                  · Your pages switch to Free tier limits (1 page, no custom domain)<br />
                  · Custom domain redirects stop, your alexandra.com falls back to tadaify.com/alexandra<br />
                  · Your data stays — re-subscribe any time and everything is right where you left it<br />
                  · You&apos;ll pay the then-current price if you re-subscribe later (price-lock-for-life requires continuous subscription)
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setCancelStepState("reason")}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setCancelStepState("done");
                      // TODO: wire to Stripe portal session
                      // Real impl: stripe.subscriptions.update({ cancel_at_period_end: true })
                    }}
                  >
                    Cancel anyway
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Done */}
            {cancelStep === "done" && (
              <div className="cancel-step active" data-step="done">
                <div style={{ textAlign: "center", padding: "20px 0 14px" }}>
                  <div style={{ fontSize: 42, marginBottom: 8 }}>👋</div>
                  <h3 style={{ margin: "0 0 6px" }}>Subscription cancelled</h3>
                  <p className="modal-sub">
                    Your access ends on <b>Dec 1, 2026</b>.
                    You&apos;ll get an email reminder 3 days before that date.
                  </p>
                  <p className="modal-sub" style={{ marginTop: 8 }}>
                    Changed your mind? You can{" "}
                    <button
                      className="cl-link"
                      style={{ color: "var(--brand-primary)" }}
                      onClick={() => {
                        reactivateSubscription();
                        setOpenModal(null);
                        setCancelStepState("reason");
                      }}
                    >
                      reactivate
                    </button>{" "}
                    any time before then — or after — and your pages come right back.
                  </p>
                </div>
                <div className="modal-actions" style={{ justifyContent: "center" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { setOpenModal(null); setCancelStepState("reason"); }}
                  >
                    Back to Billing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
