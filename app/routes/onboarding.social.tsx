/**
 * /onboarding/social — Step 2/5: Enter social handles (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-social.html (merged PR #135)
 *
 * URL state:
 *   loader reads → ?handle=<str>&platforms=<csv>
 *   action emits → /onboarding/profile?handle=&platforms=&socials=<json>
 *                  OR /onboarding/profile?handle=  (skip all)
 *
 * socials format (URL-encoded JSON): { instagram: "@myname", youtube: "youtube.com/channel/..." }
 *
 * DEC trail:
 *   DEC-297=B  social is step 2/5
 *   DEC-298=A  no scraping; manual entry only
 *
 * Covers: BR-ONBOARDING-002 (step 2 social handle entry)
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/onboarding.social";
import { PLATFORM_LIST, isValidPlatformId, type PlatformId } from "./onboarding.welcome";

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

  // Build back URL
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  const backUrl = `/onboarding/welcome?${backParams.toString()}`;

  return (
    <div style={{ maxWidth: 580 }}>
      <p
        style={{
          fontSize: 15,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
          marginBottom: 24,
          marginTop: -16,
        }}
      >
        Add your @handle for each platform. We'll create a <strong>"Follow me"</strong> link
        block for each one. Skip any you don't want to show.
      </p>

      {platforms.length === 0 ? (
        <div
          style={{
            padding: "24px",
            background: "var(--bg-muted)",
            borderRadius: "var(--radius)",
            textAlign: "center",
            color: "var(--fg-muted)",
            marginBottom: 24,
          }}
        >
          <p>No platforms selected. Click "Skip socials" to continue.</p>
        </div>
      ) : null}

      <form method="post">
        <input type="hidden" name="handle" value={handle} />
        <input type="hidden" name="platforms" value={platformsCsv} />

        {platforms.length > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}
          >
            {platforms.map((platformId) => {
              const platformInfo = PLATFORM_LIST.find((p) => p.id === platformId);
              const existingValue = existingSocials[platformId] ?? "";
              const fieldError = error?.fields?.[platformId];

              return (
                <div key={platformId}>
                  <label
                    htmlFor={`social_${platformId}`}
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginBottom: 6,
                    }}
                  >
                    {platformInfo?.name ?? platformId}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: `1.5px solid ${fieldError ? "var(--danger)" : "var(--border-strong)"}`,
                      borderRadius: "var(--radius)",
                      background: "var(--bg-elevated)",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        padding: "10px 10px 10px 14px",
                        fontSize: 14,
                        color: "var(--fg-muted)",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      @
                    </span>
                    <input
                      id={`social_${platformId}`}
                      type="text"
                      name={`social_${platformId}`}
                      defaultValue={existingValue.replace(/^@/, "")}
                      placeholder={`your${platformInfo?.name ?? platformId}handle`}
                      autoComplete="off"
                      aria-describedby={fieldError ? `error_${platformId}` : undefined}
                      aria-invalid={!!fieldError}
                      style={{
                        flex: 1,
                        border: 0,
                        background: "transparent",
                        padding: "10px 14px 10px 0",
                        fontSize: 15,
                        color: "var(--fg)",
                        outline: "none",
                        minWidth: 0,
                      }}
                    />
                  </div>
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
            })}
          </div>
        )}

        {error?.message && (
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
            aria-label="Back to platform selection"
          >
            ← Back
          </Link>

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
            aria-label="Skip adding social handles"
          >
            Skip socials
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
      </form>
    </div>
  );
}
