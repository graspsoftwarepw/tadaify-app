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
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled selection: prefer URL ?tpl= param so browser-back/forward work,
  // fall back to server-loaded selectedTemplate, then "chopin" as default.
  const urlTpl = searchParams.get("tpl");
  const currentTpl = urlTpl && isValidTemplateId(urlTpl)
    ? urlTpl
    : prefilled?.tpl ?? (selectedTemplate ?? "chopin");

  const handleRadioChange = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tpl", id);
      return next;
    }, { replace: true, preventScrollReset: true });
  };

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
                  checked={isSelected}
                  onChange={() => handleRadioChange(template.id)}
                  className="sr-only"
                  aria-label={`${template.name}: ${template.description}`}
                />
                {/* Mini preview thumbnail — ported from mockups/tadaify-mvp/onboarding-template.html */}
                <div
                  className={`tpl-preview preview-${template.id}`}
                  aria-hidden
                >
                  <div className="preview-inner">
                    <div className="preview-name">Alexandra</div>
                    <div className="preview-bio">Creator</div>
                    {template.id !== "custom" && (
                      <div className="preview-link">→ Latest post</div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                    marginBottom: 2,
                    marginTop: 8,
                  }}
                >
                  {template.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
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

      {/* Template preview CSS — ported from mockups/tadaify-mvp/onboarding-template.html */}
      <style>{`
        .tpl-card-label:hover { border-color: var(--brand-primary); }

        /* Mini-preview thumbnail container */
        .tpl-preview {
          border-radius: 8px;
          height: 90px;
          overflow: hidden;
          position: relative;
        }
        .preview-inner {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        .preview-name { line-height: 1.1; }
        .preview-bio  { line-height: 1.2; }

        /* Chopin — indigo-purple gradient */
        .preview-chopin { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: #FFF; }
        .preview-chopin .preview-name { font-family: 'Georgia', 'Crimson Pro', serif; font-size: 14px; font-weight: 600; }
        .preview-chopin .preview-bio  { opacity: 0.85; font-size: 9px; margin-top: 1px; }
        .preview-chopin .preview-link {
          margin-top: 8px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 9px;
          border: 1px solid rgba(255,255,255,0.25);
        }

        /* Neon — dark + yellow glow */
        .preview-neon { background: #0B0F1E; color: #FDE68A; position: relative; }
        .preview-neon::before {
          content: "";
          position: absolute; inset: 0;
          background: radial-gradient(180px 100px at 70% 30%, rgba(245,158,11,0.3), transparent);
        }
        .preview-neon > * { position: relative; z-index: 1; }
        .preview-neon .preview-name { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 13px; letter-spacing: -0.02em; }
        .preview-neon .preview-bio  { color: rgba(255,255,255,0.6); font-size: 9px; margin-top: 1px; }
        .preview-neon .preview-link {
          margin-top: 8px;
          background: #F59E0B; color: #1F2937;
          border-radius: 3px; padding: 4px 8px; font-size: 9px; font-weight: 700;
        }

        /* Minimal — white canvas */
        .preview-minimal { background: #FFF; color: #111827; }
        .preview-minimal .preview-name { font-family: 'Georgia', 'Crimson Pro', serif; font-size: 14px; font-weight: 500; letter-spacing: -0.02em; }
        .preview-minimal .preview-bio  { color: #6B7280; font-size: 9px; margin-top: 1px; }
        .preview-minimal .preview-link {
          margin-top: 8px;
          background: transparent; border: 1px solid #111827;
          border-radius: 0; padding: 4px 8px; font-size: 9px; color: #111827;
        }

        /* Nightfall — deep blue + purple */
        .preview-nightfall { background: linear-gradient(180deg, #0B0F1E 0%, #4C1D95 100%); color: #FFF; }
        .preview-nightfall .preview-name { font-family: 'Georgia', 'Crimson Pro', serif; font-size: 14px; font-weight: 600; }
        .preview-nightfall .preview-bio  { color: rgba(255,255,255,0.7); font-size: 9px; margin-top: 1px; }
        .preview-nightfall .preview-link {
          margin-top: 8px;
          background: rgba(139,92,246,0.3); border: 1px solid rgba(139,92,246,0.6);
          border-radius: 8px; padding: 4px 8px; font-size: 9px;
        }

        /* Sunrise — warm orange gradient */
        .preview-sunrise { background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FB923C 100%); color: #1F2937; }
        .preview-sunrise .preview-name { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; }
        .preview-sunrise .preview-bio  { font-size: 9px; margin-top: 1px; opacity: 0.75; }
        .preview-sunrise .preview-link {
          margin-top: 8px;
          background: #1F2937; color: #FFF;
          border-radius: 12px; padding: 4px 8px; font-size: 9px; font-weight: 600;
        }

        /* Custom — hatched pattern */
        .preview-custom {
          background: repeating-linear-gradient(
            45deg,
            var(--bg-muted, #f3f4f6),
            var(--bg-muted, #f3f4f6) 8px,
            var(--bg, #fff) 8px,
            var(--bg, #fff) 16px
          );
          color: var(--fg-muted, #6B7280);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; text-align: center;
        }
      `}</style>
    </div>
  );
}
