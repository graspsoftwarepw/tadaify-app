/**
 * /onboarding/template — Step 4/5: Pick starter template (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-template.html (merged PR #135)
 *
 * URL state:
 *   loader reads → ?handle=&platforms=&socials=&name=&bio=&av=
 *   action emits → /onboarding/tier?<all above>&tpl=<template-id>
 *
 * DEC trail:
 *   DEC-297=B  template is step 4/5
 *
 * Covers: BR-ONBOARDING-004 (step 4 template selection)
 */

import { redirect } from "react-router";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/onboarding.template";

// ─── Template definitions ──────────────────────────────────────────────────────

export const PRESET_TEMPLATES = [
  {
    id: "chopin",
    name: "Chopin",
    description: "Classic serif · warm ivory",
    emoji: "🎹",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Dark + glow · high contrast",
    emoji: "🌈",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean · whitespace-first",
    emoji: "⬜",
  },
  {
    id: "nightfall",
    name: "Nightfall",
    description: "Deep blue · stars",
    emoji: "🌙",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    description: "Warm orange · energetic",
    emoji: "🌅",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Start blank · build from scratch",
    emoji: "🎨",
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

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TemplatePage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle, platforms, socials, name, bio, av, selectedTemplate } = loaderData;
  const error = actionData?.error;
  const prefilled = actionData?.values;

  const currentTpl = prefilled?.tpl ?? (selectedTemplate ?? "chopin");

  // Back URL preserves accumulated state
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  if (name) backParams.set("name", name);
  if (bio) backParams.set("bio", bio);
  if (av) backParams.set("av", av);
  const backUrl = `/onboarding/profile?${backParams.toString()}`;

  return (
    <div style={{ maxWidth: 680 }}>
      <p
        style={{
          fontSize: 15,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
          marginBottom: 28,
          marginTop: -16,
        }}
      >
        Choose a starting look for your page. You can customise everything later in the editor.
      </p>

      <form method="post">
        <input type="hidden" name="handle" value={handle} />
        <input type="hidden" name="platforms" value={platforms} />
        <input type="hidden" name="socials" value={socials} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="bio" value={bio} />
        <input type="hidden" name="av" value={av} />

        {/* Template grid */}
        <div
          role="radiogroup"
          aria-label="Choose a template"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {PRESET_TEMPLATES.map((template) => {
            const isSelected = currentTpl === template.id;
            return (
              <label
                key={template.id}
                style={{
                  display: "block",
                  border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border-strong)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  cursor: "pointer",
                  background: isSelected ? "rgba(99, 102, 241, 0.06)" : "var(--bg-elevated)",
                  transition: "border-color .12s, background .12s",
                  userSelect: "none",
                }}
                className="tpl-card-label"
              >
                <input
                  type="radio"
                  name="tpl"
                  value={template.id}
                  defaultChecked={isSelected}
                  className="sr-only"
                  aria-label={`${template.name}: ${template.description}`}
                />
                <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden>
                  {template.emoji}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                    marginBottom: 4,
                  }}
                >
                  {template.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.4 }}>
                  {template.description}
                </div>
              </label>
            );
          })}
        </div>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: 13,
              color: "var(--danger)",
              marginBottom: 14,
            }}
          >
            {error.message}
          </p>
        )}

        {/* Action bar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            to={backUrl}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--fg-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
            aria-label="Back to profile setup"
          >
            ← Back
          </Link>

          <button
            type="submit"
            style={{
              flex: 1,
              minHeight: 44,
              padding: "10px 24px",
              background: "var(--brand-primary)",
              color: "#FFF",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Continue with{" "}
            {PRESET_TEMPLATES.find((t) => t.id === currentTpl)?.name ?? "this template"} →
          </button>
        </div>
      </form>

      <style>{`
        .tpl-card-label:has(input:checked) {
          border-color: var(--brand-primary) !important;
          background: rgba(99, 102, 241, 0.06) !important;
        }
        .tpl-card-label:hover {
          border-color: var(--brand-primary);
        }
      `}</style>
    </div>
  );
}
