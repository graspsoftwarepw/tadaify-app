/**
 * /onboarding/profile — Step 3/5: Display name + bio + avatar (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-profile.html (merged PR #135)
 *
 * URL state:
 *   loader reads → ?handle=&platforms=&socials=&name=&bio=&av=
 *   action emits → /onboarding/template?handle=&platforms=&socials=&name=&bio=&av=
 *
 * Avatar upload: POST /api/upload/avatar (TR-tadaify-003, tadaify-app#138).
 *   - r2_key stored in `av` URL param and passed forward.
 *   - Preview served via /api/avatar/:key (base64url-encoded r2_key).
 *   - MOCK_R2=1 mode for local dev + tests.
 *
 * DEC trail:
 *   DEC-297=B  profile is step 3/5
 *   DEC-298=A  manual-only; no platform scraping
 *   DEC-310=B  avatar is optional
 *
 * Covers: BR-ONBOARDING-003 (step 3 profile setup)
 * State broadcast: tdf:onboarding:state-update (TR-tadaify-006, tadaify-app#137)
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import { useEffect, useCallback, useState, useRef } from "react";
import type { Route } from "./+types/onboarding.profile";
import { publish } from "~/lib/onboarding-preview-bus";
import {
  validateAvatarFile,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_ERROR_MESSAGES,
} from "~/lib/avatar-validator";
import { buildAvatarPreviewUrl } from "~/routes/api.avatar.$key";

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

// ─── Avatar upload state ───────────────────────────────────────────────────────

type AvatarState =
  | { status: "idle" }
  | { status: "loading"; progress?: number }
  | { status: "success"; r2Key: string; previewUrl: string }
  | { status: "error"; message: string; retryable: boolean };

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ProfilePage({ loaderData, actionData }: Route.ComponentProps) {
  const { handle, platforms, socials, prefillName, prefillBio, prefillAv } = loaderData;
  const error = actionData?.error;
  const prefilled = actionData?.values;

  const currentName = prefilled?.name ?? prefillName;
  const currentBio = prefilled?.bio ?? prefillBio;

  // Avatar state — initialized from URL param if present (UC-4: refresh preserves av)
  const [avatarState, setAvatarState] = useState<AvatarState>(() => {
    if (prefillAv) {
      return {
        status: "success",
        r2Key: prefillAv,
        previewUrl: buildAvatarPreviewUrl(prefillAv),
      };
    }
    return { status: "idle" };
  });

  // Current r2_key for the hidden form field
  const currentR2Key =
    avatarState.status === "success" ? avatarState.r2Key : (prefilled?.av ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broadcast initial + updates to preview pane
  const broadcastState = useCallback(
    (name: string, bio: string, av: string | null) => {
      publish({
        handle,
        name: name || null,
        bio: bio || null,
        av,
        platforms: platforms ? platforms.split(",").filter(Boolean) : [],
        socials: (() => {
          try {
            return socials ? (JSON.parse(socials) as Record<string, string>) : {};
          } catch {
            return {};
          }
        })(),
        tpl: null,
      });
    },
    [handle, platforms, socials]
  );

  // Broadcast initial state on mount
  useEffect(() => {
    const avVal = avatarState.status === "success" ? avatarState.previewUrl : null;
    broadcastState(currentName, currentBio, avVal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only

  // Broadcast when avatar changes
  useEffect(() => {
    if (avatarState.status === "success") {
      broadcastState(currentName, currentBio, avatarState.previewUrl);
    }
  }, [avatarState, broadcastState, currentName, currentBio]);

  // Back URL preserves accumulated state
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  const backUrl = `/onboarding/social?${backParams.toString()}`;

  // ── Avatar upload handler ─────────────────────────────────────────────────

  async function handleFileSelected(file: File) {
    // Client-side validation (fast feedback; server is authoritative)
    const validation = validateAvatarFile({ type: file.type, size: file.size });
    if (!validation.ok) {
      setAvatarState({
        status: "error",
        message: AVATAR_ERROR_MESSAGES[validation.reason],
        retryable: false,
      });
      return;
    }

    setAvatarState({ status: "loading", progress: 0 });

    try {
      // Get access token from Supabase session cookie (or use mock token in MOCK_R2 mode)
      const sessionCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("sb-") && c.includes("-auth-token="));

      let accessToken = "";
      if (sessionCookie) {
        const eqIdx = sessionCookie.indexOf("=");
        const val = sessionCookie.slice(eqIdx + 1);
        try {
          const parsed = JSON.parse(decodeURIComponent(val));
          if (parsed?.access_token) accessToken = parsed.access_token as string;
        } catch {
          // not JSON
        }
      }

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/avatar");
      if (accessToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      }

      // Progress tracking (visual checklist item 4)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setAvatarState({ status: "loading", progress: pct });
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText) as { r2_key: string };
              const r2Key = data.r2_key;
              const previewUrl = buildAvatarPreviewUrl(r2Key);
              setAvatarState({ status: "success", r2Key, previewUrl });
            } catch {
              reject(new Error("Invalid server response"));
            }
            resolve();
          } else {
            let msg = "Upload failed — please retry";
            try {
              const errData = JSON.parse(xhr.responseText) as { message?: string; error?: string };
              if (errData.message) msg = errData.message;
            } catch {
              // ignore
            }
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => reject(new Error("Network error — upload failed"));
        xhr.send(formData);
      });
    } catch (err) {
      setAvatarState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed — please retry",
        retryable: true,
      });
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected after an error
    e.target.value = "";
    handleFileSelected(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleUploadZoneClick() {
    if (avatarState.status !== "loading") {
      fileInputRef.current?.click();
    }
  }

  function handleRetry() {
    fileInputRef.current?.click();
  }

  function handleSkip() {
    setAvatarState({ status: "idle" });
  }

  // ── Derived display values ────────────────────────────────────────────────

  const displayInitials = currentName
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
    : "?";

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
            onChange={(e) => {
              const bioEl = document.getElementById("bio") as HTMLTextAreaElement | null;
              broadcastState(
                e.target.value,
                bioEl?.value ?? currentBio,
                avatarState.status === "success" ? avatarState.previewUrl : null
              );
            }}
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
            onChange={(e) => {
              const nameEl = document.getElementById("name") as HTMLInputElement | null;
              broadcastState(
                nameEl?.value ?? currentName,
                e.target.value,
                avatarState.status === "success" ? avatarState.previewUrl : null
              );
            }}
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
            style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}
          >
            Avatar{" "}
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--fg-muted)" }}>
              (optional)
            </span>
          </label>

          {/* Hidden file input (triggered programmatically) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose avatar image"
            data-testid="avatar-file-input"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />

          {/* Hidden form field — carries r2_key to action */}
          <input type="hidden" name="av" value={currentR2Key} />

          {/* Upload zone */}
          <div
            role="button"
            tabIndex={avatarState.status === "loading" ? -1 : 0}
            aria-label={
              avatarState.status === "success"
                ? "Avatar uploaded. Click to replace."
                : "Upload avatar — click or drag and drop"
            }
            data-testid="avatar-upload-zone"
            onClick={handleUploadZoneClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUploadZoneClick();
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 120,
              minWidth: 44, // ECN-138-09: mobile tap target ≥ 44×44px
              padding: "20px 16px",
              border: `1.5px dashed ${
                avatarState.status === "error" ? "var(--danger)" : "var(--border-strong)"
              }`,
              borderRadius: "var(--radius)",
              background: "var(--bg-muted)",
              cursor: avatarState.status === "loading" ? "wait" : "pointer",
              textAlign: "center",
            }}
          >
            {/* State: idle */}
            {avatarState.status === "idle" && (
              <>
                {/* Avatar initials placeholder — dashed circle */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "2px dashed var(--border-strong)",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--fg-muted)",
                    fontWeight: 700,
                    fontSize: 24,
                  }}
                  aria-hidden
                >
                  {displayInitials}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--fg)", fontWeight: 500 }}>
                    Drag &amp; drop or click to browse
                  </p>
                  <p
                    data-testid="avatar-type-hint"
                    style={{ margin: "4px 0 0", fontSize: 12, color: "var(--fg-muted)" }}
                  >
                    JPG, PNG, WebP · max 2MB
                  </p>
                </div>
              </>
            )}

            {/* State: loading */}
            {avatarState.status === "loading" && (
              <>
                <div
                  role="status"
                  aria-label="Uploading..."
                  data-testid="avatar-upload-spinner"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "3px solid var(--border-strong)",
                    borderTopColor: "var(--brand-primary)",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ margin: 0, fontSize: 14, color: "var(--fg-muted)" }}>Uploading...</p>
                {avatarState.progress !== undefined && avatarState.progress > 0 && (
                  <div
                    role="progressbar"
                    aria-valuenow={avatarState.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Upload progress: ${avatarState.progress}%`}
                    style={{
                      width: "80%",
                      height: 4,
                      background: "var(--border-strong)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${avatarState.progress}%`,
                        height: "100%",
                        background: "var(--brand-primary)",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* State: success — circle-masked preview */}
            {avatarState.status === "success" && (
              <>
                <div
                  style={{
                    position: "relative",
                    width: 72,
                    height: 72,
                  }}
                >
                  <img
                    src={avatarState.previewUrl}
                    alt="Your avatar preview"
                    data-testid="avatar-preview-image"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Replace overlay on hover */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.15s",
                      pointerEvents: "none",
                    }}
                    className="avatar-replace-overlay"
                  >
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Replace</span>
                  </div>
                  <style>{`.avatar-upload-zone:hover .avatar-replace-overlay { opacity: 1; }`}</style>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)" }}>
                  Click to replace
                </p>
              </>
            )}

            {/* State: error */}
            {avatarState.status === "error" && (
              <>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "2px solid var(--danger)",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                  aria-hidden
                >
                  ✕
                </div>
                <p
                  role="alert"
                  data-testid="avatar-error-message"
                  style={{ margin: 0, fontSize: 14, color: "var(--danger)", fontWeight: 500 }}
                >
                  {avatarState.message}
                </p>
                {avatarState.retryable && (
                  <button
                    type="button"
                    data-testid="avatar-retry-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry();
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "var(--brand-primary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Retry upload
                  </button>
                )}
              </>
            )}
          </div>

          {/* Hint text (shown when idle or after error) */}
          {(avatarState.status === "idle" || avatarState.status === "error") && (
            <p
              style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}
            >
              JPG, PNG, WebP · max 2MB
            </p>
          )}

          {/* Skip link (visual checklist item 8 — avatar is optional per DEC-310=B) */}
          {avatarState.status !== "success" && (
            <p style={{ marginTop: 8, textAlign: "center" }}>
              <button
                type="button"
                data-testid="avatar-skip-button"
                onClick={handleSkip}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--fg-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Skip avatar — add later
              </button>
            </p>
          )}
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
