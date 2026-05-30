/**
 * DomainPanel — main content area for /app?tab=domain.
 *
 * Visual contract: mockups/tadaify-mvp/app-domain.html (1678 LOC, full).
 * Every section, class name, ARIA label, text node, SVG icon, and stub value
 * is mirrored verbatim from the mockup. Styling lives in
 * `app/styles/app-dashboard.css` under
 * `.app-dashboard-root .main-domain` (appended block headed "DOMAIN PANEL").
 * Mount must occur inside an ancestor carrying `.app-dashboard-root` — the
 * route component wraps `<main>` accordingly.
 *
 * Wizard states: step 1 (enter domain) → optional payment overlay (free tier,
 * first domain) → step 2 (DNS instructions + verify) → step 3 (SSL + live).
 * Managed via local React state; does NOT touch any API.
 *
 * Out of scope this pass — all actions are stubbed with TODO comments:
 *   - Add domain (proceed past wizard step 1 with real API call)
 *   - Verify DNS (real DNS check API)
 *   - Change primary / test-live / re-check DNS+SSL / remove domain (domain API)
 *   - Stripe payment step (real Stripe Checkout initiation)
 *   - Copy live URL to clipboard
 *
 * DEC trail:
 *   DEC-PRICELOCK-02  ($1.99/mo universal add-on, every tier)
 *   DEC-PRICELOCK-01  (price-locked-for-life)
 *   DEC-CUSTOM-DOMAIN-NAV-01=A (6th sidebar item)
 *   DEC-WORDMARK-01   (no hyphen)
 *   DEC-DOMAIN-01     (single-domain architecture)
 *
 * Story: F-CUSTOM-DOMAIN-001
 */

import { useCallback, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type DomainState = "empty" | "list";
type Tier = "free" | "creator" | "pro" | "business";
type WizardStep = 1 | 2 | 3 | "payment";

interface DomainPanelProps {
  /** Creator handle — shown as the example URL in empty hero. */
  handle: string;
  /** Creator tier — drives billing row copy and payment overlay logic. */
  tier: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeTier(t: string): Tier {
  if (t === "free" || t === "creator" || t === "pro" || t === "business") return t;
  return "free";
}

function isValidDomain(val: string): boolean {
  if (!val) return false;
  const re =
    /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63}(?<!-))*\.[a-zA-Z]{2,}$/;
  return re.test(val);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Wizard step indicator bar */
function WizardSteps({ step }: { step: WizardStep }) {
  function stepClass(n: 1 | 2 | 3): string {
    if (step === "payment") {
      return n === 1 ? "ws-step active" : "ws-step";
    }
    if (typeof step === "number") {
      if (n < step) return "ws-step done";
      if (n === step) return "ws-step active";
    }
    return "ws-step";
  }
  function connectorClass(afterStep: 1 | 2): string {
    if (typeof step === "number" && step > afterStep) return "ws-connector done";
    return "ws-connector";
  }
  return (
    <div className="domain-wizard-steps" role="list" aria-label="Wizard progress">
      <div className={stepClass(1)} id="ws1" role="listitem">
        <div className="ws-num">
          {stepClass(1) === "ws-step done" ? null : <span>1</span>}
        </div>
        <span>Domain</span>
      </div>
      <div className={connectorClass(1)} id="wc1" />
      <div className={stepClass(2)} id="ws2" role="listitem">
        <div className="ws-num">
          {stepClass(2) === "ws-step done" ? null : <span>2</span>}
        </div>
        <span>DNS</span>
      </div>
      <div className={connectorClass(2)} id="wc2" />
      <div className={stepClass(3)} id="ws3" role="listitem">
        <div className="ws-num">
          {stepClass(3) === "ws-step done" ? null : <span>3</span>}
        </div>
        <span>Live</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DomainPanel({ handle, tier }: DomainPanelProps) {
  const normTier = normalizeTier(tier);

  // ── Panel state ──
  // Default to empty (no domains). Mockup supports "list" too — both states
  // are fully rendered; visibility is driven by `domainState`.
  const [domainState, setDomainState] = useState<DomainState>("empty");

  // ── Wizard modal state ──
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");
  const [domainDetect, setDomainDetect] = useState<{
    text: string;
    isSubdomain: boolean;
  } | null>(null);
  const [currentDomain, setCurrentDomain] = useState("yourdomain.com");

  // ── DNS / SSL state ──
  const [dnsVerified, setDnsVerified] = useState(false);
  const [sslReady, setSslReady] = useState(false);
  const [sslError, setSslError] = useState(false);
  const [dnsStatusText, setDnsStatusText] = useState(
    "Waiting for DNS… checking every 30 seconds"
  );
  const [dnsVerifiedTime, setDnsVerifiedTime] = useState("Verified just now");

  // ── Registrar expanders ──
  const [registrarExpanded, setRegistrarExpanded] = useState(false);
  const [wizardRegistrarExpanded, setWizardRegistrarExpanded] = useState(false);

  // ── Dropdown state ──
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ── Confirm remove modal ──
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDomain, setConfirmDomain] = useState("yourdomain.com");
  const [confirmDaysLeft, setConfirmDaysLeft] = useState("28");

  // ── Handlers ──

  const openWizard = useCallback((step: WizardStep = 1) => {
    setWizardStep(step);
    setWizardOpen(true);
    setDomainInput("");
    setDomainError("");
    setDomainDetect(null);
    setDnsVerified(false);
    setSslReady(false);
    setSslError(false);
    setDnsStatusText("Waiting for DNS… checking every 30 seconds");
  }, []);

  const closeWizard = useCallback(() => {
    setWizardOpen(false);
    setTimeout(() => {
      setWizardStep(1);
      setDomainInput("");
      setDomainError("");
      setDomainDetect(null);
      setDnsVerified(false);
      setSslReady(false);
      setSslError(false);
      setDnsStatusText("Waiting for DNS… checking every 30 seconds");
    }, 300);
  }, []);

  const goToStep1 = useCallback(() => setWizardStep(1), []);

  const goToStep2 = useCallback(
    (fromPayment = false) => {
      if (!fromPayment) {
        const val = domainInput.trim();
        if (!isValidDomain(val)) {
          setDomainError(
            val
              ? "Please enter a valid domain (e.g. yourdomain.com)"
              : "Please enter a domain name."
          );
          return;
        }
        setCurrentDomain(val);
        // TODO: wire to domain API — check if domain is already taken
        // Free tier, first domain → payment overlay
        if (normTier === "free" && domainState === "empty") {
          setWizardStep("payment");
          return;
        }
      }
      setWizardStep(2);
    },
    [domainInput, normTier, domainState]
  );

  const simulateVerify = useCallback(() => {
    // TODO: wire to domain API — real DNS verification
    setDnsVerified(true);
    setDnsStatusText("DNS verified ✓");
    const now = new Date();
    setDnsVerifiedTime("Verified at " + now.toLocaleTimeString());
    setTimeout(() => {
      setWizardStep(3);
      // Simulate SSL provisioning
      setTimeout(() => {
        setSslReady(true);
      }, 3500);
    }, 900);
  }, []);

  const retrySSL = useCallback(() => {
    // TODO: wire to domain API — real SSL retry
    setSslError(false);
    setTimeout(() => {
      setSslReady(true);
    }, 3500);
  }, []);

  const copyLiveUrl = useCallback(() => {
    // TODO: wire to domain API — copy live URL
    const url = `https://${currentDomain}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [currentDomain]);

  const validateDomainInput = useCallback((val: string) => {
    setDomainInput(val);
    if (!val) {
      setDomainError("");
      setDomainDetect(null);
      return;
    }
    if (val.includes("http") || val.includes("www.")) {
      setDomainError(
        "No need for http:// or www. — just the domain (e.g. yourdomain.com)"
      );
      setDomainDetect(null);
      return;
    }
    if (val.includes(" ")) {
      setDomainError("Domain names cannot contain spaces.");
      setDomainDetect(null);
      return;
    }
    if (isValidDomain(val)) {
      setDomainError("");
      const parts = val.split(".");
      const isSubdomain = parts.length > 2;
      setDomainDetect({ text: val, isSubdomain });
    } else {
      setDomainError("");
      setDomainDetect(null);
    }
  }, []);

  const toggleDropdown = useCallback(
    (id: string) => {
      setOpenDropdown(openDropdown === id ? null : id);
    },
    [openDropdown]
  );

  const closeDropdowns = useCallback(() => setOpenDropdown(null), []);

  const openConfirm = useCallback((domain: string, days: string) => {
    setConfirmDomain(domain);
    setConfirmDaysLeft(days);
    setConfirmOpen(true);
    // TODO: wire to domain API — remove domain
  }, []);

  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  // Billing row copy (tier-contextual, matches mockup verbatim)
  const billingFreeVisible = normTier === "free";
  const billingCreatorVisible = normTier === "creator";
  const billingProVisible = normTier === "pro";
  const billingBusinessVisible = normTier === "business";

  // DNS name hint based on auto-detect
  const dnsNameValue =
    domainDetect?.isSubdomain && domainDetect.text
      ? domainDetect.text.split(".")[0]
      : "@";

  return (
    <section className="main-domain" data-tier={normTier} data-state={domainState}>
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="page-head">
        <div>
          <h1>Your domain</h1>
          <p className="sub">
            Connect a custom domain so visitors see your URL, not ours.
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            id="add-domain-btn"
            onClick={() => openWizard(1)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {domainState === "list" ? "Add another" : "Add domain"}
          </button>
        </div>
      </div>

      <div className="domain-layout">
        <div>
          {/* ===== STATE: EMPTY ===== */}
          <div
            className="state-empty"
            role="region"
            aria-label="No domains connected"
            style={{ display: domainState === "empty" ? "flex" : "none", flexDirection: "column", gap: 16 }}
          >
            <div className="empty-hero">
              <div className="eh-icon" aria-hidden="true">🌐</div>
              <h2>Make tadaify yours</h2>
              <div className="eh-url">
                {handle}.com → your tadaify page
              </div>
              <p className="eh-desc">
                Looks more professional. Builds your brand. Gives you a clean URL
                your audience will trust and remember.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 4 }}
                onClick={() => openWizard(1)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add domain
              </button>
              <p className="eh-price">
                <strong>$1.99/mo per domain</strong> — universal add-on, every
                tier. Cancel anytime.
              </p>
            </div>

            <div className="empty-footer">
              <p>
                <strong>Already have a domain?</strong> Add it above — no
                transfer required.
              </p>
              <p>
                Need to buy one? These registrars have great prices and no dark
                patterns:
              </p>
              <div className="registrar-chips">
                <span className="reg-chip">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Namecheap
                </span>
                <span className="reg-chip">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Porkbun
                </span>
                <span className="reg-chip">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Cloudflare Registrar
                </span>
              </div>
            </div>
          </div>

          {/* ===== STATE: LIST (1+ domains) ===== */}
          <div
            className="state-list"
            role="region"
            aria-label="Connected domains"
            style={{ display: domainState === "list" ? "flex" : "none", flexDirection: "column", gap: 0 }}
          >
            <div className="domain-list" id="domain-list">

              {/* Domain 1 — live + primary */}
              <div
                className="domain-card"
                id="domain-card-1"
              >
                <div
                  className="domain-status-dot dot-green"
                  aria-label="Active"
                />
                <div className="domain-info">
                  <div className="domain-name">
                    {handle}.com
                    <span className="primary-badge">Primary</span>
                  </div>
                  <div className="domain-meta">
                    <span>Connected</span>
                    <span className="dm-sep" />
                    <span>SSL active</span>
                    <span className="dm-sep" />
                    <span>47 days</span>
                  </div>
                </div>
                <div className="domain-actions">
                  <a
                    href="#"
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: wire to domain API — open live site
                    }}
                    rel="noopener"
                    title="Visit site"
                    aria-label={`Visit ${handle}.com`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Visit
                  </a>
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="kebab-btn"
                      onClick={() => toggleDropdown("dd1")}
                      aria-label="Domain options"
                      aria-haspopup="true"
                      aria-expanded={openDropdown === "dd1"}
                      id="dd1-btn"
                    >
                      ⋯
                    </button>
                    <div
                      className={`dropdown-menu${openDropdown === "dd1" ? " open" : ""}`}
                      id="dd1"
                      role="menu"
                    >
                      <button
                        type="button"
                        className="dm-item"
                        role="menuitem"
                        onClick={() => {
                          closeDropdowns();
                          // TODO: wire to domain API — set as primary
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Set as primary
                      </button>
                      <button
                        type="button"
                        className="dm-item"
                        role="menuitem"
                        onClick={() => {
                          closeDropdowns();
                          // TODO: wire to domain API — test live
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Test live
                      </button>
                      <button
                        type="button"
                        className="dm-item"
                        role="menuitem"
                        onClick={() => {
                          closeDropdowns();
                          // TODO: wire to domain API — re-check DNS/SSL
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 .49-4.9" />
                        </svg>
                        Re-check DNS / SSL
                      </button>
                      <div className="dm-divider" role="separator" />
                      <button
                        type="button"
                        className="dm-item danger"
                        role="menuitem"
                        onClick={() => {
                          openConfirm(`${handle}.com`, "28");
                          closeDropdowns();
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        Remove domain
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Domain 2 — provisioning (DNS verified, SSL pending) */}
              <div className="domain-card" id="domain-card-2">
                <div
                  className="domain-status-dot dot-yellow"
                  aria-label="Provisioning"
                />
                <div className="domain-info">
                  <div className="domain-name">
                    store.{handle}.com
                  </div>
                  <div className="domain-meta">
                    <span>DNS verified</span>
                    <span className="dm-sep" />
                    <span className="pulse-wrap">
                      <span className="domain-pulse" aria-hidden="true" />
                      SSL provisioning…
                    </span>
                    <span className="dm-sep" />
                    <span>Updates every 30s</span>
                  </div>
                </div>
                <div className="domain-actions">
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="kebab-btn"
                      onClick={() => toggleDropdown("dd2")}
                      aria-label="Domain options"
                      aria-haspopup="true"
                      id="dd2-btn"
                    >
                      ⋯
                    </button>
                    <div
                      className={`dropdown-menu${openDropdown === "dd2" ? " open" : ""}`}
                      id="dd2"
                      role="menu"
                    >
                      <button
                        type="button"
                        className="dm-item"
                        role="menuitem"
                        onClick={() => {
                          closeDropdowns();
                          // TODO: wire to domain API — re-check DNS/SSL
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 .49-4.9" />
                        </svg>
                        Re-check DNS / SSL
                      </button>
                      <div className="dm-divider" role="separator" />
                      <button
                        type="button"
                        className="dm-item danger"
                        role="menuitem"
                        onClick={() => {
                          openConfirm(`store.${handle}.com`, "27");
                          closeDropdowns();
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        Remove domain
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Billing info (tier-contextual) */}
            {billingFreeVisible && (
              <div className="billing-row">
                <strong>Billing: 2 domains × $1.99/mo = $4/mo</strong>
                <br />
                No domains are included on Free — this $4/mo covers both.
              </div>
            )}
            {billingCreatorVisible && (
              <div className="billing-row">
                <strong>
                  Billing: 1 domain included · 1 extra × $1.99/mo = $1.99/mo
                </strong>
                <br />
                Creator includes 1 domain. You're paying for 1 extra.
              </div>
            )}
            {billingProVisible && (
              <div className="billing-row">
                <strong>
                  Billing: 1 domain included · 1 extra × $1.99/mo = $1.99/mo
                </strong>
                <br />
                Pro includes 1 domain. You're paying for 1 extra.
              </div>
            )}
            {billingBusinessVisible && (
              <div className="billing-row">
                <strong>Billing: 10 domains included · both covered</strong>
                <br />
                Business includes 10 domains. Both of yours are on your plan.
              </div>
            )}
          </div>

          {/* ===== DNS TROUBLESHOOTING expandable ===== */}
          <div
            className="registrar-expander"
            style={{ marginTop: 28 }}
            id="registrar-expander"
          >
            <button
              type="button"
              className={`re-trigger${registrarExpanded ? " open" : ""}`}
              onClick={() => setRegistrarExpanded((v) => !v)}
              aria-expanded={registrarExpanded}
              aria-controls="registrar-body"
            >
              <span>🔧 DNS troubleshooting — common registrars &amp; errors</span>
              <svg
                className="chevron"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              className={`re-body${registrarExpanded ? " open" : ""}`}
              id="registrar-body"
              role="region"
            >
              <div className="re-row">
                <span className="re-registrar">Namecheap</span>
                <span className="re-path">
                  Domain List → Manage → Advanced DNS → Add New Record → CNAME
                </span>
              </div>
              <div className="re-row">
                <span className="re-registrar">GoDaddy</span>
                <span className="re-path">
                  My Products → DNS → Add → CNAME; set Name to @ and Value to
                  tadaify.com
                </span>
              </div>
              <div className="re-row">
                <span className="re-registrar">Cloudflare</span>
                <span className="re-path">
                  Dashboard → DNS → Records → Add record. Important: set proxy
                  status to DNS Only (grey cloud) — not proxied.
                </span>
              </div>
              <div className="re-row">
                <span className="re-registrar">Porkbun</span>
                <span className="re-path">
                  Manage → DNS → Quick DNS → CNAME to tadaify.com
                </span>
              </div>
              <div className="re-row">
                <span className="re-registrar">
                  Google Domains
                  <br />
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: 12,
                      color: "var(--fg-subtle)",
                    }}
                  >
                    (now Squarespace)
                  </span>
                </span>
                <span className="re-path">
                  DNS → Manage custom records → Create new record → CNAME
                </span>
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: "rgba(245,158,11,0.06)",
                  borderRadius: 8,
                  fontSize: "12.5px",
                  color: "var(--fg-muted)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--fg-muted)" }}>
                  DNS propagation
                </strong>{" "}
                usually takes under 1 hour, but can take up to 48h. If still
                pending after 2h, double-check the CNAME value and TTL.{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: wire to domain API — open guide
                  }}
                  style={{ color: "var(--brand-primary)", fontWeight: 500 }}
                >
                  Read the full guide →
                </a>
              </div>
            </div>
          </div>

          {/* Page footer */}
          <div className="domain-footer-help">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // TODO: wire to domain API — open domain setup guide
              }}
            >
              Read the domain setup guide
            </a>
            &nbsp;·&nbsp;
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // TODO: wire to domain API — open support
              }}
            >
              Contact support
            </a>
          </div>
        </div>

        {/* ===== RIGHT TIPS PANEL (desktop only) ===== */}
        <aside className="side-tips" aria-label="Domain best practices">
          <div className="tips-panel">
            <h3>Domain best practices</h3>
            <div className="tip-chip">
              <span className="tip-ic">📈</span>
              <div>
                <div className="tip-title">SEO benefit</div>
                <div className="tip-body">
                  Your own domain signals authority to search engines. Links
                  pointing to yourdomain.com build equity you own — not
                  tadaify.com's.
                </div>
              </div>
            </div>
            <div className="tip-chip">
              <span className="tip-ic">📧</span>
              <div>
                <div className="tip-title">Email forwarding</div>
                <div className="tip-body">
                  We don't provide email. For hello@yourdomain.com forwarding
                  try <strong>ImprovMX</strong> (free tier) or Cloudflare Email
                  Routing.
                </div>
              </div>
            </div>
            <div className="tip-chip">
              <span className="tip-ic">🔗</span>
              <div>
                <div className="tip-title">Subdomain vs apex</div>
                <div className="tip-body">
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      background: "var(--bg-muted)",
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                  >
                    links.yourdomain.com
                  </code>{" "}
                  works great if you want your main site on the root. Apex (
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      background: "var(--bg-muted)",
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                  >
                    yourdomain.com
                  </code>
                  ) looks cleanest.
                </div>
              </div>
            </div>
            <div className="tip-chip">
              <span className="tip-ic">🌐</span>
              <div>
                <div className="tip-title">Existing website?</div>
                <div className="tip-body">
                  Yes — you can use a subdomain like{" "}
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      background: "var(--bg-muted)",
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                  >
                    links.yourdomain.com
                  </code>{" "}
                  while your main site stays on Webflow, Squarespace, etc.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================
          ADD DOMAIN WIZARD MODAL
          ============================================================ */}
      <div
        className={`domain-modal-backdrop${wizardOpen ? " open" : ""}`}
        id="add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeWizard();
        }}
      >
        <div className="domain-modal" id="wizard-shell">
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              Add a domain
            </h2>
            <button
              type="button"
              className="modal-close"
              onClick={closeWizard}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="modal-body">

            {/* Step indicator */}
            <WizardSteps step={wizardStep} />

            {/* ===== STEP 1: Enter domain ===== */}
            {wizardStep === 1 && (
              <div className="wiz-panel active" data-step="1" id="step1-panel">
                <div>
                  <div className="field-label">Your domain</div>
                  <div className="domain-input-wrap">
                    <input
                      type="text"
                      id="domain-input"
                      placeholder="yourdomain.com"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-label="Domain name"
                      value={domainInput}
                      onChange={(e) => validateDomainInput(e.target.value)}
                    />
                  </div>
                  <p className="input-hint">
                    Enter just the domain — no http://, no www. Works with apex
                    (
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        background: "var(--bg-muted)",
                        padding: "1px 5px",
                        borderRadius: 4,
                      }}
                    >
                      yourdomain.com
                    </code>
                    ) or subdomain (
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        background: "var(--bg-muted)",
                        padding: "1px 5px",
                        borderRadius: 4,
                      }}
                    >
                      links.yourdomain.com
                    </code>
                    ).
                  </p>
                  {domainError && (
                    <p
                      className="input-error visible"
                      id="domain-error"
                      role="alert"
                    >
                      {domainError}
                    </p>
                  )}
                  {!domainError && domainDetect && (
                    <p
                      id="domain-detect"
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: "var(--brand-primary)",
                        marginTop: 6,
                      }}
                    >
                      {domainDetect.isSubdomain ? (
                        <>
                          ✓ Detected:{" "}
                          <strong>subdomain</strong> — clean CNAME setup, works
                          with any registrar.
                        </>
                      ) : (
                        <>
                          ✓ Detected:{" "}
                          <strong>apex domain</strong> — needs A record (or
                          transfer DNS to Cloudflare for CNAME flattening).
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Subdomain auto-detect hidden field (matches mockup) */}
                <input type="hidden" id="subdomain-check" />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={closeWizard}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    id="step1-continue"
                    onClick={() => goToStep2()}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ===== PAYMENT OVERLAY (Free tier, first domain) ===== */}
            {wizardStep === "payment" && (
              <div className="wiz-panel active" data-step="payment">
                <div className="stripe-plan-card">
                  <div className="spc-left">
                    <div className="spc-name">Custom domain add-on</div>
                    <div className="spc-desc" id="domain-being-added">
                      {currentDomain}
                    </div>
                    <div className="spc-note">
                      Not an upgrade — Free stays Free. This covers the domain
                      only.
                    </div>
                  </div>
                  <div className="spc-price">
                    $1.99<sub>/mo</sub>
                  </div>
                </div>

                <div
                  className="card-form-mock"
                  aria-label="Payment details (mock)"
                >
                  <div>
                    <div className="field-label">Card number</div>
                    <div className="cf-field">
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        aria-label="Card number"
                      />
                    </div>
                  </div>
                  <div className="cf-row">
                    <div className="cf-field">
                      <label>Expiry</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={7}
                        aria-label="Expiry date"
                      />
                    </div>
                    <div className="cf-field">
                      <label>CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        aria-label="CVC"
                      />
                    </div>
                  </div>
                  <div className="pay-methods">
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--fg-subtle)",
                        flex: 1,
                      }}
                    >
                      Or pay with:
                    </span>
                    <span className="pay-method-icon">Apple Pay</span>
                    <span className="pay-method-icon">Google Pay</span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--fg-subtle)",
                    textAlign: "center",
                    marginTop: -4,
                  }}
                >
                  $1.99/mo billed monthly, starting today. Cancel anytime from
                  Settings → Billing.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={goToStep1}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      goToStep2(true);
                      // TODO: wire to domain API — initiate Stripe payment
                    }}
                  >
                    Pay &amp; continue
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 2: DNS instructions ===== */}
            {wizardStep === 2 && (
              <div className="wiz-panel active" data-step="2">
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "var(--fg-muted)",
                    margin: 0,
                  }}
                >
                  Add this record at your domain registrar, then click Verify.
                </p>

                <div
                  className="dns-card"
                  role="table"
                  aria-label="DNS record to add"
                >
                  <div className="dns-card-header" role="row">
                    <div className="dns-col-head" role="columnheader">
                      Add at your registrar
                    </div>
                    <div className="dns-col-head" role="columnheader">
                      Value (point to tadaify)
                    </div>
                  </div>
                  <div className="dns-rows">
                    <div className="dns-row" role="row">
                      <div className="dns-cell" role="cell">
                        <div className="field-name">Type</div>
                        <code>CNAME</code>
                      </div>
                      <div className="dns-cell" role="cell">
                        <div className="field-name">Value</div>
                        <code>tadaify.com</code>
                      </div>
                    </div>
                    <div className="dns-row" role="row">
                      <div className="dns-cell" role="cell">
                        <div className="field-name">Name / Host</div>
                        <code id="dns-name-value">{dnsNameValue}</code>
                      </div>
                      <div className="dns-cell" role="cell">
                        <div className="field-name">TTL</div>
                        <code>Auto (or 3600)</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Domain ownership TXT */}
                <details
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--fg-muted)",
                      cursor: "pointer",
                      userSelect: "none",
                      listStyle: "none",
                    }}
                  >
                    Also add this TXT record (required by some registrars)
                  </summary>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "var(--fg-muted)",
                        marginBottom: 8,
                      }}
                    >
                      If your registrar or DNS provider asks for a verification
                      token:
                    </div>
                    <div className="dns-card">
                      <div className="dns-rows">
                        <div className="dns-row">
                          <div className="dns-cell">
                            <div className="field-name">Type</div>
                            <code>TXT</code>
                          </div>
                          <div className="dns-cell">
                            <div className="field-name">Value</div>
                            <code>tadaify-verify=a8f3e1b2</code>
                          </div>
                        </div>
                        <div className="dns-row">
                          <div className="dns-cell">
                            <div className="field-name">Name</div>
                            <code>@</code>
                          </div>
                          <div className="dns-cell">
                            <div className="field-name">TTL</div>
                            <code>Auto</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Live status */}
                <div
                  className={`dns-status-bar${dnsVerified ? " verified" : ""}`}
                  id="dns-status-bar"
                  role="status"
                  aria-live="polite"
                >
                  {dnsVerified ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                  <span id="dns-status-text">{dnsStatusText}</span>
                </div>

                <div className="registrar-expander">
                  <button
                    type="button"
                    className={`re-trigger${wizardRegistrarExpanded ? " open" : ""}`}
                    onClick={() => setWizardRegistrarExpanded((v) => !v)}
                    aria-expanded={wizardRegistrarExpanded}
                  >
                    <span>Where do I find this in my registrar?</span>
                    <svg
                      className="chevron"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div
                    className={`re-body${wizardRegistrarExpanded ? " open" : ""}`}
                    role="region"
                  >
                    <div className="re-row">
                      <span className="re-registrar">Namecheap</span>
                      <span className="re-path">
                        Domain List → Manage → Advanced DNS → Add New Record →
                        CNAME
                      </span>
                    </div>
                    <div className="re-row">
                      <span className="re-registrar">Cloudflare</span>
                      <span className="re-path">
                        DNS → Records → Add. Set proxy to DNS Only (grey cloud),
                        NOT proxied.
                      </span>
                    </div>
                    <div className="re-row">
                      <span className="re-registrar">Porkbun</span>
                      <span className="re-path">
                        Manage → DNS → Quick DNS → CNAME to tadaify.com
                      </span>
                    </div>
                    <div className="re-row">
                      <span className="re-registrar">GoDaddy</span>
                      <span className="re-path">
                        My Products → DNS → Add → CNAME; Name = @, Value =
                        tadaify.com
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={goToStep1}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={simulateVerify}
                  >
                    I've added the records — verify now
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 3: SSL + Live ===== */}
            {wizardStep === 3 && (
              <div className="wiz-panel active" data-step="3">
                <div className="ssl-timeline" role="list" aria-label="Provisioning status">
                  <div className="ssl-step" role="listitem">
                    <div className="ssl-icon done" aria-label="Done">
                      ✓
                    </div>
                    <div className="ssl-body">
                      <div className="ssl-title">DNS verified</div>
                      <div className="ssl-sub" id="dns-verified-time">
                        {dnsVerifiedTime}
                      </div>
                    </div>
                  </div>
                  <div
                    className="ssl-step"
                    role="listitem"
                    id="ssl-step-provision"
                  >
                    <div
                      className={`ssl-icon${sslReady ? " done" : " pending"}`}
                      aria-label={sslReady ? "Done" : "In progress"}
                    >
                      {sslReady ? "✓" : "⏳"}
                    </div>
                    <div className="ssl-body">
                      <div className="ssl-title">
                        {sslReady
                          ? "SSL certificate ready"
                          : "Provisioning SSL certificate…"}
                      </div>
                      <div className="ssl-sub">
                        {sslReady
                          ? "TLS 1.3, 90-day cert, auto-renewed."
                          : "Usually takes 30–90 seconds. Hang tight."}
                      </div>
                    </div>
                  </div>
                  <div
                    className="ssl-step"
                    role="listitem"
                    id="ssl-step-live"
                    style={{ opacity: sslReady ? 1 : 0.35 }}
                  >
                    <div
                      className={`ssl-icon${sslReady ? " done" : " waiting"}`}
                      aria-label={sslReady ? "Done" : "Waiting"}
                    >
                      {sslReady ? "✓" : "🔒"}
                    </div>
                    <div className="ssl-body">
                      <div className="ssl-title">SSL ready</div>
                      <div className="ssl-sub">
                        {sslReady
                          ? "Your domain is secured and live."
                          : "Waiting for provisioning…"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live CTA */}
                {sslReady && (
                  <div
                    className="live-cta"
                    id="live-cta"
                    role="status"
                    aria-live="polite"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div style={{ fontSize: 22 }}>🎉</div>
                    <div className="lc-domain" id="live-domain-url">
                      https://{currentDomain}
                    </div>
                    <p
                      style={{
                        fontSize: "13.5px",
                        color: "var(--fg-muted)",
                        margin: 0,
                      }}
                    >
                      Your custom domain is live and secured with SSL.
                    </p>
                    <div className="lc-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={copyLiveUrl}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy URL
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setDomainState("list");
                          closeWizard();
                        }}
                      >
                        Done
                      </button>
                    </div>
                    <p
                      style={{ fontSize: 12, color: "var(--fg-subtle)" }}
                    >
                      $1.99/mo billed monthly, starting today. Cancel anytime
                      in Settings → Billing.
                    </p>
                  </div>
                )}

                {/* SSL failure state */}
                {sslError && (
                  <div
                    id="ssl-error"
                    style={{
                      padding: "14px 16px",
                      background: "var(--danger-bg)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#991B1B",
                    }}
                    role="alert"
                  >
                    <strong>SSL provisioning timed out.</strong> This sometimes
                    happens with high load.
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          background: "var(--danger)",
                          color: "#fff",
                          border: "none",
                        }}
                        onClick={retrySSL}
                      >
                        Retry provisioning
                      </button>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: wire to domain API — open support
                        }}
                        style={{
                          color: "#991B1B",
                          fontWeight: 500,
                          fontSize: 13,
                          alignSelf: "center",
                        }}
                      >
                        Wait 15 min before contacting support →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
          {/* /modal-body */}
        </div>
        {/* /domain-modal */}
      </div>
      {/* /domain-modal-backdrop */}

      {/* ============================================================
          REMOVE CONFIRMATION MODAL
          ============================================================ */}
      <div
        className={`domain-modal-backdrop${confirmOpen ? " open" : ""}`}
        id="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeConfirm();
        }}
      >
        <div className="domain-confirm-modal">
          <h3 id="confirm-title">
            Remove <span id="confirm-domain-name">{confirmDomain}</span>?
          </h3>
          <p>
            Visitors will be redirected to{" "}
            <strong>tadaify.com/{handle}</strong>. The subscription line item
            cancels at end of your current billing period (
            <span id="confirm-days-left">{confirmDaysLeft}</span> days
            remaining).
          </p>
          <div className="confirm-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={closeConfirm}
            >
              Keep domain
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                closeConfirm();
                // TODO: wire to domain API — remove domain
              }}
            >
              Remove domain
            </button>
          </div>
        </div>
      </div>

      {/* ── Dev toolbar: mockup state toggle (aria-hidden) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 72,
          right: 14,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              color: "var(--fg-subtle)",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: 2,
              fontSize: 10,
            }}
          >
            Mockup state
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setDomainState("empty")}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => setDomainState("list")}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => openWizard(1)}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Wizard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
