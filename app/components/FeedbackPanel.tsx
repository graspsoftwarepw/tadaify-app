/**
 * FeedbackPanel — main content area for /app?tab=feedback.
 *
 * Visual contract: mockups/tadaify-mvp/app-feedback.html (198 LOC).
 * Every section, class name, ARIA label, text node, and stub value is mirrored
 * verbatim from the mockup. Styling lives in `app/styles/app-dashboard.css`
 * under `.app-dashboard-root .main-feedback` (appended block headed
 * "FEEDBACK PANEL"). Mount must occur inside an ancestor carrying
 * `.app-dashboard-root` — the route component wraps `<main>` accordingly.
 *
 * Out of scope this pass (matches the mockup's stub behaviour):
 *   - Real feedback submission — form submit is stubbed with window.alert.
 *
 * Story: app-feedback mockup-fidelity pass (TADA-BUG-005).
 * Covers: 1:1 match with `mockups/tadaify-mvp/app-feedback.html`.
 */

import { useCallback, useRef } from "react";

export function FeedbackPanel() {
  const formRef = useRef<HTMLFormElement>(null);

  // Smooth scroll to the form when a topic card is clicked.
  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Pre-fill topic select and scroll to form on card click.
  const handleCardClick = useCallback(
    (topic: "bug" | "idea" | "other") => {
      const select = document.getElementById("topic") as unknown as HTMLSelectElement;
      if (select) {
        select.value = topic;
      }
      scrollToForm();
    },
    [scrollToForm]
  );

  // Form submit handler — stub alert per mockup.
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire to feedback API
    if (typeof window !== "undefined") {
      window.alert(
        "Mockup — feedback would go to product@tadaify.com."
      );
    }
  }, []);

  return (
    <section
      className="main-feedback"
      data-testid="feedback-panel"
      aria-labelledby="feedback-title"
    >
      {/* ── Page head ───────────────────────────────────────────────────── */}
      <div className="page-head">
        <h1 id="feedback-title">Feedback</h1>
        <p className="sub">
          Tell us what's working, what isn't, and what you wish tadaify did. We
          read everything — read receipts ON.
        </p>
      </div>

      {/* ── Topic cards grid ────────────────────────────────────────────── */}
      <div className="fb-grid">
        <button
          type="button"
          className="fb-card"
          onClick={() => handleCardClick("bug")}
          aria-label="Report a bug"
        >
          <div className="ic">🐞</div>
          <div className="ttl">Report a bug</div>
          <div className="desc">
            Something broken, slow, or visually off. Screenshot welcome.
          </div>
        </button>
        <button
          type="button"
          className="fb-card warm"
          onClick={() => handleCardClick("idea")}
          aria-label="Suggest a feature"
        >
          <div className="ic">💡</div>
          <div className="ttl">Suggest a feature</div>
          <div className="desc">
            A block, integration, or workflow you wish existed.
          </div>
        </button>
        <button
          type="button"
          className="fb-card green"
          onClick={() => handleCardClick("other")}
          aria-label="General feedback"
        >
          <div className="ic">💬</div>
          <div className="ttl">General feedback</div>
          <div className="desc">
            Anything else — pricing, tone, docs, onboarding, vibe.
          </div>
        </button>
      </div>

      {/* ── Feedback form ───────────────────────────────────────────────── */}
      <form
        ref={formRef}
        className="form-card"
        id="fb-form"
        onSubmit={handleSubmit}
      >
        <h3>Send us feedback</h3>
        <p className="form-sub">
          We aim to reply within 1 business day. For urgent issues, email{" "}
          <a href="mailto:support@tadaify.com">support@tadaify.com</a>.
        </p>

        {/* Topic select */}
        <div className="field">
          <label htmlFor="topic">What is this about?</label>
          <select id="topic" name="topic">
            <option value="bug">🐞 Bug report</option>
            <option value="idea">💡 Feature idea</option>
            <option value="other">💬 General feedback</option>
          </select>
        </div>

        {/* Title input */}
        <div className="field">
          <label htmlFor="title">Short title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Schedule block fails on mobile Safari"
            required
          />
        </div>

        {/* Body textarea */}
        <div className="field">
          <label htmlFor="body">Tell us more</label>
          <textarea
            id="body"
            name="body"
            placeholder="What were you trying to do? What happened? What did you expect?"
            required
          />
        </div>

        {/* Contact checkbox */}
        <div className="field-row">
          <input
            type="checkbox"
            id="contact"
            name="contact"
            defaultChecked
          />
          <label htmlFor="contact">
            It's OK to email me back at my account address.
          </label>
        </div>

        {/* Form actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Send feedback
          </button>
          <a href="/app" className="btn btn-ghost">
            Cancel
          </a>
        </div>
      </form>
    </section>
  );
}
