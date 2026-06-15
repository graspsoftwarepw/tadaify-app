/**
 * AI Suggest sub-modal — the floating UI shown when a creator clicks the
 * ✨ Suggest button on a short-text field (title / caption / button label)
 * in the block editor. Ported from mockups/tadaify-mvp/app-ai-suggest-modal.html,
 * overlaid on the reused dashboard like the block picker.
 *
 * Presentational + local UI state only; data from typed fixtures. Every one
 * of the mockup's states (loaded / loading / error / empty / out-of-quota) is
 * reproduced behind an explicit in-view "mockup states" switcher — that strip
 * is mockup-only scaffolding, not the modal's real content. The field flavour
 * (title / caption / button label) and the demo tier are switchable the same
 * way. Apply / refresh / upgrade are mocked (alert).
 *
 * @implements fr-ai-suggest-modal
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./ai-suggest-modal-proto.css";
import { DashboardScreen } from "../dashboard/DashboardScreen";
import {
  aiModalStateLabels,
  tierQuotasFixture,
  triggerContextsFixture,
  type AiModalState,
  type AiTier,
  type FieldFlavour,
  type Suggestion,
} from "./aiSuggestFixture";

const CONTEXTS = triggerContextsFixture();
const QUOTAS = tierQuotasFixture();
const FLAVOURS: FieldFlavour[] = ["title", "caption", "cta"];
const STATES: AiModalState[] = ["loaded", "loading", "error", "empty", "out"];
const TIERS: AiTier[] = ["free", "creator", "pro", "business"];

const mock = (what: string) => () => window.alert(`Mockup — would ${what}.`);

function CostStrip({ tier }: { tier: AiTier }) {
  const q = QUOTAS[tier];
  // Unlimited tiers (Pro / Business): no cost strip — no clutter.
  if (q.limit == null) return null;
  const pct = Math.min(100, Math.round((q.used / q.limit) * 100));
  const left = q.limit - q.used;
  const tone = left <= 0 ? "is-out" : left <= 2 ? "is-low" : "";
  return (
    <div className={`ctx-cost ${tone}`}>
      <div className="meter">
        <div className="line">
          {left <= 0 ? (
            <b>You&apos;ve used today&apos;s {q.limit} AI suggestions</b>
          ) : (
            <>
              <b>
                {q.used} of {q.limit}
              </b>{" "}
              suggestions today
              <span className="who">
                {" "}
                · {q.label} tier{left <= 2 ? ` · ${left} left` : ""}
              </span>
            </>
          )}
        </div>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="sub">Resets in 8h 23m · midnight UTC</div>
      </div>
    </div>
  );
}

function SuggCard({
  s,
  idx,
  selected,
  onSelect,
}: {
  s: Suggestion;
  idx: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`sugg-card${selected ? " is-selected" : ""}`}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span className="idx">{idx}</span>
        <span className="copy">{s.copy}</span>
        <span className="style-tag">{s.tag}</span>
        <span className="check" aria-hidden>
          ✓
        </span>
      </button>
    </li>
  );
}

export function AiSuggestModalScreen() {
  const navigate = useNavigate();
  const [flavour, setFlavour] = useState<FieldFlavour>("title");
  const [tier, setTier] = useState<AiTier>("free");
  const [state, setState] = useState<AiModalState>("loaded");
  const [selected, setSelected] = useState(1);
  const [refine, setRefine] = useState("");

  const ctx = CONTEXTS[flavour];

  // The sub-modal opened from the block editor — dismissing returns to the
  // dashboard, matching the block-picker exemplar.
  const close = () => navigate("/__proto/dashboard");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const useDisabled = state !== "loaded";

  const body = useMemo(() => {
    if (state === "loading") {
      return (
        <ul className="sugg-list" aria-busy="true" aria-label="Loading suggestions">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="sugg-skeleton">
              <span className="sk-idx" />
              <span className="sk-copy">
                <span className="sk-block sk-line-1" />
                <span className="sk-block sk-line-2" />
              </span>
              <span className="sk-tag" />
            </li>
          ))}
        </ul>
      );
    }
    if (state === "error") {
      return (
        <div className="err-box" role="alert">
          <svg className="err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="err-msg">
            <b>Couldn&apos;t fetch suggestions.</b>
            <span className="err-sub">The AI model is taking longer than expected. Give it another go in a moment.</span>
            <div className="err-actions">
              <button type="button" onClick={() => setState("loaded")}>Try again</button>
            </div>
          </div>
        </div>
      );
    }
    if (state === "empty") {
      return (
        <div className="empty-box">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2 15 9l7 .5-5.5 4.5 1.8 6.8L12 17l-6.3 3.8 1.8-6.8L2 9.5 9 9z" />
          </svg>
          <div className="empty-h">Tell us a bit about it first</div>
          <div className="empty-sub">
            Type something in the field, paste a URL into the block, or describe it in the box above.
            We&apos;ll generate five options based on whatever you give us.
          </div>
        </div>
      );
    }
    if (state === "out") {
      const q = QUOTAS[tier];
      return (
        <div className="out-box" role="alert">
          <div className="out-icon" aria-hidden>⏳</div>
          <div className="out-h">Comes back at midnight UTC</div>
          <div className="out-countdown">
            in <b>8 hours 23 minutes</b>
          </div>
          <button className="upgrade-btn" type="button" onClick={mock(`open the upgrade flow from ${q.label}`)}>
            ✨ Upgrade for more
          </button>
          <details>
            <summary>Why is there a daily limit?</summary>
            <p>
              AI suggestions cost us a fraction of a cent each ($0.000223 per call on Cloudflare
              Workers AI). We rate-limit to keep tadaify Free for everyone.
            </p>
          </details>
        </div>
      );
    }
    // loaded
    return (
      <>
        <div className="suggestions-head">
          <span className="lbl">Pick one</span>
          <span className="count">5 suggestions</span>
        </div>
        <ul className="sugg-list">
          {ctx.suggestions.map((s, i) => (
            <SuggCard
              key={s.copy}
              s={s}
              idx={i + 1}
              selected={selected === i}
              onSelect={() => setSelected(i)}
            />
          ))}
        </ul>
      </>
    );
  }, [state, ctx, selected, tier]);

  return (
    <>
      <DashboardScreen />

      <div className="proto-root proto-ai-suggest">
        {/* Mockup-only scaffolding: field flavour + tier + state switchers. */}
        <div className="state-strip" role="region" aria-label="Mockup states (not part of the modal)">
          <span className="ss-note">Mockup states · review only</span>
          <div className="ss-group">
            <span className="ss-lbl">Field</span>
            {FLAVOURS.map((f) => (
              <button key={f} type="button" className={f === flavour ? "is-active" : ""} onClick={() => { setFlavour(f); setSelected(1); }}>
                {CONTEXTS[f].label}
              </button>
            ))}
          </div>
          <div className="ss-group">
            <span className="ss-lbl">Tier</span>
            {TIERS.map((t) => (
              <button key={t} type="button" className={t === tier ? "is-active" : ""} onClick={() => setTier(t)}>
                {QUOTAS[t].label}
              </button>
            ))}
          </div>
          <div className="ss-group">
            <span className="ss-lbl">State</span>
            {STATES.map((s) => (
              <button key={s} type="button" className={s === state ? "is-active" : ""} onClick={() => setState(s)}>
                {aiModalStateLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div
          className="ai-modal-backdrop is-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-h"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="ai-modal" role="document">
            <header className="ai-modal-head">
              <h3 id="ai-h">
                <span className="sparkle" aria-hidden>✨</span> AI suggestions for{" "}
                <span className="target-name">{ctx.label}</span>
              </h3>
              <button className="iconbtn" type="button" aria-label="Close" onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            {state !== "out" && <div className="cost-strip-wrap"><CostStrip tier={tier} /></div>}

            <div className="ai-modal-body">
              <div className="ctx-strip">
                <svg className="ctx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div className="ctx-text">
                  {ctx.contextLabel} <b>{ctx.basedOn}</b> — <code>{ctx.contextCode}</code>
                </div>
              </div>

              <div className="refine">
                <label htmlFor="ai-refine">
                  Add context for AI <span className="opt">— optional</span>
                </label>
                <textarea
                  id="ai-refine"
                  value={refine}
                  onChange={(e) => setRefine(e.target.value)}
                  placeholder="e.g. 'punchy and short', 'more professional', 'mention the release date'"
                />
              </div>

              {body}
            </div>

            <div className="ai-modal-foot">
              <div className="left">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={mock("fetch fresh suggestions (uses 1 of your daily limit)")}
                  title="Costs 1 from your daily limit. Different suggestions next time."
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Refresh<span className="refresh-cost"> (uses 1 daily)</span>
                </button>
              </div>
              <div className="right">
                <button className="btn-ghost" type="button" onClick={close}>Cancel</button>
                <button
                  className="btn-primary"
                  type="button"
                  disabled={useDisabled}
                  onClick={() => {
                    if (useDisabled) return;
                    mock(`apply "${ctx.suggestions[selected]?.copy ?? ""}" to ${ctx.label}`)();
                    close();
                  }}
                >
                  Use this
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
