/**
 * WelcomeHeader — persistent route-level header across all /register sections.
 *
 * Renders section-aware copy per DEC-358=B (tadaify-app#196):
 *   A / B / B-email            → "Hey @{handle} 👋"
 *   B-otp / B-password-toggle  → "@{handle}, almost there..."
 *   C                          → "Welcome @{handle}!"
 *
 * - Stays mounted across A → B → B-email → B-otp → B-password-toggle → C
 * - Reactive on `handle` prop (updates in real-time, no debounce)
 * - Brand wordmark styled per DEC-WORDMARK-01 (3-span: ta=indigo, da!=warm, ify=dark)
 * - aria-live="polite" for screen reader announcements
 *
 * Story: F-002a — persistent welcome header (DEC-352=A)
 *        F-002a-followup — varying copy (DEC-358=B)
 * Issues: tadaify-app#187, tadaify-app#196
 */

import { getWelcomeCopy } from "~/lib/register-welcome-copy";
import type { RegisterSection } from "~/lib/register-welcome-copy";

export interface WelcomeHeaderProps {
  handle: string;
  section: RegisterSection;
}

export function WelcomeHeader({ handle, section }: WelcomeHeaderProps) {
  const displayHandle = handle || "yourname";
  const copy = getWelcomeCopy(section, displayHandle);

  // Section C copy ends with "!" — omit the wave emoji for that variant.
  // B-otp / B-password-toggle also omit the wave (starts with "@handle,").
  const showWave = section === "A" || section === "B" || section === "B-email";

  return (
    <header
      className="welcome-header"
      aria-live="polite"
      style={{
        padding: "clamp(10px, 2vw, 16px) clamp(24px, 4vw, 64px)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        // prevent eating viewport on mobile — max height 56px
        maxHeight: 64,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <h1
        className="font-display"
        style={{
          fontSize: "clamp(16px, 2.5vw, 24px)",
          lineHeight: 1.2,
          margin: 0,
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {showWave ? (
          // DEC-358=B — short copy only: "Hey @{handle} 👋" (no wordmark suffix)
          <>
            Hey{" "}
            <span className="handle" style={{ color: "var(--brand-primary)" }}>
              @{displayHandle}
            </span>{" "}
            <span aria-hidden>👋</span>
          </>
        ) : (
          <span data-welcome-copy={section}>{copy}</span>
        )}
      </h1>
    </header>
  );
}
