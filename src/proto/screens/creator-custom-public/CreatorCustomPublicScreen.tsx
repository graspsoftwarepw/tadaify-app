/**
 * Public Custom page — what a visitor sees at tadaify.com/<handle>/<slug>
 * (a creator-named URL such as /press-kit). Faithful port of
 * mockups/tadaify-mvp/creator-custom-public.html onto the shared PublicChrome.
 * The page renders the creator's block list as a vertical stack — the same
 * patterns as the homepage block render, but at a custom slug. Presentational
 * + local React state only; data from a typed fixture.
 *
 * The mockup demoed three sub-views via hash routing (#/ full page,
 * #/password Pro+ gate, #/blocks-empty placeholder). Here those become local
 * state with an in-view "Mockup states" strip so reviewers can jump between
 * them without a router. The custom slug isn't a canonical nav section, so no
 * nav item is forced active.
 *
 * @implements fr-creator-custom-public
 */
import { useState } from "react";
import { PublicChrome, type PublicPageId } from "../public/PublicChrome";
import { customContentFixture } from "./creatorCustomPublicFixture";
import "./creator-custom-public-proto.css";

type ViewState = "page" | "password" | "empty";

// Custom slugs are not part of the canonical creator nav, so nothing is
// marked active. Cast a non-canonical id so no nav link matches.
const NO_CURRENT = "none" as PublicPageId;

export function CreatorCustomPublicScreen() {
  const c = customContentFixture();
  const [state, setState] = useState<ViewState>("page");
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [openAcc, setOpenAcc] = useState<Record<string, number | null>>({});

  function onUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pw.trim() === c.password) {
      setPwError(false);
      setPw("");
      setState("page");
    } else {
      setPwError(true);
    }
  }

  return (
    <PublicChrome
      rootClassName="proto-custom-public"
      creator={c.creator}
      current={NO_CURRENT}
      urlSuffix={c.slug}
      socials={c.footerSocials}
    >
      {state === "page" && (
        <>
          <div className="page-hero">
            <h1>{c.hero.title}</h1>
            <p className="page-sub">{c.hero.sub}</p>
          </div>

          <div className="blocks">
            {c.blocks.map((b, i) => {
              if (b.kind === "image") {
                return (
                  <figure className="b-image" key={i}>
                    <div className="ph" aria-label={`Photo: ${b.caption}`}>
                      {b.caption}
                    </div>
                  </figure>
                );
              }
              if (b.kind === "heading") {
                return (
                  <div key={i}>
                    <div className={`b-heading ${b.level}`}>{b.text}</div>
                    {b.sub && <p className="b-heading-sub">{b.sub}</p>}
                  </div>
                );
              }
              if (b.kind === "link") {
                return (
                  <button
                    type="button"
                    className={`b-link${b.warm ? " is-warm" : ""}`}
                    key={i}
                    onClick={() =>
                      window.alert(`Mockup — would open "${b.label}"`)
                    }
                  >
                    <span>{b.label}</span>
                    {b.meta && <span className="b-link-meta">{b.meta}</span>}
                  </button>
                );
              }
              if (b.kind === "divider") {
                return <hr className="b-divider" key={i} />;
              }
              if (b.kind === "accordion") {
                const openIdx = openAcc[i] ?? (b.items.findIndex((it) => it.open) >= 0 ? b.items.findIndex((it) => it.open) : null);
                return (
                  <div className="b-accordion" key={i}>
                    {b.items.map((it, j) => {
                      const isOpen = openIdx === j;
                      return (
                        <div className="b-acc-item" key={j}>
                          <button
                            type="button"
                            className="b-acc-summary"
                            aria-expanded={isOpen}
                            onClick={() =>
                              setOpenAcc((prev) => ({
                                ...prev,
                                [i]: isOpen ? null : j,
                              }))
                            }
                          >
                            {it.q}
                            <span className="b-acc-mark" aria-hidden="true">
                              {isOpen ? "−" : "+"}
                            </span>
                          </button>
                          {isOpen && <div className="b-acc-body">{it.a}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              }
              // newsletter
              return (
                <div className="b-newsletter" key={i}>
                  <h3>{b.heading}</h3>
                  <p>{b.body}</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      window.alert("Mockup — submits to the provider; shows a checkmark");
                    }}
                  >
                    <input type="email" placeholder={b.placeholder} required />
                    <button type="submit">{b.button}</button>
                  </form>
                  <div className="b-nl-trust">{b.trust}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {state === "password" && (
        <div className="lock-screen">
          <div className="lock-emoji" aria-hidden="true">🔒</div>
          <h2>This page is private</h2>
          <p>
            The creator has password-protected this page. Enter the password
            they shared with you to continue.
          </p>
          <form className="lock-form" onSubmit={onUnlock}>
            <input
              type="password"
              className={pwError ? "is-error" : undefined}
              placeholder="Enter password"
              autoComplete="off"
              aria-label="Page password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                if (pwError) setPwError(false);
              }}
            />
            {pwError && (
              <div className="lock-error">
                That password doesn't match. Try again or contact the creator.
              </div>
            )}
            <button type="submit">Unlock page</button>
          </form>
          <div className="lock-link">
            Forgot the password?{" "}
            <a href="/__proto/creator-contact-public">Contact Alexandra →</a>
          </div>
          <div className="lock-hint">
            Mockup hint: try <b>{c.password}</b> (set in the editor).
          </div>
        </div>
      )}

      {state === "empty" && (
        <div className="empty-screen">
          <div className="empty-emoji" aria-hidden="true">🚧</div>
          <h2>This page is being built</h2>
          <p>
            Alexandra hasn't added content here yet. Check back soon — or visit
            one of the pages below in the meantime.
          </p>
          <div className="es-other-pages">
            {c.otherPages.map((p) => (
              <a href={p.href} key={p.label}>
                {p.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mockup-only in-view state switcher (replaces the mockup's hash routes). */}
      <div className="state-strip" aria-label="Mockup states">
        <span>Mockup states (try each):</span>
        {(
          [
            ["page", "Page"],
            ["password", "🔒 Password gate"],
            ["empty", "Empty state"],
          ] as [ViewState, string][]
        ).map(([s, label]) => (
          <button
            key={s}
            type="button"
            className={state === s ? "is-active" : undefined}
            onClick={() => {
              setPw("");
              setPwError(false);
              setState(s);
            }}
          >
            {label}
          </button>
        ))}
        <span className="ss-note">visitor only ever sees one of these at a time</span>
      </div>
    </PublicChrome>
  );
}
