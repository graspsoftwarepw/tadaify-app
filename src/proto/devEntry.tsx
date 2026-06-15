/**
 * devEntry — the dev-only `/__proto/*` mount for the tadaify clickable
 * prototype. Production builds exclude this: it is only added to the route
 * table when `import.meta.env.DEV` (see app/routes.ts), so this mock tree
 * never reaches the Cloudflare Workers bundle.
 *
 * The single hub that links every prototype screen together — the "one big
 * clickable mockup". Screens reuse the app's own styling and graduate by
 * swapping their typed fixtures for real data.
 */
import { useParams } from "react-router";
import "./theme/proto-tokens.css";
import { StyleGuide } from "./StyleGuide";
import { DashboardScreen } from "./screens/dashboard/DashboardScreen";
import { CreatorPublicScreen } from "./screens/creator-public/CreatorPublicScreen";
import { CreatorAboutPublicScreen } from "./screens/creator-about-public/CreatorAboutPublicScreen";
import { CreatorBlogPublicScreen } from "./screens/creator-blog-public/CreatorBlogPublicScreen";
import { CreatorPortfolioPublicScreen } from "./screens/creator-portfolio-public/CreatorPortfolioPublicScreen";
import { CreatorContactPublicScreen } from "./screens/creator-contact-public/CreatorContactPublicScreen";
import { CreatorFaqPublicScreen } from "./screens/creator-faq-public/CreatorFaqPublicScreen";
import { CreatorSchedulePublicScreen } from "./screens/creator-schedule-public/CreatorSchedulePublicScreen";
import { CreatorCustomPublicScreen } from "./screens/creator-custom-public/CreatorCustomPublicScreen";
import { CreatorLinksArchivePublicScreen } from "./screens/creator-links-archive-public/CreatorLinksArchivePublicScreen";
import { CreatorNewsletterSignupPublicScreen } from "./screens/creator-newsletter-signup-public/CreatorNewsletterSignupPublicScreen";
import { CreatorLegalPublicScreen } from "./screens/creator-legal-public/CreatorLegalPublicScreen";
import { CreatorPaidArticlesPublicScreen } from "./screens/creator-paid-articles-public/CreatorPaidArticlesPublicScreen";
import { CreatorPaidArticlePublicScreen } from "./screens/creator-paid-article-public/CreatorPaidArticlePublicScreen";
import { ProductPublicScreen } from "./screens/product-public/ProductPublicScreen";
import { BlockPickerScreen } from "./screens/block-picker/BlockPickerScreen";
import { BlockEditorScreen } from "./screens/block-editor/BlockEditorScreen";
import { AiSuggestModalScreen } from "./screens/ai-suggest-modal/AiSuggestModalScreen";
import { TierGateModalScreen } from "./screens/tier-gate-modal/TierGateModalScreen";
import { AboutEditorScreen } from "./screens/page-editors/AboutEditorScreen";
import { LinksArchiveEditorScreen } from "./screens/page-editors/LinksArchiveEditorScreen";
import { ContactEditorScreen } from "./screens/page-editors/ContactEditorScreen";
import { FaqEditorScreen } from "./screens/page-editors/FaqEditorScreen";
import { NewsletterSignupEditorScreen } from "./screens/page-editors/NewsletterSignupEditorScreen";
import { BlogEditorScreen } from "./screens/page-editors/BlogEditorScreen";
import { PortfolioEditorScreen } from "./screens/page-editors/PortfolioEditorScreen";
import { ScheduleEditorScreen } from "./screens/page-editors/ScheduleEditorScreen";
import { CustomEditorScreen } from "./screens/page-editors/CustomEditorScreen";
import { PaidArticlesEditorScreen } from "./screens/page-editors/PaidArticlesEditorScreen";
import { LegalEditorScreen } from "./screens/page-editors/LegalEditorScreen";
import { SettingsScreen } from "./screens/settings/SettingsScreen";
import { Wordmark } from "./lib/Wordmark";
import { ThemeToggle } from "./lib/ThemeToggle";

type Screen = {
  segment: string;
  label: string;
  status: "ready" | "planned";
  batch: string;
};

/** The clickable map. `ready` screens render; `planned` are upcoming batches. */
const SCREENS: Screen[] = [
  { segment: "dashboard", label: "Creator dashboard — My page", status: "ready", batch: "Dashboard" },
  { segment: "style-guide", label: "Style guide · tokens & states", status: "ready", batch: "Foundation" },
  { segment: "creator-public", label: "Public creator page", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-about-public", label: "Public creator — About", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-blog-public", label: "Public creator — Blog", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-portfolio-public", label: "Public creator — Portfolio", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-contact-public", label: "Public creator — Contact", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-faq-public", label: "Public creator — FAQ", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-schedule-public", label: "Public creator — Schedule", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-custom-public", label: "Public creator — Custom page", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-links-archive-public", label: "Public creator — Links archive", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-newsletter-signup-public", label: "Public creator — Newsletter signup", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-legal-public", label: "Public creator — Legal", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-paid-articles-public", label: "Public creator — Paid articles", status: "ready", batch: "P1 · Public pages" },
  { segment: "creator-paid-article-public", label: "Public creator — Paid article", status: "ready", batch: "P1 · Public pages" },
  { segment: "product-public", label: "Public — Product", status: "ready", batch: "P1 · Public pages" },
  { segment: "block-picker", label: "Block picker modal", status: "ready", batch: "P2 · Dashboard modals" },
  { segment: "block-editor", label: "Block editor modal", status: "ready", batch: "P2 · Dashboard modals" },
  { segment: "ai-suggest-modal", label: "AI suggest modal", status: "ready", batch: "P2 · Dashboard modals" },
  { segment: "tier-gate-modal", label: "Tier gate / upsell modal", status: "ready", batch: "P2 · Dashboard modals" },
  { segment: "settings", label: "Settings (account, billing, security, …)", status: "ready", batch: "P3 · Settings" },
  { segment: "page-about", label: "Editor — About page", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-links-archive", label: "Editor — Links archive", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-contact", label: "Editor — Contact", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-faq", label: "Editor — FAQ", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-newsletter-signup", label: "Editor — Newsletter signup", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-blog", label: "Editor — Blog", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-portfolio", label: "Editor — Portfolio", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-schedule", label: "Editor — Schedule", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-custom", label: "Editor — Custom page", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-paid-articles", label: "Editor — Paid articles", status: "ready", batch: "P4 · Page editors" },
  { segment: "page-legal", label: "Editor — Legal", status: "ready", batch: "P4 · Page editors" },
  { segment: "onboarding", label: "Onboarding + auth", status: "planned", batch: "P5 · Onboarding/auth" },
];

function ProtoIndex() {
  const batches = [...new Set(SCREENS.map((s) => s.batch))];
  return (
    <div className="proto-root min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6">
        <Wordmark size="sm" />
        <span className="pill pill-warm">/__proto · clickable prototype</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display mb-2 text-3xl font-semibold">Prototype map</h1>
        <p className="mb-8 text-[var(--fg-muted)]">
          Every tadaify screen, one clickable tree — ported from the approved
          mockups, reusing the app's own styling.
        </p>
        {batches.map((batch) => (
          <div key={batch} className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
              {batch}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SCREENS.filter((s) => s.batch === batch).map((s) => {
                const ready = s.status === "ready";
                const inner = (
                  <div className="card flex items-center gap-3 py-3">
                    <span className="flex-1 text-sm font-medium">{s.label}</span>
                    <span className={`pill ${ready ? "pill-success" : ""} text-[10px]`}>
                      {ready ? "ready" : "planned"}
                    </span>
                  </div>
                );
                return ready ? (
                  <a key={s.segment} href={`/__proto/${s.segment}`} className="no-underline">
                    {inner}
                  </a>
                ) : (
                  <div key={s.segment} className="opacity-55">{inner}</div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProtoDevHost() {
  const splat = useParams()["*"] ?? "";
  const segment = splat.replace(/\/+$/, "");

  switch (segment) {
    case "":
      return <ProtoIndex />;
    case "dashboard":
      return <DashboardScreen />;
    case "creator-public":
      return <CreatorPublicScreen />;
    case "creator-about-public":
      return <CreatorAboutPublicScreen />;
    case "creator-blog-public":
      return <CreatorBlogPublicScreen />;
    case "creator-portfolio-public":
      return <CreatorPortfolioPublicScreen />;
    case "creator-contact-public":
      return <CreatorContactPublicScreen />;
    case "creator-faq-public":
      return <CreatorFaqPublicScreen />;
    case "creator-schedule-public":
      return <CreatorSchedulePublicScreen />;
    case "creator-custom-public":
      return <CreatorCustomPublicScreen />;
    case "creator-links-archive-public":
      return <CreatorLinksArchivePublicScreen />;
    case "creator-newsletter-signup-public":
      return <CreatorNewsletterSignupPublicScreen />;
    case "creator-legal-public":
      return <CreatorLegalPublicScreen />;
    case "creator-paid-articles-public":
      return <CreatorPaidArticlesPublicScreen />;
    case "creator-paid-article-public":
      return <CreatorPaidArticlePublicScreen />;
    case "product-public":
      return <ProductPublicScreen />;
    case "block-picker":
      return <BlockPickerScreen />;
    case "block-editor":
      return <BlockEditorScreen />;
    case "ai-suggest-modal":
      return <AiSuggestModalScreen />;
    case "tier-gate-modal":
      return <TierGateModalScreen />;
    case "page-about":
      return <AboutEditorScreen />;
    case "page-links-archive":
      return <LinksArchiveEditorScreen />;
    case "page-contact":
      return <ContactEditorScreen />;
    case "page-faq":
      return <FaqEditorScreen />;
    case "page-newsletter-signup":
      return <NewsletterSignupEditorScreen />;
    case "page-blog":
      return <BlogEditorScreen />;
    case "page-portfolio":
      return <PortfolioEditorScreen />;
    case "page-schedule":
      return <ScheduleEditorScreen />;
    case "page-custom":
      return <CustomEditorScreen />;
    case "page-paid-articles":
      return <PaidArticlesEditorScreen />;
    case "page-legal":
      return <LegalEditorScreen />;
    case "settings":
      return <SettingsScreen />;
    case "style-guide":
      return <StyleGuide />;
    default:
      return <ProtoIndex />;
  }
}
