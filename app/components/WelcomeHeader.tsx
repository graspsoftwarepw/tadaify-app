/**
 * WelcomeHeader — persistent route-level header across all /register sections.
 *
 * Renders: "Hey @{handle} 👋 welcome to tada!ify"
 * - Stays mounted across A → B → B-email → B-otp → B-password-toggle → C
 * - Reactive on `handle` prop (updates in real-time, no debounce)
 * - Brand wordmark styled per DEC-WORDMARK-01 (3-span: ta=indigo, da!=warm, ify=dark)
 * - aria-live="polite" for screen reader announcements
 *
 * Story: F-002a — persistent welcome header (DEC-352=A + DEC-358=A)
 * Issue: tadaify-app#187
 */

export interface WelcomeHeaderProps {
  handle: string;
}

export function WelcomeHeader({ handle }: WelcomeHeaderProps) {
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
        Hey{" "}
        <span className="handle" style={{ color: "var(--brand-primary)" }}>
          @{handle || "yourname"}
        </span>{" "}
        <span aria-hidden>👋</span>
        {" "}welcome to{" "}
        <span className="brand-wordmark" aria-label="tada!ify">
          <span style={{ color: "var(--wm-ta)" }}>ta</span>
          <span style={{ color: "var(--wm-da)" }}>da!</span>
          <span style={{ color: "var(--wm-ify)" }}>ify</span>
        </span>
      </h1>
    </header>
  );
}
