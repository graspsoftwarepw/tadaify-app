/**
 * /onboarding/profile — Step 3/5: Display name + bio + avatar (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-profile.html (merged PR #135)
 *
 * URL state:
 *   loader reads → ?handle=&platforms=&socials=
 *   action emits → /onboarding/template?handle=&platforms=&socials=&name=&bio=&av=
 *
 * NOTE: av (avatar) field accepts a local object URL only in this PR (#134c adds R2 upload)
 *
 * DEC trail:
 *   DEC-297=B  profile is step 3/5
 *   DEC-298=A  manual-only; no platform scraping
 *
 * Covers: BR-ONBOARDING-003 (step 3 profile setup)
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/onboarding.profile";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const BIO_MAX_LENGTH = 160;

// ─── Validators ────────────────────────────────────────────────────────────────

export function validateDisplayName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, message: "Name is required." };
  if (trimmed.length > 80) return { valid: false, message: "Name must be 80 characters or less." };
  return { valid: true };
}

export function validateBio(bio: string): { valid: boolean; message?: string } {
  if (bio.length > BIO_MAX_LENGTH) {
    return { valid: false, message: `Bio must be ${BIO_MAX_LENGTH} characters or less.` };
  }
  return { valid: true };
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
  return { handle, platforms, socials, prefillName: name, prefillBio: bio, prefillAv: av };
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const handle = (form.get("handle") as string) ?? "";
  const platforms = (form.get("platforms") as string) ?? "";
  const socials = (form.get("socials") as string) ?? "";
  const name = ((form.get("name") as string) ?? "").trim();
  const bio = ((form.get("bio") as string) ?? "").trim();
  const av = (form.get("av") as string) ?? "";

  // Validate name (required)
  const nameValidation = validateDisplayName(name);
  if (!nameValidation.valid) {
    return {
      error: { field: "name", message: nameValidation.message ?? "Name is required." },
      values: { name, bio, av },
    };
  }

  // Validate bio (optional but max length)
  const bioValidation = validateBio(bio);
  if (!bioValidation.valid) {
    return {
      error: { field: "bio", message: bioValidation.message ?? "Bio is too long." },
      values: { name, bio, av },
    };
  }

  const params = new URLSearchParams();
  if (handle) params.set("handle", handle);
  if (platforms) params.set("platforms", platforms);
  if (socials) params.set("socials", socials);
  params.set("name", name);
  if (bio) params.set("bio", bio);
  if (av) params.set("av", av);

  return redirect(`/onboarding/template?${params.toString()}`);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ProfilePage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle, platforms, socials, prefillName, prefillBio, prefillAv } = loaderData;
  const error = actionData?.error;
  const prefilled = actionData?.values;

  const currentName = prefilled?.name ?? prefillName;
  const currentBio = prefilled?.bio ?? prefillBio;

  // Back URL preserves accumulated state
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  const backUrl = `/onboarding/social?${backParams.toString()}`;

  return (
    <div style={{ maxWidth: 560 }}>
      <p
        style={{
          fontSize: 15,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
          marginBottom: 28,
          marginTop: -16,
        }}
      >
        This is how you'll appear on your page. You can change everything later.
      </p>

      <form method="post" noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <input type="hidden" name="handle" value={handle} />
        <input type="hidden" name="platforms" value={platforms} />
        <input type="hidden" name="socials" value={socials} />

        {/* ── Display name ──────────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="name"
            style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}
          >
            Display name <span aria-hidden style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={currentName}
            placeholder="Your name or brand"
            maxLength={80}
            aria-describedby={error?.field === "name" ? "name-error" : undefined}
            aria-invalid={error?.field === "name"}
            style={{
              width: "100%",
              minHeight: 44,
              border: `1.5px solid ${error?.field === "name" ? "var(--danger)" : "var(--border-strong)"}`,
              borderRadius: "var(--radius)",
              background: "var(--bg-elevated)",
              padding: "10px 14px",
              fontSize: 15,
              color: "var(--fg)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {error?.field === "name" && (
            <p
              id="name-error"
              role="alert"
              style={{ fontSize: 13, color: "var(--danger)", marginTop: 4 }}
            >
              {error.message}
            </p>
          )}
        </div>

        {/* ── Bio ───────────────────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="bio"
            style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}
          >
            Bio{" "}
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--fg-muted)" }}>
              (optional · max {BIO_MAX_LENGTH} chars)
            </span>
          </label>
          <textarea
            id="bio"
            name="bio"
            maxLength={BIO_MAX_LENGTH + 10}
            rows={3}
            defaultValue={currentBio}
            placeholder="A short intro about you or your brand…"
            aria-describedby={error?.field === "bio" ? "bio-error" : "bio-counter"}
            aria-invalid={error?.field === "bio"}
            style={{
              width: "100%",
              border: `1.5px solid ${error?.field === "bio" ? "var(--danger)" : "var(--border-strong)"}`,
              borderRadius: "var(--radius)",
              background: "var(--bg-elevated)",
              padding: "10px 14px",
              fontSize: 15,
              color: "var(--fg)",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              lineHeight: 1.5,
            }}
          />
          <div
            id="bio-counter"
            style={{
              fontSize: 12,
              color: "var(--fg-muted)",
              marginTop: 4,
              textAlign: "right",
            }}
            aria-live="polite"
          >
            {/* Counter updated via CSS/JS in real app; static here */}
            {currentBio.length} / {BIO_MAX_LENGTH}
          </div>
          {error?.field === "bio" && (
            <p
              id="bio-error"
              role="alert"
              style={{ fontSize: 13, color: "var(--danger)", marginTop: 4 }}
            >
              {error.message}
            </p>
          )}
        </div>

        {/* ── Avatar ────────────────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="av"
            style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}
          >
            Avatar{" "}
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--fg-muted)" }}>
              (optional · upload in a future update)
            </span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px",
              border: "1.5px dashed var(--border-strong)",
              borderRadius: "var(--radius)",
              background: "var(--bg-muted)",
            }}
          >
            {/* Avatar initials placeholder */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--brand-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                fontWeight: 700,
                fontSize: 22,
                flexShrink: 0,
              }}
              aria-label="Avatar placeholder"
            >
              {currentName
                ? currentName
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                : handle
                ? handle[0]?.toUpperCase()
                : "?"}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)", margin: 0 }}>
                R2 upload coming in a future update (#134c).
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--fg-muted)",
                  margin: "4px 0 0",
                  lineHeight: 1.4,
                }}
              >
                For now, we'll use your initials. Swap it anytime from your profile settings.
              </p>
            </div>
          </div>
          {/* Hidden av field (empty for now; #134c will populate via upload) */}
          <input type="hidden" name="av" value="" />
        </div>

        {/* General error */}
        {error && !error.field && (
          <p role="alert" style={{ fontSize: 13, color: "var(--danger)" }}>
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
            aria-label="Back to social handles"
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
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
