/**
 * Onboarding step 5/5 — Compare plans. Faithful port of
 * mockups/tadaify-mvp/onboarding-tier.html: a read-only plan comparison.
 * Every user starts on Free (marked "Your starting plan"); no tier
 * is selectable, no checkout in onboarding. Rendered inside OnboardingShell.
 *
 * Back / the single "Take me to my page" CTA are real `/__proto/onboarding-*`
 * links. The complete step (no progress bar) follows.
 *
 * @implements fr-onboarding
 */
import { OnboardingShell } from "./OnboardingShell";
import { tierFixture } from "./tierFixture";

export function TierScreen() {
  const { plans } = tierFixture();

  return (
    <OnboardingShell
      step={5}
      stepLabel="Step 5 of 5 · Compare plans"
      fillPct={100}
      showActionBar={false}
    >
      <div className="ob-tier-head">
        <h1>You're all set — starting on Free.</h1>
        <p className="lead">
          Most features are <strong>free to try</strong>. Take tadaify for a spin,
          build your page, see if it fits — then upgrade anytime from{" "}
          <strong>Settings → Billing</strong> if you want more pages, custom
          domains, or extra AI credits.
        </p>
      </div>

      <div className="recommendation">
        ✨ No credit card needed today. Here's what each plan includes so you know
        what's available when you're ready.
      </div>

      <div className="pricelock">
        <div className="pricelock-icon" aria-hidden="true">🔒</div>
        <div>
          <h4 className="pricelock-title">When you do upgrade, your price is locked for life.</h4>
          <p className="pricelock-text">
            Subscribe at <strong>$7.99/mo</strong> later → pay <strong>$7.99/mo</strong>{" "}
            in year 3, year 5, year 10. As long as your subscription stays active, we{" "}
            <strong>never</strong> raise your price. Ever. Only if you cancel and
            re-subscribe do you pay the then-current price.
          </p>
        </div>
      </div>

      <div className="tier-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`tier-card${plan.startingPlan ? " starting-plan" : ""}`}
            data-tier={plan.id}
          >
            {plan.startingPlan && <div className="ribbon">✓ Your starting plan</div>}
            <h3>{plan.name}</h3>
            <div className="price">
              {plan.price}
              {plan.per && <span className="per"> {plan.per}</span>}
            </div>
            <div className="tier-sub">{plan.sub}</div>
            {plan.lockForLife && (
              <span className="lock-badge" title="Price locked as long as your subscription stays active">
                🔒 Locked for life
              </span>
            )}
            <ul>
              {plan.features.map((f) => (
                <li key={f.text}>
                  {f.text}
                  {f.comingSoon && <span className="soon-pill">coming soon</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="addon-universal">
        <span className="addon-plus" aria-hidden="true">+</span>
        <p>
          Need extra domains later? Add <strong>$1.99/mo per custom domain</strong>{" "}
          to any plan — Free included. No upgrade needed.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/__proto/onboarding-complete" className="ob-btn ob-btn-primary ob-btn-lg">
          Take me to my page →
        </a>
      </div>

      <p className="tier-fineprint">
        Upgrade whenever you want from <strong>Settings → Billing</strong>. 30-day
        money-back on any paid tier.
        <br />
        🔒 <strong>Price locked for life</strong> — we never raise the price on
        active subscribers.
      </p>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <a href="/__proto/onboarding-template" className="ob-back-hub">
          ← back
        </a>
      </p>
    </OnboardingShell>
  );
}
