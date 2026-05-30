/**
 * /onboarding/profile — Step 3/5: Display name + bio + avatar (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-profile.html (Slice C 2026-04-30)
 *
 * URL state:
 *   loader reads → ?handle=&platforms=&socials=&name=&bio=&av=
 *   action emits → /onboarding/template?handle=&platforms=&socials=&name=&bio=&av=
 *
 * Avatar upload: POST /api/upload/avatar (TR-tadaify-003, tadaify-app#138).
 *   - r2_key stored in `av` URL param and passed forward.
 *   - Preview served via /api/avatar/:key (base64url-encoded r2_key).
 *   - AVATARS_R2 binding emulated by miniflare via @cloudflare/vite-plugin in local dev.
 *
 * DEC trail:
 *   DEC-297=B  profile is step 3/5
 *   DEC-298=A  manual-only; no platform scraping; Upload + Initials avatar; Write-your-own bio
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function initialsFor(name: string, handle: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return handle ? handle[0].toUpperCase() : "YOU";
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

  // Selected avatar source: 'upload' | 'initials' | null
  const [avatarSource, setAvatarSource] = useState<"upload" | "initials" | null>(
    prefillAv ? "upload" : null
  );

  // Live name for initials card refresh
  const [liveName, setLiveName] = useState(currentName);

  // Bio textarea content
  const [liveBio, setLiveBio] = useState(currentBio);
  const [bioLength, setBioLength] = useState(currentBio.length);
  const [bioSelected, setBioSelected] = useState(false);

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
      broadcastState(liveName, liveBio, avatarState.previewUrl);
    }
  }, [avatarState, broadcastState, liveName, liveBio]);

  // Back URL preserves accumulated state
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  const backUrl = `/onboarding/social?${backParams.toString()}`;

  const displayHandle = handle || "yourname";

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
      const formData = new FormData();
      formData.append("file", file);

      // Auth is resolved server-side from the request Cookie header.
      // Same-origin XHR sends cookies automatically — no client-side
      // document.cookie parsing needed (Codex F1 fix).
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/avatar");

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
          } else if (xhr.status === 503) {
            // Avatar uploads disabled (R2 not provisioned yet) — treat as
            // graceful skip, not an error. User can add avatar later.
            setAvatarState({ status: "idle" });
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

  // ── Avatar card selection ────────────────────────────────────────────────

  function selectUpload() {
    setAvatarSource("upload");
    if (avatarState.status !== "loading") {
      fileInputRef.current?.click();
    }
  }

  function selectInitials() {
    setAvatarSource("initials");
    setAvatarState({ status: "idle" });
    broadcastState(liveName, liveBio, null);
  }

  // ── Bio handlers ─────────────────────────────────────────────────────────

  function handleBioSelect() {
    setBioSelected(true);
  }

  function handleBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setLiveBio(val);
    setBioLength(val.length);
    broadcastState(
      liveName,
      val,
      avatarState.status === "success" ? avatarState.previewUrl : null
    );
  }

  // ── Name change ──────────────────────────────────────────────────────────

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLiveName(val);
    broadcastState(
      val,
      liveBio,
      avatarState.status === "success" ? avatarState.previewUrl : null
    );
  }

  // ── Skip profile ─────────────────────────────────────────────────────────

  function handleSkipProfile(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const url = new URLSearchParams();
    if (handle) url.set("handle", handle);
    if (platforms) url.set("platforms", platforms);
    if (socials) url.set("socials", socials);
    window.location.href = `/onboarding/template?${url.toString()}`;
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const initials = initialsFor(liveName, handle);

  const uploadThumbContent = () => {
    if (avatarState.status === "loading") {
      return (
        <>
          <div
            role="status"
            aria-label="Uploading..."
            data-testid="avatar-upload-spinner"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "3px solid var(--border-strong)",
              borderTopColor: "var(--brand-primary)",
              animation: "onb-profile-spin 0.8s linear infinite",
            }}
          />
        </>
      );
    }
    if (avatarState.status === "success") {
      return (
        <img
          src={avatarState.previewUrl}
          alt="Your avatar"
          data-testid="avatar-preview-image"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }
    if (avatarState.status === "error") {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      );
    }
    // idle
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    );
  };

  return (
    <>
      <main className="onboarding-shell">
        <div className="onboarding-shell-inner">

          {/* Progress bar: step 3 of 5 */}
          <div className="progress-bar" aria-label="Step 3 of 5">
            <div className="progress-step done"><span className="progress-dot" /></div>
            <div className="progress-line done" />
            <div className="progress-step done"><span className="progress-dot" /></div>
            <div className="progress-line done" />
            <div className="progress-step active"><span className="progress-dot" /></div>
            <div className="progress-line" />
            <div className="progress-step"><span className="progress-dot" /></div>
            <div className="progress-line" />
            <div className="progress-step"><span className="progress-dot" /></div>
          </div>
          <p className="progress-label">Step 3 of 5 · Make it yours</p>

          <div className="ob-twocol">

            <div className="onb-card onb-card-lg" style={{ marginTop: 24 }}>

              {/* Hero */}
              <div className="onb-hero">
                <span className="logo-mark" data-logo aria-hidden="true" />
                <div>
                  <h2 style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1 }}>Make it yours</h2>
                  <p className="text-muted" style={{ fontSize: 15, marginTop: 6 }}>
                    How should visitors see you?{" "}
                    <strong style={{ color: "var(--fg)" }}>You can always change this later.</strong>
                  </p>
                </div>
              </div>

              <form method="post" noValidate>
                <input type="hidden" name="handle" value={handle} />
                <input type="hidden" name="platforms" value={platforms} />
                <input type="hidden" name="socials" value={socials} />
                <input type="hidden" name="av" value={currentR2Key} />

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

                {/* ── 1. Display name ─────────────────────────────────────── */}
                <div className="onb-profile-field-label">
                  <h3>Display name</h3>
                  <span className="onb-profile-field-hint">Required</span>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  spellCheck={false}
                  defaultValue={currentName}
                  placeholder="e.g. Alexandra Doe"
                  maxLength={80}
                  className="onb-profile-name-input"
                  aria-describedby={error?.field === "name" ? "name-error" : undefined}
                  aria-invalid={error?.field === "name" || undefined}
                  onChange={handleNameChange}
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

                {/* ── 2. Avatar selector (DEC-298=A: upload + initials only) ── */}
                <div className="onb-profile-field-label">
                  <h3>Avatar</h3>
                  <span className="onb-profile-field-hint" id="avatar-hint">Pick one</span>
                </div>

                <div className="onb-profile-av-grid" id="av-grid" role="radiogroup" aria-label="Choose avatar type">

                  {/* Upload card */}
                  <div
                    className={`onb-profile-av-card${avatarSource === "upload" ? " is-selected" : ""}`}
                    data-source="upload"
                    tabIndex={0}
                    role="radio"
                    aria-checked={avatarSource === "upload"}
                    data-testid="avatar-upload-zone"
                    onClick={selectUpload}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") { e.preventDefault(); selectUpload(); }
                    }}
                  >
                    <div className="onb-profile-av-thumb" data-source="upload">
                      {uploadThumbContent()}
                    </div>
                    <span className="onb-profile-av-source">
                      {avatarState.status === "loading"
                        ? "Uploading…"
                        : avatarState.status === "success"
                        ? "Click to replace"
                        : avatarState.status === "error"
                        ? "Upload failed"
                        : "Upload your own"}
                    </span>
                    {avatarState.status === "error" && (
                      <span
                        role="alert"
                        data-testid="avatar-error-message"
                        style={{ fontSize: 11, color: "var(--danger)", textAlign: "center" }}
                      >
                        {avatarState.message}
                      </span>
                    )}
                    {avatarState.status === "loading" && avatarState.progress !== undefined && avatarState.progress > 0 && (
                      <div
                        role="progressbar"
                        aria-valuenow={avatarState.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${avatarState.progress}%`}
                        style={{
                          width: "80%",
                          height: 3,
                          background: "var(--border-strong)",
                          borderRadius: 2,
                          overflow: "hidden",
                          marginTop: 4,
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
                  </div>

                  {/* Initials card */}
                  <div
                    className={`onb-profile-av-card${avatarSource === "initials" ? " is-selected" : ""}`}
                    data-source="initials"
                    tabIndex={0}
                    role="radio"
                    aria-checked={avatarSource === "initials"}
                    onClick={selectInitials}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") { e.preventDefault(); selectInitials(); }
                    }}
                  >
                    <div
                      className={`onb-profile-av-thumb${avatarSource === "initials" ? " initials-selected" : ""}`}
                      data-source="initials"
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <span className="onb-profile-av-source">Use initials</span>
                  </div>

                </div>

                {/* ── 3. Bio (DEC-298=A: write your own only) ──────────────── */}
                <div className="onb-profile-field-label">
                  <h3>Bio / description</h3>
                  <span
                    className={`onb-profile-field-hint${bioLength > 140 ? " is-warn" : ""}`}
                    id="bio-counter"
                    aria-live="polite"
                  >
                    {bioLength} / 160
                  </span>
                </div>

                <div className="onb-profile-bio-list" id="bio-list">
                  {/* DEC-298=A: "Write your own" is the only bio option */}
                  <div
                    className={`onb-profile-bio-row${bioSelected ? " is-selected" : ""}`}
                    data-source="manual"
                    onClick={handleBioSelect}
                  >
                    <span className="onb-profile-bio-radio" />
                    <div className="onb-profile-bio-content">
                      <p className="onb-profile-bio-source">Write your own</p>
                      {bioSelected ? (
                        <textarea
                          id="bio"
                          name="bio"
                          className="onb-profile-bio-textarea"
                          placeholder="A short line about you. 160 characters max."
                          maxLength={BIO_MAX_LENGTH}
                          defaultValue={currentBio}
                          autoFocus
                          aria-describedby={error?.field === "bio" ? "bio-error" : "bio-counter"}
                          aria-invalid={error?.field === "bio" || undefined}
                          onChange={handleBioChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p
                          className="onb-profile-bio-text"
                          style={{ color: "var(--fg-subtle)", fontStyle: "italic" }}
                        >
                          {currentBio || "Click to write your own…"}
                        </p>
                      )}
                      {error?.field === "bio" && (
                        <p
                          id="bio-error"
                          role="alert"
                          style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}
                        >
                          {error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── 4. Actions ───────────────────────────────────────────── */}
                <div className="onb-profile-actions-row">
                  <Link
                    to={backUrl}
                    className="btn btn-secondary"
                    id="back-link"
                    aria-label="Back to social handles"
                  >
                    ← Back
                  </Link>
                  <button
                    type="submit"
                    id="continue-btn"
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1 }}
                  >
                    Continue →
                  </button>
                </div>

                {/* ── 5. Skip link ─────────────────────────────────────────── */}
                <a
                  href="#"
                  className="onb-profile-skip-link"
                  onClick={handleSkipProfile}
                >
                  Skip for now — set up later
                </a>

                {/* ── 6. Trust strip ──────────────────────────────────────── */}
                <p className="onb-profile-trust-strip">
                  🔒 GDPR-compliant · We never share your profile data
                </p>

              </form>
            </div>

            {/* Live preview pane (right column on >=960px, stacks <960px) */}
            <aside
              data-onboarding-preview
              data-render="profile"
              data-handle={displayHandle}
              data-platforms={platforms}
              aria-label="Live preview of your tadaify page"
            />

          </div>
          {/* /.ob-twocol */}

        </div>
      </main>
    </>
  );
}
