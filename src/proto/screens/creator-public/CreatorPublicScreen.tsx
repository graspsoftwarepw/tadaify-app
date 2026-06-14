/**
 * Public creator page — what visitors see at tadaify.com/<handle>. Faithful
 * port of mockups/tadaify-mvp/creator-public.html. Presentational only; data
 * from typed fixtures. The creator's own (light) theme is what visitors see;
 * the top-strip toggle is a mockup-only aid for reviewing both palettes.
 *
 * @implements fr-public-creator-page
 */
import "./creator-public-proto.css";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import {
  countdownFixture,
  publicProfileFixture,
} from "./creatorPublicFixture";

function CountdownCell({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="countdown-cell">
      <div className="countdown-num">{value}</div>
      <div className="countdown-unit">{unit}</div>
    </div>
  );
}

export function CreatorPublicScreen() {
  const p = publicProfileFixture();
  const cd = countdownFixture();

  return (
    <div className="proto-root proto-public">
      {/* Mockup-only top strip */}
      <div className="public-topstrip">
        <a href="/__proto" className="text-muted">← back to prototype hub</a>
        <span className="flex items-center gap-3">
          <span className="url">tadaify.com/{p.handle}</span>
          <ThemeToggle />
        </span>
      </div>

      <div className="creator-shell">
        {/* LEFT: identity */}
        <aside className="identity">
          <div className="avatar">{p.initials}</div>
          <h1 className="name">{p.name}</h1>
          <p className="bio">
            {p.bioLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < p.bioLines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="socials">
            {p.socials.map((s) => (
              <a key={s.label} href="#" className="social" title={s.label} aria-label={s.label}>
                {s.glyph}
              </a>
            ))}
          </div>
          {p.verified && (
            <div className="pill pill-success" style={{ marginTop: 18 }}>✓ verified creator</div>
          )}
        </aside>

        {/* RIGHT: block stack */}
        <section className="blocks">
          {/* Hero product */}
          <a href="#" className="cb cb-hero">
            <span className="pill pill-warm" style={{ marginBottom: 12 }}>🔥 50% OFF · ends Friday</span>
            <div className="cb-row">
              <div>
                <div className="cb-title" style={{ fontSize: 22, fontFamily: "var(--font-display)" }}>Ultimate Fitness Course</div>
                <div className="cb-sub">12 weeks · 60 video lessons · lifetime access · private Discord</div>
              </div>
              <div className="cb-price"><span className="strike">$197</span>$127</div>
            </div>
            <span className="cb-cta">Get it now →</span>
          </a>

          {/* Coaching */}
          <a href="#" className="cb">
            <div className="cb-row">
              <div>
                <div className="cb-title">1:1 Coaching Session</div>
                <div className="cb-sub">60-minute zoom · program review · custom macro plan</div>
              </div>
              <div className="cb-price">$49</div>
            </div>
          </a>

          {/* Lead magnet */}
          <a href="#" className="cb">
            <div className="cb-row">
              <div>
                <div className="cb-title">Free guide: 10 Morning Habits of High-Energy Women</div>
                <div className="cb-sub">24-page PDF — we email it instantly</div>
              </div>
              <span className="cb-free-pill">FREE</span>
            </div>
          </a>

          {/* IG embed preview */}
          <a href="#" className="cb">
            <div className="cb-row">
              <div>
                <div className="cb-title">📸 Latest on Instagram</div>
                <div className="cb-sub">@alexandrasilva_fit · 50k followers · see the last 6 posts</div>
              </div>
              <span className="cb-cta cb-cta-soft">Open →</span>
            </div>
          </a>

          {/* Countdown */}
          <div className="cb cb-countdown">
            <div className="countdown-head">
              <div>
                <div className="countdown-label">Next live in</div>
                <div className="countdown-sub">Album drop on Friday at 19:00 UTC · the timer updates every second in the browser.</div>
              </div>
              <div className="countdown-icon" aria-hidden>🔥</div>
            </div>
            <div className="countdown-grid" aria-label="Countdown to the next live event">
              <CountdownCell value={cd.d} unit="days" />
              <CountdownCell value={cd.h} unit="hours" />
              <CountdownCell value={cd.m} unit="mins" />
              <CountdownCell value={cd.s} unit="secs" />
            </div>
            <a href="#" className="countdown-link">Learn more →</a>
            <div className="countdown-note">Auto-hide is on by default. When the target passes, the block disappears on the next page load.</div>
          </div>

          {/* Affiliate */}
          <div className="cb-section-heading">Things I use (affiliate)</div>
          <a href="#" className="cb-affiliate">
            <div className="thumb t1">P</div>
            <div className="body">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Peloton Bike+</div>
              <div className="text-muted" style={{ fontSize: 13 }}>My daily HIIT setup · <span className="aff-badge">ad</span></div>
            </div>
            <span className="text-muted">→</span>
          </a>
          <a href="#" className="cb-affiliate">
            <div className="thumb t2">G</div>
            <div className="body">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Gymshark — Alexandra's picks</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Leggings + sports bra I wear in all reels · <span className="aff-badge">ad</span></div>
            </div>
            <span className="text-muted">→</span>
          </a>

          {/* Podcast */}
          <a href="#" className="cb cb-podcast">
            <div className="cb-row">
              <div>
                <div className="cb-title" style={{ color: "#FFF" }}>🎙 My podcast: Strong Not Skinny</div>
                <div className="cb-sub" style={{ color: "rgba(255,255,255,0.75)" }}>Weekly episodes on Spotify, Apple, YouTube</div>
              </div>
              <span className="cb-cta" style={{ background: "rgba(255,255,255,0.18)" }}>Listen →</span>
            </div>
          </a>

          {/* Powered-by (free tier only) */}
          <div className="powered">
            Powered by <Wordmark size="sm" /> — <a href="/__proto">get yours free →</a>
          </div>
        </section>
      </div>
    </div>
  );
}
