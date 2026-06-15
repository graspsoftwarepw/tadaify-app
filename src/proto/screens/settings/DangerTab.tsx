/**
 * Settings · Danger zone tab — cancel subscription (with the "your page stays
 * live forever" promise), pause subscription (Pro+), a cross-link to export
 * your data before leaving, permanent account deletion (GDPR Art. 17) with its
 * consequence list and before-you-go checklist, an accidental-delete recovery
 * note, and the read-only account-action history. Faithful port of
 * mockups/tadaify-mvp/app-settings-danger.html, composed on the shared
 * SettingsShell primitives.
 *
 * Destructive actions are never one-click: cancel runs a 3-step centred
 * SettingsModal (why → did-you-know → confirm), pause opens a centred modal,
 * and delete opens a type-to-confirm modal (type the account email + password +
 * acknowledge before the Delete button enables). Every modal closes on Escape /
 * backdrop / Cancel. The tab never raises the shell save-bar — actions apply
 * immediately and every side effect is mocked with an alert; no dead links.
 * Data comes from the typed dangerFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import { SettingsSection, SettingsModal } from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import { dangerFixture, type Consequence } from "./dangerFixture";

type Modal = null | "cancel" | "pause" | "delete";

const mock = (msg: string) => () => alert(msg);

function ConsequenceList({ items }: { items: Consequence[] }) {
  return (
    <ul className="consequence-list">
      {items.map((c) => (
        <li key={c.title} className={`is-${c.tone}`}>
          <span className="cl-ico" aria-hidden>
            {c.tone === "good" ? "✓" : c.tone === "warn" ? "!" : "×"}
          </span>
          <div className="cl-body">
            <strong>{c.title}</strong>
            <span className="cl-meta">{c.meta}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DangerTab() {
  const fx = dangerFixture();
  const [modal, setModal] = useState<Modal>(null);
  const [cancelStep, setCancelStep] = useState<1 | 2 | 3>(1);
  const [delEmail, setDelEmail] = useState("");
  const [delPassword, setDelPassword] = useState("");
  const [delAck, setDelAck] = useState(false);

  const close = () => {
    setModal(null);
    setCancelStep(1);
    setDelEmail("");
    setDelPassword("");
    setDelAck(false);
  };

  const deleteReady = delEmail.trim().toLowerCase() === fx.accountEmail.toLowerCase() && delPassword.length > 0 && delAck;

  return (
    <>
      {/* Section 1 — Cancel subscription */}
      <SettingsSection
        title={
          <>
            <span className="sst-emoji" aria-hidden>
              👋
            </span>{" "}
            Cancel subscription
          </>
        }
        lede="Sorry to see you considering this. Before you go, take a look at what cancelling means — the good news is that your page doesn't disappear."
        danger
      >
        <div className="plan-summary">
          <div className="ps-emoji" aria-hidden>
            ✨
          </div>
          <div className="ps-body">
            <div className="ps-title">
              {fx.planName} <span className="chip locked-life">🔒 Price locked for life</span>
            </div>
            <div className="ps-meta">
              <b>{fx.planPrice}</b> · billed monthly · renews <b>{fx.renews}</b> via {fx.card}
            </div>
            <div className="ps-chips">
              <span className="chip success">● Active</span>
              <span className="chip neutral">Started {fx.startedOn}</span>
              <span className="chip neutral">{fx.daysInto}</span>
            </div>
          </div>
          <div className="ps-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would jump to the Billing tab")}>
              Manage in Billing →
            </button>
          </div>
        </div>

        <div className="promise-callout" role="note">
          <div className="pc-ico" aria-hidden>
            <S w={20}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </S>
          </div>
          <div className="pc-body">
            <div className="pc-title">Your page stays live forever — even on Free tier</div>
            <div className="pc-sub">
              When you cancel, <b>tadaify.com/alexandra</b> keeps working with your blocks, links, and analytics. You drop down to{" "}
              <b>Free tier limits</b> after the period ends (8 blocks, no custom domain, basic analytics) — but the page never goes dark.
            </div>
          </div>
        </div>

        <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => setModal("cancel")} style={{ marginTop: 6 }}>
          Cancel {fx.planName} subscription
        </button>
      </SettingsSection>

      {/* Section 2 — Pause subscription (Pro+) */}
      <SettingsSection
        title={
          <>
            <span className="sst-emoji" aria-hidden>
              ⏸
            </span>{" "}
            Pause subscription
          </>
        }
        action={<span className="chip pro sec-tier-pill">✨ Pro</span>}
        lede="Going on hiatus? Pause your subscription for 1–3 months. No charges during the pause, your page stays live with all Pro features, and you'll get a reminder 3 days before it resumes."
      >
        <div className="pause-actions-row">
          <button className="btn btn-warm btn-sm" type="button" onClick={() => setModal("pause")}>
            Pause subscription →
          </button>
          <span className="pause-note">{fx.pausesRemaining} pauses remaining this year</span>
        </div>
      </SettingsSection>

      {/* Section 3 — Export cross-link */}
      <SettingsSection
        title={
          <>
            <span className="sst-emoji" aria-hidden>
              📦
            </span>{" "}
            Before you leave — download your data
          </>
        }
      >
        <button type="button" className="crosslink-card" onClick={mock("Mockup — would jump to the GDPR & data tab to export everything")}>
          <span className="xc-ico" aria-hidden>
            <S w={18}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </S>
          </span>
          <span className="xc-body">
            <span className="xc-title">Export everything as ZIP (JSON + CSV) →</span>
            <span className="xc-sub">Your profile, pages, blocks, subscribers, bookings, analytics, billing, audit log. Available in GDPR & data tab.</span>
          </span>
        </button>
      </SettingsSection>

      {/* Section 4 — Delete account */}
      <SettingsSection
        title={
          <>
            <span className="sst-emoji" aria-hidden>
              🗑️
            </span>{" "}
            Permanently delete your tadaify account
          </>
        }
        action={<span className="chip neutral">GDPR Art. 17</span>}
        lede="This is the nuclear option — different from cancelling. Deletion permanently erases your account, your handle, and everything connected to it. There is a 30-day grace window during which logging in restores your account; after that, it's gone forever."
        danger
      >
        <ConsequenceList items={fx.deleteConsequences} />

        <div className="before-go-head">Before you go — recommended steps</div>
        <ul className="before-checklist">
          {fx.beforeYouGo.map((step, i) => (
            <li key={step.title}>
              <span className="bc-num">{i + 1}</span>
              <div className="bc-body">
                <div className="bc-title">{step.title}</div>
                <div className="bc-sub">{step.sub}</div>
              </div>
              {step.link && (
                <button className="bc-link" type="button" onClick={mock(`Mockup — would jump to ${step.link}`)}>
                  {step.link}
                </button>
              )}
            </li>
          ))}
        </ul>

        <button className="btn btn-danger btn-sm" type="button" onClick={() => setModal("delete")} style={{ marginTop: 18 }}>
          Delete my account
        </button>
        <span className="danger-action-note">Type your email + password to confirm</span>
      </SettingsSection>

      {/* Section 5 — Recovery */}
      <SettingsSection
        title={
          <>
            <span className="sst-emoji" aria-hidden>
              🆘
            </span>{" "}
            Accidentally clicked delete?
          </>
        }
      >
        <p className="section-help" style={{ marginBottom: 0 }}>
          <strong>Sign in within 30 days</strong> using your existing email + password — your account is fully restored, no support ticket
          needed. After 30 days, contact support within 90 days while the audit log is still retained — recovery isn't guaranteed but we'll
          try.
        </p>
      </SettingsSection>

      {/* Section 6 — Account action history */}
      <SettingsSection
        title={
          <>
            <span className="sst-emoji" aria-hidden>
              📜
            </span>{" "}
            Account action history
          </>
        }
        action={
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the full security log")}>
            Full security log →
          </button>
        }
      >
        <p className="section-help">
          Everything we record about cancel / pause / delete on your account. Retained for 90 days even after deletion for legal compliance.
        </p>
        <div className="account-audit-list">
          {fx.history.map((h) => (
            <div key={h.id} className={`account-audit-row is-${h.tone}`}>
              <span className="ar-ico" aria-hidden>
                {h.ico}
              </span>
              <div className="ar-body">
                <div className="ar-event">{h.event}</div>
                <div className="ar-meta">{h.meta}</div>
              </div>
              <div className="ar-time">{h.time}</div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* ── Modals ── */}
      {modal === "cancel" && (
        <SettingsModal
          title={`Cancel ${fx.planName} subscription?`}
          sub={
            cancelStep === 1
              ? "Tell us why (optional) so we can keep improving — or skip ahead. We never block you with a survey."
              : cancelStep === 2
                ? "Did you know? A couple of things you haven't tried yet — they come with your current plan."
                : "Here's exactly what happens when you cancel."
          }
          onClose={close}
          hideCancel
          confirm={
            cancelStep === 1 ? (
              <>
                <button className="btn btn-ghost btn-sm" type="button" onClick={close}>
                  Never mind, keep my plan
                </button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setCancelStep(2)}>
                  Continue →
                </button>
              </>
            ) : cancelStep === 2 ? (
              <>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCancelStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => setCancelStep(3)}>
                  Continue cancelling →
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCancelStep(2)}>
                  ← Back
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  type="button"
                  onClick={() => {
                    alert("Mockup — would cancel at period end and keep your page live on Free");
                    close();
                  }}
                >
                  Cancel my subscription
                </button>
              </>
            )
          }
        >
          <div className="stepper" aria-label="Cancel steps">
            {(["Why?", "Did you know?", "Confirm"] as const).map((label, i) => (
              <span key={label} className={`step-pill${cancelStep === i + 1 ? " is-current" : ""}`}>
                <span className="step-num">{i + 1}</span>
                {label}
              </span>
            ))}
          </div>
          {cancelStep === 1 && (
            <>
              <p className="modal-hint">Optional — skip if you'd rather just leave. We never block you with a survey.</p>
              <div className="reason-list" role="radiogroup" aria-label="Cancellation reason">
                {[
                  ["Too expensive for what I use", "Dropping to Free still keeps your page live forever."],
                  ["Found a better alternative", "We'd love to know which — tell us below if you want."],
                  ["Don't use it enough", "Have you considered pausing instead? See step 2."],
                  ["Going on hiatus", "Pause is probably what you want (Pro+, see step 2)."],
                  ["Other", "Tell us in the box below."],
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
              <textarea className="field-input" rows={3} placeholder="Anything else? (optional) — goes straight to a human." />
            </>
          )}
          {cancelStep === 2 && (
            <div className="retention-card">
              <div className="rc-eyebrow">Did you know?</div>
              <div className="rc-title">You haven't tried these features yet</div>
              <ul className="rc-feature-list">
                <li>
                  <span className="rcf-emoji" aria-hidden>
                    📧
                  </span>
                  <div>
                    <b>Newsletter signup block (capped at 1k subscribers free)</b>
                    <span className="rcf-meta">You have 142 visitors but no email capture set up. Avg conversion: 2–4%.</span>
                  </div>
                </li>
                <li>
                  <span className="rcf-emoji" aria-hidden>
                    📊
                  </span>
                  <div>
                    <b>Last-30-day analytics with click attribution</b>
                    <span className="rcf-meta">Free tier loses per-block click breakdown — you'd lose which blocks convert.</span>
                  </div>
                </li>
              </ul>
            </div>
          )}
          {cancelStep === 3 && (
            <ConsequenceList
              items={[
                { tone: "warn", title: "Your access to Creator features ends at period end", meta: "You keep full Creator access until your paid period ends." },
                { tone: "good", title: "Your tadaify page stays live forever as Free tier", meta: "Your URL keeps working — limited to 8 blocks, no custom domain, basic analytics — but never goes dark." },
                { tone: "good", title: "All your blocks, pages, subscribers, and analytics are preserved", meta: "Nothing is deleted. If you re-subscribe, everything is exactly where you left it." },
                { tone: "good", title: "Re-subscribe anytime before period end to keep your locked price", meta: "After that the price returns to the current rate." },
              ]}
            />
          )}
        </SettingsModal>
      )}

      {modal === "pause" && (
        <SettingsModal
          title="Pause subscription"
          sub="No charges during the pause. Your page stays live with full Creator features. We'll send a reminder 3 days before resume."
          onClose={close}
          confirm={
            <button
              className="btn btn-warm btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would pause the subscription via Stripe");
                close();
              }}
            >
              Pause for 2 months
            </button>
          }
        >
          <label className="modal-field-label">Pause for</label>
          <div className="pause-duration-row" role="radiogroup" aria-label="Pause duration">
            {["1 month", "2 months", "3 months"].map((d, i) => (
              <label key={d} className={`pause-duration${i === 1 ? " is-selected" : ""}`}>
                <input type="radio" name="pause-duration" defaultChecked={i === 1} /> {d}
              </label>
            ))}
          </div>
          <label className="modal-field-label">Reason (optional)</label>
          <select className="field-select" defaultValue="">
            <option value="">— Select if you want —</option>
            <option value="travel">Travelling / off-grid</option>
            <option value="rebrand">Rebranding</option>
            <option value="break">Taking a creative break</option>
            <option value="seasonal">Seasonal business</option>
            <option value="other">Other</option>
          </select>
          <div className="modal-info">
            <strong>{fx.pausesRemaining} of 2 pauses remaining this year.</strong> Limited to prevent indefinite-pause loopholes.
          </div>
        </SettingsModal>
      )}

      {modal === "delete" && (
        <SettingsModal
          title="⚠️ Permanently delete your tadaify account"
          sub="This is the final step. Your account, page, handle, and all associated data will be erased within 30 days. You have a 30-day grace period — sign in within that window to fully restore your account."
          onClose={close}
          confirm={
            <button
              className="btn btn-danger btn-sm"
              type="button"
              disabled={!deleteReady}
              onClick={() => {
                alert("Mockup — would schedule permanent deletion after the 30-day grace window");
                close();
              }}
            >
              Delete my account forever
            </button>
          }
        >
          <div className="modal-warning">
            <strong>Heads up:</strong> Your custom domain DNS records (if any) are <strong>not auto-removed</strong>. Update alexandra.com to
            point elsewhere before the grace window ends — otherwise visitors hit a dangling domain.
          </div>
          <div className="modal-fields">
            <div>
              <label className="modal-field-label">Your account email</label>
              <input className="field-input" type="email" value={fx.accountEmail} readOnly />
            </div>
            <div>
              <label className="modal-field-label">Type your email address to confirm</label>
              <input
                className="field-input"
                type="email"
                autoComplete="off"
                placeholder={fx.accountEmail}
                value={delEmail}
                onChange={(e) => setDelEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="modal-field-label">Confirm with your password</label>
              <input
                className="field-input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={delPassword}
                onChange={(e) => setDelPassword(e.target.value)}
              />
            </div>
          </div>
          <label className="ack-row">
            <input type="checkbox" checked={delAck} onChange={(e) => setDelAck(e.target.checked)} />
            <span>
              <strong>I understand this is permanent.</strong> After the 30-day grace window, my account, handle (@alexandra), and all data
              are erased and cannot be recovered.
            </span>
          </label>
        </SettingsModal>
      )}
    </>
  );
}
