/**
 * Public Newsletter signup page — what a visitor sees at
 * tadaify.com/<handle>/subscribe. Faithful port of
 * mockups/tadaify-mvp/creator-newsletter-signup-public.html onto the shared
 * PublicChrome. A focused, single-purpose conversion page in the
 * Substack/Beehiiv landing tradition. Presentational + local React state only;
 * data from a typed fixture.
 *
 * The form layout is a creator setting chosen in the dashboard editor, so the
 * public page renders exactly ONE layout — the creator's chosen one
 * (`fixture.chosenLayout`); it is not a layout comparison. The five confirmation
 * states (the mockup demoed them via hash routing) become local state with an
 * in-view "Mockup states" strip; submitting auto-advances to success (1.5s).
 * "Subscribe" isn't a canonical nav section, so no nav item is forced active.
 *
 * @implements fr-creator-newsletter-signup-public
 */
import { useEffect, useRef, useState } from "react";
import { PublicChrome, type PublicPageId } from "../public/PublicChrome";
import { newsletterSignupContentFixture } from "./creatorNewsletterSignupPublicFixture";
import "./creator-newsletter-signup-public-proto.css";

type SignupState = "default" | "submitting" | "success" | "already" | "error";

// Subscribe is not part of the canonical creator nav, so nothing is marked
// active. Cast a non-canonical id so no nav link matches.
const NO_CURRENT = "none" as PublicPageId;

export function CreatorNewsletterSignupPublicScreen() {
  const c = newsletterSignupContentFixture();
  const [state, setState] = useState<SignupState>("default");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formInput = useRef<HTMLInputElement | null>(null);
  const formSection = useRef<HTMLElement | null>(null);
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
    setState("submitting");
  }

  function focusForm() {
    formSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    formInput.current?.focus();
  }

  return (
    <PublicChrome
      rootClassName="proto-newsletter-signup-public"
      creator={c.creator}
      current={NO_CURRENT}
      urlSuffix="subscribe"
      socials={c.footerSocials}
    >
      {state === "default" && (
        <div className="full-landing">
          {/* Hero */}
          <section className="hero">
            <div className="hero-cover" aria-hidden="true">{c.hero.cover}</div>
            <h1>{c.hero.heading}</h1>
            <p className="lede">{c.hero.lede}</p>
          </section>

          {/* Provider trust strip */}
          <div className="trust-strip">
            <span className="ts-mark">
              <span className="ts-dot" aria-hidden="true" /> {c.trust}
            </span>
          </div>

          {/* The creator's chosen signup layout (picked in the dashboard editor) —
              the public page renders exactly this one, never a comparison. */}
          {(() => {
            const layout = c.chosenLayout;
            return (
              <section className="form-section" ref={formSection}>
                <div className={`form-card${layout.id === "card" ? " form-cardlayout" : ""}`}>
                  {layout.id === "card" && (
                    <>
                      <div className="fc-icon" aria-hidden="true">{layout.cardIcon}</div>
                      <p className="fc-prompt">{layout.cardPrompt}</p>
                    </>
                  )}
                  <form
                    className={layout.id === "oneline" ? "form-oneline" : "form-twoline"}
                    onSubmit={onSubmit}
                  >
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@email.com"
                      required
                      ref={formInput}
                      aria-label="Email address"
                    />
                    <button className="form-btn" type="submit">
                      {layout.id === "oneline" && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      )}
                      {layout.button}
                    </button>
                  </form>
                  <div className={`consent${layout.id === "card" ? " is-center" : ""}`}>
                    <input type="checkbox" id={`nl-consent-${layout.id}`} defaultChecked />
                    <label htmlFor={`nl-consent-${layout.id}`}>
                      I agree to receive emails from Alexandra and accept the{" "}
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
                </div>
              </section>
            );
          })()}

          {/* Social proof */}
          <section className="proof-strip">
            <div className="proof-count">
              {c.proofCount.lead}
              <b>{c.proofCount.count}</b>
              {c.proofCount.tail}
            </div>
            <div className="proof-quotes">
              {c.proofQuotes.map((p) => (
                <div className="proof-quote" key={p.author}>
                  "{p.quote}"<span className="pq-author">{p.author}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What you'll get */}
          <section className="wyg">
            <h2>{c.wygHeading}</h2>
            <ul>
              {c.wyg.map((it) => (
                <li key={it.text}>
                  <span className="wyg-emoji" aria-hidden="true">{it.emoji}</span>
                  <span className="wyg-text">{it.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Past issues */}
          <section className="past">
            <h2>{c.pastHeading}</h2>
            <p className="past-sub">{c.pastSub}</p>
            <div className="past-grid">
              {c.pastIssues.map((issue) => (
                <button
                  type="button"
                  className="past-card"
                  key={issue.title}
                  onClick={() => window.alert(`Mockup — would open "${issue.title}"`)}
                >
                  <span className={`pc-cover${issue.coverTone ? ` t-${issue.coverTone}` : ""}`} aria-hidden="true">
                    {issue.cover}
                  </span>
                  <span className="pc-body">
                    <span className="pc-title">{issue.title}</span>
                    <span className="pc-excerpt">{issue.excerpt}</span>
                    <span className="pc-meta">{issue.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="faq">
            <h2>{c.faqHeading}</h2>
            {c.faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div className={`faq-row${isOpen ? " is-open" : ""}`} key={f.q}>
                  <button
                    type="button"
                    className="faq-summary"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    {f.q}
                    <span className="faq-mark" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <div className="faq-a">{f.a}</div>}
                </div>
              );
            })}
          </section>

          {/* Footer CTA */}
          <section className="closer">
            <h2>{c.closer.heading}</h2>
            <button className="closer-btn" type="button" onClick={focusForm}>
              {c.closer.button}
            </button>
            <div className="fallback">
              Or follow on{" "}
              <button type="button" className="link-btn" onClick={() => window.alert("Mockup — opens Instagram")}>Instagram</button>,{" "}
              <button type="button" className="link-btn" onClick={() => window.alert("Mockup — opens TikTok")}>TikTok</button> and{" "}
              <button type="button" className="link-btn" onClick={() => window.alert("Mockup — opens YouTube")}>YouTube</button> — links in your bio.
            </div>
          </section>
        </div>
      )}

      {state === "submitting" && (
        <div className="state-host">
          <div className="state-card">
            <div className="spinner" aria-hidden="true" />
            <h2>Adding you to the list…</h2>
            <p>Hold tight — we're handing your email to Kit. This usually takes a second.</p>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="state-host">
          <div className="state-card">
            <div className="state-emoji is-success" aria-hidden="true">🎉</div>
            <h2>Thanks for subscribing!</h2>
            <p>Check your inbox for a confirmation email — click the link inside to lock it in. (Sometimes it lands in Promotions; the first one's a doozy of a "drag me to Primary".)</p>
            <div className="state-actions">
              <a className="btn-primary" href="/__proto/creator-public">← Back to alexandra.tadaify.com</a>
              <button className="btn-ghost" type="button" onClick={() => window.alert("Mockup — adds Alexandra to your contacts")}>Add Alexandra to your contacts</button>
            </div>
            <p className="state-foot">
              Didn't get the confirmation email?{" "}
              <button type="button" className="link-btn" onClick={() => window.alert("Mockup — resends the confirmation email")}>Resend it</button>.
            </p>
          </div>
        </div>
      )}

      {state === "already" && (
        <div className="state-host">
          <div className="state-card">
            <div className="state-emoji is-info" aria-hidden="true">👋</div>
            <h2>Looks like you're already on the list.</h2>
            <p>You subscribed with this email back on March 14. No need to sign up again — your next Tuesday note is on the way.</p>
            <div className="state-actions">
              <button className="btn-primary" type="button" onClick={() => window.alert("Mockup — opens Kit subscription management")}>Manage your subscription on Kit →</button>
              <a className="btn-ghost" href="/__proto/creator-public">← Back to main page</a>
            </div>
            <p className="state-foot">
              Wrong email?{" "}
              <button type="button" className="link-btn" onClick={() => setState("default")}>Use a different one</button>.
            </p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="state-host">
          <div className="state-card">
            <div className="state-emoji is-error" aria-hidden="true">😬</div>
            <h2>Something went wrong on our end.</h2>
            <p>We couldn't reach Kit just now. Your email isn't saved — could you try again in a moment? If it keeps failing, you can email Alexandra directly.</p>
            <div className="state-actions">
              <button className="btn-primary" type="button" onClick={() => setState("default")}>Try again</button>
              <a className="btn-ghost" href="mailto:hello@alexandrasilva.com">Email Alexandra</a>
            </div>
            <p className="state-foot">Error code: <code>KIT_API_502 · req_8a2b…</code></p>
          </div>
        </div>
      )}

      {/* Mockup-only in-view state switcher (replaces the mockup's hash routes). */}
      <div className="state-strip" aria-label="Mockup states">
        <span>Mockup states (try each):</span>
        {(
          [
            ["default", "Default"],
            ["submitting", "Submitting"],
            ["success", "Success"],
            ["already", "Already subscribed"],
            ["error", "Error"],
          ] as [SignupState, string][]
        ).map(([s, label]) => (
          <button
            key={s}
            type="button"
            className={state === s ? "is-active" : undefined}
            onClick={() => setState(s)}
          >
            {label}
          </button>
        ))}
        <span className="ss-note">visitor only ever sees one of these at a time</span>
      </div>
    </PublicChrome>
  );
}
