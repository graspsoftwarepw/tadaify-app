/**
 * Error pages prototype — faithful port of mockups/tadaify-mvp/error-pages.html.
 *
 * The mockup is a showcase of 10 distinct error / edge-case states (404 handle
 * not found, handle released, 500, maintenance, offline, 403, subscription
 * expired, account suspended, 429, block deleted) flipped through a bottom-right
 * toolbar + ?state=N deep link. That switcher is the mockup's own demonstration
 * of separate states — NOT competing design variants of one screen — so it is
 * preserved here as a clearly-labelled in-page state switcher backed by local
 * useState. Copy is verbatim from the mockup; data comes from a typed fixture.
 *
 * Presentational + local React state only. Mock actions alert; the single
 * "go home" action per state points at /__proto/landing.
 *
 * @implements fr-error-pages
 */
import { useEffect, useState } from "react";
import { Wordmark } from "../../lib/Wordmark";
import { ThemeToggle } from "../../lib/ThemeToggle";
import {
  errorPagesFixture,
  type ErrorAction,
  type ErrorStateFixture,
} from "./errorPagesFixture";
import "./error-pages-proto.css";

const HOME_HREF = "/__proto/landing";

function mock(label: string) {
  window.alert(`${label} (prototype)`);
}

function variantClass(v: ErrorAction["variant"]): string {
  return `btn btn-${v}`;
}

/** Decorative illustrations — straight ports of the mockup's inline SVGs. */
function Illustration({ kind }: { kind: ErrorStateFixture["illustration"] }) {
  const common = { viewBox: "0 0 200 200", fill: "none" } as const;
  switch (kind) {
    case "plane":
      return (
        <svg {...common}>
          <ellipse cx="60" cy="150" rx="42" ry="6" fill="#E5E7EB" />
          <ellipse cx="140" cy="156" rx="36" ry="5" fill="#E5E7EB" opacity=".7" />
          <path d="M30 60 Q40 40 70 50 Q90 30 120 50 Q150 40 170 70 Q170 90 140 90 L60 90 Q30 90 30 60Z" fill="#EDE9FE" />
          <path d="M40 110 Q60 95 90 105 Q110 90 140 105 Q165 100 170 120 Q165 135 140 135 L60 135 Q35 135 40 110Z" fill="#FEF3C7" />
          <g transform="translate(78 60) rotate(-12)">
            <path d="M0 30 L70 0 L60 70 L40 50 L0 30Z" fill="#6366F1" />
            <path d="M40 50 L60 70 L48 42 Z" fill="#4338CA" />
            <path d="M0 30 L40 50 L60 14 Z" fill="#818CF8" />
          </g>
          <circle cx="170" cy="40" r="2.5" fill="#F59E0B" />
          <circle cx="20" cy="90" r="2" fill="#8B5CF6" />
          <circle cx="180" cy="120" r="2" fill="#6366F1" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="60" ry="6" fill="#FDE68A" opacity=".6" />
          <g transform="translate(40 40) rotate(-12)">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#F59E0B" strokeWidth="6" />
            <circle cx="40" cy="40" r="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
            <rect x="72" y="36" width="80" height="10" rx="3" fill="#F59E0B" />
            <rect x="138" y="32" width="8" height="18" rx="2" fill="#F59E0B" />
            <rect x="124" y="32" width="6" height="14" rx="2" fill="#F59E0B" />
          </g>
          <g transform="translate(140 90) rotate(15)">
            <rect x="0" y="0" width="42" height="32" rx="4" fill="#6366F1" />
            <line x1="6" y1="10" x2="36" y2="10" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
            <line x1="6" y1="18" x2="28" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".5" />
          </g>
          <circle cx="30" cy="120" r="3" fill="#8B5CF6" />
          <circle cx="170" cy="60" r="2" fill="#F59E0B" />
        </svg>
      );
    case "cable":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="62" ry="6" fill="#FEE2E2" opacity=".7" />
          <g stroke="#EF4444" strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M30 90 Q56 60 80 90 Q100 110 90 130" />
            <path d="M170 90 Q144 60 120 90 Q100 110 110 130" />
          </g>
          <g transform="translate(78 76)">
            <rect x="0" y="0" width="20" height="36" rx="4" fill="#6366F1" />
            <rect x="2" y="6" width="6" height="4" rx="1" fill="#fff" opacity=".7" />
            <rect x="12" y="6" width="6" height="4" rx="1" fill="#fff" opacity=".7" />
            <rect x="2" y="14" width="6" height="4" rx="1" fill="#fff" opacity=".4" />
            <rect x="12" y="14" width="6" height="4" rx="1" fill="#fff" opacity=".4" />
          </g>
          <g transform="translate(102 76)">
            <rect x="0" y="0" width="20" height="36" rx="4" fill="#F59E0B" />
            <circle cx="10" cy="14" r="3" fill="#fff" opacity=".8" />
            <rect x="6" y="22" width="8" height="3" rx="1" fill="#fff" opacity=".5" />
          </g>
          <path d="M96 60 L100 40 L104 60 L108 50" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "toolbox":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="68" ry="6" fill="#FDE68A" opacity=".6" />
          <rect x="40" y="80" width="120" height="70" rx="8" fill="#F59E0B" />
          <rect x="40" y="100" width="120" height="50" rx="0" fill="#D97706" />
          <rect x="84" y="64" width="32" height="22" rx="3" fill="#92400E" />
          <rect x="92" y="56" width="16" height="10" rx="2" fill="#92400E" />
          <rect x="58" y="118" width="24" height="14" rx="2" fill="#FEF3C7" />
          <rect x="118" y="118" width="24" height="14" rx="2" fill="#FEF3C7" />
          <g transform="translate(140 36)">
            <circle cx="14" cy="14" r="14" fill="#6366F1" />
            <circle cx="14" cy="14" r="5" fill="#FFFFFF" />
            <g fill="#6366F1">
              <rect x="12" y="0" width="4" height="6" rx="1" />
              <rect x="12" y="22" width="4" height="6" rx="1" />
              <rect x="0" y="12" width="6" height="4" rx="1" />
              <rect x="22" y="12" width="6" height="4" rx="1" />
            </g>
          </g>
        </svg>
      );
    case "wifi":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="56" ry="6" fill="#E5E7EB" opacity=".7" />
          <g stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M40 100 Q100 50 160 100" />
            <path d="M58 118 Q100 80 142 118" />
            <path d="M76 136 Q100 116 124 136" />
          </g>
          <circle cx="100" cy="150" r="6" fill="#9CA3AF" />
          <line x1="40" y1="50" x2="160" y2="160" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
          <line x1="40" y1="50" x2="160" y2="160" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="58" ry="6" fill="#FEE2E2" opacity=".7" />
          <path d="M100 30 L150 50 V100 Q150 140 100 160 Q50 140 50 100 V50 Z" fill="#EF4444" />
          <path d="M100 30 L150 50 V100 Q150 140 100 160 Q50 140 50 100 V50 Z" fill="none" stroke="#991B1B" strokeWidth="3" />
          <rect x="80" y="86" width="40" height="36" rx="4" fill="#fff" />
          <path d="M88 86 V74 Q88 64 100 64 Q112 64 112 74 V86" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="104" r="4" fill="#EF4444" />
          <rect x="98" y="104" width="4" height="10" fill="#EF4444" />
        </svg>
      );
    case "sleep":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="60" ry="6" fill="#E5E7EB" opacity=".7" />
          <rect x="40" y="60" width="120" height="100" rx="14" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
          <path d="M50 90 Q70 80 90 90 Q110 100 130 90 Q150 80 160 90 V160 Q40 160 40 160 V90 Q40 80 50 90Z" fill="#E5E7EB" />
          <g transform="translate(80 100)">
            <ellipse cx="20" cy="22" rx="22" ry="14" fill="#9CA3AF" />
            <path d="M2 18 L0 8 L8 14 Z" fill="#9CA3AF" />
            <path d="M38 18 L40 8 L32 14 Z" fill="#9CA3AF" />
            <circle cx="14" cy="22" r="1.5" fill="#374151" />
            <circle cx="26" cy="22" r="1.5" fill="#374151" />
            <path d="M16 26 Q20 28 24 26" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
          <text x="142" y="78" fontFamily="Crimson Pro, serif" fontSize="14" fill="#9CA3AF">z</text>
          <text x="150" y="68" fontFamily="Crimson Pro, serif" fontSize="18" fill="#9CA3AF">z</text>
          <text x="160" y="56" fontFamily="Crimson Pro, serif" fontSize="22" fill="#9CA3AF">z</text>
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="56" ry="6" fill="#FEE2E2" opacity=".7" />
          <circle cx="100" cy="100" r="64" fill="#FEE2E2" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#EF4444" strokeWidth="4" />
          <rect x="80" y="70" width="14" height="60" rx="3" fill="#EF4444" />
          <rect x="106" y="70" width="14" height="60" rx="3" fill="#EF4444" />
        </svg>
      );
    case "hourglass":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="172" rx="48" ry="6" fill="#FDE68A" opacity=".6" />
          <rect x="62" y="38" width="76" height="10" rx="2" fill="#92400E" />
          <rect x="62" y="152" width="76" height="10" rx="2" fill="#92400E" />
          <path d="M70 48 L130 48 L130 70 Q130 90 100 100 Q70 90 70 70 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
          <path d="M70 152 L130 152 L130 130 Q130 110 100 100 Q70 110 70 130 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
          <path d="M78 56 L122 56 L122 68 Q122 80 100 88 Q78 80 78 68 Z" fill="#F59E0B" />
          <path d="M84 152 L116 152 L116 134 Q116 122 100 116 Q84 122 84 134 Z" fill="#F59E0B" />
          <line x1="100" y1="98" x2="100" y2="120" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="120" r="2.5" fill="#F59E0B" />
        </svg>
      );
    case "brokenlink":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="60" ry="6" fill="#E5E7EB" opacity=".7" />
          <g stroke="#6366F1" strokeWidth="10" strokeLinecap="round" fill="none">
            <path d="M58 70 Q40 70 40 90 Q40 108 56 110" />
            <path d="M142 130 Q160 130 160 110 Q160 92 144 90" />
          </g>
          <line x1="60" y1="100" x2="80" y2="100" stroke="#6366F1" strokeWidth="10" strokeLinecap="round" />
          <line x1="120" y1="100" x2="140" y2="100" stroke="#6366F1" strokeWidth="10" strokeLinecap="round" />
          <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round">
            <line x1="86" y1="92" x2="98" y2="80" />
            <line x1="92" y1="100" x2="108" y2="100" />
            <line x1="86" y1="108" x2="98" y2="120" />
          </g>
        </svg>
      );
  }
}

function ActionButton({ action }: { action: ErrorAction }) {
  if (action.kind === "home") {
    return (
      <a href={HOME_HREF} className={variantClass(action.variant)}>
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" className={variantClass(action.variant)} onClick={() => mock(action.label)}>
      {action.label}
    </button>
  );
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function StateView({ s }: { s: ErrorStateFixture }) {
  // State 4 maintenance countdown ticker.
  const [countdown, setCountdown] = useState(s.countdown);
  // State 9 retry-after ticker.
  const [retry, setRetry] = useState(s.retryPill);

  useEffect(() => {
    if (!s.countdown) return;
    const end =
      Date.now() +
      (parseInt(s.countdown.hours, 10) * 3600 +
        parseInt(s.countdown.minutes, 10) * 60 +
        parseInt(s.countdown.seconds, 10)) *
        1000;
    const id = setInterval(() => {
      const diff = Math.max(0, end - Date.now());
      const total = Math.floor(diff / 1000);
      setCountdown({
        hours: pad(Math.floor(total / 3600)),
        minutes: pad(Math.floor((total % 3600) / 60)),
        seconds: pad(total % 60),
      });
    }, 1000);
    return () => clearInterval(id);
  }, [s.countdown]);

  useEffect(() => {
    if (!s.retryPill) return;
    let end = Date.now() + 42 * 1000;
    const id = setInterval(() => {
      const total = Math.floor(Math.max(0, end - Date.now()) / 1000);
      if (total === 0) {
        setRetry("now");
        end = Date.now() + 42 * 1000;
      } else {
        setRetry(`${pad(Math.floor(total / 60))}:${pad(total % 60)}`);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [s.retryPill]);

  return (
    <div className={`errp-wrap tone-${s.wrapTone}`}>
      <div className={`errp-card${s.isWide ? " is-wide" : ""}`}>
        <div className="errp-illustration" aria-hidden="true">
          <Illustration kind={s.illustration} />
        </div>

        <div className={`errp-eyebrow ${s.eyebrowTone === "neutral" ? "" : s.eyebrowTone}`.trim()}>
          {s.eyebrow}
        </div>
        <h1>{s.heading}</h1>
        <p className="errp-lead">
          {s.lead.map((seg, i) =>
            seg.mono ? (
              <span key={i} className="errp-mono">
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>

        {s.search && (
          <form className="errp-search" onSubmit={(e) => e.preventDefault()}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--fg-subtle)" }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder={s.search.placeholder} aria-label={s.search.placeholder} />
            <button type="submit" className="btn btn-primary btn-sm" onClick={() => mock(s.search!.button)}>
              {s.search.button}
            </button>
          </form>
        )}

        {s.suggestions && (
          <div className="errp-suggestions" aria-label={s.search?.suggestionsLabel}>
            {s.suggestions.map((sg) => (
              <button
                type="button"
                key={sg.handle}
                className="errp-suggestion"
                onClick={() => mock(`Open ${sg.handle}`)}
              >
                <span className="sg-av" style={sg.avatarGradient ? { background: sg.avatarGradient } : undefined}>
                  {sg.initial}
                </span>
                <span className="sg-tx">
                  <span className="sg-name">{sg.name}</span>
                  <span className="sg-handle">{sg.handle}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {s.statusRow && (
          <div className={`errp-status-row is-${s.statusRow.tone}`} role="status">
            <span className="dot" aria-hidden="true" />
            <span>
              {s.statusRow.segments.map((seg, i) =>
                seg.href ? (
                  <button key={i} type="button" className="errp-link" onClick={() => mock(seg.text)}>
                    {seg.text}
                  </button>
                ) : seg.bold ? (
                  <b key={i} style={{ color: "var(--fg)" }}>
                    {seg.text}
                  </b>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </span>
          </div>
        )}

        {countdown && (
          <div className="errp-countdown" aria-label="Time until estimated end">
            <div className="cd-cell">
              <div className="cd-num">{countdown.hours}</div>
              <div className="cd-lbl">Hours</div>
            </div>
            <div className="cd-cell">
              <div className="cd-num">{countdown.minutes}</div>
              <div className="cd-lbl">Minutes</div>
            </div>
            <div className="cd-cell">
              <div className="cd-num">{countdown.seconds}</div>
              <div className="cd-lbl">Seconds</div>
            </div>
          </div>
        )}

        {s.progress && (
          <div className="errp-progress" aria-label="Service restoration progress">
            <span />
          </div>
        )}

        {s.estimatedEnd && (
          <p className="errp-help is-flush">
            {s.estimatedEnd.map((seg, i) =>
              seg.bold ? (
                <b key={i} style={{ color: "var(--fg)" }}>
                  {seg.text}
                </b>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        )}

        {s.cacheList && (
          <div className="errp-cache-list">
            {s.cacheList.items.map((item) => (
              <div className="errp-cache-item" key={item.name}>
                <svg
                  className="cache-tick"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="cache-name">{item.name}</span>
                <span className="cache-meta">{item.meta}</span>
              </div>
            ))}
          </div>
        )}

        {s.userline && (
          <div className="errp-userline">
            <span className="uav">{s.userline.initial}</span>
            Logged in as <b>{s.userline.email}</b>
          </div>
        )}

        {s.appeal && (
          <div className="errp-appeal">
            <div>
              <b>{s.appeal.reason}</b> <span className="reason-tag">{s.appeal.reasonTag}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <b>Reviewer notes:</b> {s.appeal.notes}
            </div>
            <div style={{ marginTop: 8 }}>
              <b>{s.appeal.referenceLabel}</b> <span className="errp-mono">{s.appeal.reference}</span>
            </div>
          </div>
        )}

        {retry && (
          <div className="errp-retry-pill" role="status">
            <span className="ring" aria-hidden="true" />
            Retry in <b>{retry}</b>
          </div>
        )}

        <div className="errp-actions">
          {s.actions.map((a) => (
            <ActionButton key={a.label} action={a} />
          ))}
        </div>

        {s.proHint && (
          <div className="errp-pro-hint">
            <span className="pill pill-pro">Pro</span>
            <div>
              {s.proHint.map((seg, i) =>
                seg.link ? (
                  <button key={i} type="button" className="errp-link" onClick={() => mock(seg.text)}>
                    {seg.text}
                  </button>
                ) : seg.br ? (
                  <br key={i} />
                ) : seg.bold ? (
                  <b key={i}>{seg.text}</b>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </div>
          </div>
        )}

        {s.secondaryHelp && (
          <p className="errp-help">
            {s.secondaryHelp.map((seg, i) =>
              seg.br ? (
                <br key={i} />
              ) : seg.link ? (
                <button key={i} type="button" className="errp-link" onClick={() => mock(seg.text)}>
                  {seg.text}
                </button>
              ) : seg.mono ? (
                <span key={i} className="errp-mono">
                  {seg.text}
                </span>
              ) : seg.strong ? (
                <strong key={i}>{seg.text}</strong>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        )}

        {s.details && (
          <details className="errp-details">
            <summary>
              {s.details.summaryPrefix}
              <code>{s.details.requestId}</code>
              {s.details.summarySuffix}
            </summary>
            <pre>{s.details.trace}</pre>
          </details>
        )}
      </div>
    </div>
  );
}

export function ErrorPagesScreen() {
  const states = errorPagesFixture();
  const [active, setActive] = useState(states[0].state);
  const current = states.find((s) => s.state === active) ?? states[0];

  return (
    <div className="errp-root">
      <div className="errp-topbar">
        <Wordmark size="sm" />
        <div className="errp-topbar-controls">
          <span className="errp-state-tag">Error state</span>
          <select
            className="errp-state-select"
            aria-label="Select error state"
            value={active}
            onChange={(e) => setActive(Number(e.target.value))}
          >
            {states.map((s) => (
              <option key={s.state} value={s.state}>
                {s.switchLabel}
              </option>
            ))}
          </select>
          <ThemeToggle />
        </div>
      </div>
      <StateView key={current.state} s={current} />
    </div>
  );
}
