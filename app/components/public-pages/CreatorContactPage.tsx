/**
 * CreatorContactPage — public-facing Contact page render.
 *
 * Visitor view at tadaify.com/<handle>/contact. Shows creator nav, hero,
 * office-hours strip, FAQ-quickref accordion, the contact form, other
 * contact methods, and footer.
 *
 * Confirmation states: default | submitting | success | error | honeypot-caught
 * Managed with local React state; hash routing is Q+1 dead code (not wired).
 *
 * All form submission + outbound link actions stubbed with TODO comments.
 *
 * Dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-contact.css
 */

import type { ReactElement } from "react";
import { useState, useCallback } from "react";
import "~/styles/public-pages/creator-contact.css";

type ContactState = "default" | "submitting" | "success" | "error" | "honeypot-caught";

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
        <a href="/book">Book</a>
        <a href="/contact" className="is-current">Contact</a>
      </div>
    </nav>
  );
}

function HeroSection(): ReactElement {
  return (
    <section className="hero">
      <div className="hero-icon" aria-hidden="true">📮</div>
      <h1>Let&apos;s work together.</h1>
      <p className="lede">
        For project briefs, coaching calls, speaking invitations or just a friendly hello — I usually reply within 24h on weekdays.
      </p>
    </section>
  );
}

function OfficeHoursStrip(): ReactElement {
  return (
    <div className="hours-strip">
      <span className="hs-mark">
        <span className="hs-dot" aria-hidden="true" />
        {" "}Replies usually within 24h · Mon–Fri 9-17 GMT
      </span>
    </div>
  );
}

function FaqQuickref(): ReactElement {
  return (
    <section className="faq-quick">
      <h2>Before you write — answers to the 3 most common questions</h2>
      <details>
        <summary>How fast do you reply?</summary>
        <div className="faq-a">
          Within 24h on weekdays. Weekends are off — I don&apos;t check email Sat/Sun on purpose. If it&apos;s truly urgent, mention &quot;URGENT&quot; in the subject and I&apos;ll triage faster.
        </div>
      </details>
      <details>
        <summary>What&apos;s your typical project rate?</summary>
        <div className="faq-a">
          Coaching packages start at £450 / month for 4 weekly sessions. One-off form-check sessions are £85. Custom programming is £600. Send me your goal in the form and I&apos;ll match you with the right option.
        </div>
      </details>
      <details>
        <summary>Do you take on pro-bono / charity work?</summary>
        <div className="faq-a">
          Yes — one project per quarter. Reach out with a short pitch (mission, audience, ask) and I&apos;ll let you know if it&apos;s a fit for the next slot.
        </div>
      </details>
    </section>
  );
}

interface ContactFormProps {
  onStateChange: (state: ContactState) => void;
}

function ContactForm({ onStateChange }: ContactFormProps): ReactElement {
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // TODO: wire real form submission
      const form = e.currentTarget;
      const hp = form.querySelector<HTMLInputElement>("#hp-website");
      if (hp && hp.value.trim() !== "") {
        onStateChange("honeypot-caught");
        return;
      }
      const nameEl = form.querySelector<HTMLInputElement>("#f-name");
      const emailEl = form.querySelector<HTMLInputElement>("#f-email");
      const messageEl = form.querySelector<HTMLTextAreaElement>("#f-message");
      const consentEl = form.querySelector<HTMLInputElement>("#consent");

      const nameOk = Boolean(nameEl && nameEl.value.trim() !== "");
      const emailOk = Boolean(emailEl && emailEl.value.trim() !== "");
      const messageOk = Boolean(messageEl && messageEl.value.trim() !== "");
      const consentOk = Boolean(consentEl && consentEl.checked);

      setNameError(!nameOk);
      setEmailError(!emailOk);
      setMessageError(!messageOk);
      setConsentError(!consentOk);

      if (!nameOk || !emailOk || !messageOk || !consentOk) return;

      onStateChange("submitting");
      // TODO: submit to API, then onStateChange("success") or onStateChange("error")
    },
    [onStateChange],
  );

  return (
    <section className="form-section" id="form">
      <div className="form-card">
        <form className="form-grid" id="contact-form" onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className={`field${nameError ? " has-error" : ""}`}>
            <label className="field-label" htmlFor="f-name">
              Name<span className="req" aria-hidden="true">*</span>
            </label>
            <input
              className="field-input"
              id="f-name"
              name="name"
              type="text"
              placeholder="Your name"
              required
              onChange={() => setNameError(false)}
            />
          </div>

          {/* Email */}
          <div className={`field${emailError ? " has-error" : ""}`}>
            <label className="field-label" htmlFor="f-email">
              Email<span className="req" aria-hidden="true">*</span>
            </label>
            <input
              className="field-input"
              id="f-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              onChange={() => setEmailError(false)}
            />
            <div className="field-help">We&apos;ll only use this to reply to you.</div>
          </div>

          {/* Subject */}
          <div className="field">
            <label className="field-label" htmlFor="f-subject">Subject</label>
            <input
              className="field-input"
              id="f-subject"
              name="subject"
              type="text"
              placeholder="What's this about?"
            />
          </div>

          {/* Inquiry type */}
          <div className="field">
            <label className="field-label" htmlFor="f-inquiry">Inquiry type</label>
            <select className="field-select" id="f-inquiry" name="inquiry">
              <option value="">Select one…</option>
              <option>Coaching package</option>
              <option>Speaking / podcast</option>
              <option>Brand partnership</option>
              <option>General question</option>
            </select>
          </div>

          {/* Message */}
          <div className={`field full${messageError ? " has-error" : ""}`}>
            <label className="field-label" htmlFor="f-message">
              Message<span className="req" aria-hidden="true">*</span>
            </label>
            <textarea
              className="field-area"
              id="f-message"
              name="message"
              placeholder="Tell me what you're working on, what you'd like help with, and any timeline you have in mind…"
              required
              onChange={() => setMessageError(false)}
            />
          </div>

          {/* Honeypot — visually hidden, must stay empty */}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="hp-website">Don&apos;t fill this in</label>
            <input id="hp-website" type="text" name="hp-website" tabIndex={-1} autoComplete="off" />
          </div>

          {/* GDPR consent */}
          <div className={`consent${consentError ? " has-error" : ""}`}>
            <input type="checkbox" id="consent" name="consent" required onChange={() => setConsentError(false)} />
            <label htmlFor="consent">
              I agree to my data being stored to receive a reply, and I accept the{" "}
              {/* TODO: wire to privacy policy URL */}
              <a href="#">privacy policy</a>.
            </label>
          </div>

          {/* Submit */}
          <div className="submit-row">
            <button className="form-btn" type="submit">
              <SendIcon />
              Send message
            </button>
            <span className="submit-meta">Spam-protected · GDPR-friendly</span>
          </div>
        </form>
      </div>
    </section>
  );
}

function OtherMethods(): ReactElement {
  return (
    <section className="other">
      <h2>Other ways to reach me</h2>
      <div className="om-grid">

        {/* TODO: wire contact methods from creator profile */}
        <a className="om-card" href="mailto:hello@alexandrasilva.com">
          <div className="om-icon" aria-hidden="true">✉️</div>
          <div className="om-body">
            <div className="om-label">Email</div>
            <div className="om-value">hello@alexandrasilva.com</div>
          </div>
        </a>

        <a className="om-card" href="tel:+442079460192">
          <div className="om-icon" aria-hidden="true">📞</div>
          <div className="om-body">
            <div className="om-label">Phone</div>
            <div className="om-value">+44 20 7946 0192</div>
          </div>
        </a>

        <a className="om-card" href="https://wa.me/447700900123" target="_blank" rel="noopener noreferrer">
          <div className="om-icon" aria-hidden="true">📱</div>
          <div className="om-body">
            <div className="om-label">WhatsApp</div>
            <div className="om-value">+44 7700 900123</div>
          </div>
        </a>

        <a className="om-card" href="https://instagram.com/alexandrasilva" target="_blank" rel="noopener noreferrer">
          <div className="om-icon" aria-hidden="true">📷</div>
          <div className="om-body">
            <div className="om-label">Instagram DMs</div>
            <div className="om-value">@alexandrasilva</div>
          </div>
        </a>

        {/* Address + map */}
        <div className="address-card">
          <div className="ac-text">
            <div className="ac-icon" aria-hidden="true">📍</div>
            <div className="ac-body">
              <div className="om-label">Studio</div>
              <div className="om-value">71 Shoreditch High Street, London E1 6JJ, United Kingdom</div>
            </div>
          </div>
          <div className="ac-map" aria-label="Map embed (Google Maps iframe in production)">📍</div>
        </div>

        {/* Inline social row */}
        <div className="socials-inline">
          {/* TODO: wire social URLs from creator profile */}
          <a className="si-link" href="https://instagram.com/alexandrasilva" target="_blank" rel="noopener noreferrer">📷 Instagram</a>
          <a className="si-link" href="https://twitter.com/alex_silva" target="_blank" rel="noopener noreferrer">🐦 X / Twitter</a>
          <a className="si-link" href="https://linkedin.com/in/alexandra-silva" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
        </div>

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
        <h2>Sending your message…</h2>
        <p>Hold tight — Alexandra&apos;s inbox is just a moment away. We&apos;re delivering your message + (optionally) a copy to her tadaify inbox.</p>
      </div>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }): ReactElement {
  return (
    <div className="state-host">
      <div className="state-card">
        <div className="state-emoji is-success" aria-hidden="true">🙏</div>
        <h2>Got it — thanks for reaching out!</h2>
        <p>I read every message myself, so it might take up to 24h on weekdays. In the meantime, feel free to browse the latest essays or follow along on Instagram.</p>

        <div className="related-links">
          {/* TODO: wire to creator blog URL */}
          <a href="#">📚 Read the latest blog post</a>
          {/* TODO: wire to creator Instagram URL */}
          <a href="#">📷 Follow on Instagram</a>
        </div>

        <div className="state-actions">
          {/* TODO: wire to creator home URL */}
          <a className="btn-primary" href="/">← Back to alexandra.tadaify.com</a>
          <button className="btn-ghost" type="button" onClick={onReset}>Send another message</button>
        </div>
        <p className="state-msg-id">
          Your message ID: <code>msg_8a2b91…</code> — keep it for any follow-up.
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
        <h2>Something went wrong sending that.</h2>
        <p>We couldn&apos;t deliver your message just now — your draft isn&apos;t lost, you can try again. If it keeps failing, you can email Alexandra directly.</p>
        <div className="state-actions">
          <button className="btn-primary" type="button" onClick={onReset}>Try again</button>
          {/* TODO: wire to creator email */}
          <a className="btn-ghost" href="mailto:hello@alexandrasilva.com">Email Alexandra</a>
        </div>
        <p className="state-msg-id">
          Error code: <code>SMTP_TIMEOUT · req_8a2b…</code>
        </p>
      </div>
    </div>
  );
}

function HoneypotCaughtState({ onReset }: { onReset: () => void }): ReactElement {
  return (
    <div className="state-host">
      <div className="state-card">
        <div className="state-emoji is-info" aria-hidden="true">🪤</div>
        <h2>Honeypot caught (mockup-only view)</h2>
        <p>
          The hidden honeypot field was filled in — that&apos;s a strong signal this is a bot. In production, the visitor would silently see the success screen so the spammer doesn&apos;t know they were filtered. The message <b>does not</b> reach Alexandra&apos;s inbox.
        </p>
        <div className="state-actions">
          {/* TODO: wire honeypot silent-success path in production */}
          <button className="btn-primary" type="button" onClick={() => {/* TODO */}}>See what the bot would see</button>
          <button className="btn-ghost" type="button" onClick={onReset}>Back to form</button>
        </div>
        <p className="state-msg-id">
          Filter applied: <code>honeypot:hp-website · 0 messages forwarded</code>
        </p>
      </div>
    </div>
  );
}

// ── Page root ──────────────────────────────────────────────────────────────

export function CreatorContactPage(): ReactElement {
  const [contactState, setContactState] = useState<ContactState>("default");

  const handleReset = useCallback(() => {
    setContactState("default");
  }, []);

  const renderContent = (): ReactElement => {
    switch (contactState) {
      case "submitting":
        return <SubmittingState />;
      case "success":
        return <SuccessState onReset={handleReset} />;
      case "error":
        return <ErrorState onReset={handleReset} />;
      case "honeypot-caught":
        return <HoneypotCaughtState onReset={handleReset} />;
      default:
        return (
          <>
            <HeroSection />
            <OfficeHoursStrip />
            <FaqQuickref />
            <ContactForm onStateChange={setContactState} />
            <OtherMethods />
            <PublicFooter />
          </>
        );
    }
  };

  return (
    <div className="creator-contact-page">
      <CreatorNav />
      {renderContent()}
    </div>
  );
}
