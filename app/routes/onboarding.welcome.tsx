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

export default function WelcomePage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle } = loaderData;
  const error = actionData?.error;

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Hero sub-heading (main h1 comes from parent layout) */}
      <p
        style={{
          fontSize: 16,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
          marginBottom: 28,
          marginTop: -16,
        }}
      >
        {handle ? (
          <>
            Welcome,{" "}
            <strong style={{ color: "var(--brand-primary)" }}>@{handle}</strong>! Which
            platforms are you on? We'll add <strong>"Follow me"</strong> link blocks to your page.
            Just your @handle — no account connection.
          </>
        ) : (
          <>
            Which platforms are you on? We'll add <strong>"Follow me"</strong> link blocks
            to your page. Just your @handle — no account connection.
          </>
        )}
      </p>

      <form method="post">
        <input type="hidden" name="handle" value={handle} />

        {/* Platform grid */}
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
            {PLATFORM_LIST.map((p) => (
              <label
                key={p.id}
                style={{
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
                }}
                className="platform-card-label"
              >
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
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--fg)",
                    lineHeight: 1.2,
                  }}
                >
                  {p.name}
                </span>
              </label>
            ))}
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

      <style>{`
        .platform-card-label:has(input:checked) {
          border-color: var(--brand-primary);
          background: rgba(99, 102, 241, 0.06);
        }
        .platform-card-label:hover {
          border-color: var(--brand-primary);
          background: var(--bg-muted);
        }
      `}</style>
    </div>
  );
}
