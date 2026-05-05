/**
 * /onboarding/welcome — Step 1/5: Platform picker (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-welcome.html (merged PR #135)
 *
 * URL state:
 *   loader reads  → ?handle=<str> (pre-filled from registration)
 *   action emits  → /onboarding/social?handle=<str>&platforms=<csv>
 *                   OR /onboarding/profile?handle=<str>  (skip)
 *
 * DEC trail:
 *   DEC-297=B  welcome is step 1/5; shows platform picker
 *   DEC-298=A  skip bypasses platform/social setup, lands on profile (step 3)
 *
 * Covers: BR-ONBOARDING-001 (step 1 platform picker)
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/onboarding.welcome";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const PLATFORM_LIST = [
  { id: "instagram", name: "Instagram" },
  { id: "tiktok",    name: "TikTok" },
  { id: "youtube",   name: "YouTube" },
  { id: "x",         name: "X (Twitter)" },
  { id: "twitch",    name: "Twitch" },
  { id: "spotify",   name: "Spotify" },
  { id: "linkedin",  name: "LinkedIn" },
  { id: "pinterest", name: "Pinterest" },
  { id: "threads",   name: "Threads" },
] as const;

export type PlatformId = typeof PLATFORM_LIST[number]["id"];

export function isValidPlatformId(id: string): id is PlatformId {
  return PLATFORM_LIST.some((p) => p.id === id);
}

// ─── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  return { handle };
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent") as string;
  const handle = (form.get("handle") as string) ?? "";

  if (intent === "skip") {
    // DEC-298=A: skip platforms/social → land on profile (required step 3)
    const params = new URLSearchParams();
    if (handle) params.set("handle", handle);
    return redirect(`/onboarding/profile?${params.toString()}`);
  }

  // Collect selected platforms (checkboxes)
  const platforms = form.getAll("platform") as string[];
  const validPlatforms = platforms.filter(isValidPlatformId);

  if (validPlatforms.length === 0) {
    return { error: { message: "Select at least one platform, or skip." } };
  }

  const params = new URLSearchParams();
  if (handle) params.set("handle", handle);
  params.set("platforms", validPlatforms.join(","));
  return redirect(`/onboarding/social?${params.toString()}`);
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Per-platform brand colors (--sp-a/b/c) — ported from
 * mockups/tadaify-mvp/onboarding-welcome.html (Bug #3 fix).
 * The gradient is applied via CSS vars on each card element.
 */
export const PLATFORM_COLORS: Record<string, { a: string; b: string; c: string }> = {
  instagram: { a: "#F58529", b: "#DD2A7B", c: "#8134AF" },
  tiktok:    { a: "#25F4EE", b: "#000",    c: "#FE2C55" },
  youtube:   { a: "#FF0000", b: "#CC0000", c: "#FF4444" },
  x:         { a: "#000",    b: "#333",    c: "#666"    },
  twitch:    { a: "#9146FF", b: "#772CE8", c: "#A970FF" },
  spotify:   { a: "#1DB954", b: "#1AA34A", c: "#4ADE80" },
  linkedin:  { a: "#0A66C2", b: "#004182", c: "#378FE9" },
  pinterest: { a: "#E60023", b: "#AD081B", c: "#FF4E5C" },
  threads:   { a: "#000",    b: "#1f1f1f", c: "#4a4a4a" },
};

/** Platform SVG icons — ported from mockups/tadaify-mvp/onboarding-welcome.html */
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  twitch: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M2.547.75L.75 5.344v18.093h6.188V27h3.41l3.411-3.563h4.985L24 17.672V.75zM21.75 16.547l-3.75 3.75h-6.188L8.438 23.86v-3.563H3.75V3h18zM18 7.5h-2.25v6.75H18zm-5.063 0h-2.25v6.75h2.25z"/>
    </svg>
  ),
  spotify: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.5-1.1a.75.75 0 0 1-.33-1.46c4.6-1.04 8.5-.6 11.6 1.3a.75.75 0 0 1 .24 1zm1.47-3.27a.94.94 0 0 1-1.28.3c-3.2-2-8.1-2.5-11.9-1.35a.94.94 0 0 1-.55-1.8c4.3-1.3 9.7-.7 13.4 1.55a.94.94 0 0 1 .33 1.3zm.13-3.4C15.3 8.4 8.6 8.2 5 9.3a1.12 1.12 0 1 1-.65-2.15c4.1-1.25 11.5-1 15.9 1.6a1.12 1.12 0 1 1-1.15 1.92z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/>
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 0 0-4.37 23.18c-.1-1-.2-2.55.04-3.64.2-.99 1.35-6.3 1.35-6.3s-.34-.69-.34-1.7c0-1.6.93-2.78 2.08-2.78.98 0 1.45.73 1.45 1.62 0 .98-.63 2.46-.95 3.83-.27 1.14.58 2.07 1.7 2.07 2.05 0 3.62-2.16 3.62-5.28 0-2.76-1.98-4.7-4.82-4.7-3.28 0-5.2 2.46-5.2 5 0 .99.38 2.05.86 2.63a.35.35 0 0 1 .08.33c-.09.37-.3 1.14-.33 1.3-.05.22-.17.27-.4.16-1.48-.68-2.4-2.84-2.4-4.58 0-3.73 2.7-7.16 7.8-7.16 4.1 0 7.28 2.92 7.28 6.82 0 4.07-2.56 7.35-6.13 7.35-1.2 0-2.32-.62-2.7-1.35 0 0-.6 2.26-.74 2.82-.27 1.02-1 2.3-1.49 3.08A12 12 0 1 0 12 0z"/>
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M17.73 11.14c-.1-.05-.21-.1-.32-.14-.18-3.34-2-5.26-5.07-5.28h-.04c-1.83 0-3.36.78-4.3 2.2l1.7 1.16c.7-1.06 1.8-1.3 2.6-1.3h.02c1 0 1.75.3 2.22.87.34.42.57 1 .68 1.72-.83-.14-1.72-.18-2.67-.13-2.68.15-4.41 1.72-4.3 3.9.06 1.1.6 2.06 1.54 2.7.8.53 1.82.8 2.9.74 1.42-.08 2.54-.62 3.32-1.62.59-.75.97-1.72 1.14-2.95.7.43 1.22 1 1.5 1.67.5 1.17.52 3.08-1.03 4.63-1.36 1.36-3 1.95-5.45 1.96-2.73-.02-4.8-.9-6.14-2.6-1.27-1.6-1.92-3.93-1.95-6.9.03-2.97.68-5.3 1.95-6.9 1.34-1.7 3.4-2.58 6.14-2.6 2.77.02 4.88.9 6.26 2.64.68.85 1.19 1.92 1.52 3.17l1.98-.53c-.4-1.53-1.04-2.86-1.9-3.95C17.4 1.2 14.84.02 11.43 0h-.01C8.02.02 5.52 1.2 3.76 3.53 2.18 5.6 1.37 8.48 1.34 12v.01C1.37 15.5 2.18 18.4 3.76 20.47 5.52 22.8 8.02 24 11.42 24h.01c3.02-.02 5.15-.81 6.9-2.57 2.3-2.3 2.23-5.18 1.47-6.95-.55-1.27-1.6-2.3-3.05-2.96zm-5.27 4.72c-1.2.07-2.44-.47-2.5-1.6-.05-.85.6-1.8 2.6-1.9a9.5 9.5 0 0 1 .52-.02c.72 0 1.4.07 2 .2-.24 3.02-1.68 3.25-2.62 3.3z"/>
    </svg>
  ),
};

export default function WelcomePage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle } = loaderData;
  const error = actionData?.error;

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Hero header — ported from mockups/tadaify-mvp/onboarding-welcome.html (Bug #3) */}
      <header style={{ marginBottom: 28, marginTop: -8 }}>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(26px, 4vw, 36px)", lineHeight: 1.15, marginBottom: 10 }}
        >
          {handle ? (
            <>
              Welcome,{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, var(--brand-primary), var(--warm-primary, #F59E0B))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                @{handle}
              </span>{" "}
              <span aria-hidden>👋</span>
            </>
          ) : (
            <>Pick your platforms</>
          )}
        </h1>
        <p style={{ fontSize: 15, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>
          Which platforms are you on? We'll add{" "}
          <strong>"Follow me"</strong> link blocks to your page.
          Just your @handle — no account connection.
        </p>
      </header>

      <form method="post">
        <input type="hidden" name="handle" value={handle} />

        {/* Platform grid — branded cards with SVG icons + CSS vars */}
        <fieldset
          style={{ border: "none", padding: 0, margin: 0 }}
          aria-label="Select the platforms you use"
        >
          <legend className="sr-only">Select the platforms you use</legend>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
              marginBottom: 24,
            }}
            role="group"
          >
            {PLATFORM_LIST.map((p) => {
              const colors = PLATFORM_COLORS[p.id] ?? { a: "#6366F1", b: "#8B5CF6", c: "#A78BFA" };
              return (
                <label
                  key={p.id}
                  data-platform={p.id}
                  style={{
                    // CSS vars used by :has rules and gradient bar
                    ["--sp-a" as string]: colors.a,
                    ["--sp-b" as string]: colors.b,
                    ["--sp-c" as string]: colors.c,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    border: "1.5px solid var(--border-strong)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    background: "var(--bg-elevated)",
                    transition: "border-color .12s, background .12s",
                    userSelect: "none",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="platform-card-label"
                >
                  {/* Gradient bar on top (visible when selected) */}
                  <span className="sp-bar" aria-hidden />
                  <input
                    type="checkbox"
                    name="platform"
                    value={p.id}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "var(--brand-primary)",
                      flexShrink: 0,
                    }}
                    aria-label={p.name}
                  />
                  <span
                    className="sp-icon"
                    style={{ flexShrink: 0, display: "flex", alignItems: "center", color: "var(--fg-muted)" }}
                    aria-hidden
                  >
                    {PLATFORM_ICONS[p.id] ?? null}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--fg)",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.name}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

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
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            name="intent"
            value="skip"
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              color: "var(--fg-muted)",
            }}
            aria-label="Skip platform selection"
          >
            Skip
          </button>

          <button
            type="submit"
            name="intent"
            value="continue"
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
            Continue →
          </button>
        </div>

        <p
          style={{
            marginTop: 14,
            fontSize: 13,
            color: "var(--fg-muted)",
          }}
        >
          You can add more anytime from settings.
        </p>
      </form>

      {/* Platform card styling — ported from mockups/tadaify-mvp/onboarding-welcome.html (Bug #3) */}
      <style>{`
        .platform-card-label { padding-top: 16px; }
        .sp-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--sp-a) 0%, var(--sp-b) 50%, var(--sp-c) 100%);
          opacity: 0;
          transition: opacity .12s;
        }
        .platform-card-label:has(input:checked) {
          border-color: var(--brand-primary);
          background: rgba(99, 102, 241, 0.06);
        }
        .platform-card-label:has(input:checked) .sp-bar { opacity: 1; }
        .platform-card-label:has(input:checked) .sp-icon { color: var(--sp-a); }
        .platform-card-label:hover {
          border-color: var(--brand-primary);
          background: var(--bg-muted);
        }
        .sp-icon svg { display: block; }
      `}</style>
    </div>
  );
}
