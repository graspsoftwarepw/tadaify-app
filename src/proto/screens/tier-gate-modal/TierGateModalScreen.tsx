/**
 * TierGate modal — the single shared upsell scene in tadaify, shown at Save
 * when a feature needs a higher subscription tier. Ported from
 * mockups/tadaify-mvp/app-tier-gate-modal.html, overlaid on the reused
 * dashboard like the block picker.
 *
 * Premium features stay fully visible + interactive everywhere else; the gate
 * happens only here, at save. Presentational + local UI state only; data from
 * typed fixtures. The mockup's per-feature triggers (A/B, custom domain, team,
 * schedule, Klaviyo, multi-feature, already-covered toast, admin-role gate) and
 * its four checkout states (default / loading / success / cancel) are reproduced
 * behind an explicit in-view "mockup states" switcher — that strip is mockup-only
 * scaffolding, not the modal's real content. Upgrade / save-as-draft are mocked.
 *
 * @implements fr-tier-gate-modal
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./tier-gate-modal-proto.css";
import { DashboardScreen } from "../dashboard/DashboardScreen";
import {
  TIER_LABEL,
  tierFeatureLists,
  tierGateStateLabels,
  topTier,
  triggersFixture,
  yearlyMonthly,
  yearlySaving,
  type BillingCycle,
  type Tier,
  type TierGateState,
  type Trigger,
} from "./tierGateFixture";

const TRIGGERS = triggersFixture();
const FEATURE_LISTS = tierFeatureLists();
const STATES: TierGateState[] = ["default", "loading", "success", "cancel"];

const mock = (what: string) => () => window.alert(`Mockup — would ${what}.`);
const fmt = (n: number) => `$${n.toFixed(2)}`;

/** Render the fixture's lightweight **bold** / `code` markup as React nodes. */
function richText(s: string, key: number) {
  const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <span key={key}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

function TierPanel({ tier, cycle }: { tier: Tier; cycle: BillingCycle }) {
  const isBiz = tier === "business";
  const list = FEATURE_LISTS[tier as "creator" | "pro" | "business"] ?? [];
  const price = cycle === "yearly" ? yearlyMonthly(tier) : tierPriceMonthly(tier);
  return (
    <div className={`tg-tier-panel${isBiz ? " is-business" : ""}`}>
      <div className="tg-tier-head">
        <span className="tier-pill">🔓 {TIER_LABEL[tier].toUpperCase()}</span>
        <span className="tier-title">{TIER_LABEL[tier]} plan</span>
        <span className="tier-price">
          <span className="price-amt">{fmt(price)}</span>
          <span className="price-cadence">/mo{cycle === "yearly" ? " billed yearly" : ""}</span>
        </span>
      </div>
      <ul className="tg-tier-features">
        {list.map((html, i) => (
          <li key={i}>
            <span className="check" aria-hidden>✓</span>
            <span>{richText(html, i)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function tierPriceMonthly(tier: Tier): number {
  return { free: 0, creator: 7.99, pro: 19.99, business: 49.99 }[tier];
}

function AdminPanel() {
  return (
    <div className="tg-tier-panel">
      <div className="tg-tier-head">
        <span className="tier-pill is-role">👤 ADMIN ROLE</span>
        <span className="tier-title">Your workspace already has Business — you just need Admin</span>
      </div>
      <ul className="tg-tier-features">
        <li><span className="check" aria-hidden>✓</span><span><b>You&apos;re on Business</b> — Team is part of your plan</span></li>
        <li><span className="check" aria-hidden>✓</span><span>Adding/removing team members is an <b>Admin-only action</b></span></li>
        <li><span className="check" aria-hidden>✓</span><span>Your account owner is <b>alexandra@example.com</b></span></li>
      </ul>
    </div>
  );
}

export function TierGateModalScreen() {
  const navigate = useNavigate();
  const [triggerKey, setTriggerKey] = useState("ab");
  const [state, setState] = useState<TierGateState>("default");
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  const trigger = useMemo<Trigger>(
    () => TRIGGERS.find((t) => t.key === triggerKey) ?? TRIGGERS[0],
    [triggerKey],
  );

  // The gate opened from an editor's Save — dismissing returns to the dashboard.
  const close = () => navigate("/__proto/dashboard");

  // Escape: from loading → cancel (matches the mockup's requestClose), else close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!trigger.alreadyCovered && state === "loading") setState("cancel");
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, trigger]);

  const requestClose = () => {
    if (!trigger.alreadyCovered && state === "loading") setState("cancel");
    else close();
  };

  const top = topTier(trigger.features);
  const roleProblem = !!trigger.roleProblem;
  const tierName = roleProblem ? "Admin role" : TIER_LABEL[top];
  const verb = trigger.features.length > 1 ? "need" : trigger.features[0]?.name.endsWith("s") ? "need" : "needs";
  const featureName = trigger.features.length > 1 ? `${trigger.features.length} premium features` : trigger.features[0]?.name;

  const saving = yearlySaving(top);
  const upgradePrice = cycle === "yearly" ? yearlyMonthly(top) : tierPriceMonthly(top);

  return (
    <>
      <DashboardScreen />

      <div className="proto-root proto-tier-gate">
        {/* Mockup-only scaffolding: trigger + checkout-state switchers. */}
        <div className="state-strip" role="region" aria-label="Mockup states (not part of the modal)">
          <span className="ss-note">Mockup states · review only</span>
          <div className="ss-group">
            <span className="ss-lbl">Trigger</span>
            {TRIGGERS.map((t) => (
              <button key={t.key} type="button" className={t.key === triggerKey ? "is-active" : ""} onClick={() => { setTriggerKey(t.key); setState("default"); }}>
                {t.demoLabel}
              </button>
            ))}
          </div>
          <div className="ss-group">
            <span className="ss-lbl">Checkout</span>
            {STATES.map((s) => (
              <button
                key={s}
                type="button"
                className={s === state ? "is-active" : ""}
                disabled={trigger.alreadyCovered}
                onClick={() => setState(s)}
              >
                {tierGateStateLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {trigger.alreadyCovered ? (
          // Already on the right tier: no modal, just the confirmation toast.
          <div className="tg-toast-stage">
            <div className="toast is-visible">
              <span className="toast-check" aria-hidden>✓</span>
              <span className="toast-msg">{trigger.toast}</span>
            </div>
            <p className="toast-explain">
              <code>checkAndProceed</code> ran on Save; the current tier already covers every feature,
              so it proceeds silently — no modal. <button type="button" className="linkish" onClick={close}>Back to dashboard</button>
            </p>
          </div>
        ) : (
          <div
            className="tg-backdrop is-open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tg-h"
            onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}
          >
            <div className="tg-modal" role="document">
              {state === "success" ? (
                <div className="tg-success">
                  <div className="burst" aria-hidden>✨</div>
                  <h3>You&apos;re on {tierName} now! Let&apos;s publish your work.</h3>
                  <p>
                    Your block was saved as draft. We&apos;ll take you straight back to publish — your
                    configuration is exactly how you left it.
                  </p>
                  <div className="actions">
                    <button className="btn btn-primary" type="button" onClick={() => { mock("continue to publish the staged work")(); close(); }}>
                      Continue → Publish
                    </button>
                  </div>
                </div>
              ) : state === "cancel" ? (
                <div className="tg-cancel">
                  <div className="icon" aria-hidden>💾</div>
                  <h3>No worries — your work is still saved as draft.</h3>
                  <p>Want to try the upgrade again, or come back to it later? Either way, nothing&apos;s lost.</p>
                  <div className="actions">
                    <button className="btn btn-warm" type="button" onClick={() => setState("loading")}>Try upgrade again</button>
                    <button className="btn btn-secondary" type="button" onClick={() => { mock("save as draft and exit")(); close(); }}>Save as draft and exit</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="tg-head">
                    <h3 id="tg-h">
                      <span className="sparkle" aria-hidden>✨</span> Just one step — <span className="feature-name">{featureName}</span> {verb}{" "}
                      <span className="tier-name">{tierName}</span>
                    </h3>
                    <button className="iconbtn" type="button" aria-label="Close" onClick={requestClose}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div className="tg-body">
                    <div className="tg-context">
                      <div className="ctx-h">{trigger.contextHeading}</div>
                      <ul>
                        {trigger.features.flatMap((f) => f.contextLines).map((line, i) => (
                          <li key={i}>{richText(line, i)}</li>
                        ))}
                      </ul>
                    </div>

                    {roleProblem ? <AdminPanel /> : <TierPanel tier={top} cycle={cycle} />}

                    <div className={`tg-draft${roleProblem ? " is-info" : ""}`}>
                      <span className="draft-icon" aria-hidden>{roleProblem ? "📋" : "💾"}</span>
                      <span>
                        {roleProblem ? (
                          <><b>We saved the invite as a request.</b> Your owner will see it next time they open Settings → Team.</>
                        ) : (
                          <><b>Your work is saved as draft.</b> {trigger.draftCopy}</>
                        )}
                      </span>
                    </div>

                    {trigger.partialSave && (
                      <div className="tg-partial">
                        Or{" "}
                        <button type="button" className="linkish" onClick={mock(`save without ${trigger.partialSave.label}`)}>
                          {roleProblem ? "copy a request link" : `save without ${trigger.partialSave.label}`}
                        </button>{" "}
                        — {trigger.partialSave.desc}
                      </div>
                    )}
                  </div>

                  <div className="tg-foot">
                    <div className="left">
                      <button className="btn btn-secondary" type="button" disabled={state === "loading"} onClick={() => { mock(roleProblem ? "cancel the invite" : "save as draft")(); close(); }}>
                        {roleProblem ? "Cancel invite" : "Save as draft"}
                      </button>
                    </div>
                    <div className="right">
                      {roleProblem ? (
                        <button className="btn btn-primary" type="button" onClick={() => { mock("notify alexandra@example.com")(); close(); }}>
                          Notify alexandra@example.com
                        </button>
                      ) : (
                        <>
                          <div className={`tg-bill-toggle${state === "loading" ? " is-disabled" : ""}`} role="group" aria-label="Billing cycle">
                            <button type="button" className={cycle === "monthly" ? "is-active" : ""} disabled={state === "loading"} onClick={() => setCycle("monthly")}>Monthly</button>
                            <button type="button" className={cycle === "yearly" ? "is-active" : ""} disabled={state === "loading"} onClick={() => setCycle("yearly")}>
                              Yearly <span className="save-chip">SAVE 2 MO</span>
                            </button>
                          </div>
                          {state === "loading" ? (
                            <button className="btn btn-primary is-loading" type="button" disabled>
                              <span className="btn-spinner" aria-hidden /> Opening checkout…
                            </button>
                          ) : (
                            <button className="btn btn-warm" type="button" onClick={() => setState("loading")}>
                              Upgrade — {fmt(upgradePrice)}/mo
                              <span className="price-sub">{cycle === "yearly" ? `billed yearly · save ${fmt(saving)}` : "billed monthly"}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
