/**
 * Public Contact page — what a visitor sees at tadaify.com/<handle>/contact.
 * Faithful port of mockups/tadaify-mvp/creator-contact-public.html onto the
 * shared PublicChrome. Presentational + local React state only; data from a
 * typed fixture.
 *
 * The mockup demoed its confirmation states via hash routing (#/submitting,
 * #/success, #/error, #/honeypot-caught). Here those become local state with an
 * in-view "Mockup states" strip so reviewers can jump between them without a
 * router. Submitting auto-advances to success; the honeypot path is mocked.
 *
 * @implements fr-creator-contact-public
 */
import { useEffect, useRef, useState } from "react";
import { PublicChrome } from "../public/PublicChrome";
import { contactContentFixture } from "./creatorContactPublicFixture";
import "./creator-contact-public-proto.css";

type FormState = "form" | "submitting" | "success" | "error" | "honeypot";

export function CreatorContactPublicScreen() {
  const c = contactContentFixture();
  const [state, setState] = useState<FormState>("form");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [honeypot, setHoneypot] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Submitting auto-advances to success, mirroring the mockup's 1.5s timeout.
  useEffect(() => {
    if (state === "submitting") {
      timerRef.current = setTimeout(() => setState("success"), 1500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot.trim() !== "") {
      setState("honeypot");
      return;
    }
    const form = e.currentTarget;
    const next: Record<string, boolean> = {};
    for (const id of ["name", "email", "message"]) {
      const el = form.elements.namedItem(id) as HTMLInputElement | null;
      if (!el || el.value.trim() === "") next[id] = true;
    }
    const consent = form.elements.namedItem("consent") as HTMLInputElement | null;
    if (!consent?.checked) next.consent = true;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setState("submitting");
  }

  return (
    <PublicChrome
      rootClassName="proto-contact-public"
      creator={c.creator}
      current="contact"
      urlSuffix="contact"
      socials={c.footerSocials}
    >
      {state === "form" && (
        <>
          <section className="contact-hero">
            <div className="hero-icon" aria-hidden="true">{c.hero.icon}</div>
            <h1>{c.hero.heading}</h1>
            <p className="lede">{c.hero.lede}</p>
          </section>

          <div className="hours-strip">
            <span className="hs-mark">
              <span className="hs-dot" aria-hidden="true" /> {c.hours}
            </span>
          </div>

          <section className="faq-quick" aria-labelledby="cf-faq-h">
            <h2 id="cf-faq-h">{c.faqHeading}</h2>
            {c.faqs.map((f, i) => (
              <div className={`faq-row${openFaq === i ? " is-open" : ""}`} key={f.q}>
                <button
                  type="button"
                  className="faq-summary"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <span className="faq-mark" aria-hidden="true">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </section>

          <section className="form-section">
            <div className="form-card">
              <form className="form-grid" onSubmit={onSubmit} noValidate>
                <div className={`field${errors.name ? " has-error" : ""}`}>
                  <label className="field-label" htmlFor="cf-name">
                    Name<span className="req" aria-hidden="true">*</span>
                  </label>
                  <input className="field-input" id="cf-name" name="name" type="text" placeholder="Your name" />
                </div>

                <div className={`field${errors.email ? " has-error" : ""}`}>
                  <label className="field-label" htmlFor="cf-email">
                    Email<span className="req" aria-hidden="true">*</span>
                  </label>
                  <input className="field-input" id="cf-email" name="email" type="email" placeholder="you@example.com" />
                  <div className="field-help">We'll only use this to reply to you.</div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="cf-subject">Subject</label>
                  <input className="field-input" id="cf-subject" name="subject" type="text" placeholder="What's this about?" />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="cf-inquiry">Inquiry type</label>
                  <select className="field-select" id="cf-inquiry" name="inquiry" defaultValue="">
                    <option value="">Select one…</option>
                    {c.inquiryTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className={`field full${errors.message ? " has-error" : ""}`}>
                  <label className="field-label" htmlFor="cf-message">
                    Message<span className="req" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    className="field-area"
                    id="cf-message"
                    name="message"
                    placeholder="Tell me what you're working on, what you'd like help with, and any timeline you have in mind…"
                  />
                </div>

                {/* Honeypot — visually hidden, must stay empty. */}
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="cf-hp">Don't fill this in</label>
                  <input
                    id="cf-hp"
                    name="hp-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className={`consent${errors.consent ? " has-error" : ""}`}>
                  <input type="checkbox" id="cf-consent" name="consent" />
                  <label htmlFor="cf-consent">
                    I agree to my data being stored to receive a reply, and I accept the{" "}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => window.alert("Mockup — opens the privacy policy")}
                    >
                      privacy policy
                    </button>
                    .
                  </label>
                </div>

                <div className="submit-row">
                  <button className="form-btn" type="submit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send message
                  </button>
                  <span className="submit-meta">Spam-protected · GDPR-friendly</span>
                </div>
              </form>
            </div>
          </section>

          <section className="other" aria-labelledby="cf-other-h">
            <h2 id="cf-other-h">Other ways to reach me</h2>
            <div className="om-grid">
              {c.methods.map((m) => (
                <a className="om-card" href={m.href} key={m.label} target="_blank" rel="noopener noreferrer">
                  <div className="om-icon" aria-hidden="true">{m.icon}</div>
                  <div className="om-body">
                    <div className="om-label">{m.label}</div>
                    <div className="om-value">{m.value}</div>
                  </div>
                </a>
              ))}

              <div className="address-card">
                <div className="ac-text">
                  <div className="ac-icon" aria-hidden="true">📍</div>
                  <div className="ac-body">
                    <div className="om-label">{c.address.label}</div>
                    <div className="om-value">{c.address.value}</div>
                  </div>
                </div>
                <div className="ac-map" aria-label="Map embed (placeholder)">📍</div>
              </div>

              <div className="socials-inline">
                {c.inlineSocials.map((s) => (
                  <a className="si-link" href={s.href} key={s.label} target="_blank" rel="noopener noreferrer">
                    {s.glyph} {s.label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {state === "submitting" && (
        <div className="state-host">
          <div className="state-card">
            <div className="spinner" aria-hidden="true" />
            <h2>Sending your message…</h2>
            <p>Hold tight — Alexandra's inbox is just a moment away. We're delivering your message + (optionally) a copy to her tadaify inbox.</p>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="state-host">
          <div className="state-card">
            <div className="state-emoji is-success" aria-hidden="true">🙏</div>
            <h2>Got it — thanks for reaching out!</h2>
            <p>I read every message myself, so it might take up to 24h on weekdays. In the meantime, feel free to browse the latest essays or follow along on Instagram.</p>
            <div className="related-links">
              <a href="/__proto/creator-blog-public">📚 Read the latest blog post</a>
              <button type="button" onClick={() => window.alert("Mockup — opens Instagram")}>📷 Follow on Instagram</button>
            </div>
            <div className="state-actions">
              <a className="btn-primary" href="/__proto/creator-public">← Back to alexandra.tadaify.com</a>
              <button className="btn-ghost" type="button" onClick={() => setState("form")}>Send another message</button>
            </div>
            <p className="state-foot">Your message ID: <code>msg_8a2b91…</code> — keep it for any follow-up.</p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="state-host">
          <div className="state-card">
            <div className="state-emoji is-error" aria-hidden="true">😬</div>
            <h2>Something went wrong sending that.</h2>
            <p>We couldn't deliver your message just now — your draft isn't lost, you can try again. If it keeps failing, you can email Alexandra directly.</p>
            <div className="state-actions">
              <button className="btn-primary" type="button" onClick={() => setState("form")}>Try again</button>
              <a className="btn-ghost" href="mailto:hello@alexandrasilva.com">Email Alexandra</a>
            </div>
            <p className="state-foot">Error code: <code>SMTP_TIMEOUT · req_8a2b…</code></p>
          </div>
        </div>
      )}

      {state === "honeypot" && (
        <div className="state-host">
          <div className="state-card">
            <div className="state-emoji is-info" aria-hidden="true">🪤</div>
            <h2>Honeypot caught (mockup-only view)</h2>
            <p>The hidden honeypot field was filled in — that's a strong signal this is a bot. In production, the visitor would silently see the success screen so the spammer doesn't know they were filtered. The message <b>does not</b> reach Alexandra's inbox.</p>
            <div className="state-actions">
              <button className="btn-primary" type="button" onClick={() => setState("success")}>See what the bot would see</button>
              <button className="btn-ghost" type="button" onClick={() => { setHoneypot(""); setState("form"); }}>Back to form</button>
            </div>
            <p className="state-foot">Filter applied: <code>honeypot:hp-website · 0 messages forwarded</code></p>
          </div>
        </div>
      )}

      {/* Mockup-only in-view state switcher (replaces the mockup's hash routes). */}
      <div className="state-strip" aria-label="Mockup states">
        <span>Mockup states (try each):</span>
        {(["form", "submitting", "success", "error", "honeypot"] as FormState[]).map((s) => (
          <button
            key={s}
            type="button"
            className={state === s ? "is-active" : undefined}
            onClick={() => { if (s === "form") setHoneypot(""); setState(s); }}
          >
            {s === "form" ? "Default" : s === "honeypot" ? "Honeypot caught" : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="ss-note">visitor only ever sees one of these at a time</span>
      </div>
    </PublicChrome>
  );
}
