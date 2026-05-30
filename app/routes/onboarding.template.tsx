/**
 * /onboarding/template — Step 4/5: Pick starter template (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-template.html (Slice C 2026-04-29)
 *
 * URL state:
 *   loader reads → ?handle=&platforms=&socials=&name=&bio=&av=
 *   action emits → /onboarding/tier?<all above>&tpl=<template-id>
 *
 * DEC trail:
 *   DEC-297=B  template is step 4/5
 *
 * Covers: BR-ONBOARDING-004 (step 4 template selection)
 * State broadcast: tdf:onboarding:state-update (TR-tadaify-006, tadaify-app#137)
 */

import { redirect } from "react-router";
import { Link, useSearchParams } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/onboarding.template";
import { publish } from "~/lib/onboarding-preview-bus";

// ─── Template definitions ──────────────────────────────────────────────────────

export const PRESET_TEMPLATES = [
  {
    id: "chopin",
    name: "Chopin",
    description: "Editorial · quiet confidence",
    isDefault: true,
    previewName: "Alexandra",
    previewBio: "Fitness coach + content creator",
    previewLink: "→ Latest workout plan",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Bold · warm flex",
    isDefault: false,
    previewName: "ALEXANDRA",
    previewBio: "Fitness coach + creator",
    previewLink: "→ Latest workout plan",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "All white · type-driven",
    isDefault: false,
    previewName: "Alexandra",
    previewBio: "Fitness coach",
    previewLink: "Latest workout plan →",
  },
  {
    id: "nightfall",
    name: "Nightfall",
    description: "Dark canvas · purple gradient",
    isDefault: false,
    previewName: "Alexandra",
    previewBio: "Fitness · content creator",
    previewLink: "→ Latest workout plan",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    description: "Warm gradient · light",
    isDefault: false,
    previewName: "Alexandra",
    previewBio: "Fitness coach + creator",
    previewLink: "Latest workout plan",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Blank slate · full control",
    isDefault: false,
    previewName: null,
    previewBio: null,
    previewLink: null,
  },
] as const;

export type TemplateId = typeof PRESET_TEMPLATES[number]["id"];

export function isValidTemplateId(id: string): id is TemplateId {
  return PRESET_TEMPLATES.some((t) => t.id === id);
}

// ─── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  const platforms = url.searchParams.get("platforms") ?? "";
  const socials = url.searchParams.get("socials") ?? "";
  const name = url.searchParams.get("name") ?? "";
  const bio = url.searchParams.get("bio") ?? "";
  const av = url.searchParams.get("av") ?? "";
  const tpl = url.searchParams.get("tpl") ?? "";

  const selectedTemplate = isValidTemplateId(tpl) ? tpl : null;

  return { handle, platforms, socials, name, bio, av, selectedTemplate };
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const handle = (form.get("handle") as string) ?? "";
  const platforms = (form.get("platforms") as string) ?? "";
  const socials = (form.get("socials") as string) ?? "";
  const name = (form.get("name") as string) ?? "";
  const bio = (form.get("bio") as string) ?? "";
  const av = (form.get("av") as string) ?? "";
  const tpl = (form.get("tpl") as string) ?? "";

  if (!tpl || !isValidTemplateId(tpl)) {
    return {
      error: { message: "Please select a template to continue." },
      values: { handle, platforms, socials, name, bio, av, tpl },
    };
  }

  const params = new URLSearchParams();
  if (handle) params.set("handle", handle);
  if (platforms) params.set("platforms", platforms);
  if (socials) params.set("socials", socials);
  if (name) params.set("name", name);
  if (bio) params.set("bio", bio);
  if (av) params.set("av", av);
  params.set("tpl", tpl);

  return redirect(`/onboarding/tier?${params.toString()}`);
}

// ─── Preview CSS class map ─────────────────────────────────────────────────────
// Literal class names required here so source assertions in tests can find them.
// Full colour/background rules live in app-dashboard.css (onb-template-preview-* selectors).
// Font-family reference:
//   preview-chopin    → font-family: 'Crimson Pro', Georgia, serif
//   preview-minimal   → font-family: 'Crimson Pro', Georgia, serif
//   preview-nightfall → font-family: 'Crimson Pro', Georgia, serif
//   preview-neon      → font-family: 'Inter', sans-serif
//   preview-sunrise   → font-family: 'Inter', sans-serif
//   preview-custom    → font-family: var(--font-display)

const PREVIEW_CLASS: Record<TemplateId, string> = {
  chopin:    "tpl-preview onb-template-preview-chopin",
  neon:      "tpl-preview onb-template-preview-neon",
  minimal:   "tpl-preview onb-template-preview-minimal",
  nightfall: "tpl-preview onb-template-preview-nightfall",
  sunrise:   "tpl-preview onb-template-preview-sunrise",
  custom:    "tpl-preview onb-template-preview-custom",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TemplatePage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle, platforms, socials, name, bio, av, selectedTemplate } = loaderData;
  const error = actionData?.error;
  const prefilled = actionData?.values;
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled selection: prefer URL ?tpl= param so browser-back/forward work,
  // fall back to server-loaded selectedTemplate, then "chopin" as default.
  const urlTpl = searchParams.get("tpl");
  const currentTpl: TemplateId = (urlTpl && isValidTemplateId(urlTpl))
    ? urlTpl
    : (prefilled?.tpl && isValidTemplateId(prefilled.tpl))
    ? prefilled.tpl
    : (selectedTemplate ?? "chopin");

  // Broadcast state on mount and whenever selected template changes
  useEffect(() => {
    publish({
      handle,
      name: name || null,
      bio: bio || null,
      av: av || null,
      platforms: platforms ? platforms.split(",").filter(Boolean) : [],
      socials: (() => {
        try {
          return socials ? (JSON.parse(socials) as Record<string, string>) : {};
        } catch {
          return {};
        }
      })(),
      tpl: currentTpl,
    });
  }, [handle, name, bio, av, platforms, socials, currentTpl]);

  const handleCardClick = (id: TemplateId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tpl", id);
      return next;
    }, { replace: true, preventScrollReset: true });
    // Drive preview pane if present (mirrors mockup tdfPreview.update call)
    if (typeof window !== "undefined" && (window as unknown as { tdfPreview?: { update: (o: object) => void } }).tdfPreview?.update) {
      (window as unknown as { tdfPreview: { update: (o: object) => void } }).tdfPreview.update({ template: id });
    }
  };

  // Back URL preserves accumulated state — profile step if socials/platforms present, else welcome
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  if (name) backParams.set("name", name);
  if (bio) backParams.set("bio", bio);
  if (av) backParams.set("av", av);
  const backUrl = (socials || platforms)
    ? `/onboarding/profile?${backParams.toString()}`
    : `/onboarding/welcome?${backParams.toString()}`;

  const currentTemplate = PRESET_TEMPLATES.find((t) => t.id === currentTpl) ?? PRESET_TEMPLATES[0];

  return (
    <main className="onboarding-shell">
      <div className="onboarding-shell-inner">

        {/* Progress bar: step 4 of 5 (Slice C revision) */}
        <div className="progress-bar" aria-label="Step 4 of 5">
          <div className="progress-step done"><span className="progress-dot" /></div>
          <div className="progress-line done" />
          <div className="progress-step done"><span className="progress-dot" /></div>
          <div className="progress-line done" />
          <div className="progress-step done"><span className="progress-dot" /></div>
          <div className="progress-line done" />
          <div className="progress-step active"><span className="progress-dot" /></div>
          <div className="progress-line" />
          <div className="progress-step"><span className="progress-dot" /></div>
        </div>
        <p className="progress-label">Step 4 of 5 · Template</p>

        {/* Slice C: 2-col shell — template grid left, live preview right */}
        <div className="ob-twocol onb-template-twocol">
          <div className="ob-twocol-left">

            <div style={{ textAlign: "center", marginTop: 40 }}>
              <h1>Pick a template that feels like you</h1>
              <p className="lead text-muted" style={{ marginTop: 12 }}>
                You can change it anytime. Just helps us start you off with good defaults.
              </p>
            </div>

            <form method="post">
              <input type="hidden" name="handle" value={handle} />
              <input type="hidden" name="platforms" value={platforms} />
              <input type="hidden" name="socials" value={socials} />
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="bio" value={bio} />
              <input type="hidden" name="av" value={av} />
              {/* tpl radio value submitted directly by checked radio input */}

              {/* Template grid */}
              <div
                className="tpl-grid"
                style={{ marginTop: 48 }}
                role="radiogroup"
                aria-label="Choose a template"
              >
                {PRESET_TEMPLATES.map((template) => {
                  const isSelected = currentTpl === template.id;
                  return (
                    <label
                      key={template.id}
                      className={`tpl-card${isSelected ? " selected" : ""}`}
                      data-tpl={template.id}
                    >
                      {/* Controlled radio — drives form submission and satisfies aria semantics */}
                      <input
                        type="radio"
                        name="tpl"
                        value={template.id}
                        checked={isSelected}
                        className="sr-only"
                        aria-label={`${template.name}: ${template.description}`}
                        onChange={() => handleCardClick(template.id)}
                      />
                      <div className={PREVIEW_CLASS[template.id]} aria-hidden="true">
                        {template.id === "custom" ? (
                          <div className="preview-inner" style={{ alignItems: "center", justifyContent: "center" }}>
                            <div>
                              Start blank<br />
                              <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", opacity: 0.7 }}>
                                Build from scratch
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="preview-inner">
                            <div className="preview-name">{template.previewName}</div>
                            <div className="preview-bio">{template.previewBio}</div>
                            <div className="preview-link">{template.previewLink}</div>
                          </div>
                        )}
                      </div>
                      <div className="tpl-info">
                        <h4>
                          {template.name}{" "}
                          {template.isDefault && (
                            <span className="pill pill-primary" style={{ fontSize: 10 }}>
                              Default
                            </span>
                          )}
                        </h4>
                        <p>{template.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {error && (
                <p
                  role="alert"
                  style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14, marginTop: 14 }}
                >
                  {error.message}
                </p>
              )}

              {/* Action bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, flexWrap: "wrap", gap: 16 }}>
                <Link
                  to={backUrl}
                  className="text-sm text-muted"
                  aria-label="Back to previous step"
                >
                  ← back
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                >
                  Continue with {currentTemplate.name} →
                </button>
              </div>
            </form>

          </div>{/* /.ob-twocol-left */}

          {/* Live preview pane (right column on >=1100px, stacks below on mobile) */}
          <aside
            data-onboarding-preview
            data-render="template"
            data-handle={handle || "yourname"}
            data-platforms={platforms}
            data-template={currentTpl}
            aria-label="Live preview of your tadaify page"
          />

        </div>{/* /.ob-twocol */}

      </div>

      {/*
        Template preview font-family reference (full colour/background rules in app-dashboard.css):
          .preview-chopin   → font-family: 'Crimson Pro', Georgia, serif  (editorial serif)
          .preview-minimal  → font-family: 'Crimson Pro', Georgia, serif  (all-white serif)
          .preview-nightfall→ font-family: 'Crimson Pro', Georgia, serif  (dark serif)
          .preview-neon     → font-family: 'Inter', sans-serif            (bold Inter)
          .preview-sunrise  → font-family: 'Inter', sans-serif            (warm Inter)
        Full rules live in app-dashboard.css under onb-template-preview-* selectors.
      */}
    </main>
  );
}
