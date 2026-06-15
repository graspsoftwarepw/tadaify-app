/**
 * MarketingChrome — the shared marketing shell for tadaify's public marketing
 * pages (landing, pricing). Carries the sticky top nav (brand wordmark, section
 * links, CTA buttons, a mobile drawer toggle) and the dark footer, faithfully
 * ported from `mockups/tadaify-mvp/landing.html` (nav `.nav`, footer).
 *
 * Intra-prototype targets are real `/__proto/*` links (Login → register,
 * Pricing → pricing). Marketing sub-pages that have no prototype screen yet
 * (Templates, Trust, Docs, footer columns, "ask AI" links) are mocked via a
 * `type="button"` + `window.alert(...)` so the shell never ships a dead
 * placeholder link. The mobile nav drawer is driven by local `useState`.
 *
 * Shared infrastructure: this component carries NO per-page requirement
 * marker and is intentionally absent from every marketing FR's related_files.
 * The per-page FRs reference it in prose / related_requirements only.
 */
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "../../lib/ThemeToggle";
import "./marketing-chrome.css";

/** The locked tada!ify brand lockup (variant F spans). Token-coloured. */
function BrandWordmark() {
  return (
    <span className="mk-wm" aria-label="tada!ify">
      <span className="ta" aria-hidden>
        ta
      </span>
      <span className="da" aria-hidden>
        da!
      </span>
      <span className="ify" aria-hidden>
        ify
      </span>
    </span>
  );
}

const mockAlert = (label: string) => () =>
  window.alert(`${label} (prototype)`);

/** Top-nav section links. `href` → real prototype route; otherwise mocked. */
const NAV_LINKS: { label: string; href?: string }[] = [
  { label: "Pricing", href: "/__proto/pricing" },
  { label: "Templates" },
  { label: "Trust" },
  { label: "Docs" },
];

const FOOTER_COLS: { heading: string; items: string[] }[] = [
  { heading: "Product", items: ["Pricing", "Templates", "Trust", "Roadmap", "Status", "Changelog"] },
  { heading: "Creators", items: ["Creator Directory", "Help Center", "Migrate your page", "FAQ"] },
  { heading: "Developers", items: ["API reference", "Webhooks", "OAuth", "API changelog"] },
  { heading: "Company", items: ["Blog", "Manifesto", "Contact", "Privacy", "Terms"] },
];

const ASK_AI = ["ChatGPT", "Claude", "Gemini", "Perplexity", "Grok"];

export function MarketingChrome({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="proto-root proto-marketing">
      {/* Sticky top nav. */}
      <nav className="mk-nav" aria-label="Primary">
        <div className="mk-container mk-nav-inner">
          <a className="mk-nav-brand" href="/__proto" aria-label="tadaify home">
            <BrandWordmark />
          </a>

          <div className="mk-nav-links">
            {NAV_LINKS.map((link) =>
              link.href ? (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ) : (
                <button key={link.label} type="button" onClick={mockAlert(link.label)}>
                  {link.label}
                </button>
              ),
            )}
          </div>

          <div className="mk-nav-cta">
            <a className="btn btn-ghost" href="/__proto/login">
              Login
            </a>
            <a className="btn btn-warm" href="/__proto/register">
              Claim your handle
            </a>
            <ThemeToggle />
            <button
              type="button"
              className="mk-nav-mobile-toggle"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {drawerOpen ? (
          <div className="mk-nav-drawer">
            {NAV_LINKS.map((link) =>
              link.href ? (
                <a key={link.label} href={link.href} onClick={() => setDrawerOpen(false)}>
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    mockAlert(link.label)();
                  }}
                >
                  {link.label}
                </button>
              ),
            )}
            <a href="/__proto/login" onClick={() => setDrawerOpen(false)}>
              Login
            </a>
          </div>
        ) : null}
      </nav>

      {children}

      {/* Dark footer. */}
      <footer className="mk-footer">
        <div className="mk-container">
          <div className="mk-foot-grid">
            {FOOTER_COLS.map((col) => (
              <div key={col.heading} className="mk-foot-col">
                <h4>{col.heading}</h4>
                <ul>
                  {col.items.map((item) => (
                    <li key={item}>
                      {item === "Pricing" ? (
                        <a href="/__proto/pricing">{item}</a>
                      ) : (
                        <button type="button" onClick={mockAlert(item)}>
                          {item}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mk-ask-ai">
            <span className="mk-label">Ask AI about tadaify:</span>
            <div className="mk-ai-links">
              {ASK_AI.map((ai) => (
                <button key={ai} type="button" onClick={mockAlert(`Ask ${ai}`)}>
                  {ai}
                </button>
              ))}
            </div>
          </div>

          <div className="mk-foot-bottom">
            <BrandWordmark />
            <span>© 2026 tadaify. Made by creators, for creators.</span>
            <span className="mk-foot-legal">
              <button type="button" onClick={mockAlert("Privacy")}>
                Privacy
              </button>
              {" · "}
              <button type="button" onClick={mockAlert("Terms")}>
                Terms
              </button>
              {" · "}
              <button type="button" onClick={mockAlert("Cookies")}>
                Cookies
              </button>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
