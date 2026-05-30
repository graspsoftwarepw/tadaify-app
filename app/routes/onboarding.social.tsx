/**
 * /onboarding/social — Step 2/5: Enter social handles (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-social.html (Slice C 2026-04-29)
 *
 * URL state:
 *   loader reads → ?handle=<str>&platforms=<csv>
 *   action emits → /onboarding/profile?handle=&platforms=&socials=<json>
 *                  OR /onboarding/profile?handle=  (skip all)
 *
 * socials format (URL-encoded JSON): { instagram: "myname", youtube: "alicetv" }
 *
 * DEC trail:
 *   DEC-297=B  social is step 2/5
 *   DEC-298=A  no scraping; manual entry only
 *   DEC-SOCIAL-01  no OAuth, no auto-import; handle-based only
 *
 * Covers: BR-ONBOARDING-002 (step 2 social handle entry)
 * State broadcast: tdf:onboarding:state-update (TR-tadaify-006, tadaify-app#137)
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import { useCallback, useEffect, useState } from "react";
import type { Route } from "./+types/onboarding.social";
import { PLATFORM_LIST, isValidPlatformId, type PlatformId } from "./onboarding.welcome";
import { publish } from "~/lib/onboarding-preview-bus";

// ─── Validators ────────────────────────────────────────────────────────────────

export function parsePlatforms(raw: string | null): PlatformId[] {
  if (!raw) return [];
  return raw.split(",").filter(isValidPlatformId) as PlatformId[];
}

/** JSON-encode social handle map, removing empty/whitespace values */
export function buildSocialsParam(entries: Record<string, string>): string {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(entries)) {
    const trimmed = v.trim();
    if (trimmed) clean[k] = trimmed;
  }
  return JSON.stringify(clean);
}

export function parseSocials(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") result[k] = v;
    }
    return result;
  } catch {
    return {};
  }
}

/** Validate a social handle/URL string — non-empty after trim */
export function validateSocialEntry(value: string): { valid: boolean; message?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: "Handle cannot be empty." };
  if (trimmed.length > 200) return { valid: false, message: "Handle too long." };
  return { valid: true };
}

// ─── Platform display config ───────────────────────────────────────────────────
// Mirrors PLATFORMS object in mockups/tadaify-mvp/onboarding-social.html

const PLATFORM_CONFIG: Record<
  string,
  { prefix: string; bg: string; icon: string }
> = {
  instagram: {
    prefix: "instagram.com/",
    icon: "📸",
    bg: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
  },
  tiktok: {
    prefix: "tiktok.com/@",
    icon: "🎵",
    bg: "#010101",
  },
  youtube: {
    prefix: "youtube.com/@",
    icon: "▶",
    bg: "#FF0000",
  },
  x: {
    prefix: "x.com/",
    icon: "𝕏",
    bg: "#000000",
  },
  twitch: {
    prefix: "twitch.tv/",
    icon: "🎮",
    bg: "#9146FF",
  },
  spotify: {
    prefix: "open.spotify.com/user/",
    icon: "🎧",
    bg: "#1DB954",
  },
  linkedin: {
    prefix: "linkedin.com/in/",
    icon: "in",
    bg: "#0A66C2",
  },
  pinterest: {
    prefix: "pinterest.com/",
    icon: "📌",
    bg: "#E60023",
  },
  threads: {
    prefix: "threads.net/@",
    icon: "@",
    bg: "#000000",
  },
};

// ─── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  const platformsCsv = url.searchParams.get("platforms") ?? "";
  const socialsRaw = url.searchParams.get("socials") ?? "";

  const platforms = parsePlatforms(platformsCsv);
  const existingSocials = parseSocials(socialsRaw);

  return { handle, platforms, platformsCsv, existingSocials };
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent") as string;
  const handle = (form.get("handle") as string) ?? "";
  const platformsCsv = (form.get("platforms") as string) ?? "";

  if (intent === "skip") {
    const params = new URLSearchParams();
    if (handle) params.set("handle", handle);
    return redirect(`/onboarding/profile?${params.toString()}`);
  }

  const platforms = parsePlatforms(platformsCsv);

  // Collect social entries
  const entries: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};

  for (const platform of platforms) {
    const value = (form.get(`social_${platform}`) as string) ?? "";
    if (value.trim()) {
      const validation = validateSocialEntry(value);
      if (!validation.valid) {
        fieldErrors[platform] = validation.message ?? "Invalid.";
      } else {
        entries[platform] = value.trim();
      }
    }
    // empty = skipped for this platform (allowed)
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: { fields: fieldErrors, message: "Please fix the errors below." } };
  }

  const params = new URLSearchParams();
  if (handle) params.set("handle", handle);
  if (platformsCsv) params.set("platforms", platformsCsv);
  if (Object.keys(entries).length > 0) {
    params.set("socials", buildSocialsParam(entries));
  }
  return redirect(`/onboarding/profile?${params.toString()}`);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SocialPage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle, platforms, platformsCsv, existingSocials } = loaderData;
  const error = actionData?.error;

  // Track which platforms have been individually skipped (client-side)
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});

  // Build the current socials map from live DOM inputs (trimmed, non-empty, keyed by platform)
  const collectLiveSocials = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const pid of platforms) {
      if (skipped[pid]) continue;
      const el = document.getElementById(`social_${pid}`) as HTMLInputElement | null;
      const trimmed = el?.value.trim() ?? "";
      if (trimmed) result[pid] = trimmed;
    }
    return result;
  }, [platforms, skipped]);

  // Broadcast current state to the preview bus
  const broadcastSocialState = useCallback(() => {
    const activePlatforms = platforms.filter((p) => !skipped[p]);
    publish({
      handle,
      name: null,
      bio: null,
      av: null,
      platforms: activePlatforms,
      socials: collectLiveSocials(),
      tpl: null,
    });
  }, [handle, platforms, skipped, collectLiveSocials]);

  // Broadcast initial state on mount
  useEffect(() => {
    broadcastSocialState();
  }, [broadcastSocialState]);

  // Build back URL
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  const backUrl = `/onboarding/welcome?${backParams.toString()}`;

  function handleSkipPlatform(platformId: string) {
    setSkipped((prev) => ({ ...prev, [platformId]: true }));
  }

  const displayHandle = handle || "yourname";

  return (
    <>
      {/* ── Page shell ── */}
      <main className="onboarding-shell">
        <div className="onboarding-shell-inner">

          {/* Progress bar — step 2 of 5 (Slice C revision) */}
          <div className="progress-bar" aria-label="Step 2 of 5">
            <div className="progress-step done"><span className="progress-dot" /></div>
            <div className="progress-line done" />
            <div className="progress-step active"><span className="progress-dot" /></div>
            <div className="progress-line" />
            <div className="progress-step"><span className="progress-dot" /></div>
            <div className="progress-line" />
            <div className="progress-step"><span className="progress-dot" /></div>
            <div className="progress-line" />
            <div className="progress-step"><span className="progress-dot" /></div>
          </div>
          <p className="progress-label">Step 2 of 5 · Your socials</p>

          {/* Slice C: 2-col shell — form left, live preview right. Stacks <960px. */}
          <div className="ob-twocol">
            <div className="onb-card onb-card-lg" style={{ marginTop: 24 }}>

              {/* Hero */}
              <div className="onb-hero">
                <span className="logo-mark" data-logo aria-hidden="true" />
                <div>
                  <h2 style={{ fontSize: "clamp(24px,3vw,36px)", lineHeight: 1.1 }}>
                    Your handles
                  </h2>
                  <p className="text-muted" style={{ fontSize: 15, marginTop: 6 }}>
                    We'll create a "Follow me on …" link block for each.{" "}
                    <strong style={{ color: "var(--fg)" }}>No connection, no login.</strong>
                  </p>
                </div>
              </div>

              <form method="post">
                <input type="hidden" name="handle" value={handle} />
                <input type="hidden" name="platforms" value={platformsCsv} />

                {/* Platform rows */}
                <div className="platform-list" id="platform-list">
                  {platforms.length === 0 ? (
                    <div
                      style={{
                        padding: 24,
                        background: "var(--bg-muted)",
                        borderRadius: "var(--radius)",
                        textAlign: "center",
                        color: "var(--fg-muted)",
                      }}
                    >
                      <p>No platforms selected. Click "Skip socials" to continue.</p>
                    </div>
                  ) : (
                    platforms.map((platformId) => {
                      const platformInfo = PLATFORM_LIST.find((p) => p.id === platformId);
                      const cfg = PLATFORM_CONFIG[platformId];
                      const existingValue = existingSocials[platformId] ?? "";
                      const fieldError = error?.fields?.[platformId];
                      const isSkipped = skipped[platformId];

                      return (
                        <div
                          key={platformId}
                          className={`platform-row${isSkipped ? " skipped" : ""}`}
                          id={`row-${platformId}`}
                          data-platform={platformId}
                        >
                          <div className="platform-row-header">
                            <div
                              className="platform-icon"
                              style={{ background: cfg?.bg ?? "var(--brand-primary)" }}
                              aria-hidden="true"
                            >
                              {cfg?.icon ?? platformId[0].toUpperCase()}
                            </div>
                            <span className="platform-name">
                              {platformInfo?.name ?? platformId}
                            </span>
                            <button
                              type="button"
                              className="skip-link"
                              aria-label={`Skip ${platformInfo?.name ?? platformId}`}
                              onClick={() => handleSkipPlatform(platformId)}
                            >
                              Skip this platform ×
                            </button>
                          </div>

                          <div
                            className={`handle-input-row${fieldError ? " is-error" : ""}`}
                          >
                            <span className="handle-prefix">
                              {cfg?.prefix ?? `${platformId}.com/`}
                            </span>
                            <input
                              id={`social_${platformId}`}
                              className="handle-input"
                              type="text"
                              name={`social_${platformId}`}
                              defaultValue={existingValue}
                              placeholder={displayHandle}
                              autoComplete="off"
                              spellCheck={false}
                              aria-describedby={fieldError ? `error_${platformId}` : undefined}
                              aria-invalid={!!fieldError}
                              disabled={isSkipped}
                              onChange={() => broadcastSocialState()}
                            />
                          </div>

                          {/* Live preview line */}
                          <p
                            className="handle-preview"
                            id={`preview-${platformId}`}
                          >
                            {isSkipped ? (
                              <em>Skipped — won't appear on your page.</em>
                            ) : existingValue ? (
                              <>
                                This will appear as:{" "}
                                <strong>
                                  Follow me on {platformInfo?.name ?? platformId}
                                </strong>{" "}
                                → {cfg?.prefix ?? ""}{existingValue}
                              </>
                            ) : null}
                          </p>

                          {fieldError && (
                            <p
                              id={`error_${platformId}`}
                              role="alert"
                              style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}
                            >
                              {fieldError}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Affirmation strip */}
                <div className="affirmation-strip">
                  These will appear as link blocks on your page. You can edit, reorder, or delete
                  any of them later.
                </div>

                {error?.message && (
                  <p
                    role="alert"
                    style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14, marginTop: 12 }}
                  >
                    {error.message}
                  </p>
                )}

                {/* Action bar */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 28,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Link
                    to={backUrl}
                    className="btn btn-secondary"
                    id="back-link"
                    aria-label="Back to platform selection"
                  >
                    ← Back
                  </Link>

                  <button
                    type="submit"
                    name="intent"
                    value="skip"
                    className="btn btn-secondary"
                    id="skip-socials-btn"
                    aria-label="Skip adding social handles"
                  >
                    Skip socials
                  </button>

                  <button
                    type="submit"
                    name="intent"
                    value="continue"
                    className="btn btn-primary btn-lg"
                    id="continue-btn"
                    style={{ flex: 1 }}
                  >
                    Continue →
                  </button>
                </div>

                {/* Trust strip */}
                <p
                  className="trust-strip"
                  style={{ marginTop: 18, textAlign: "center", fontSize: 12, color: "var(--fg-subtle)" }}
                >
                  🔒 Handle-based — no OAuth, no account connection · You can edit any time
                </p>

              </form>
            </div>

            {/* Live preview pane (right column on >=960px, stacks below on mobile) */}
            {/* TODO: wire to OnboardingPreviewPane component once Slice C preview pane is implemented */}
            <aside
              data-onboarding-preview
              data-render="social"
              data-handle={displayHandle}
              aria-label="Live preview of your tadaify page"
            />
          </div>
          {/* /.ob-twocol */}

        </div>
      </main>
    </>
  );
}
