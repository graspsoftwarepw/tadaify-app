/**
 * CreatorFaqPage — public FAQ / Help Center page render.
 *
 * Visitor view at tadaify.com/<handle>/faq. Renders the FAQ the creator
 * authored, with live search, tag-chip filters, sticky TOC, scroll-spy,
 * per-question permalink copy, and "was this helpful?" thumbs.
 *
 * Sub-views via in-page hash routing:
 *   #/                  → full FAQ (all sections expanded)
 *   #/section/<slug>    → single section deep-link
 *   #/q/<slug>          → single question deep-link (auto-expands + scrolls)
 *   #/search?q=<query>  → search results across all sections
 *   #/tag/<slug>        → tag filter view
 *
 * All outbound link/CTA actions stubbed with TODO comments.
 * Dead-code: NOT wired to app/routes.ts — added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-faq.css
 */

import type { ReactElement } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import "~/styles/public-pages/creator-faq.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QaItem {
  id: string;
  question: string;
  answer: ReactElement;
  tags: string[];
}

interface FaqSection {
  id: string;
  slug: string;
  icon: string;
  title: string;
  intro: string;
  count: number;
  items: QaItem[];
}

// ---------------------------------------------------------------------------
// Static data (mirrors mockup content exactly)
// ---------------------------------------------------------------------------

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "section-account",
    slug: "account",
    icon: "🔑",
    title: "Account & access",
    intro: "Everything about logging in, downloads, and getting back into your training plan.",
    count: 8,
    items: [
      {
        id: "q-reset-password",
        question: "How do I reset my password?",
        tags: ["login"],
        answer: (
          <>
            <p>
              Go to{" "}
              <a href="#" style={{ color: "var(--brand-primary)" }}>
                tadaify.com/login
              </a>{" "}
              and click "Forgot password". You'll get a reset link by email
              within 60 seconds. The link is valid for 1 hour.
            </p>
            <p>
              If the email never arrives, check spam first — Gmail occasionally
              filters reset emails. Still missing? DM me and I'll send a manual
              reset.
            </p>
          </>
        ),
      },
      {
        id: "q-download-pdf",
        question: "Where can I download the training PDF after I bought it?",
        tags: ["downloads", "post-purchase"],
        answer: (
          <>
            <p>
              After checkout you'll get an email from{" "}
              <code>no-reply@tadaify.com</code> with your download link. The
              link is also pinned in your account at tadaify.com/alexandra/account.
            </p>
            <p>Heads up:</p>
            <ul>
              <li>
                The link expires after 30 days, but you can re-generate it from
                your account.
              </li>
              <li>
                The PDF is watermarked with your email — please don't share it
                publicly.
              </li>
            </ul>
            <p>
              If the email never arrived, check spam first, then DM me — I'll
              resend within an hour.
            </p>
          </>
        ),
      },
      {
        id: "q-share-account",
        question: "Can I share my account with my workout partner?",
        tags: ["policy", "login"],
        answer: (
          <p>
            Account sharing isn't allowed — each plan is licensed per person.
            If you'd like to train together, the second account is 50% off with
            code <code>TRAIN2GETHER</code> at checkout.
          </p>
        ),
      },
    ],
  },
  {
    id: "section-billing",
    slug: "billing",
    icon: "💳",
    title: "Billing & refunds",
    intro: "30-day money-back guarantee. Stripe handles all payments — your card details never touch my server.",
    count: 12,
    items: [
      {
        id: "q-refund-policy",
        question: "What's your refund policy?",
        tags: ["refund", "policy"],
        answer: (
          <>
            <p>
              You get <b>30 days</b> from purchase to ask for a full refund —
              no questions asked. Just reply to your purchase confirmation email
              and I'll refund you within 24 hours.
            </p>
            <p>
              The only exception is custom 1:1 plans — once I've delivered the
              personalised plan PDF, refunds are partial (50%).
            </p>
          </>
        ),
      },
      {
        id: "q-double-charge",
        question: "Why was I charged twice this month?",
        tags: ["billing"],
        answer: (
          <>
            <p>
              That's unusual. Most often it's an authorisation hold (especially
              on prepaid cards) that drops off in 3-5 business days, not an
              actual charge — Stripe shows both as "pending" briefly.
            </p>
            <p>
              If you see two completed charges after 5 days, send me your order
              numbers and I'll refund the duplicate within 24 hours.
            </p>
          </>
        ),
      },
      {
        id: "q-payment-plans",
        question: "Do you offer payment plans for the 12-week program?",
        tags: ["payment"],
        answer: (
          <p>
            Yes — at checkout you can split into 3 monthly payments via Stripe
            (no extra fees). For 6+ payments, message me directly and I'll set
            up a custom plan.
          </p>
        ),
      },
    ],
  },
  {
    id: "section-coaching",
    slug: "coaching",
    icon: "🎯",
    title: "1:1 coaching calls",
    intro: "Booking, rescheduling, what to bring, and how recordings work.",
    count: 7,
    items: [
      {
        id: "q-book-call",
        question: "How do I book my onboarding call?",
        tags: ["booking"],
        answer: (
          <p>
            After purchase you'll get an email with a Cal.com link to my
            schedule. Pick any 45-minute slot in the next 14 days. If nothing
            works, reply to that email and I'll open extra slots.
          </p>
        ),
      },
      {
        id: "q-reschedule",
        question: "Can I reschedule a call last-minute?",
        tags: ["booking"],
        answer: (
          <p>
            Up to 24 hours before, just hit "Reschedule" in the Cal.com
            confirmation email — no fee. Inside 24 hours I'll do my best to
            swap, but I can't always promise.
          </p>
        ),
      },
    ],
  },
  {
    id: "section-shipping",
    slug: "shipping",
    icon: "📦",
    title: "Shipping & delivery",
    intro: "Times, tracking, and the regions I currently ship to.",
    count: 9,
    items: [
      {
        id: "q-shipping-times",
        question: "How long does shipping take?",
        tags: ["shipping"],
        answer: (
          <p>
            EU: 3-5 business days. UK: 5-7. US/Canada: 7-12. Rest of world: up
            to 21. You'll get a tracking link the moment your label is printed.
          </p>
        ),
      },
    ],
  },
  {
    id: "section-product",
    slug: "product",
    icon: "🧰",
    title: "Product details",
    intro: "Sizing, materials, and how to take care of your gear.",
    count: 6,
    items: [
      {
        id: "q-sizing",
        question: "How do I pick the right size?",
        tags: ["sizing"],
        answer: (
          <p>
            Each product page has a size chart with chest / waist / hip in cm
            and inches. If you're between sizes, size up — the cut is on the
            fitted side.
          </p>
        ),
      },
    ],
  },
  {
    id: "section-legal",
    slug: "legal",
    icon: "⚖️",
    title: "Legal & policy",
    intro: "Privacy, terms, and how I handle your data.",
    count: 5,
    items: [
      {
        id: "q-data-handling",
        question: "What data do you collect, and where is it stored?",
        tags: ["policy", "premium"],
        answer: (
          <>
            <p>
              I store the bare minimum: your name, email, purchases, and any
              messages you send me. Everything is on EU servers (Supabase
              Frankfurt). I never sell your data.
            </p>
            <p>
              You can request a full export or deletion at any time by emailing{" "}
              <a href="#" style={{ color: "var(--brand-primary)" }}>
                privacy@strongnotskinny.com
              </a>
              . GDPR + UK GDPR rights apply.
            </p>
          </>
        ),
      },
    ],
  },
];

const ALL_TAGS = ["login", "downloads", "refund", "booking", "payment", "policy", "shipping", "sizing", "premium"];

// ---------------------------------------------------------------------------
// QaItemRow
// ---------------------------------------------------------------------------
function QaItemRow({
  item,
  isOpen,
  isTarget,
  activeTag,
  onTagClick,
  onDeepLink,
}: {
  item: QaItem;
  isOpen: boolean;
  isTarget: boolean;
  activeTag: string;
  onTagClick: (tag: string) => void;
  onDeepLink: (id: string) => void;
}): ReactElement {
  const [helpfulState, setHelpfulState] = useState<"yes" | "no" | null>(null);

  const handleHelpful = useCallback(
    (vote: "yes" | "no") => {
      // TODO: send helpfulness signal
      setHelpfulState(vote);
    },
    []
  );

  return (
    <details
      className={`cfp-qa-item${isTarget ? " is-target" : ""}`}
      id={item.id}
      open={isOpen}
    >
      <summary>
        <span className="cfp-qi-q">{item.question}</span>
        <svg
          className="cfp-qi-caret"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="cfp-qi-body">{item.answer}</div>
      <div className="cfp-qi-meta-row">
        <div className="cfp-qi-tags">
          {item.tags.map((tag) => (
            <button
              key={tag}
              className="cfp-qi-tag"
              onClick={() => onTagClick(tag)}
            >
              {/* TODO: filter by tag */}
              {tag}
            </button>
          ))}
        </div>
        <div className="cfp-qi-actions">
          <div className="cfp-qi-helpful">
            {helpfulState ? (
              <span>
                {helpfulState === "yes"
                  ? "Thanks for the feedback!"
                  : "Thanks — I'll improve this answer."}
              </span>
            ) : (
              <>
                <span>Was this helpful?</span>
                <button
                  className={helpfulState === "yes" ? "is-active" : ""}
                  onClick={() => handleHelpful("yes")}
                  aria-label="Yes, helpful"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-6 0v4" />
                    <rect x="2" y="9" width="20" height="12" rx="2" />
                  </svg>
                  Yes
                </button>
                <button
                  className={helpfulState === "no" ? "is-active" : ""}
                  onClick={() => handleHelpful("no")}
                  aria-label="No, not helpful"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: "rotate(180deg)" }}
                  >
                    <path d="M14 9V5a3 3 0 0 0-6 0v4" />
                    <rect x="2" y="9" width="20" height="12" rx="2" />
                  </svg>
                  No
                </button>
              </>
            )}
          </div>
          <button
            className="cfp-qi-deeplink"
            aria-label="Copy permalink"
            onClick={() => onDeepLink(item.id)}
          >
            {/* TODO: copy permalink */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CreatorFaqPage(): ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [currentTocSection, setCurrentTocSection] = useState<string>("account");
  const [tocCollapsed, setTocCollapsed] = useState<boolean>(false);
  const [targetQId, setTargetQId] = useState<string | null>(null);

  // Compute which items / sections are visible
  const isSearchActive = searchQuery.trim().length > 0;
  const isTagActive = activeTag.length > 0;

  const visibleSections = FAQ_SECTIONS.map((sec) => {
    const visibleItems = sec.items.filter((item) => {
      if (isSearchActive) {
        const hay = (item.question + " " + item.tags.join(" ")).toLowerCase();
        return hay.includes(searchQuery.toLowerCase());
      }
      if (isTagActive) {
        return item.tags.includes(activeTag);
      }
      return true;
    });
    return { ...sec, visibleItems };
  }).filter((sec) => sec.visibleItems.length > 0);

  const totalMatches = isSearchActive
    ? visibleSections.reduce((acc, s) => acc + s.visibleItems.length, 0)
    : 0;

  // Scroll-spy
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const slug = e.target.id.replace(/^section-/, "");
            setCurrentTocSection(slug);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    document.querySelectorAll(".cfp-section").forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Auto-collapse TOC on small viewports
  useEffect(() => {
    if (window.matchMedia("(max-width: 919px)").matches) {
      setTocCollapsed(true);
    }
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    // TODO: navigate to tag route
    setActiveTag(tag === activeTag ? "" : tag);
    setSearchQuery("");
  }, [activeTag]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveTag("");
  }, []);

  const handleDeepLink = useCallback((qid: string) => {
    // TODO: copy permalink to clipboard
    void qid;
  }, []);

  const handleContactCta = useCallback(() => {
    // TODO: navigate to contact page
  }, []);

  const handleMessageNoMatch = useCallback(() => {
    // TODO: navigate to contact page
  }, []);

  return (
    <div className="creator-faq-page">
      {/* Creator nav */}
      <nav className="cfp-nav">
        <a href="/" className="cfp-nav-handle">
          {/* TODO: link to creator home */}
          <span className="cfp-av" aria-hidden="true">A</span>
          Alexandra Silva
        </a>
        <div className="cfp-nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/faq" className="is-current">FAQ</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      {/* Page hero */}
      <header className="cfp-hero">
        <h1>FAQ</h1>
        <p className="cfp-lede">
          Answers to the questions I get every week — about training plans,
          refunds, coaching calls, and how to access your downloads.
        </p>
        <div className="cfp-meta-line">
          <span>47 questions</span>
          <span className="cfp-meta-dot" />
          <span>6 sections</span>
          <span className="cfp-meta-dot" />
          <span>
            Last updated <b>Apr 24, 2026</b>
          </span>
        </div>
      </header>

      {/* Sticky search bar */}
      <div className="cfp-search-wrap">
        <div className="cfp-search-bar">
          <div
            className={`cfp-search-input-wrap${isSearchActive ? " has-query" : ""}`}
            id="search-input-wrap"
          >
            <svg
              className="cfp-search-ico"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search the Help Center…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTag("");
              }}
              aria-label="Search FAQ"
            />
            <button
              className="cfp-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Tag chip bar */}
      <div className="cfp-tag-bar">
        <button
          className={`cfp-tag-chip${!activeTag ? " is-active" : ""}`}
          onClick={() => handleTagClick("")}
        >
          All tags
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            className={`cfp-tag-chip${activeTag === tag ? " is-active" : ""}`}
            onClick={() => handleTagClick(tag)}
          >
            {/* TODO: filter by tag */}
            {tag}
          </button>
        ))}
      </div>

      {/* Search results banner */}
      {isSearchActive && (
        <div className="cfp-search-banner">
          Showing <b>{totalMatches}</b> matches for "<b>{searchQuery}</b>"
        </div>
      )}

      {/* Layout */}
      <div className="cfp-layout">
        {/* TOC */}
        <aside
          className={`cfp-toc${tocCollapsed ? " is-collapsed" : ""}`}
          aria-label="Table of contents"
        >
          <button
            className="cfp-toc-toggle"
            onClick={() => setTocCollapsed((c) => !c)}
            aria-label="Toggle table of contents"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Sections (6)
          </button>
          <ul className="cfp-toc-list">
            {FAQ_SECTIONS.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={`toc-link${currentTocSection === sec.slug ? " is-current" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: scroll to section
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="cfp-toc-icon">{sec.icon}</span>
                  {sec.title}
                  <span className="cfp-toc-count">{sec.count}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="cfp-toc-help">
            Can't find what you need?
            <br />
            Try <b>Cmd/Ctrl + F</b> on the page, or use the search above. Every
            answer has a permalink — click the <b>🔗</b> icon to share a single
            Q&amp;A.
          </div>
        </aside>

        {/* Content */}
        <div className="cfp-content">
          {visibleSections.length === 0 && isSearchActive ? (
            <div className="cfp-no-match">
              <h3>
                No matches for "<span>{searchQuery}</span>"
              </h3>
              <p>
                Try a different keyword, or message me directly — I'll add an
                answer if it's a common one.
              </p>
              <div className="cfp-nm-actions">
                <button className="cfp-nm-primary" onClick={handleMessageNoMatch}>
                  {/* TODO: open Contact page */}
                  Message Alexandra →
                </button>
                <button className="cfp-nm-ghost" onClick={handleClearSearch}>
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            visibleSections.map((sec) => (
              <section
                key={sec.id}
                className="cfp-section"
                id={sec.id}
                data-section={sec.slug}
              >
                <h2>
                  <span className="cfp-h2-icon" aria-hidden="true">
                    {sec.icon}
                  </span>
                  {sec.title}
                </h2>
                <p className="cfp-sec-intro">{sec.intro}</p>
                <div className="cfp-qa-stack">
                  {sec.visibleItems.map((item, idx) => (
                    <QaItemRow
                      key={item.id}
                      item={item}
                      isOpen={idx === 0 && sec.slug === "account" && !isSearchActive && !isTagActive}
                      isTarget={targetQId === item.id}
                      activeTag={activeTag}
                      onTagClick={handleTagClick}
                      onDeepLink={handleDeepLink}
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          {/* Still have questions */}
          {!isSearchActive && (
            <div className="cfp-still-questions">
              <h3>Still have questions?</h3>
              <p>Send me a message — I usually reply within a day.</p>
              <button className="cfp-sq-cta" onClick={handleContactCta}>
                {/* TODO: link to Contact page */}
                Contact Alexandra →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="cfp-footer">
        <div className="cfp-footer-socials" aria-label="Social links">
          {[
            { label: "Instagram", path: "M2 2h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" },
          ].map(() => null)}
          <a href="#" aria-label="Instagram" onClick={(e) => { e.preventDefault(); /* TODO */ }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" aria-label="TikTok" onClick={(e) => { e.preventDefault(); /* TODO */ }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
          <a href="#" aria-label="YouTube" onClick={(e) => { e.preventDefault(); /* TODO */ }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
          </a>
          <a href="#" aria-label="Email" onClick={(e) => { e.preventDefault(); /* TODO */ }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </a>
        </div>
        <p className="cfp-made-with">
          Made with{" "}
          <a href="/" onClick={(e) => { e.preventDefault(); /* TODO */ }}>
            tadaify
          </a>{" "}
          — your bio link, your best first impression.
        </p>
      </footer>
    </div>
  );
}
