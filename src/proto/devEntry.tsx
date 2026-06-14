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
  { segment: "settings", label: "Settings (8 tabs)", status: "planned", batch: "P3 · Settings" },
  { segment: "pages-blog", label: "Page editors", status: "planned", batch: "P4 · Page editors" },
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
    case "style-guide":
      return <StyleGuide />;
    default:
      return <ProtoIndex />;
  }
}
