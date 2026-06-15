/**
 * Settings · Billing tab — current plan with a monthly/yearly cadence toggle
 * and an inline compare-plans expander, payment method (card on file),
 * recent-invoices table with a status filter, a "manage in Stripe" block,
 * custom-domain add-ons, and a read-only billing email. Faithful port of the
 * Billing pane in mockups/tadaify-mvp/app-settings-billing.html, composed on
 * the shared SettingsShell primitives.
 *
 * Presentational, local-state only: flipping the billing cadence raises the
 * shell save-bar to dirty (registered via `onSaveBar`); "Change plan" opens a
 * centred confirm modal and the cancel cross-link opens a centred multi-step
 * cancel-flow modal. All modals close on Escape / backdrop / Cancel. Every
 * outbound action (Stripe portal, update card, download invoice) is mocked with
 * an alert — no dead links. Data comes from the typed billingFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import { SettingsSection, FieldRow, SettingsModal, type SaveBar } from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import type { SettingsTabProps } from "./AccountTab";
import { billingFixture, type InvoiceStatus } from "./billingFixture";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: "Paid",
  open: "Open",
  void: "Void",
  failed: "Failed",
};

const mock = (msg: string) => () => alert(msg);

export function BillingTab({ onSaveBar }: Pick<SettingsTabProps, "onSaveBar">) {
  const fx = billingFixture();

  const [cadence, setCadence] = useState<"monthly" | "yearly">("monthly");
  const [compareOpen, setCompareOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [changePlan, setChangePlan] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<"reason" | "confirm" | "done">("reason");

  const setCad = (next: "monthly" | "yearly") => {
    setCadence(next);
    onSaveBar({
      state: "dirty",
      hint: "Cadence changed — review and save.",
      saveLabel: "Save cadence",
      onSave: () => {
        alert("Mockup — would update your billing cadence in Stripe");
        onSaveBar(null);
      },
      onDiscard: () => {
        setCadence("monthly");
        onSaveBar(null);
      },
    });
  };

  const shownInvoices = fx.invoices.filter((i) => filter === "all" || i.status === filter);

  const closeCancel = () => {
    setCancelOpen(false);
    setCancelStep("reason");
  };

  return (
    <>
      {/* Current plan */}
      <SettingsSection
        title="Current plan"
        action={
          <span className="cadence-toggle" role="tablist" aria-label="Billing cadence">
            <button type="button" className={cadence === "monthly" ? "active" : ""} onClick={() => setCad("monthly")}>
              Monthly
            </button>
            <button type="button" className={cadence === "yearly" ? "active" : ""} onClick={() => setCad("yearly")}>
              Yearly <span className="cadence-savings">save 2 mo</span>
            </button>
          </span>
        }
      >
        <div className="plan-card">
          <div className="plan-icon" aria-hidden>
            {fx.planIcon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="plan-name">{fx.planName}</div>
            <div className="plan-price">
              <b>{cadence === "monthly" ? fx.planPriceMonthly : fx.planPriceYearly}</b> · renews <b>{fx.renews}</b>
            </div>
            <div className="plan-badges">
              <span className="chip locked-life">🔒 Locked for life at {fx.planPriceMonthly}</span>
              <span className="chip success">Active</span>
            </div>
          </div>
          <div className="plan-actions">
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setChangePlan(true)}>
              Change plan
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setChangePlan(true)}>
              Downgrade
            </button>
          </div>
        </div>

        <div className="pricelock-note">
          <span className="pn-ico" aria-hidden>
            🔒
          </span>
          <div>
            Your <b>{fx.planPriceMonthly}</b> price is locked forever as long as your subscription stays active — we never raise it.
            Upgrading to a higher tier locks your new price.
          </div>
        </div>

        <button
          type="button"
          className="compare-toggle"
          aria-expanded={compareOpen}
          onClick={() => setCompareOpen((v) => !v)}
        >
          <span className={`ct-caret${compareOpen ? " is-open" : ""}`}>›</span> Compare plans
        </button>
        {compareOpen && (
          <div className="compare-grid" role="region" aria-label="Plan comparison">
            {fx.comparePlans.map((p) => (
              <div key={p.id} className="compare-card">
                <div className="cc-name">{p.name}</div>
                <div className="cc-price">
                  <b>{p.price}</b> · {p.priceNote}
                </div>
                <ul className="cc-features">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  className="cc-cta"
                  type="button"
                  disabled={p.current}
                  onClick={p.current ? undefined : mock(`Mockup — would switch to ${p.name}`)}
                >
                  {p.current ? "Current plan" : `Pick ${p.name.replace(/\s*[⭐].*/, "")}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Payment method */}
      <SettingsSection
        title="Payment method"
        action={
          <span className="stripe-trust-strip">
            <span aria-hidden>🔒</span> PCI scope 0 · we never see your card
          </span>
        }
      >
        <div className="pm-card">
          <div className="pm-brand">{fx.cardBrand}</div>
          <div className="pm-meta">
            <div className="pm-num">•••• •••• •••• {fx.cardLast4}</div>
            <div className="pm-exp">
              Expires {fx.cardExpiry} · billing email <b>{fx.billingEmail}</b>
            </div>
          </div>
          <div className="pm-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the Stripe Customer Portal")}>
              Update card
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 10, lineHeight: 1.5 }}>
          Card details live in Stripe — <b>Update card</b> opens the Stripe-hosted Customer Portal. We get back the last 4 digits and
          brand only.
        </p>
      </SettingsSection>

      {/* Recent invoices */}
      <SettingsSection
        title="Recent invoices"
        action={
          <span className="invoice-toolbar">
            <span className="it-label">Filter:</span>
            <select className="field-select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="open">Open</option>
              <option value="void">Void</option>
              <option value="failed">Failed</option>
            </select>
          </span>
        }
      >
        <p className="section-help">Click any row to open the Stripe-hosted PDF — invoices are stored on Stripe, not in our database.</p>
        <div className="table-scroll">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shownInvoices.map((iv) => (
                <tr key={iv.id}>
                  <td className="mono">{iv.date}</td>
                  <td>{iv.description}</td>
                  <td className="mono">{iv.amount}</td>
                  <td>
                    <span className={`chip inv-${iv.status}`}>{STATUS_LABEL[iv.status]}</span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-xs" type="button" onClick={mock(`Mockup — would open invoice ${iv.id} PDF`)}>
                      PDF ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="invoices-footer">
          <span className="it-count">
            Showing <b>{shownInvoices.length}</b> of <b>{fx.invoiceTotal}</b>
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the Stripe Portal for full history")}>
            Open Stripe Portal for full history ↗
          </button>
        </div>
      </SettingsSection>

      {/* Manage in Stripe */}
      <SettingsSection title="Manage in Stripe">
        <p className="section-help">
          Card update, full invoice history (PDF), tax IDs and address all live inside the Stripe-hosted Customer Portal — we never see
          or store your card details. Cancelling a subscription is not in the portal on purpose — its home is the{" "}
          <button className="field-link" type="button" onClick={() => setCancelOpen(true)}>
            cancel flow
          </button>{" "}
          so we can capture feedback and offer a friendly retry.
        </p>
        <div className="stripe-cta-row">
          <button className="btn btn-primary btn-sm" type="button" onClick={mock("Mockup — would open the Stripe Customer Portal")}>
            Manage billing in Stripe ↗
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the Stripe Customer Portal")}>
            Update card
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the Stripe Portal invoice list")}>
            All invoices
          </button>
        </div>
      </SettingsSection>

      {/* Custom domain add-ons */}
      <SettingsSection
        title="Custom domain add-ons"
        action={
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the Domains manager")}>
            Manage domains →
          </button>
        }
      >
        <p className="section-help">
          Universal <b>$1.99/mo per domain</b> — every tier. Verified domains charge as a separate line item on your next invoice.
        </p>
        <div className="domain-list">
          {fx.domains.map((d) => (
            <div key={d.domain} className="domain-addon-row">
              <S w={15}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </S>
              <span className="da-name">{d.domain}</span>
              <span className="chip success">Active</span>
              <span className="da-price">{d.price}</span>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Billing email */}
      <SettingsSection title="Billing email">
        <p className="section-help">Receipts and invoices go to this address. Changing it updates Stripe too.</p>
        <div className="pm-card pm-card-muted">
          <div className="pm-mail-ico" aria-hidden>
            <S w={16}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </S>
          </div>
          <div className="pm-meta">
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{fx.billingEmail}</div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>Billing receipts go here · same as account email</div>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — change your email in the Account tab")}>
            Change in Account →
          </button>
        </div>
      </SettingsSection>

      {/* Change plan modal */}
      {changePlan && (
        <SettingsModal
          title="Change to Pro"
          sub="You'll be charged the prorated difference now, then your new monthly price locks in for life as long as your subscription stays active."
          onClose={() => setChangePlan(false)}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would charge the prorated difference and switch the plan in Stripe");
                setChangePlan(false);
              }}
            >
              Confirm &amp; charge
            </button>
          }
        >
          <div className="cp-summary">
            <div className="cp-line">
              <span className="cp-key">Current plan</span>
              <span>
                <b>Creator</b> · $7.99/mo
              </span>
            </div>
            <div className="cp-line">
              <span className="cp-key">New plan</span>
              <span>
                <b>Pro</b> · $19.99/mo
              </span>
            </div>
            <div className="cp-line cp-total">
              <span>Charged today</span>
              <span className="mono">
                <b>$7.33</b>
              </span>
            </div>
            <div className="cp-prorate-note">Prorated for 11 days remaining in current cycle</div>
          </div>
          <div className="pricelock-note">
            <span className="pn-ico" aria-hidden>
              🔒
            </span>
            <div>
              Your new <b>$19.99/mo</b> price will be locked for life as long as your subscription stays active.
            </div>
          </div>
        </SettingsModal>
      )}

      {/* Cancel-flow modal (multi-step) */}
      {cancelOpen && cancelStep === "reason" && (
        <SettingsModal
          title="Sure you want to cancel?"
          sub="Your work stays saved. Your pages stay live until Dec 1, 2026 — the end of your current billing cycle. Tell us why — leaving feedback helps us improve."
          onClose={closeCancel}
          hideCancel
          confirm={
            <>
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeCancel}>
                Keep my subscription
              </button>
              <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => setCancelStep("confirm")}>
                Continue to cancel →
              </button>
            </>
          }
        >
          <div className="reason-list" role="radiogroup" aria-label="Cancellation reason">
            {[
              ["Too expensive", "$7.99/mo isn't right for me right now"],
              ["Missing a feature I need", "Tell us which one in the box below"],
              ["Not using it enough", "My audience isn't on a bio link site yet"],
              ["Switching to another tool", "Linktree / Beacons / Carrd / Bento / other"],
              ["Hit a bug or technical issue", "Sorry — please tell us so we can fix it"],
              ["Other", "Help us understand"],
            ].map(([title, sub]) => (
              <label key={title} className="reason-item">
                <input type="radio" name="cancel-reason" />
                <span className="ri-body">
                  <span className="ri-title">{title}</span>
                  <span className="ri-sub">{sub}</span>
                </span>
              </label>
            ))}
          </div>
          <textarea className="field-input" rows={3} placeholder="What could we have done better?" />
        </SettingsModal>
      )}
      {cancelOpen && cancelStep === "confirm" && (
        <SettingsModal
          title="Confirm cancellation"
          sub="We'll cancel at the end of your current billing cycle. Until then nothing changes — your pages stay live, your features stay on."
          onClose={closeCancel}
          hideCancel
          confirm={
            <>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCancelStep("reason")}>
                ← Back
              </button>
              <button className="btn btn-danger btn-sm" type="button" onClick={() => setCancelStep("done")}>
                Cancel anyway
              </button>
            </>
          }
        >
          <div className="modal-warning">
            <strong>What happens after Dec 1, 2026</strong>
            <br />
            · Your pages switch to Free tier limits (1 page, no custom domain)
            <br />
            · Custom domain redirects stop; alexandra.com falls back to tadaify.com/alexandra
            <br />
            · Your data stays — re-subscribe any time and everything is right where you left it
            <br />
            · You'll pay the then-current price if you re-subscribe later
          </div>
        </SettingsModal>
      )}
      {cancelOpen && cancelStep === "done" && (
        <SettingsModal
          title="Subscription cancelled"
          sub="Your access ends on Dec 1, 2026. You'll get an email reminder 3 days before that date."
          onClose={closeCancel}
          hideCancel
          confirm={
            <button className="btn btn-primary btn-sm" type="button" onClick={closeCancel}>
              Back to Billing
            </button>
          }
        >
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0, lineHeight: 1.5 }}>
            Changed your mind? You can reactivate any time before then — or after — and your pages come right back.
          </p>
        </SettingsModal>
      )}
    </>
  );
}
