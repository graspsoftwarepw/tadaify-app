/**
 * CreatorNewsletterSignupPage — public-facing Newsletter signup page render.
 *
 * Visitor view at tadaify.com/<handle>/subscribe. Shows creator nav, hero,
 * trust strip, all 3 form layout variants, social proof, what-you-get,
 * past issues, FAQ, footer CTA, and footer.
 *
 * Confirmation states: default | submitting | success | already-subscribed | error
 * Managed with local React state; hash routing is Q+1 dead code (not wired).
 *
 * All form submission + outbound link actions stubbed with TODO comments.
 *
 * Dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-newsletter-signup.css
 */

import type { ReactElement } from "react";
import { useState, useCallback, useRef } from "react";
import "~/styles/public-pages/creator-newsletter-signup.css";

type NewsletterState = "default" | "submitting" | "success" | "already-subscribed" | "error";

// ── SVG icons ──────────────────────────────────────────────────────────────

function SendIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ verticalAlign: "-2px", marginRight: "6px" }}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function InstagramIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  );
}

function YouTubeIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CreatorNav(): ReactElement {
  return (
    <nav className="creator-nav">
      <a href="/" className="cn-handle">
        {/* TODO: wire to creator handle / avatar */}
        <span className="av" aria-hidden="true">A</span>
        Alexandra Silva
      </a>
      <div className="cn-links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a href="/portfolio">Portfolio</a>
        <a href="/contact">Contact</a>
        <a href="/subscribe" className="is-current">Subscribe</a>
      </div>
    </nav>
  );
}

function HeroSection(): ReactElement {
  return (
    <section className="hero">
      <div className="hero-cover" aria-hidden="true">✉️</div>
      <h1>Get my weekly notes on training without burning out.</h1>
      <p className="lede">
        One short, honest email every Tuesday. Drills, mindset shifts, recovery tactics — no spam, no fluff.
      </p>
    </section>
  );
}

function TrustStrip(): ReactElement {
  return (
    <div className="trust-strip">
      <span className="ts-mark">
        <span className="ts-dot" />
        {" "}Powered by Kit · GDPR-friendly · 1-click unsubscribe
      </span>
    </div>
  );
}

interface FormLayoutOneLineProps {
  onSubmit: () => void;
  id: string;
  consentId: string;
}

function FormLayoutOneLine({ onSubmit, id, consentId }: FormLayoutOneLineProps): ReactElement {
  return (
    <section className="form-section is-anchor" id={id}>
      <h2><span className="form-section-num">1</span> One-line layout</h2>
      <div className="form-card">
        <form
          className="form-oneline"
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        >
          <input className="form-input" type="email" placeholder="you@email.com" required />
          <button className="form-btn" type="submit">
            <SendIcon />
            Subscribe
          </button>
        </form>
        <div className="consent">
          <input type="checkbox" id={consentId} defaultChecked />
          <label htmlFor={consentId}>
            I agree to receive emails from Alexandra and accept the{" "}
            {/* TODO: wire to privacy policy URL */}
            <a href="#">privacy policy</a>.
          </label>
        </div>
      </div>
    </section>
  );
}

interface FormLayoutTwoLineProps {
  onSubmit: () => void;
  id: string;
  consentId: string;
}

function FormLayoutTwoLine({ onSubmit, id, consentId }: FormLayoutTwoLineProps): ReactElement {
  return (
    <section className="form-section is-anchor" id={id}>
      <h2><span className="form-section-num">2</span> Two-line layout</h2>
      <div className="form-card">
        <form
          className="form-twoline"
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        >
          <input className="form-input" type="email" placeholder="you@email.com" required />
          <button className="form-btn" type="submit">Subscribe to the newsletter</button>
        </form>
        <div className="consent">
          <input type="checkbox" id={consentId} defaultChecked />
          <label htmlFor={consentId}>
            I agree to receive emails from Alexandra and accept the{" "}
            {/* TODO: wire to privacy policy URL */}
            <a href="#">privacy policy</a>.
          </label>
        </div>
      </div>
    </section>
  );
}

interface FormLayoutCardProps {
  onSubmit: () => void;
  id: string;
  consentId: string;
}

function FormLayoutCard({ onSubmit, id, consentId }: FormLayoutCardProps): ReactElement {
  return (
    <section className="form-section is-anchor" id={id}>
      <h2><span className="form-section-num">3</span> Centered card layout</h2>
      <div className="form-card form-cardlayout">
        <div className="fc-icon" aria-hidden="true">✉️</div>
        <p className="fc-prompt">Join 24,512 creators training smarter</p>
        <form
          className="form-twoline"
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        >
          <input className="form-input" type="email" placeholder="you@email.com" required />
          <button className="form-btn" type="submit">Count me in</button>
        </form>
        <div className="consent" style={{ justifyContent: "center" }}>
          <input type="checkbox" id={consentId} defaultChecked />
          <label htmlFor={consentId}>
            I agree to receive emails &amp; accept the{" "}
            {/* TODO: wire to privacy policy URL */}
            <a href="#">privacy policy</a>.
          </label>
        </div>
      </div>
    </section>
  );
}

function LayoutSwitcher(): ReactElement {
  return (
    <div className="layout-switcher">
      <span>Compare layouts:</span>
      <a href="#layout-oneline">One-line</a>
      <a href="#layout-twoline">Two-line</a>
      <a href="#layout-card">Centered card</a>
      <span style={{ opacity: 0.6, marginLeft: "auto" }}>In production, only the layout chosen by the creator renders.</span>
    </div>
  );
}

function SocialProof(): ReactElement {
  return (
    <section className="proof-strip">
      <div className="proof-count">Join <b>24,512</b> creators learning to train smarter</div>
      <div className="proof-quotes">
        <div className="proof-quote">
          &ldquo;Best fitness newsletter I read. Honest, no-fluff, and the Tuesday cadence is perfect for actually trying things.&rdquo;
          <span className="pq-author">— Mira K., Berlin</span>
        </div>
        <div className="proof-quote">
          &ldquo;Alex&apos;s Tuesday emails are the only ones I open every week. The recovery section alone changed how I sleep.&rdquo;
          <span className="pq-author">— Daniel P., NYC</span>
        </div>
      </div>
    </section>
  );
}

function WhatYouGet(): ReactElement {
  return (
    <section className="wyg">
      <h2>Here&apos;s what lands in your inbox:</h2>
      <ul>
        <li>
          <span className="wyg-emoji">📅</span>
          <span className="wyg-text">One short essay every Tuesday — usually 4-7 minutes to read.</span>
        </li>
        <li>
          <span className="wyg-emoji">🏋️</span>
          <span className="wyg-text">Weekly drills you can try in your next session — no fancy gear.</span>
        </li>
        <li>
          <span className="wyg-emoji">🛌</span>
          <span className="wyg-text">Recovery + sleep tactics that actually work for non-athletes.</span>
        </li>
        <li>
          <span className="wyg-emoji">💌</span>
          <span className="wyg-text">Behind-the-scenes from my own training — the failures included.</span>
        </li>
      </ul>
    </section>
  );
}

function PastIssues(): ReactElement {
  return (
    <section className="past">
      <h2>Recent issues you&apos;d have read:</h2>
      <p className="past-sub">A peek at the last three Tuesdays.</p>
      <div className="past-grid">
        {/* TODO: wire past issues from creator newsletter archive */}
        <a className="past-card" href="#" onClick={(e) => e.preventDefault()}>
          <div className="pc-cover t-warm">📈</div>
          <div className="pc-body">
            <div className="pc-title">Why I stopped chasing PRs</div>
            <div className="pc-excerpt">Hitting a wall at 165kg taught me more about programming than any deload week ever did.</div>
            <div className="pc-meta">Apr 22 · 6 min read</div>
          </div>
        </a>
        <a className="past-card" href="#" onClick={(e) => e.preventDefault()}>
          <div className="pc-cover">💤</div>
          <div className="pc-body">
            <div className="pc-title">Sleep is the cheat code</div>
            <div className="pc-excerpt">Three small experiments that doubled my deep-sleep minutes — backed by my Whoop data.</div>
            <div className="pc-meta">Apr 15 · 5 min read</div>
          </div>
        </a>
        <a className="past-card" href="#" onClick={(e) => e.preventDefault()}>
          <div className="pc-cover t-rose">🧠</div>
          <div className="pc-body">
            <div className="pc-title">Mental reps &gt; physical reps</div>
            <div className="pc-excerpt">Visualisation is real, but only if you do it the way Olympic divers do — not the way Instagram does.</div>
            <div className="pc-meta">Apr 08 · 7 min read</div>
          </div>
        </a>
      </div>
    </section>
  );
}

function FaqSection(): ReactElement {
  return (
    <section className="faq">
      <h2>Frequently asked</h2>
      <details>
        <summary>How often will you email me?</summary>
        <div className="faq-a">
          Once a week, every Tuesday morning. Sometimes a bonus drop alert when something time-sensitive lands. Never daily, never twice in one day.
        </div>
      </details>
      <details>
        <summary>Can I unsubscribe at any time?</summary>
        <div className="faq-a">
          Yes — every email has a one-click unsubscribe link in the footer. No survey, no &quot;are you sure&quot; — instant.
        </div>
      </details>
      <details>
        <summary>Will you sell or share my email?</summary>
        <div className="faq-a">
          Never. Your email lives in my Kit account and that&apos;s it. I don&apos;t sell, share, swap or rent lists. GDPR-compliant by default.
        </div>
      </details>
      <details>
        <summary>What if I want to read past issues first?</summary>
        <div className="faq-a">
          The &quot;Recent issues&quot; cards above show the last three Tuesdays. The full archive lives on my Kit page once you confirm.
        </div>
      </details>
    </section>
  );
}

interface CloserSectionProps {
  onScrollToForm: () => void;
}

function CloserSection({ onScrollToForm }: CloserSectionProps): ReactElement {
  return (
    <section className="closer">
      <h2>Ready? It&apos;s one click + your email.</h2>
      <button className="closer-btn" type="button" onClick={onScrollToForm}>
        Subscribe now
      </button>
      <div className="fallback">
        {/* TODO: wire social links from creator profile */}
        Or follow on <a href="#">Instagram</a>, <a href="#">TikTok</a> and <a href="#">YouTube</a> — links in your bio.
      </div>
    </section>
  );
}

function PublicFooter(): ReactElement {
  return (
    <footer className="public-footer">
      <div className="pf-socials">
        {/* TODO: wire social links from creator profile */}
        <a href="#" aria-label="Instagram"><InstagramIcon /></a>
        <a href="#" aria-label="TikTok"><TikTokIcon /></a>
        <a href="#" aria-label="YouTube"><YouTubeIcon /></a>
      </div>
      <div className="pf-tdf">
        <span>Made with</span>
        {/* TODO: wire to tadaify landing */}
        <a href="/" className="wm">
          <span className="ta">ta</span><span className="da">da!</span><span className="ify">ify</span>
        </a>
      </div>
    </footer>
  );
}

// ── State screens ──────────────────────────────────────────────────────────

function SubmittingState(): ReactElement {
  return (
    <div className="state-host">
      <div className="state-card">
        <div className="spinner" aria-hidden="true" />
        <h2>Adding you to the list…</h2>
        <p>Hold tight — we&apos;re handing your email to Kit. This usually takes a second.</p>
      </div>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }): ReactElement {
  return (
    <div className="state-host">
      <div className="state-card">
        <div className="state-emoji is-success" aria-hidden="true">🎉</div>
        <h2>Thanks for subscribing!</h2>
        <p>
          Check your inbox for a confirmation email — click the link inside to lock it in. (Sometimes it lands in Promotions; the first one&apos;s a doozy of a &quot;drag me to Primary&quot;.)
        </p>
        <div className="state-actions">
          {/* TODO: wire to creator home URL */}
          <a className="btn-primary" href="/">← Back to alexandra.tadaify.com</a>
          {/* TODO: wire add-to-contacts action */}
          <a className="btn-ghost" href="#">Add Alexandra to your contacts</a>
        </div>
        <p className="state-footnote">
          Didn&apos;t get the confirmation email?{" "}
          {/* TODO: wire resend confirmation action */}
          <a href="#">Resend it</a>.
        </p>
      </div>
    </div>
  );
}

function AlreadySubscribedState({ onReset }: { onReset: () => void }): ReactElement {
  return (
    <div className="state-host">
      <div className="state-card">
        <div className="state-emoji is-info" aria-hidden="true">👋</div>
        <h2>Looks like you&apos;re already on the list.</h2>
        <p>
          You subscribed with this email back on March 14. No need to sign up again — your next Tuesday note is on the way.
        </p>
        <div className="state-actions">
          {/* TODO: wire to Kit subscriber management */}
          <a className="btn-primary" href="#">Manage your subscription on Kit →</a>
          {/* TODO: wire to creator home URL */}
          <a className="btn-ghost" href="/">← Back to main page</a>
        </div>
        <p className="state-footnote">
          Wrong email?{" "}
          <button
            type="button"
            onClick={onReset}
            style={{ background: "none", border: "none", padding: 0, color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer", font: "inherit", fontSize: "12.5px" }}
          >
            Use a different one
          </button>.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ onReset }: { onReset: () => void }): ReactElement {
  return (
    <div className="state-host">
      <div className="state-card">
        <div className="state-emoji is-error" aria-hidden="true">😬</div>
        <h2>Something went wrong on our end.</h2>
        <p>
          We couldn&apos;t reach Kit just now. Your email isn&apos;t saved — could you try again in a moment? If it keeps failing, you can email Alexandra directly.
        </p>
        <div className="state-actions">
          <button className="btn-primary" type="button" onClick={onReset}>Try again</button>
          {/* TODO: wire to creator email */}
          <a className="btn-ghost" href="mailto:hello@alexandrasilva.com">Email Alexandra</a>
        </div>
        <p className="state-footnote">
          Error code: <code>KIT_API_502 · req_8a2b…</code>
        </p>
      </div>
    </div>
  );
}

// ── Page root ──────────────────────────────────────────────────────────────

export function CreatorNewsletterSignupPage(): ReactElement {
  const [newsletterState, setNewsletterState] = useState<NewsletterState>("default");
  const formRef = useRef<HTMLElement | null>(null);

  const handleSubmit = useCallback(() => {
    // TODO: wire real subscription submission
    setNewsletterState("submitting");
  }, []);

  const handleReset = useCallback(() => {
    setNewsletterState("default");
  }, []);

  const handleScrollToForm = useCallback(() => {
    // TODO: smooth scroll to form in production; find #layout-oneline input
    const el = document.getElementById("layout-oneline");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const input = el.querySelector<HTMLInputElement>("input[type='email']");
      if (input) input.focus();
    }
  }, []);

  const renderContent = (): ReactElement => {
    switch (newsletterState) {
      case "submitting":
        return <SubmittingState />;
      case "success":
        return <SuccessState onReset={handleReset} />;
      case "already-subscribed":
        return <AlreadySubscribedState onReset={handleReset} />;
      case "error":
        return <ErrorState onReset={handleReset} />;
      default:
        return (
          <>
            <HeroSection />
            <TrustStrip />
            <FormLayoutOneLine onSubmit={handleSubmit} id="layout-oneline" consentId="consent-1" />
            <LayoutSwitcher />
            <FormLayoutTwoLine onSubmit={handleSubmit} id="layout-twoline" consentId="consent-2" />
            <FormLayoutCard onSubmit={handleSubmit} id="layout-card" consentId="consent-3" />
            <SocialProof />
            <WhatYouGet />
            <PastIssues />
            <FaqSection />
            <CloserSection onScrollToForm={handleScrollToForm} />
            <PublicFooter />
          </>
        );
    }
  };

  return (
    <div className="creator-newsletter-signup-page" ref={(el) => { formRef.current = el; }}>
      <CreatorNav />
      {renderContent()}
    </div>
  );
}
