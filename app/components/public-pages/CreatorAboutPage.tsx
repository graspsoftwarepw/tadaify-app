/**
 * CreatorAboutPage — public-facing About page render.
 *
 * Visitor view at tadaify.com/<handle>/about. Shows the creator's hero,
 * long-form bio, highlights grid, story timeline, press carousel, and
 * a contact CTA.
 *
 * Press carousel: dot navigation cycles between 3 quotes; auto-advances
 * every 7s, pauses on hover. Falls back to scroll-snap on mobile.
 *
 * All outbound link/CTA actions stubbed with TODO comments.
 *
 * Dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-about.css
 */

import type { ReactElement } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import "~/styles/public-pages/creator-about.css";

const QUOTES = [
  {
    text: "Alexandra is the rare coach who treats rest as a workout. Her programs are quietly the best I’ve followed.",
    sourceName: "The Fitness Times — issue 47",
    sourceAbbr: "FT",
    sourceStyle: {},
  },
  {
    text: "Honest, no-nonsense coaching. She’s the one I send my friends to when they ask where to start lifting.",
    sourceName: "Run Happy podcast · @robinhuxley",
    sourceAbbr: "RH",
    sourceStyle: { background: "rgba(245,158,11,0.15)", color: "var(--brand-warm-dark)" },
  },
  {
    text: "The book Rest Days Are Workouts is the antidote to the cult of grind. Required reading for any tired lifter.",
    sourceName: "Strong Habits Newsletter",
    sourceAbbr: "SH",
    sourceStyle: { background: "rgba(52,211,153,0.16)", color: "#047857" },
  },
];

export function CreatorAboutPage(): ReactElement {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => {
    setCarouselIdx(((i % QUOTES.length) + QUOTES.length) % QUOTES.length);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % QUOTES.length);
    }, 7000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Respect reduced-motion: no auto-advance
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const handleDotClick = (i: number) => {
    go(i);
    startTimer();
  };

  return (
    <div className="creator-about-page">

      {/* Creator nav */}
      <nav className="creator-nav">
        <a href="#" className="cn-handle">
          {/* TODO: link to creator home */}
          <span className="av" aria-hidden="true">A</span>
          Alexandra Silva
        </a>
        <div className="cn-links">
          <a href="#">Home</a>
          <a href="#" className="is-current" aria-current="page">About</a>
          <a href="#">Blog</a>
          <a href="#">Portfolio</a>
          <a href="#">Book</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* Hero section */}
      <section className="about-hero fade-up delay-1" aria-labelledby="hero-name">
        <div className="hero-photo" aria-hidden="true">A</div>
        <div className="hero-text">
          <h1 id="hero-name">Alexandra Silva</h1>
          <p className="tagline">Strength coach for women who hate gymtok.</p>
          <div className="social-proof">
            <b>@alexandra</b>
            <span className="sp-dot" />
            <span><b>24k</b> followers</span>
            <span className="sp-dot" />
            <span>since <b>2018</b></span>
          </div>
        </div>
      </section>

      <hr className="pub-divider" />

      {/* Bio section */}
      <section className="about-section bio-section fade-up delay-2" aria-labelledby="bio-h">
        <h2 id="bio-h">My story</h2>
        <div className="bio-text">
          <p>I&apos;m Alexandra. I coach busy women who want to get strong without making the gym their personality.</p>
          <p>
            I started lifting at 24 to fix a back I&apos;d wrecked sitting at a desk. Five years later I&apos;d quit my
            consulting job and was coaching full-time. Today I work with about 40 women a year — most of them mums,
            founders, or runners who&apos;d hit a wall trying to &ldquo;just do more cardio.&rdquo;
          </p>
          <p>
            My method is unsexy: heavy basics, real recovery, and exactly enough volume to keep moving forward.{" "}
            <em>No 4 AM cold-plunge content. No 30-day shred programs.</em> Just the boring stuff that actually
            works for the next ten years.
          </p>
        </div>
      </section>

      {/* Highlights grid */}
      <section className="highlights-public fade-up delay-3" aria-labelledby="highlights-h">
        <h2
          id="highlights-h"
          style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(24px, 3.2vw, 32px)",
            letterSpacing: "-0.01em",
            margin: "0 0 22px",
          }}
        >
          Highlights
        </h2>
        <div className="highlights-grid-public">
          <div className="hp-card">
            <div className="hp-icon" aria-hidden="true">💪</div>
            <div className="hp-value">40 women / year</div>
            <div className="hp-caption">coached 1:1 since 2020</div>
          </div>
          <div className="hp-card">
            <div className="hp-icon" aria-hidden="true">📚</div>
            <div className="hp-value">1 book published</div>
            <div className="hp-caption">Rest Days Are Workouts (2024)</div>
          </div>
          <div className="hp-card">
            <div className="hp-icon" aria-hidden="true">🌍</div>
            <div className="hp-value">Lisbon, Portugal</div>
            <div className="hp-caption">working remotely since 2022</div>
          </div>
          <div className="hp-card">
            <div className="hp-icon" aria-hidden="true">📅</div>
            <div className="hp-value">6 yrs coaching</div>
            <div className="hp-caption">started 2018, full-time since 2020</div>
          </div>
          <div className="hp-card">
            <div className="hp-icon" aria-hidden="true">🎙</div>
            <div className="hp-value">40+ podcasts</div>
            <div className="hp-caption">guest on training &amp; longevity shows</div>
          </div>
          <div className="hp-card">
            <div className="hp-icon" aria-hidden="true">🏋️‍♀️</div>
            <div className="hp-value">DL 152 kg</div>
            <div className="hp-caption">current best · trained, not bro-spotted</div>
          </div>
        </div>
      </section>

      {/* Story timeline */}
      <section className="timeline-public" aria-labelledby="timeline-h">
        <h2 id="timeline-h" style={{ textAlign: "center" }}>The road here</h2>
        <div className="tl-track">

          <div className="tl-row tl-left">
            <div className="tl-card">
              <h3>First barbell</h3>
              <p>Joined a powerlifting gym in Berlin to fix back pain. Stayed for the community.</p>
            </div>
            <div className="tl-marker" aria-hidden="true">2018</div>
          </div>

          <div className="tl-row tl-right">
            <div className="tl-marker" aria-hidden="true">2020</div>
            <div className="tl-card">
              <h3>Quit consulting</h3>
              <p>Took a sabbatical to certify as a strength coach. Never went back to the office.</p>
            </div>
          </div>

          <div className="tl-row tl-left">
            <div className="tl-card">
              <h3>Moved to Lisbon</h3>
              <p>Switched to remote-first coaching. Built the first cohort of online clients.</p>
            </div>
            <div className="tl-marker" aria-hidden="true">2022</div>
          </div>

          <div className="tl-row tl-right">
            <div className="tl-marker" aria-hidden="true">2024</div>
            <div className="tl-card">
              <h3>Published Rest Days Are Workouts</h3>
              <p>Self-published the book on recovery. Sold out the first run in 6 weeks.</p>
            </div>
          </div>

          <div className="tl-row tl-left">
            <div className="tl-card">
              <h3>Now</h3>
              <p>Building Strong Not Skinny — a small group program for busy women.</p>
            </div>
            <div className="tl-marker" aria-hidden="true">2026</div>
          </div>

        </div>
      </section>

      {/* Press / quotes carousel */}
      <section className="press-section" aria-labelledby="press-h">
        <h2 id="press-h">In the press</h2>
        <div
          className="qc-track"
          ref={trackRef}
          onMouseEnter={stopTimer}
          onMouseLeave={startTimer}
          onFocus={stopTimer}
          onBlur={startTimer}
        >
          <div
            className="qc-stage"
            role="region"
            aria-roledescription="carousel"
            aria-label="Press quotes"
            style={{ transform: `translateX(${-100 * carouselIdx}%)` }}
          >
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className="qc-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${QUOTES.length}`}
              >
                <blockquote>
                  &ldquo;{q.text}&rdquo;
                  <cite>
                    <span className="source-icon" aria-hidden="true" style={q.sourceStyle}>
                      {q.sourceAbbr}
                    </span>
                    {q.sourceName}
                  </cite>
                </blockquote>
              </div>
            ))}
          </div>
          <div className="qc-dots" role="tablist" aria-label="Carousel dots">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={carouselIdx === i}
                aria-label={`Slide ${i + 1}`}
                className={carouselIdx === i ? "is-active" : ""}
                onClick={() => handleDotClick(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="cta-section" aria-labelledby="cta-h">
        <div className="cta-eyebrow">Get in touch</div>
        <h3 id="cta-h">Want to train together?</h3>
        <a
          href="#"
          className="cta-button"
          onClick={(e) => e.preventDefault()} // TODO: route to creator home / booking
        >
          Work with me
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      {/* Footer */}
      <footer className="creator-footer">
        <div className="social-stack" aria-label="Social profiles">
          <a className="social-icon-pub" href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>IG</a>
          <a className="social-icon-pub" href="#" aria-label="TikTok"    onClick={(e) => e.preventDefault()}>TT</a>
          <a className="social-icon-pub" href="#" aria-label="YouTube"   onClick={(e) => e.preventDefault()}>YT</a>
          <a className="social-icon-pub" href="#" aria-label="Substack"  onClick={(e) => e.preventDefault()}>SB</a>
          <a className="social-icon-pub" href="#" aria-label="Spotify"   onClick={(e) => e.preventDefault()}>SP</a>
        </div>
        <div className="powered">
          © 2026 Alexandra Silva · made with{" "}
          <a href="#" onClick={(e) => e.preventDefault()}>tadaify</a>
        </div>
      </footer>

    </div>
  );
}
