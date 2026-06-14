/**
 * Public About page — what a visitor sees at tadaify.com/<handle>/about.
 * Faithful port of mockups/tadaify-mvp/creator-about-public.html.
 * Presentational + local React state only; data from typed fixtures. The
 * top-strip theme toggle is a mockup-only aid for reviewing both palettes.
 *
 * @implements fr-creator-about-public
 */
import { useEffect, useRef, useState } from "react";
import "./creator-about-public-proto.css";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import { aboutContentFixture } from "./creatorAboutPublicFixture";

export function CreatorAboutPublicScreen() {
  const c = aboutContentFixture();
  const [slide, setSlide] = useState(0);
  const slideCount = c.press.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const start = () => {
    stop();
    if (reducedMotion) return;
    timerRef.current = setInterval(
      () => setSlide((i) => (i + 1) % slideCount),
      7000,
    );
  };

  // Auto-advance every 7s; cleaned up on unmount.
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="proto-root proto-about-public">
      {/* Mockup-only top strip */}
      <div className="public-topstrip">
        <a href="/__proto" className="text-muted">← back to prototype hub</a>
        <span className="flex items-center gap-3">
          <span className="url">tadaify.com/{c.hero.handle.replace("@", "")}/about</span>
          <ThemeToggle />
        </span>
      </div>

      {/* Canonical creator home nav (inherited chrome) */}
      <nav className="creator-nav">
        <a href="/__proto/creator-public" className="cn-handle">
          <span className="av" aria-hidden="true">{c.hero.initial}</span>
          {c.hero.name}
        </a>
        <div className="cn-links">
          {c.nav.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={link.current ? "is-current" : undefined}
              aria-current={link.current ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section className="about-hero fade-up delay-1" aria-labelledby="hero-name">
        <div className="hero-photo" aria-hidden="true">{c.hero.initial}</div>
        <div className="hero-text">
          <h1 id="hero-name">{c.hero.name}</h1>
          <p className="tagline">{c.hero.tagline}</p>
          <div className="social-proof">
            <b>{c.hero.handle}</b>
            <span className="sp-dot" />
            <span><b>{c.hero.followers}</b> followers</span>
            <span className="sp-dot" />
            <span>since <b>{c.hero.since}</b></span>
          </div>
        </div>
      </section>

      <hr className="pub-divider" />

      {/* Bio */}
      <section className="about-section bio-section fade-up delay-2" aria-labelledby="bio-h">
        <h2 id="bio-h">{c.bioHeading}</h2>
        <div className="bio-text">
          {c.bioParagraphs.map((p, i) => (
            <p key={i}>
              {p.text}
              {p.em && <em>{p.em}</em>}
            </p>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights-public fade-up delay-3" aria-labelledby="highlights-h">
        <h2 id="highlights-h" className="highlights-heading">{c.highlightsHeading}</h2>
        <div className="highlights-grid-public">
          {c.highlights.map((h) => (
            <div className="hp-card" key={h.value}>
              <div className="hp-icon" aria-hidden="true">{h.icon}</div>
              <div className="hp-value">{h.value}</div>
              <div className="hp-caption">{h.caption}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-public" aria-labelledby="timeline-h">
        <h2 id="timeline-h">{c.timelineHeading}</h2>
        <div className="tl-track">
          {c.timeline.map((entry) => (
            <div className={`tl-row tl-${entry.side}`} key={entry.year + entry.title}>
              {entry.side === "right" && (
                <div className="tl-marker" aria-hidden="true">{entry.year}</div>
              )}
              <div className="tl-card">
                <h3>{entry.title}</h3>
                <p>{entry.body}</p>
              </div>
              {entry.side === "left" && (
                <div className="tl-marker" aria-hidden="true">{entry.year}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Press / quotes carousel */}
      <section className="press-section" aria-labelledby="press-h">
        <h2 id="press-h">{c.pressHeading}</h2>
        <div
          className="qc-track"
          onMouseEnter={stop}
          onMouseLeave={start}
          onFocus={stop}
          onBlur={start}
        >
          <div
            className="qc-stage"
            role="region"
            aria-roledescription="carousel"
            aria-label="Press quotes"
            style={{ transform: `translateX(${-100 * slide}%)` }}
          >
            {c.press.map((q, i) => (
              <div
                className="qc-slide"
                key={q.sourceIcon + i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slideCount}`}
              >
                <blockquote>
                  {q.quote}
                  <cite>
                    <span
                      className={`source-icon${q.tint ? ` tint-${q.tint}` : ""}`}
                      aria-hidden="true"
                    >
                      {q.sourceIcon}
                    </span>
                    {q.source}
                  </cite>
                </blockquote>
              </div>
            ))}
          </div>
          <div className="qc-dots" role="tablist" aria-label="Carousel dots">
            {c.press.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slide}
                aria-label={`Slide ${i + 1}`}
                className={i === slide ? "is-active" : ""}
                onClick={() => {
                  setSlide(i);
                  start();
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="cta-section" aria-labelledby="cta-h">
        <div className="cta-eyebrow">{c.cta.eyebrow}</div>
        <h3 id="cta-h">{c.cta.heading}</h3>
        <a href="/__proto/creator-public" className="cta-button">
          {c.cta.button}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      {/* Footer */}
      <footer className="creator-footer">
        <div className="social-stack" aria-label="Social profiles">
          {c.socials.map((s) => (
            <a key={s.label} className="social-icon-pub" href="#" aria-label={s.label}>
              {s.glyph}
            </a>
          ))}
        </div>
        <div className="powered">
          {c.footerNote} <Wordmark size="sm" />
        </div>
      </footer>
    </div>
  );
}
