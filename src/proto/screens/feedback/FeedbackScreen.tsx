/**
 * Feedback — the creator-facing surface to send feedback / bug reports to the
 * tadaify product team, opened from the "Feedback" entry at the bottom of the
 * dashboard sidebar. Faithful port of mockups/tadaify-mvp/app-feedback.html.
 *
 * Presentational, local-state only: three quick-pick cards that pre-select the
 * topic and scroll to the form, plus the feedback form (topic select, title,
 * body, contact-back checkbox, submit). Data comes from the typed
 * feedbackFixture. Submission is mocked — the surface only proves the route
 * exists and shows the shape. It renders inside the shared dashboard chrome.
 *
 * @implements fr-feedback
 * @implements fr-globalui-view-layout
 */
import { useRef, useState } from "react";
import "./feedback-proto.css";
import { DashboardChrome } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { feedbackFixture, type FeedbackTopic } from "./feedbackFixture";

export function FeedbackScreen() {
  const profile = dashboardProfileFixture();
  const fx = feedbackFixture();

  const [topic, setTopic] = useState<FeedbackTopic>("bug");
  const [contactBack, setContactBack] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  const pickTopic = (next: FeedbackTopic) => {
    setTopic(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardChrome profile={profile} activeNav="feedback">
      <section className="proto-feedback" aria-labelledby="feedback-title">
        <div className="page-head">
          <div>
            <h1 id="feedback-title">{fx.heading}</h1>
            <p className="fb-sub">{fx.sub}</p>
          </div>
        </div>

        <div className="fb-grid">
          {fx.cards.map((c) => (
            <button
              key={c.topic}
              type="button"
              className={`fb-card fb-card-${c.accent}`}
              onClick={() => pickTopic(c.topic)}
            >
              <span className="fb-card-ic" aria-hidden>{c.icon}</span>
              <span className="fb-card-ttl">{c.title}</span>
              <span className="fb-card-desc">{c.desc}</span>
            </button>
          ))}
        </div>

        <form
          ref={formRef}
          className="fb-form-card"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Mockup — feedback would go to product@tadaify.com.");
          }}
        >
          <h3 className="fb-form-ttl">{fx.form.heading}</h3>
          <p className="fb-form-sub">
            We aim to reply within 1 business day. For urgent issues, email{" "}
            <a className="fb-link" href={`mailto:${fx.form.supportEmail}`}>
              {fx.form.supportEmail}
            </a>
            .
          </p>

          <div className="fb-field">
            <label htmlFor="fb-topic">What is this about?</label>
            <select
              id="fb-topic"
              className="fb-control"
              value={topic}
              onChange={(e) => setTopic(e.target.value as FeedbackTopic)}
            >
              {fx.form.topics.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="fb-field">
            <label htmlFor="fb-title">Short title</label>
            <input
              id="fb-title"
              className="fb-control"
              type="text"
              placeholder={fx.form.titlePlaceholder}
              required
            />
          </div>

          <div className="fb-field">
            <label htmlFor="fb-body">Tell us more</label>
            <textarea
              id="fb-body"
              className="fb-control fb-area"
              placeholder={fx.form.bodyPlaceholder}
              required
            />
          </div>

          <div className="fb-field-row">
            <input
              id="fb-contact"
              type="checkbox"
              checked={contactBack}
              onChange={(e) => setContactBack(e.target.checked)}
            />
            <label htmlFor="fb-contact" className="fb-contact-label">
              {fx.form.contactLabel}
            </label>
          </div>

          <div className="fb-form-actions">
            <button type="submit" className="btn btn-primary">{fx.form.submitLabel}</button>
            <a className="btn btn-ghost" href="/__proto/dashboard">Cancel</a>
          </div>
        </form>
      </section>
    </DashboardChrome>
  );
}
