/**
 * CreatorCustomPage — public-facing custom/named page render.
 *
 * Visitor view at tadaify.com/<handle>/<slug>. Renders the creator's block
 * list as a vertical stack at a creator-named URL (e.g. /press-kit, /resources).
 *
 * Three sub-views via in-component state:
 *   "page"     — full page with all blocks rendered (default)
 *   "password" — Pro+ password gate (locked screen)
 *   "empty"    — friendly placeholder for an empty published page
 *
 * All purchase/interaction actions stubbed with TODO comments.
 *
 * Dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-custom.css
 */

import type { ReactElement } from "react";
import { useState } from "react";
import "~/styles/public-pages/creator-custom.css";

type SubView = "page" | "password" | "empty";

export function CreatorCustomPage(): ReactElement {
  const [view, setView] = useState<SubView>("page");
  const [lockValue, setLockValue] = useState("");
  const [lockError, setLockError] = useState(false);
  const [nlEmail, setNlEmail] = useState("");

  const handleLockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to real password-gate API
    const pw = lockValue.trim();
    if (pw === "atelier-2026") {
      setLockError(false);
      setLockValue("");
      setView("page");
    } else {
      setLockError(true);
    }
  };

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to newsletter provider (Kit / ConvertKit etc.)
    setNlEmail("");
  };

  return (
    <div className="creator-custom-page">

      {/* ── Mockup-only top strip ── */}
      <div className="mock-strip" aria-hidden="true">
        <a href="#" className="ms-back">
          {/* TODO: route to creator home */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </a>
        <span className="ms-url">
          tadaify.com/alexandra/<b>press-kit</b>
        </span>
        <span className="ms-spacer" />
        <span className="ms-route-pill" role="tablist" aria-label="Sub-view (mockup-only)">
          <a
            href="#"
            role="tab"
            className={view === "page" ? "is-active" : ""}
            onClick={(e) => { e.preventDefault(); setView("page"); }}
          >
            Page
          </a>
          <a
            href="#"
            role="tab"
            className={view === "password" ? "is-active" : ""}
            onClick={(e) => { e.preventDefault(); setView("password"); setLockError(false); setLockValue(""); }}
          >
            🔒 Password gate
          </a>
          <a
            href="#"
            role="tab"
            className={view === "empty" ? "is-active" : ""}
            onClick={(e) => { e.preventDefault(); setView("empty"); }}
          >
            Empty state
          </a>
        </span>
      </div>

      {/* ── Sub-view: full page ── */}
      {view === "page" && (
        <>
          {/* Creator nav */}
          <nav className="creator-nav">
            <a href="#" className="cn-handle">
              {/* TODO: link to creator home */}
              <span className="av" aria-hidden="true">A</span>
              Alexandra Silva
            </a>
            <div className="cn-links">
              <a href="#">Home</a>
              <a href="#">Blog</a>
              <a href="#">Portfolio</a>
              <a href="#" className="is-current" aria-current="page">Press kit</a>
              <a href="#">Contact</a>
            </div>
          </nav>

          {/* Page hero */}
          <div className="page-hero">
            <h1>Press &amp; media kit</h1>
            <p className="page-sub">
              Everything you need to write, podcast, or partner with Alexandra Silva.
              Logos, founder photo, key facts, approved bio — and a way to stay in the
              loop on press releases.
            </p>
          </div>

          {/* Block stack */}
          <div className="blocks">

            {/* Block — Founder image */}
            <figure className="b-image">
              <div className="ph" aria-label="Photo: Alexandra Silva, founder">
                Alexandra Silva · founder portrait
              </div>
            </figure>

            {/* Block — Heading H2 */}
            <h2 className="b-heading h2">Logos &amp; download assets</h2>
            <p className="b-heading-sub">Click any logo to download. SVG and PNG both included.</p>

            {/* Block — Link buttons (logo downloads) */}
            <a
              className="b-link"
              href="https://assets.alexandra.com/press/logo-full.zip"
              onClick={(e) => e.preventDefault()} // TODO: wire to real asset URL
            >
              <span>Logo (full mark)</span>
              <span className="b-link-meta">SVG · PNG · 2 MB</span>
            </a>
            <a
              className="b-link"
              href="https://assets.alexandra.com/press/wordmark.zip"
              onClick={(e) => e.preventDefault()} // TODO: wire to real asset URL
            >
              <span>Wordmark only</span>
              <span className="b-link-meta">SVG · PNG · 1 MB</span>
            </a>
            <a
              className="b-link"
              href="https://assets.alexandra.com/press/mono-dark.zip"
              onClick={(e) => e.preventDefault()} // TODO: wire to real asset URL
            >
              <span>Monochrome — dark</span>
              <span className="b-link-meta">SVG · PNG · 800 KB</span>
            </a>
            <a
              className="b-link"
              href="https://assets.alexandra.com/press/mono-light.zip"
              onClick={(e) => e.preventDefault()} // TODO: wire to real asset URL
            >
              <span>Monochrome — light</span>
              <span className="b-link-meta">SVG · PNG · 800 KB</span>
            </a>

            {/* Block — Heading H2 */}
            <h2 className="b-heading h2" style={{ marginTop: "12px" }}>
              Quick facts about Alexandra
            </h2>

            {/* Block — Accordion */}
            <div className="b-accordion">
              <details open>
                <summary>When did Alexandra found Strong Not Skinny?</summary>
                <div className="b-acc-body">
                  In 2019, after eight years coaching one-on-one in Lisbon and Madrid.
                  The first online program shipped in October 2019 with 47 founding members.
                </div>
              </details>
              <details>
                <summary>Where is the studio based?</summary>
                <div className="b-acc-body">
                  Lisbon, Portugal — Estrela neighborhood. Most coaching happens online;
                  in-person workshops run quarterly across Europe.
                </div>
              </details>
              <details>
                <summary>How many active clients are in the program?</summary>
                <div className="b-acc-body">
                  Around 1,200 monthly active members. The 1:1 roster is capped at 18 —
                  currently full with a waitlist.
                </div>
              </details>
              <details>
                <summary>What topics does Alexandra speak on?</summary>
                <div className="b-acc-body">
                  Strength training for women over 35 · sustainable nutrition without macro
                  tracking · building a coaching business that doesn&apos;t require burnout.
                  Most-booked talk:{" "}
                  <em>&ldquo;The Recovery Stack — why under-training beats over-training.&rdquo;</em>
                </div>
              </details>
              <details>
                <summary>Is there an approved bio for press?</summary>
                <div className="b-acc-body">
                  Short (50 words): Alexandra Silva is a strength coach and writer based in
                  Lisbon. She founded Strong Not Skinny in 2019 to teach women over 35 how to
                  build muscle without burning out. Her work has appeared in{" "}
                  <em>Outside</em>, <em>Self</em>, and <em>Women&apos;s Health</em>.
                </div>
              </details>
            </div>

            <hr className="b-divider" />

            {/* Block — Newsletter signup */}
            <div className="b-newsletter">
              <h3>Get press releases first</h3>
              <p>Drop your email — we send a short note every time there&apos;s something worth covering.</p>
              <form onSubmit={handleNlSubmit}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                />
                <button type="submit">Subscribe</button>
              </form>
              <div className="b-nl-trust">No spam · 1-click unsubscribe · GDPR-friendly</div>
            </div>

            {/* Block — CTA link (warm) */}
            <a
              className="b-link is-warm"
              href="#"
              style={{ justifyContent: "center", padding: "18px 24px", fontSize: "16px" }}
              onClick={(e) => e.preventDefault()} // TODO: route to contact page
            >
              <span>Reach me directly →</span>
            </a>

          </div>

          {/* Footer */}
          <footer className="creator-foot">
            <div className="cf-socials">
              <a className="cf-social" href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>📸</a>
              <a className="cf-social" href="#" aria-label="TikTok"    onClick={(e) => e.preventDefault()}>🎬</a>
              <a className="cf-social" href="#" aria-label="YouTube"   onClick={(e) => e.preventDefault()}>▶️</a>
              <a className="cf-social" href="#" aria-label="X / Twitter" onClick={(e) => e.preventDefault()}>𝕏</a>
              <a className="cf-social" href="mailto:hello@alexandra.com" aria-label="Email" onClick={(e) => e.preventDefault()}>✉️</a>
            </div>
            <div className="cf-tag">
              Made with <a href="#">tadaify</a>
            </div>
          </footer>
        </>
      )}

      {/* ── Sub-view: password gate ── */}
      {view === "password" && (
        <div className="lock-screen">
          <div className="lock-emoji" aria-hidden="true">🔒</div>
          <h2>This page is private</h2>
          <p>
            The creator has password-protected this page. Enter the password they
            shared with you to continue.
          </p>
          <form className="lock-form" onSubmit={handleLockSubmit}>
            <input
              type="password"
              placeholder="Enter password"
              autoComplete="off"
              aria-label="Page password"
              className={lockError ? "is-error" : ""}
              value={lockValue}
              onChange={(e) => { setLockValue(e.target.value); setLockError(false); }}
            />
            {lockError && (
              <div className="lock-error">
                That password doesn&apos;t match. Try again or contact the creator.
              </div>
            )}
            <button type="submit">Unlock page</button>
          </form>
          <div className="lock-link">
            Forgot the password?{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>
              {/* TODO: route to contact page */}
              Contact Alexandra →
            </a>
          </div>
        </div>
      )}

      {/* ── Sub-view: empty page ── */}
      {view === "empty" && (
        <>
          {/* Creator nav still renders */}
          <nav className="creator-nav">
            <a href="#" className="cn-handle">
              <span className="av" aria-hidden="true">A</span>
              Alexandra Silva
            </a>
            <div className="cn-links">
              <a href="#">Home</a>
              <a href="#">Blog</a>
              <a href="#">Portfolio</a>
              <a href="#" className="is-current" aria-current="page">Press kit</a>
              <a href="#">Contact</a>
            </div>
          </nav>

          <div className="empty-screen">
            <div className="empty-emoji" aria-hidden="true">🚧</div>
            <h2>This page is being built</h2>
            <p>
              Alexandra hasn&apos;t added content here yet. Check back soon — or visit one
              of the pages below in the meantime.
            </p>
            <div className="es-other-pages">
              <a href="#" onClick={(e) => e.preventDefault()}>🏠 Home</a>
              <a href="#" onClick={(e) => e.preventDefault()}>📝 Blog</a>
              <a href="#" onClick={(e) => e.preventDefault()}>🎨 Portfolio</a>
              <a href="#" onClick={(e) => e.preventDefault()}>✉️ Contact</a>
            </div>
          </div>

          <footer className="creator-foot">
            <div className="cf-socials">
              <a className="cf-social" href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>📸</a>
              <a className="cf-social" href="#" aria-label="TikTok"    onClick={(e) => e.preventDefault()}>🎬</a>
              <a className="cf-social" href="#" aria-label="YouTube"   onClick={(e) => e.preventDefault()}>▶️</a>
              <a className="cf-social" href="mailto:hello@alexandra.com" aria-label="Email" onClick={(e) => e.preventDefault()}>✉️</a>
            </div>
            <div className="cf-tag">Made with <a href="#">tadaify</a></div>
          </footer>
        </>
      )}

    </div>
  );
}
