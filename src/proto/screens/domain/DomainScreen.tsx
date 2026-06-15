/**
 * Configuration > Domain — the creator-facing custom-domain configuration page
 * a creator opens at Configuration > Domain. Faithful port of
 * mockups/tadaify-mvp/app-domain.html, rendered inside the shared dashboard
 * chrome (appbar + sidebar) with `activeNav="domain"`.
 *
 * Presentational, local-state only: flip empty ↔ list state, switch the billing
 * tier, open the add-domain wizard (step 1 enter domain → optional Free-tier
 * payment overlay → step 2 DNS records → step 3 SSL/live), simulate DNS verify
 * and SSL provisioning, open per-domain kebab menus, open the remove-domain
 * confirm modal, and expand the DNS-troubleshooting / registrar sections. Data
 * comes from the typed domainFixture. All modals close on Escape, Cancel and
 * backdrop click. No network, no persistence.
 *
 * @implements fr-domain
 * @implements fr-globalui-view-layout
 */
import { useEffect, useState } from "react";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  billingNotesFixture,
  connectedDomainsFixture,
  dnsRecordsFixture,
  dnsTxtRecordFixture,
  domainProfileFixture,
  domainTipsFixture,
  registrarChipsFixture,
  registrarPathsFixture,
  type ConnectedDomain,
  type DomainTier,
} from "./domainFixture";
import "./domain-proto.css";

type WizardStep = 1 | "payment" | 2 | 3;
type DnsStatus = "waiting" | "verified";
type SslStage = "provisioning" | "ready";

const TIERS: DomainTier[] = ["free", "creator", "pro", "business"];
const TIER_LABEL: Record<DomainTier, string> = {
  free: "Free",
  creator: "Creator",
  pro: "Pro",
  business: "Business",
};

const PlusIcon = () => (
  <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
);

function isValidDomain(val: string): boolean {
  if (!val) return false;
  return /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63}(?<!-))*\.[a-zA-Z]{2,}$/.test(val);
}

export function DomainScreen() {
  const profile = dashboardProfileFixture();
  const domainMeta = domainProfileFixture();
  const tips = domainTipsFixture();
  const registrarPaths = registrarPathsFixture();
  const registrarChips = registrarChipsFixture();
  const billingNotes = billingNotesFixture();

  const [domains, setDomains] = useState<ConnectedDomain[]>(connectedDomainsFixture());
  const [tier, setTier] = useState<DomainTier>("free");
  const isEmpty = domains.length === 0;

  // DNS-troubleshooting expander (page level).
  const [troubleshootOpen, setTroubleshootOpen] = useState(false);
  // Registrar expander inside the wizard step 2.
  const [registrarOpen, setRegistrarOpen] = useState(false);

  // Kebab dropdowns
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Remove confirm
  const [confirmDomain, setConfirmDomain] = useState<ConnectedDomain | null>(null);

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");
  const [committedDomain, setCommittedDomain] = useState("yourdomain.com");
  const [dnsStatus, setDnsStatus] = useState<DnsStatus>("waiting");
  const [sslStage, setSslStage] = useState<SslStage>("provisioning");
  const [copied, setCopied] = useState(false);

  const closeWizard = () => {
    setWizardOpen(false);
    setStep(1);
    setDomainInput("");
    setDomainError("");
    setDnsStatus("waiting");
    setSslStage("provisioning");
    setRegistrarOpen(false);
  };

  // Escape closes wizard, confirm and any open kebab menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (wizardOpen) closeWizard();
      if (confirmDomain) setConfirmDomain(null);
      if (openMenu) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [wizardOpen, confirmDomain, openMenu]);

  // Close kebab menus on any outside click.
  useEffect(() => {
    if (!openMenu) return;
    const onClick = () => setOpenMenu(null);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openMenu]);

  const openWizard = () => {
    setStep(1);
    setDomainInput("");
    setDomainError("");
    setDnsStatus("waiting");
    setSslStage("provisioning");
    setWizardOpen(true);
  };

  const detect = (() => {
    const val = domainInput.trim();
    if (!val || !isValidDomain(val)) return null;
    return val.split(".").length > 2 ? "subdomain" : "apex";
  })();

  const liveDomainError = (() => {
    const val = domainInput.trim();
    if (!val) return "";
    if (val.includes("http") || val.includes("www.")) {
      return "No need for http:// or www. — just the domain (e.g. yourdomain.com)";
    }
    if (val.includes(" ")) return "Domain names cannot contain spaces.";
    return "";
  })();

  const goToStep2 = (fromPayment = false) => {
    if (!fromPayment) {
      const val = domainInput.trim();
      if (!isValidDomain(val)) {
        setDomainError(val ? "Please enter a valid domain (e.g. yourdomain.com)" : "Please enter a domain name.");
        return;
      }
      setCommittedDomain(val);
      setDomainError("");
      // Free tier, first domain → payment overlay.
      if (tier === "free" && isEmpty) {
        setStep("payment");
        return;
      }
    }
    setDnsStatus("waiting");
    setStep(2);
  };

  const dnsName = detect === "subdomain" ? committedDomain.split(".")[0] : "@";
  const dnsRecords = dnsRecordsFixture(dnsName);
  const txtRecords = dnsTxtRecordFixture();

  const verifyNow = () => {
    setDnsStatus("verified");
    setSslStage("provisioning");
    setStep(3);
  };

  const removeDomain = () => {
    if (confirmDomain) setDomains((ds) => ds.filter((d) => d.id !== confirmDomain.id));
    setConfirmDomain(null);
  };

  const dotClass = (status: ConnectedDomain["status"]) =>
    status === "active" ? "dot-green" : status === "provisioning" ? "dot-yellow" : "dot-red";

  return (
    <DashboardChrome profile={profile} activeNav="domain">
      <div className="proto-domain">
        {/* ── Page header ── */}
        <div className="page-head">
          <div>
            <h1>Your domain</h1>
            <p className="sub">Connect a custom domain so visitors see your URL, not ours.</p>
          </div>
          <div className="actions">
            <button className="btn btn-primary btn-sm" type="button" onClick={openWizard}>
              <PlusIcon />
              {isEmpty ? "Add domain" : "Add another"}
            </button>
          </div>
        </div>

        {/* ── Demo controls (mockup state + tier) ── */}
        <div className="demo-bar" aria-hidden="true">
          <span className="demo-label">Demo</span>
          <button
            className={`demo-chip${isEmpty ? " is-active" : ""}`}
            type="button"
            onClick={() => setDomains([])}
          >
            Empty
          </button>
          <button
            className={`demo-chip${!isEmpty ? " is-active" : ""}`}
            type="button"
            onClick={() => setDomains(connectedDomainsFixture())}
          >
            List
          </button>
          <span className="demo-label" style={{ marginLeft: 8 }}>Tier</span>
          {TIERS.map((t) => (
            <button
              key={t}
              className={`demo-chip${tier === t ? " is-active" : ""}`}
              type="button"
              onClick={() => setTier(t)}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="domain-layout">
          <div>
            {isEmpty ? (
              /* ── Empty state ── */
              <div role="region" aria-label="No domains connected" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="empty-hero">
                  <div className="eh-icon" aria-hidden>🌐</div>
                  <h2>Make tadaify yours</h2>
                  <div className="eh-url">{domainMeta.handle}.com → your tadaify page</div>
                  <p className="eh-desc">
                    Looks more professional. Builds your brand. Gives you a clean URL your audience
                    will trust and remember.
                  </p>
                  <button className="btn btn-primary" type="button" onClick={openWizard} style={{ marginTop: 4 }}>
                    <PlusIcon />
                    Add domain
                  </button>
                  <p className="eh-price">
                    <strong>$1.99/mo per domain</strong> — universal add-on, every tier. Cancel anytime.
                  </p>
                </div>

                <div className="empty-footer">
                  <p><strong>Already have a domain?</strong> Add it above — no transfer required.</p>
                  <p>Need to buy one? These registrars have great prices and no dark patterns:</p>
                  <div className="registrar-chips">
                    {registrarChips.map((c) => (
                      <span className="reg-chip" key={c}>
                        <S w={12}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></S>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── List state ── */
              <div role="region" aria-label="Connected domains">
                <div className="domain-list">
                  {domains.map((d) => (
                    <div className="domain-card" key={d.id}>
                      <div className={`domain-status-dot ${dotClass(d.status)}`} aria-label={d.status} />
                      <div className="domain-info">
                        <div className="domain-name">
                          {d.name}
                          {d.primary && <span className="primary-badge">Primary</span>}
                        </div>
                        <div className="domain-meta">
                          {d.meta.map((m, i) => (
                            <span key={m} style={{ display: "contents" }}>
                              {i > 0 && <span className="dm-sep" />}
                              {d.provisioning && m === "SSL provisioning…" ? (
                                <span className="pulse-wrap">
                                  <span className="pulse" aria-hidden />
                                  {m}
                                </span>
                              ) : (
                                <span>{m}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="domain-actions">
                        {d.status === "active" && (
                          <button
                            className="btn btn-ghost btn-xs"
                            type="button"
                            title="Visit site"
                            aria-label={`Visit ${d.name}`}
                            onClick={() => alert("Mockup — opens the live domain in a new tab")}
                          >
                            <S w={12}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></S>
                            Visit
                          </button>
                        )}
                        <div className="kebab-wrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="kebab-btn"
                            type="button"
                            aria-label="Domain options"
                            aria-haspopup="true"
                            aria-expanded={openMenu === d.id}
                            onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)}
                          >
                            ⋯
                          </button>
                          {openMenu === d.id && (
                            <div className="dropdown-menu" role="menu">
                              {d.status === "active" && (
                                <button className="dm-item" role="menuitem" type="button" onClick={() => setOpenMenu(null)}>
                                  <S w={15}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></S>
                                  Set as primary
                                </button>
                              )}
                              {d.status === "active" && (
                                <button className="dm-item" role="menuitem" type="button" onClick={() => setOpenMenu(null)}>
                                  <S w={15}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></S>
                                  Test live
                                </button>
                              )}
                              <button className="dm-item" role="menuitem" type="button" onClick={() => setOpenMenu(null)}>
                                <S w={15}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.9" /></S>
                                Re-check DNS / SSL
                              </button>
                              <div className="dm-divider" role="separator" />
                              <button
                                className="dm-item danger"
                                role="menuitem"
                                type="button"
                                onClick={() => { setConfirmDomain(d); setOpenMenu(null); }}
                              >
                                <S w={15}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></S>
                                Remove domain
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Billing info (tier-contextual) */}
                {billingNotes
                  .filter((b) => b.tier === tier)
                  .map((b) => (
                    <div className="billing-row" key={b.tier}>
                      <strong>{b.headline}</strong>
                      <br />
                      {b.body}
                    </div>
                  ))}
              </div>
            )}

            {/* ── DNS troubleshooting expander ── */}
            <div className="registrar-expander" style={{ marginTop: 28 }}>
              <button
                className="re-trigger"
                type="button"
                aria-expanded={troubleshootOpen}
                onClick={() => setTroubleshootOpen((v) => !v)}
              >
                <span>🔧 DNS troubleshooting — common registrars &amp; errors</span>
                <S w={16}><polyline points="6 9 12 15 18 9" /></S>
              </button>
              {troubleshootOpen && (
                <div className="re-body" role="region">
                  {registrarPaths.map((r) => (
                    <div className="re-row" key={r.registrar}>
                      <span className="re-registrar">
                        {r.registrar}
                        {r.note && <><br /><span className="re-sub">{r.note}</span></>}
                      </span>
                      <span className="re-path">{r.path}</span>
                    </div>
                  ))}
                  <div className="re-note">
                    <strong>DNS propagation</strong> usually takes under 1 hour, but can take up to 48h.
                    If still pending after 2h, double-check the CNAME value and TTL.{" "}
                    <a href="/__proto/domain" onClick={(e) => { e.preventDefault(); alert("Mockup — full DNS guide"); }}>
                      Read the full guide →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer help ── */}
            <div className="footer-help">
              <a href="/__proto/domain" onClick={(e) => { e.preventDefault(); alert("Mockup — domain setup guide"); }}>
                Read the domain setup guide
              </a>
              {" · "}
              <a href="/__proto/domain" onClick={(e) => { e.preventDefault(); alert("Mockup — contact support"); }}>
                Contact support
              </a>
            </div>
          </div>

          {/* ── Right tips panel ── */}
          <aside className="side-tips" aria-label="Domain best practices">
            <div className="tips-panel">
              <h3>Domain best practices</h3>
              {tips.map((t) => (
                <div className="tip-chip" key={t.title}>
                  <span className="tip-ic">{t.icon}</span>
                  <div>
                    <div className="tip-title">{t.title}</div>
                    <div className="tip-body">{t.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* ====== ADD DOMAIN WIZARD MODAL ====== */}
      {wizardOpen && (
        <div
          className="proto-domain-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="domain-wizard-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeWizard(); }}
        >
          <div className="proto-domain-modal">
            <div className="modal-header">
              <h2 id="domain-wizard-title">Add a domain</h2>
              <button className="modal-close" type="button" aria-label="Close" onClick={closeWizard}>✕</button>
            </div>
            <div className="modal-body">
              {/* Step indicator */}
              <div className="wizard-steps" role="list" aria-label="Wizard progress">
                {([["1", "Domain"], ["2", "DNS"], ["3", "Live"]] as const).map(([num, label], i) => {
                  const stepNum = i + 1;
                  const current = step === "payment" ? 1 : step;
                  const cls = stepNum < current ? "done" : stepNum === current ? "active" : "";
                  return (
                    <span key={num} style={{ display: "contents" }}>
                      {i > 0 && <span className={`ws-connector${current > i + 1 ? " done" : ""}`} />}
                      <span className={`ws-step ${cls}`} role="listitem">
                        <span className="ws-num">{stepNum < current ? "✓" : num}</span>
                        <span>{label}</span>
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* STEP 1 — Enter domain */}
              {step === 1 && (
                <div className="wiz-panel">
                  <div>
                    <div className="field-label">Your domain</div>
                    <div className="domain-input-wrap">
                      <input
                        type="text"
                        placeholder="yourdomain.com"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        aria-label="Domain name"
                        value={domainInput}
                        onChange={(e) => { setDomainInput(e.target.value); setDomainError(""); }}
                      />
                    </div>
                    <p className="input-hint">
                      Enter just the domain — no http://, no www. Works with apex
                      (<code>yourdomain.com</code>) or subdomain (<code>links.yourdomain.com</code>).
                    </p>
                    {(domainError || liveDomainError) && (
                      <p className="input-error" role="alert">{domainError || liveDomainError}</p>
                    )}
                    {!liveDomainError && detect && (
                      <p className="input-detect">
                        {detect === "subdomain" ? (
                          <>✓ Detected: <strong>subdomain</strong> — clean CNAME setup, works with any registrar.</>
                        ) : (
                          <>✓ Detected: <strong>apex domain</strong> — needs A record (or transfer DNS to Cloudflare for CNAME flattening).</>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="wiz-actions">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={closeWizard}>Cancel</button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => goToStep2()}>Continue</button>
                  </div>
                </div>
              )}

              {/* PAYMENT OVERLAY — Free tier, first domain */}
              {step === "payment" && (
                <div className="wiz-panel">
                  <div className="empty-hero" style={{ padding: "16px 18px", textAlign: "left", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderStyle: "solid", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>Custom domain add-on</div>
                      <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 3 }}>{committedDomain}</div>
                      <div style={{ fontSize: 11.5, color: "var(--brand-primary)", marginTop: 5, fontStyle: "italic" }}>
                        Not an upgrade — Free stays Free. This covers the domain only.
                      </div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 600, whiteSpace: "nowrap" }}>
                      $1.99<sub style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 400 }}>/mo</sub>
                    </div>
                  </div>

                  <div style={{ border: "1px solid var(--border-strong)", borderRadius: "var(--radius)", padding: "14px 16px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <div className="field-label">Card number</div>
                      <input className="hr-time" type="text" placeholder="4242 4242 4242 4242" maxLength={19} aria-label="Card number" style={{ width: "100%", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "var(--bg-elevated)", color: "var(--fg)", fontFamily: "var(--font-mono)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div className="field-label">Expiry</div>
                        <input type="text" placeholder="MM / YY" maxLength={7} aria-label="Expiry date" style={{ width: "100%", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "var(--bg-elevated)", color: "var(--fg)", fontFamily: "var(--font-mono)" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="field-label">CVC</div>
                        <input type="text" placeholder="123" maxLength={4} aria-label="CVC" style={{ width: "100%", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "var(--bg-elevated)", color: "var(--fg)", fontFamily: "var(--font-mono)" }} />
                      </div>
                    </div>
                  </div>

                  <p className="lc-fine" style={{ textAlign: "center" }}>
                    $1.99/mo billed monthly, starting today. Cancel anytime from Settings → Billing.
                  </p>

                  <div className="wiz-actions is-split">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStep(1)}>Back</button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => goToStep2(true)}>Pay &amp; continue</button>
                  </div>
                </div>
              )}

              {/* STEP 2 — DNS instructions */}
              {step === 2 && (
                <div className="wiz-panel">
                  <p className="wiz-intro">Add this record at your domain registrar, then click Verify.</p>

                  <div className="dns-card" role="table" aria-label="DNS record to add">
                    <div className="dns-card-header" role="row">
                      <div className="dns-col-head" role="columnheader">Add at your registrar</div>
                      <div className="dns-col-head" role="columnheader">Value (point to tadaify)</div>
                    </div>
                    {dnsRecords.map((r) => (
                      <span key={r.type} style={{ display: "contents" }}>
                        <div className="dns-row" role="row">
                          <div className="dns-cell" role="cell"><div className="field-name">Type</div><code>{r.type}</code></div>
                          <div className="dns-cell" role="cell"><div className="field-name">Value</div><code>{r.value}</code></div>
                        </div>
                        <div className="dns-row" role="row">
                          <div className="dns-cell" role="cell"><div className="field-name">Name / Host</div><code>{r.name}</code></div>
                          <div className="dns-cell" role="cell"><div className="field-name">TTL</div><code>{r.ttl}</code></div>
                        </div>
                      </span>
                    ))}
                  </div>

                  {/* TXT record (native details) */}
                  <details className="txt-expander">
                    <summary>Also add this TXT record (required by some registrars)</summary>
                    <div className="txt-body">
                      <p className="txt-intro">If your registrar or DNS provider asks for a verification token:</p>
                      <div className="dns-card">
                        {txtRecords.map((r) => (
                          <span key={r.type} style={{ display: "contents" }}>
                            <div className="dns-row">
                              <div className="dns-cell"><div className="field-name">Type</div><code>{r.type}</code></div>
                              <div className="dns-cell"><div className="field-name">Value</div><code>{r.value}</code></div>
                            </div>
                            <div className="dns-row">
                              <div className="dns-cell"><div className="field-name">Name</div><code>{r.name}</code></div>
                              <div className="dns-cell"><div className="field-name">TTL</div><code>{r.ttl}</code></div>
                            </div>
                          </span>
                        ))}
                      </div>
                    </div>
                  </details>

                  {/* Live status */}
                  <div className={`dns-status-bar${dnsStatus === "verified" ? " verified" : ""}`} role="status" aria-live="polite">
                    {dnsStatus === "verified" ? (
                      <S w={16}><polyline points="20 6 9 17 4 12" /></S>
                    ) : (
                      <S w={16}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></S>
                    )}
                    <span>{dnsStatus === "verified" ? "DNS verified ✓" : "Waiting for DNS… checking every 30 seconds"}</span>
                  </div>

                  {/* Registrar expander */}
                  <div className="registrar-expander">
                    <button
                      className="re-trigger"
                      type="button"
                      aria-expanded={registrarOpen}
                      onClick={() => setRegistrarOpen((v) => !v)}
                    >
                      <span>Where do I find this in my registrar?</span>
                      <S w={16}><polyline points="6 9 12 15 18 9" /></S>
                    </button>
                    {registrarOpen && (
                      <div className="re-body" role="region">
                        {registrarPaths.slice(0, 4).map((r) => (
                          <div className="re-row" key={r.registrar}>
                            <span className="re-registrar">{r.registrar}</span>
                            <span className="re-path">{r.path}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="wiz-actions is-split">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStep(1)}>Back</button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={verifyNow}>I've added the records — verify now</button>
                  </div>
                </div>
              )}

              {/* STEP 3 — SSL + Live */}
              {step === 3 && (
                <div className="wiz-panel">
                  <div className="ssl-timeline" role="list" aria-label="Provisioning status">
                    <div className="ssl-step" role="listitem">
                      <div className="ssl-icon done" aria-label="Done">✓</div>
                      <div className="ssl-body">
                        <div className="ssl-title">DNS verified</div>
                        <div className="ssl-sub">Verified just now</div>
                      </div>
                    </div>
                    <div className="ssl-step" role="listitem">
                      <div className={`ssl-icon ${sslStage === "ready" ? "done" : "pending"}`} aria-label={sslStage === "ready" ? "Done" : "In progress"}>
                        {sslStage === "ready" ? "✓" : "⏳"}
                      </div>
                      <div className="ssl-body">
                        <div className="ssl-title">{sslStage === "ready" ? "SSL certificate ready" : "Provisioning SSL certificate…"}</div>
                        <div className="ssl-sub">{sslStage === "ready" ? "TLS 1.3, 90-day cert, auto-renewed." : "Usually takes 30–90 seconds. Hang tight."}</div>
                      </div>
                    </div>
                    <div className={`ssl-step${sslStage === "ready" ? "" : " is-waiting"}`} role="listitem">
                      <div className={`ssl-icon ${sslStage === "ready" ? "done" : "waiting"}`} aria-label={sslStage === "ready" ? "Done" : "Waiting"}>
                        {sslStage === "ready" ? "✓" : "🔒"}
                      </div>
                      <div className="ssl-body">
                        <div className="ssl-title">SSL ready</div>
                        <div className="ssl-sub">{sslStage === "ready" ? "Your domain is secured and live." : "Waiting for provisioning…"}</div>
                      </div>
                    </div>
                  </div>

                  {sslStage === "provisioning" ? (
                    <div className="wiz-actions">
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => setSslStage("ready")}>
                        Demo: finish provisioning
                      </button>
                    </div>
                  ) : (
                    <div className="live-cta" role="status" aria-live="polite">
                      <div className="lc-emoji">🎉</div>
                      <div className="lc-domain">https://{committedDomain}</div>
                      <p className="lc-desc">Your custom domain is live and secured with SSL.</p>
                      <div className="lc-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                        >
                          {copied ? "Copied!" : (
                            <>
                              <S w={13}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></S>
                              Copy URL
                            </>
                          )}
                        </button>
                        <button className="btn btn-primary btn-sm" type="button" onClick={closeWizard}>Done</button>
                      </div>
                      <p className="lc-fine">$1.99/mo billed monthly, starting today. Cancel anytime in Settings → Billing.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== REMOVE CONFIRMATION MODAL ====== */}
      {confirmDomain && (
        <div
          className="proto-domain-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="domain-confirm-title"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDomain(null); }}
        >
          <div className="proto-domain-modal is-confirm">
            <h3 id="domain-confirm-title">Remove {confirmDomain.name}?</h3>
            <p>
              Visitors will be redirected to <strong>{domainMeta.pageUrl}</strong>. The subscription
              line item cancels at end of your current billing period ({confirmDomain.daysLeft} days
              remaining).
            </p>
            <div className="confirm-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setConfirmDomain(null)}>Keep domain</button>
              <button className="btn btn-danger btn-sm" type="button" onClick={removeDomain}>Remove domain</button>
            </div>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}
