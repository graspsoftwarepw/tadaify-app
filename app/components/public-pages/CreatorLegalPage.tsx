/**
 * CreatorLegalPage — public Legal page render.
 *
 * Visitor view at tadaify.com/<handle>/legal. Shows all the creator's policies
 * (Terms, Privacy, Cookie, Refund, DMCA) with a sticky TOC sidebar, scroll-spy
 * pill highlighting, version history collapsibles, single-policy view, archived
 * version banner, and print-friendly mode.
 *
 * Sub-views via in-page hash routing:
 *   #/                         → full Legal page (all policies)
 *   #/policy/<slug>            → single-policy focused reading mode
 *   #/version/<slug>/<version> → archived version with banner
 *   #/print                    → print-optimized layout
 *
 * All link / action callbacks are stubbed with TODO comments.
 * Dead-code: NOT wired to app/routes.ts — added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-legal.css
 */

import type { ReactElement } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import "~/styles/public-pages/creator-legal.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PolicyVersionEntry {
  version: string;
  effectiveRange: string;
  slug: string;
}

interface Policy {
  id: string;
  emoji: string;
  title: string;
  version: string;
  effective: string;
  extra?: string;
  body: ReactElement;
  permalink: string;
  versionHistory?: PolicyVersionEntry[];
}

// ---------------------------------------------------------------------------
// Static data (mirrors mockup content exactly)
// ---------------------------------------------------------------------------

const POLICIES: Policy[] = [
  {
    id: "terms",
    emoji: "📜",
    title: "Terms of Service",
    version: "v1.2",
    effective: "Effective Apr 1, 2026",
    extra: "Updated Mar 28, 2026",
    permalink: "tadaify.com/alexandra/legal#terms",
    versionHistory: [
      { version: "v1.1", effectiveRange: "Effective Jan 15, 2026 to Mar 31, 2026", slug: "terms/1.1" },
      { version: "v1.0", effectiveRange: "Effective Sep 1, 2025 to Jan 14, 2026", slug: "terms/1.0" },
    ],
    body: (
      <>
        <h3 id="terms-acceptance">1. Acceptance of terms</h3>
        <p>
          By accessing{" "}
          <a href="https://strongnotskinny.com">strongnotskinny.com</a> (the
          "Site") and any products or services we offer, you agree to be bound
          by these Terms of Service. If you do not agree, please do not use the
          Site.
        </p>
        <h3 id="terms-eligibility">2. Eligibility</h3>
        <p>
          You must be at least 18 years old, or the age of majority in your
          jurisdiction, to purchase services or products from us. By placing an
          order, you represent that you meet this requirement.
        </p>
        <h3 id="terms-payments">3. Subscriptions and payments</h3>
        <p>
          Coaching subscriptions auto-renew monthly at the price displayed at
          the time of your initial purchase. You may cancel at any time from
          your account dashboard; cancellation takes effect at the end of the
          current billing period. We do not provide pro-rated refunds for unused
          portions of an already-billed period.
        </p>
        <p>
          All payments are processed by Stripe. We do not store your card
          details on our servers.
        </p>
        <h3 id="terms-ip">4. Intellectual property</h3>
        <p>
          All training plans, video content, and written materials are owned by
          Alexandra Silva and may not be redistributed, resold, or reproduced
          without written permission. You may use our materials for your own
          personal, non-commercial use as the customer.
        </p>
        <h3 id="terms-disclaimer">5. Disclaimer of warranties</h3>
        <blockquote>
          Our content is for informational and educational purposes only and is
          not medical advice. Consult a qualified healthcare provider before
          starting any new fitness program.
        </blockquote>
        <h3 id="terms-liability">6. Limitation of liability</h3>
        <p>
          To the maximum extent permitted by law, our total liability for any
          claim arising from your use of the Site is limited to the amount you
          paid us in the 12 months preceding the claim.
        </p>
        <h3 id="terms-law">7. Governing law</h3>
        <p>
          These Terms are governed by the laws of England and Wales. Any dispute
          will be resolved in the courts of London, United Kingdom.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    emoji: "🔒",
    title: "Privacy Policy",
    version: "v2.0",
    effective: "Effective Apr 15, 2026",
    extra: "GDPR variant",
    permalink: "tadaify.com/alexandra/legal#privacy",
    versionHistory: [
      { version: "v1.0", effectiveRange: "Effective Sep 1, 2025 to Apr 14, 2026", slug: "privacy/1.0" },
    ],
    body: (
      <>
        <h3 id="privacy-collect">1. What we collect</h3>
        <p>
          We collect personal data you give us directly (name, email, billing
          address) and data automatically generated by your use of the Site (IP
          address, device type, pages visited, time on page).
        </p>
        <h3 id="privacy-why">2. Why we collect it (legal basis under GDPR Art. 6)</h3>
        <ul>
          <li>
            <strong>Performance of contract</strong> — to deliver the products
            and coaching you've purchased.
          </li>
          <li>
            <strong>Legitimate interest</strong> — to keep the Site secure and
            improve our services.
          </li>
          <li>
            <strong>Consent</strong> — for marketing emails and non-essential
            cookies. You can withdraw at any time.
          </li>
        </ul>
        <h3 id="privacy-retention">3. How long we keep it</h3>
        <p>
          Account data: as long as your account is active, plus 7 years for tax
          purposes after account closure (UK requirement).
        </p>
        <p>Anonymised analytics: 26 months (Google Analytics default).</p>
        <h3 id="privacy-rights">4. Your rights</h3>
        <p>
          Under GDPR you have the right to access, rectify, erase, restrict
          processing of, port, and object to processing of your personal data.
          Email{" "}
          <a href="mailto:hello@strongnotskinny.com">
            hello@strongnotskinny.com
          </a>{" "}
          to exercise any of these rights — we respond within 30 days.
        </p>
        <h3 id="privacy-transfers">5. International transfers</h3>
        <p>
          Some of our processors (Stripe, Google Workspace, Cloudflare) are
          based in the United States. Where data leaves the EU/UK, we rely on
          Standard Contractual Clauses (SCCs) approved by the European
          Commission.
        </p>
        <h3 id="privacy-dpo">6. Data Protection Officer</h3>
        <p>
          We are not legally required to appoint a DPO, but data protection
          inquiries are handled by Alexandra Silva personally —{" "}
          <a href="mailto:privacy@strongnotskinny.com">
            privacy@strongnotskinny.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "cookie",
    emoji: "🍪",
    title: "Cookie Policy",
    version: "v1.0",
    effective: "Effective Mar 1, 2026",
    permalink: "tadaify.com/alexandra/legal#cookie",
    body: (
      <>
        <h3 id="cookie-what">1. What cookies we set</h3>
        <p>We use the following cookies on this Site:</p>
        <ul>
          <li>
            <strong>Essential</strong> — <code>session_id</code>,{" "}
            <code>csrf_token</code> (set by tadaify, lifetime: session). Required
            for the Site to function. Cannot be disabled.
          </li>
          <li>
            <strong>Analytics</strong> — <code>_ga</code>, <code>_gid</code>{" "}
            (Google Analytics, lifetime: 2 years and 24 hours). Help us
            understand how visitors use the Site. Set only with your consent.
          </li>
          <li>
            <strong>Payment</strong> — <code>__stripe_mid</code>,{" "}
            <code>__stripe_sid</code> (Stripe, lifetime: 1 year and 30 minutes).
            Set when you visit a checkout page; required to prevent fraud.
          </li>
        </ul>
        <h3 id="cookie-optout">2. How to opt out</h3>
        <p>
          You can manage your cookie preferences at any time via the cookie
          banner that appears on first visit, or by clicking{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: re-open cookie consent banner
            }}
          >
            "Cookie preferences"
          </a>{" "}
          in our footer. You can also block cookies in your browser settings —
          note that blocking essential cookies will prevent the Site from
          working.
        </p>
      </>
    ),
  },
  {
    id: "refund",
    emoji: "💸",
    title: "Refund Policy",
    version: "v1.1",
    effective: "Effective Apr 1, 2026",
    permalink: "tadaify.com/alexandra/legal#refund",
    body: (
      <>
        <h3 id="refund-window">1. 14-day refund window</h3>
        <p>
          We offer a 14-day money-back guarantee on all digital products and
          one-time coaching purchases. If you're not satisfied within 14 days of
          purchase, email us and we'll refund your payment in full — no questions
          asked.
        </p>
        <h3 id="refund-eligibility">2. Eligibility</h3>
        <ul>
          <li>
            <strong>One-time digital products</strong> (training plans, video
            courses, ebooks) — refundable within 14 days of purchase.
          </li>
          <li>
            <strong>Monthly coaching subscriptions</strong> — your first month
            is fully refundable within 14 days. After 14 days, cancel anytime to
            stop future renewals; we don't refund partial months.
          </li>
          <li>
            <strong>1:1 coaching sessions</strong> — refundable up to 24 hours
            before the scheduled session. Inside 24 hours, no refund (the slot
            is reserved for you).
          </li>
        </ul>
        <h3 id="refund-howto">3. How to request</h3>
        <p>
          Email{" "}
          <a href="mailto:refunds@strongnotskinny.com">
            refunds@strongnotskinny.com
          </a>{" "}
          with your order number. We process refunds via Stripe within 5
          business days; the refund typically appears on your statement within
          5-10 business days after that, depending on your bank.
        </p>
      </>
    ),
  },
  {
    id: "dmca",
    emoji: "©️",
    title: "DMCA / Copyright Policy",
    version: "v1.0",
    effective: "Effective Mar 15, 2026",
    permalink: "tadaify.com/alexandra/legal#dmca",
    body: (
      <>
        <h3 id="dmca-notice">1. Filing a copyright notice</h3>
        <p>
          If you believe any content on this Site infringes your copyright, send
          a written notice to our designated agent (below) including:
        </p>
        <ol>
          <li>
            A physical or electronic signature of the copyright owner or an
            authorized representative.
          </li>
          <li>
            Identification of the copyrighted work claimed to have been
            infringed.
          </li>
          <li>
            Identification of the material claimed to be infringing, with
            information sufficient to locate it (URL).
          </li>
          <li>Your contact information (name, address, email, phone).</li>
          <li>
            A statement that you have a good faith belief that use of the
            material is not authorized.
          </li>
          <li>
            A statement, under penalty of perjury, that the information in your
            notice is accurate and that you are authorized to act.
          </li>
        </ol>
        <h3 id="dmca-counter">2. Counter-notice procedure</h3>
        <p>
          If your content has been removed in response to a DMCA notice and you
          believe the removal was a mistake, you may file a counter-notice with
          the same information requirements (per 17 USC §512(g)). We will
          reinstate the content 10-14 business days after receiving a valid
          counter-notice, unless the original complainant files a court action.
        </p>
        <h3 id="dmca-agent">3. Designated agent for DMCA notices</h3>
        <blockquote>
          Alexandra Silva — DMCA Designated Agent
          <br />
          Email:{" "}
          <a href="mailto:dmca@strongnotskinny.com">
            dmca@strongnotskinny.com
          </a>
          <br />
          Postal: 12 Example Street, London EC1A 1BB, United Kingdom
          <br />
          Phone: +44 20 0000 0000
        </blockquote>
      </>
    ),
  },
];

const SECTION_SLUGS = POLICIES.map((p) => p.id);

// ---------------------------------------------------------------------------
// Helper: Clock icon SVG
// ---------------------------------------------------------------------------
function ClockIcon({ size = 11 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PolicyArticle
// ---------------------------------------------------------------------------
function PolicyArticle({
  policy,
  onCopyPermalink,
  onSinglePolicy,
  onGoArchive,
}: {
  policy: Policy;
  onCopyPermalink: (id: string) => void;
  onSinglePolicy: (id: string) => void;
  onGoArchive: (slug: string, version: string) => void;
}): ReactElement {
  return (
    <article className="clp-policy" id={policy.id}>
      <div className="clp-policy-head">
        <div className="clp-ph-icon" aria-hidden="true">
          {policy.emoji}
        </div>
        <div className="clp-ph-meta">
          <h2>{policy.title}</h2>
          <div className="clp-ph-line">
            <span className="clp-ph-version">{policy.version}</span>
            <span className="clp-ph-effective">
              <ClockIcon />
              {policy.effective}
            </span>
            {policy.extra && (
              <>
                <span className="clp-meta-dot" />
                <span>{policy.extra}</span>
              </>
            )}
          </div>
        </div>
        <div className="clp-ph-actions">
          <button
            className="clp-ph-action"
            aria-label="Copy permalink"
            onClick={() => onCopyPermalink(policy.id)}
          >
            {/* TODO: copy permalink */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </svg>
          </button>
          <button
            className="clp-ph-action"
            aria-label="Single-policy mode"
            onClick={() => onSinglePolicy(policy.id)}
          >
            {/* TODO: enter single-policy view */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      <div className="clp-policy-body">{policy.body}</div>

      <div className="clp-policy-foot">
        <span>
          Permalink: <code>{policy.permalink}</code>
        </span>
        <span className="pf-spacer" />
        {policy.versionHistory && policy.versionHistory.length > 0 && (
          <details className="clp-ver-history">
            <summary>
              View {policy.versionHistory.length} past version
              {policy.versionHistory.length > 1 ? "s" : ""}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <ul className="clp-vh-list">
              {policy.versionHistory.map((v) => {
                const [pSlug, pVer] = v.slug.split("/");
                return (
                  <li key={v.slug}>
                    <span className="clp-vh-version">{v.version}</span>
                    <span className="clp-vh-eff">{v.effectiveRange}</span>
                    <a
                      href={`#/version/${v.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: navigate to archived version
                        onGoArchive(pSlug, pVer);
                      }}
                    >
                      View archived
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CreatorLegalPage(): ReactElement {
  const [currentSection, setCurrentSection] = useState<string>(SECTION_SLUGS[0]);
  const [tocOpen, setTocOpen] = useState<boolean>(false);
  const [singlePolicyId, setSinglePolicyId] = useState<string | null>(null);
  const [archiveInfo, setArchiveInfo] = useState<{
    policyName: string;
    version: string;
    range: string;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll-spy
  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + 120;
      let current = SECTION_SLUGS[0];
      for (const id of SECTION_SLUGS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setCurrentSection(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleCopyPermalink = useCallback((id: string) => {
    // TODO: copy permalink to clipboard
    const url = `https://tadaify.com/alexandra/legal#${id}`;
    void url;
  }, []);

  const handleSinglePolicy = useCallback((id: string) => {
    // TODO: enter single-policy hash view
    setSinglePolicyId(id);
    setArchiveInfo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleGoArchive = useCallback((pSlug: string, version: string) => {
    // TODO: navigate to archived version hash view
    const policyNames: Record<string, string> = {
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cookie: "Cookie Policy",
      refund: "Refund Policy",
      dmca: "DMCA / Copyright Policy",
    };
    const ranges: Record<string, string> = {
      "terms-1.1": "Jan 15, 2026 to Mar 31, 2026",
      "terms-1.0": "Sep 1, 2025 to Jan 14, 2026",
      "privacy-1.0": "Sep 1, 2025 to Apr 14, 2026",
    };
    setArchiveInfo({
      policyName: policyNames[pSlug] ?? "Policy",
      version,
      range: ranges[`${pSlug}-${version}`] ?? "a previous period",
    });
    setSinglePolicyId(pSlug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePrintPreview = useCallback(() => {
    // TODO: enter print preview / call window.print()
  }, []);

  const handleCopyPageLink = useCallback(() => {
    // TODO: copy canonical legal-page URL
  }, []);

  const handleDismissArchive = useCallback(() => {
    setArchiveInfo(null);
    setSinglePolicyId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isSinglePolicy = singlePolicyId !== null;
  const isArchive = archiveInfo !== null;

  return (
    <div className="creator-legal-page">
      {/* Creator nav */}
      <nav className="clp-nav">
        <a href="/" className="clp-nav-handle">
          {/* TODO: link to creator home */}
          <span className="clp-av" aria-hidden="true">A</span>
          Alexandra Silva
        </a>
        <div className="clp-nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/contact">Contact</a>
          <a href="/legal" className="is-current">Legal</a>
        </div>
      </nav>

      {/* Archive banner */}
      <div
        className={`clp-archive-banner${isArchive ? " is-visible" : ""}`}
        role="alert"
      >
        <span className="ab-icon" aria-hidden="true">📜</span>
        <div className="ab-meta">
          <strong>You're viewing an archived version.</strong>{" "}
          {archiveInfo && (
            <span>
              This is {archiveInfo.policyName} v{archiveInfo.version} —
              effective {archiveInfo.range}.
            </span>
          )}
        </div>
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            // TODO: navigate back to current version
            handleDismissArchive();
          }}
        >
          View current version →
        </a>
      </div>

      {/* Page hero */}
      <header className="clp-hero">
        <h1>Legal</h1>
        <p className="clp-lede">
          All the policies that apply to your use of Strong Not Skinny — the
          website, the courses, the coaching subscriptions, and any
          communications we send you.
        </p>
        <div className="clp-meta-line">
          <span className="clp-live-dot" aria-hidden="true" />
          <span>
            Last reviewed <b style={{ color: "var(--fg)" }}>Apr 1, 2026</b>
          </span>
          <span className="clp-meta-dot" />
          <span>5 policies</span>
          <span className="clp-meta-dot" />
          <span>Available languages: 🇬🇧 English</span>
        </div>
      </header>

      {/* Policy chooser pills */}
      <nav className="clp-pill-bar" aria-label="Policy chooser">
        <span className="clp-pill-label">Choose a section:</span>
        {POLICIES.map((p) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className={`clp-pill${currentSection === p.id && !isSinglePolicy ? " is-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              // TODO: scroll to policy section
              setSinglePolicyId(null);
              setArchiveInfo(null);
              document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <span className="clp-pill-emoji" aria-hidden="true">{p.emoji}</span>{" "}
            {p.title}
          </a>
        ))}
      </nav>

      {/* Toolbar */}
      <div className="clp-toolbar">
        <span className="clp-toolbar-label">
          {isSinglePolicy
            ? `Showing: ${POLICIES.find((p) => p.id === singlePolicyId)?.title ?? ""}`
            : "Showing all policies. Use the menu above to jump to a specific one."}
        </span>
        <span className="clp-toolbar-spacer" />
        <button
          className="clp-btn-tool"
          onClick={handlePrintPreview}
          title="Open print-friendly view"
        >
          {/* TODO: enter print preview */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print this page
        </button>
        <button className="clp-btn-tool" onClick={handleCopyPageLink}>
          {/* TODO: copy canonical URL */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
            <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
          Copy page link
        </button>
      </div>

      {/* Main grid */}
      <div className="clp-grid">
        {/* TOC sidebar */}
        <aside
          className={`clp-toc${tocOpen ? " is-open" : ""}`}
          id="toc"
          aria-label="Policy contents"
        >
          <button
            className="clp-toc-toggle"
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            aria-expanded={tocOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Table of contents
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <ul className="clp-toc-list">
            {POLICIES.map((p) => (
              <li key={p.id}>
                <a
                  href={`#${p.id}`}
                  className={`clp-toc-section${currentSection === p.id ? " is-current" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: scroll to section
                    setSinglePolicyId(null);
                    setArchiveInfo(null);
                    document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setTocOpen(false);
                  }}
                >
                  <span className="ts-emoji" aria-hidden="true">{p.emoji}</span>
                  <span>{p.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <main
          className={`clp-content${isSinglePolicy ? " is-single-policy" : ""}`}
          ref={contentRef}
        >
          {POLICIES.map((p) => (
            <PolicyArticle
              key={p.id}
              policy={p}
              onCopyPermalink={handleCopyPermalink}
              onSinglePolicy={handleSinglePolicy}
              onGoArchive={handleGoArchive}
            />
          ))}
        </main>
      </div>

      {/* Page foot */}
      <div className="clp-page-foot">
        <div className="clp-page-foot-meta">
          <ClockIcon size={13} />
          Last reviewed: <b>Apr 1, 2026</b> · Next review due Apr 1, 2027
        </div>
        <div>
          Have a legal question?{" "}
          <a href="mailto:hello@strongnotskinny.com">
            Email hello@strongnotskinny.com
          </a>
        </div>
      </div>

      {/* Public footer */}
      <footer className="clp-creator-foot">
        <div className="clp-creator-foot-inner">
          <div>© 2026 Strong Not Skinny by Alexandra Silva</div>
          <div className="clp-cf-social" aria-label="Social links">
            <a
              href="https://instagram.com/alexandra.silva"
              aria-label="Instagram"
              onClick={(e) => {
                e.preventDefault();
                // TODO: open social link
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://tiktok.com/@alexandra"
              aria-label="TikTok"
              onClick={(e) => {
                e.preventDefault();
                // TODO: open social link
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@alexandra"
              aria-label="YouTube"
              onClick={(e) => {
                e.preventDefault();
                // TODO: open social link
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 8.5a3 3 0 0 0-2.1-2.1C18 6 12 6 12 6s-6 0-7.9.4A3 3 0 0 0 2 8.5C1.6 10.4 1.6 12 1.6 12s0 1.6.4 3.5a3 3 0 0 0 2.1 2.1C6 18 12 18 12 18s6 0 7.9-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-3.5.4-3.5s0-1.6-.4-3.5z" />
                <polygon points="10 15 15 12 10 9 10 15" />
              </svg>
            </a>
          </div>
          <div className="clp-cf-tdf">
            Built with <a href="/">tadaify</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
