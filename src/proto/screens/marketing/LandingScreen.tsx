/**
 * LandingScreen — tadaify's marketing landing page, faithfully ported from
 * mockups/tadaify-mvp/landing.html (Indigo Serif v2, Phase A three-flagships).
 * Rendered inside the shared <MarketingChrome>. All copy is verbatim from the
 * mockup and lives in landingFixture.ts.
 *
 * The hero + final-CTA handle-claim forms reproduce the mockup's live
 * validation (debounced availability check, live URL preview). A valid claim
 * routes to the real /__proto/register flow; every other mock action is a
 * window.alert. No dead placeholder links.
 *
 * @implements fr-landing
 */
import { useMemo, useRef, useState } from "react";
import { MarketingChrome } from "./MarketingChrome";
import {
  CLAIM_RULES,
  api,
  creators,
  creatorsHead,
  faqHead,
  faqs,
  features,
  featuresHead,
  finalCta,
  freeTable,
  freeTableFoot,
  freeTableHead,
  generousFree,
  hero,
  philosophy,
  privacy,
  proof,
  wedges,
  wedgesHead,
} from "./landingFixture";
import "./landing-proto.css";

type ClaimState = "idle" | "ok" | "err";

function classify(raw: string): { state: ClaimState; msg: string } {
  if (!raw) return { state: "idle", msg: CLAIM_RULES.idleMsg };
  if (raw.length < 3) return { state: "err", msg: "Too short — at least 3 characters." };
  if (raw.length > 30) return { state: "err", msg: "Too long — 30 characters max." };
  if (raw.indexOf("--") !== -1) return { state: "err", msg: "Hmm — no double hyphens." };
  if (!CLAIM_RULES.re.test(raw))
    return { state: "err", msg: "Only lowercase letters, numbers, hyphens. No start/end dash." };
  if (CLAIM_RULES.reserved.indexOf(raw) !== -1)
    return { state: "err", msg: "That’s reserved for us. Try another." };
  if (CLAIM_RULES.taken.indexOf(raw) !== -1)
    return { state: "err", msg: "Taken — someone beat you to it." };
  return { state: "ok", msg: "Available! Tap claim to reserve tadaify.com/" + raw };
}

const STATUS_ICON: Record<ClaimState, string> = { ok: "✓", err: "✕", idle: "●" };

/** Hero / final-CTA handle-claim form with live preview + availability. */
function ClaimForm({
  variant,
  prefix,
  placeholder,
  buttonLabel,
  previewLabel,
  ariaLabel,
}: {
  variant: "hero" | "final";
  prefix: string;
  placeholder: string;
  buttonLabel: string;
  previewLabel: string;
  ariaLabel: string;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{ state: ClaimState; msg: string }>({
    state: "idle",
    msg: CLAIM_RULES.idleMsg,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handle = value || "yourname";
  const muted = value.length === 0;

  function onInput(next: string) {
    const raw = next.toLowerCase().trim();
    setValue(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (raw.length === 0) {
      setStatus({ state: "idle", msg: CLAIM_RULES.idleMsg });
      return;
    }
    const imm = classify(raw);
    if (imm.state === "err") {
      setStatus(imm);
      return;
    }
    setStatus({ state: "idle", msg: "Checking availability…" });
    debounceRef.current = setTimeout(() => setStatus(classify(raw)), 300);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = classify(value.toLowerCase().trim());
    if (res.state !== "ok") {
      setStatus({ state: "err", msg: res.msg || "Pick a valid handle first." });
      return;
    }
    setStatus({ state: "ok", msg: "Reserved! Taking you to signup…" });
    setTimeout(() => {
      window.location.href = `/__proto/register?handle=${encodeURIComponent(value)}`;
    }, 450);
  }

  return (
    <form className="claim-form" autoComplete="off" aria-label={ariaLabel} onSubmit={onSubmit}>
      <div className="claim-row">
        <span className="claim-prefix">{prefix}</span>
        <input
          type="text"
          className="claim-input"
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          aria-label="Your handle"
          maxLength={30}
          value={value}
          onChange={(e) => onInput(e.target.value)}
        />
        <button type="submit" className="claim-btn">
          {buttonLabel} <span className="arrow">→</span>
        </button>
      </div>

      <div className={`claim-status ${status.state === "idle" ? "" : status.state}`}>
        <span className="ico">{STATUS_ICON[status.state]}</span> {status.msg}
      </div>

      <div className="wm-preview-wrap" aria-live="polite">
        <span className="wm-preview-label">{previewLabel}</span>
        <span className={`wm-preview ${muted ? "muted" : ""}`}>
          <span className="ta">tadaify</span>
          <span className="slash">.</span>
          <span className="ify">com</span>
          <span className="slash">/</span>
          <span className="handle">{handle}</span>
        </span>
      </div>

      {variant === "hero" ? (
        <p className="trust-micro">
          <strong>{hero.trustNoCard}</strong>
          <span className="sep-dot" />
          <strong>{hero.trustNoTrial}</strong>
          <span className="sep-dot" />
          <span>{hero.trustRest}</span>
        </p>
      ) : null}
    </form>
  );
}

const FEATURE_ICON: Record<string, React.ReactNode> = {
  checkout: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 6h18M3 12h18M3 18h12" />
      <circle cx="18" cy="18" r="3" />
    </svg>
  ),
  domain: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  ),
  analytics: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 4 4 5-7" />
    </svg>
  ),
};
const FEATURE_ICO_CLASS: Record<string, string> = { checkout: "p", domain: "w", analytics: "c" };

export function LandingScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const creatorCards = useMemo(() => creators, []);

  const onMock = (label: string) => () => window.alert(`${label} (prototype)`);

  return (
    <MarketingChrome>
      {/* ── HERO ── */}
      <header className="ml-hero" id="hero-claim">
        <div className="mk-container ml-hero-inner">
          <div>
            <span className="eyebrow">
              <span className="dot" />
              {hero.eyebrow}
            </span>
            <h1>
              {hero.h1Lead}
              <em>{hero.h1Em}</em>.
            </h1>
            <p className="hero-sub">
              {hero.subLead}
              <strong>{hero.subStrong1}</strong>
              {hero.subMid}
              <strong>{hero.subStrong2}</strong>
              {hero.subTail}
            </p>
            <ClaimForm
              variant="hero"
              prefix={hero.claimPrefix}
              placeholder={hero.claimPlaceholder}
              buttonLabel={hero.claimButton}
              previewLabel={hero.previewLabel}
              ariaLabel="Claim your handle"
            />
          </div>

          <div className="ml-hero-right">
            <div className="preview-card" aria-hidden="true">
              <div className="preview-avatar" />
              <div className="preview-handle">{hero.card.handle}</div>
              <div className="preview-sub">{hero.card.sub}</div>
              {hero.card.links.map((l) => (
                <div className="preview-link" key={l.label}>
                  <span className={`ico ${l.icoClass}`}>{l.ico}</span>
                  <span>{l.label}</span>
                  <span className="price">{l.price}</span>
                </div>
              ))}
            </div>
            <div className="ml-hero-badges">
              {hero.card.badges.map((b) => (
                <span className="badge" key={b}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── SOCIAL PROOF ── */}
      <section className="proof">
        <div className="mk-container proof-inner">
          <div className="proof-avatars" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span className="proof-av" key={i} />
            ))}
          </div>
          <p className="proof-text">
            {proof.text} <strong>{proof.count}</strong> {proof.countTail}
          </p>
        </div>
      </section>

      {/* ── CREATOR SHOWCASE ── */}
      <section className="block alt">
        <div className="mk-container">
          <div className="section-head">
            <h2>
              {creatorsHead.lead}
              <em>{creatorsHead.em}</em>
            </h2>
            <p>{creatorsHead.sub}</p>
          </div>
          <div className="creators">
            {creatorCards.map((c) => (
              <a className="creator-card" href="/__proto/creator-public" key={c.handle}>
                <div className={`creator-av ${c.avatarClass}`} aria-hidden="true" />
                <h3 className="creator-name">{c.name}</h3>
                <div className="creator-niche">{c.niche}</div>
                <div className="creator-handle">{c.handle}</div>
                <span className="go">See page →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVERYTHING ON FREE ── */}
      <section className="block">
        <div className="mk-container">
          <div className="section-head">
            <h2>
              {freeTableHead.lead}
              <em>{freeTableHead.em}</em>
            </h2>
            <p>{freeTableHead.sub}</p>
          </div>
          <div className="compare-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">On Free — included</th>
                  <th scope="col">tadaify Free · $0</th>
                </tr>
              </thead>
              <tbody>
                {freeTable.map((r) => (
                  <tr key={r.feature}>
                    <td className="feat">{r.feature}</td>
                    <td className="lt">{r.detail}</td>
                    <td className="td-us">{r.usStrong ? <strong>{r.us}</strong> : r.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="compare-foot">{freeTableFoot}</div>
          </div>
        </div>
      </section>

      {/* ── 3-FEATURE BAND ── */}
      <section className="block alt">
        <div className="mk-container">
          <div className="section-head">
            <h2>
              {featuresHead.lead}
              <em className="warm">{featuresHead.em}</em>
            </h2>
            <p>{featuresHead.sub}</p>
          </div>
          <div className="feats">
            {features.map((f) => (
              <div className="feat-card" key={f.title}>
                <div className={`feat-ico ${FEATURE_ICO_CLASS[f.icon]}`}>{FEATURE_ICON[f.icon]}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #1 — PRIVACY ── */}
      <section className="block alt" aria-labelledby="privacy-heading">
        <div className="mk-container">
          <div className="section-head">
            <span className="flagship-pill">{privacy.flagship}</span>
            <h2 id="privacy-heading">
              {privacy.h2Lead}
              <em>{privacy.h2Em}</em>
            </h2>
            <p>{privacy.sub}</p>
          </div>
          <div className="badge-row">
            {privacy.badges.map((b) => (
              <span className="info-badge" key={b}>
                {b}
              </span>
            ))}
          </div>
          <div className="pillar-card">
            <p className="lead-para">
              <strong>{privacy.para1Strong}</strong>
              {privacy.para1Tail}
            </p>
            <p className="muted-para">{privacy.para2}</p>
            <p className="muted-para">
              <strong>{privacy.para3Strong}</strong>
              {privacy.para3Tail}
            </p>
            <details
              className="pillar-details"
              open={privacyOpen}
              onToggle={(e) => setPrivacyOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                {privacy.detailsSummary}
              </summary>
              <div className="pillar-details-body">
                <p>{privacy.detailsP1}</p>
                <p>
                  {privacy.detailsP2}{" "}
                  <a href="/__proto/pricing">See plans →</a>
                </p>
              </div>
            </details>
          </div>
          <div className="pillar-table-wrap">
            <div className="compare-wrap">
              <table className="compare-table small">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Cookie banner required?</th>
                    <th scope="col">Tracking method</th>
                  </tr>
                </thead>
                <tbody>
                  {privacy.rows.map((r) => (
                    <tr key={r.platform}>
                      <td className={`feat ${r.us ? "us-label" : ""}`}>{r.platform}</td>
                      <td className={r.us ? "td-us" : "neg"}>
                        {r.us ? <span className="ok-strong">{r.banner}</span> : r.banner}
                      </td>
                      <td className={r.us ? "us-method" : "lt"}>{r.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="compare-foot">{privacy.foot}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #2 — CREATOR API ── */}
      <section className="block" aria-labelledby="api-heading">
        <div className="mk-container">
          <div className="section-head">
            <span className="flagship-pill">{api.flagship}</span>
            <h2 id="api-heading">
              {api.h2Lead}
              <em>{api.h2Em}</em>
            </h2>
            <p>{api.sub}</p>
          </div>
          <div className="badge-row">
            {api.badges.map((b) => (
              <span className="info-badge" key={b}>
                {b}
              </span>
            ))}
          </div>
          <div className="pillar-grid">
            <div className="code-tile">
              <div className="code-bar">
                <span className="dot r" />
                <span className="dot y" />
                <span className="dot g" />
                <span className="code-title">{api.codeTitle}</span>
              </div>
              <div className="code-body">
                <pre>
                  <code>{api.code}</code>
                </pre>
              </div>
            </div>
            <div className="pillar-card">
              <h3 className="pillar-h3">{api.useCasesTitle}</h3>
              <ul className="use-cases">
                {api.useCases.map((u) => (
                  <li key={u.strong}>
                    <span className="uc-emoji">{u.emoji}</span>
                    <div>
                      <strong>{u.strong}</strong>
                      {u.tail}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pillar-cta">
                <a href="/__proto/pricing" className="btn btn-primary">
                  {api.cta}
                </a>
              </div>
            </div>
          </div>
          <div className="pillar-table-wrap">
            <div className="compare-wrap">
              <table className="compare-table small">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Public API access</th>
                    <th scope="col">On which tier?</th>
                  </tr>
                </thead>
                <tbody>
                  {api.rows.map((r) => (
                    <tr key={r.platform}>
                      <td className={`feat ${r.us ? "us-label" : ""}`}>{r.platform}</td>
                      <td className={r.us ? "td-us" : "neg"}>
                        {r.us ? <span className="ok-strong">{r.access}</span> : r.access}
                      </td>
                      <td className={r.us ? "us-method" : "lt"}>{r.tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="compare-foot">{api.foot}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #3 — GENEROUS FREE ── */}
      <section className="block alt" aria-labelledby="free-heading">
        <div className="mk-container">
          <div className="section-head">
            <span className="flagship-pill warm">{generousFree.flagship}</span>
            <h2 id="free-heading">
              {generousFree.h2Lead}
              <em className="warm">{generousFree.h2Em}</em>
            </h2>
            <p>{generousFree.sub}</p>
          </div>
          <div className="free-trust">
            <span className="free-trust-badge">{generousFree.trustBadge}</span>
          </div>
          <div className="pillar-table-wrap">
            <div className="compare-wrap">
              <table className="compare-table small">
                <thead>
                  <tr>
                    <th scope="col">Platform Free tier</th>
                    <th scope="col">Analytics included</th>
                    <th scope="col">Cross-tab?</th>
                    <th scope="col">Geo + City?</th>
                    <th scope="col">Devices + Referrers?</th>
                  </tr>
                </thead>
                <tbody>
                  {generousFree.rows.map((r) => (
                    <tr key={r.platform} className={r.us ? "us-row" : ""}>
                      <td className={`feat ${r.us ? "us-label" : ""}`}>{r.platform}</td>
                      <td className={r.us ? "td-us" : "lt"}>
                        {r.us ? <strong>{r.analytics}</strong> : r.analytics}
                      </td>
                      <td className={r.us ? "ok-cell" : "neg"}>{r.crossTab}</td>
                      <td className={r.us ? "ok-cell" : r.geo === "✗" ? "neg" : "lt"}>{r.geo}</td>
                      <td className={r.us ? "ok-cell" : "neg"}>{r.devices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="compare-foot">
                {generousFree.foot1}
                <br />
                <small>{generousFree.foot2}</small>
              </div>
            </div>
          </div>
          <div className="upgrades-card">
            <h3 className="pillar-h3">{generousFree.upgradesTitle}</h3>
            <p className="muted-para">{generousFree.upgradesSub}</p>
            <div className="upgrade-tiles">
              {generousFree.tiles.map((t) => (
                <div className={`upgrade-tile accent-${t.accent}`} key={t.tier}>
                  <div className="ut-tier">{t.tier}</div>
                  <div className="ut-refresh">{t.refresh}</div>
                  <div className="ut-window">{t.window}</div>
                </div>
              ))}
            </div>
            <div className="pillar-cta center">
              <a href="/__proto/pricing" className="btn btn-primary">
                {generousFree.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE — WEDGES ── */}
      <section className="block">
        <div className="mk-container">
          <div className="section-head">
            <h2>
              {wedgesHead.lead}
              <em>{wedgesHead.em}</em>
            </h2>
            <p>{wedgesHead.sub}</p>
          </div>
          <div className="wedges">
            {wedges.map((w) => (
              <div className="wedge" key={w.num}>
                <div className="wedge-num">{w.num}</div>
                <h3>
                  {w.title}
                  {w.titleEm ? <em>{w.titleEm}</em> : null}
                </h3>
                <p>{w.body}</p>
                <div className="wedge-compare">
                  <span className="bad">{w.bad}</span>
                  <span className="arr">→</span>
                  <span className="good">{w.good}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPSELL PHILOSOPHY ── */}
      <section className="block alt">
        <div className="mk-container">
          <div className="philosophy">
            <h3>
              {philosophy.hLead}
              <em>{philosophy.hEm}</em>
            </h3>
            <p>
              {philosophy.body1}
              <span className="tip-pill">{philosophy.tip}</span>
              {philosophy.body2}
            </p>
            <button type="button" className="philosophy-link" onClick={onMock("Subtle-upsell philosophy")}>
              {philosophy.link}
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="block">
        <div className="mk-container">
          <div className="section-head">
            <h2>
              {faqHead.lead}
              <em>{faqHead.em}</em>
            </h2>
            <p>{faqHead.sub}</p>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <details
                className="faq"
                key={f.q}
                open={openFaq === i}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) setOpenFaq(i);
                  else if (openFaq === i) setOpenFaq(null);
                }}
              >
                <summary>
                  {f.q} <span className="plus" aria-hidden="true">+</span>
                </summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta">
        <div className="mk-container inner">
          <h2>{finalCta.h2}</h2>
          <p>{finalCta.sub}</p>
          <ClaimForm
            variant="final"
            prefix={finalCta.claimPrefix}
            placeholder={finalCta.claimPlaceholder}
            buttonLabel={finalCta.claimButton}
            previewLabel={finalCta.previewLabel}
            ariaLabel="Claim your handle (final CTA)"
          />
          <p className="tiny">
            <strong>{finalCta.tinyCount}</strong>
            {finalCta.tinyTail}
          </p>
        </div>
      </section>
    </MarketingChrome>
  );
}
