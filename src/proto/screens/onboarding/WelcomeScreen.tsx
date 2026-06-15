/**
 * Onboarding step 1/5 — Welcome. Faithful port of
 * mockups/tadaify-mvp/onboarding-welcome.html: dynamic welcome header + a
 * multi-select platform picker (handle-based, no OAuth). Rendered inside the
 * shared OnboardingShell. Selections are local React state; Continue/Skip are
 * real `/__proto/onboarding-*` links.
 *
 * @implements fr-onboarding
 */
import { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { welcomeFixture } from "./welcomeFixture";
import { readHandleParam, withHandle } from "./handleParam";

export function WelcomeScreen() {
  const { handle: fallbackHandle, platforms } = welcomeFixture();
  const handle = readHandleParam(fallbackHandle);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const hint =
    selected.length === 0
      ? "Pick one or more — or skip to start from a blank template."
      : selected.length === 1
        ? '1 platform selected. We’ll add a "Follow me" block for it.'
        : `${selected.length} platforms selected. We’ll add "Follow me" blocks for each.`;

  return (
    <OnboardingShell
      step={1}
      stepLabel="Step 1 of 5 · Welcome"
      fillPct={20}
      backHref="/__proto"
      continueHref={withHandle("/__proto/onboarding-social", handle)}
      continueLabel={selected.length > 0 ? `Continue (${selected.length})` : "Continue"}
      hint={hint}
      microcopy="You can add more anytime from settings."
    >
      <header className="ob-hero">
        <span className="ob-logo" aria-hidden="true">t</span>
        <h1 className="ob-h1">
          Welcome, <span className="grad">@{handle}</span>{" "}
          <span className="wave" aria-hidden="true">👋</span>
        </h1>
        <p className="ob-sub">
          Which platforms are you on? We'll add <strong>"Follow me"</strong> link
          blocks that point to your profiles. Just your @handle — no account
          connection.
        </p>
      </header>

      <section className="sp-grid" role="group" aria-label="Select the platforms you use">
        {platforms.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`sp-card${isSelected ? " is-selected" : ""}`}
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(p.id)}
              style={
                {
                  "--sp-a": p.a,
                  "--sp-b": p.b,
                  "--sp-c": p.c,
                } as React.CSSProperties
              }
            >
              <span className="sp-icon" aria-hidden="true">
                {p.name.charAt(0)}
              </span>
              <span className="sp-name">{p.name}</span>
              <span className="sp-dot" aria-hidden="true" />
            </button>
          );
        })}
      </section>

      {selected.length > 0 && (
        <div className="sp-preview">
          <p className="sp-preview-label">We'll add these link blocks to your page:</p>
          <div className="sp-preview-chips">
            {selected.map((id) => {
              const p = platforms.find((x) => x.id === id);
              return (
                <span className="sp-chip" key={id}>
                  Follow me on {p?.name ?? id}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}
