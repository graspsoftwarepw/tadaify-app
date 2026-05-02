/**
 * ThemeToggleButton — sun/moon SVG toggle that mirrors
 * mockups/tadaify-mvp/register.html lines 65-76 + 498.
 *
 * Behavior matches the mockup precisely: toggles `body.dark-mode` class.
 * Persists choice in localStorage; respects prefers-color-scheme on first load.
 *
 * NOTE: the mockup's `.dark-mode` only swaps the toggle icons themselves —
 * the page palette does not change because tokens.css doesn't ship a dark
 * variant. We mirror that contract: this button gives the affordance the
 * mockup designs, full token-level dark mode is a separate (out-of-scope)
 * feature.
 *
 * Story: F-REGISTER-001a (visual divergence fix #145)
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "tadaify.theme";

function readInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall through
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function ThemeToggleButton() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = readInitialTheme();
    setTheme(initial);
    document.body.classList.toggle("dark-mode", initial === "dark");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.body.classList.toggle("dark-mode", next === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — toggle still works in-memory
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle-btn"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={theme === "dark"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "transparent",
        border: "1px solid transparent",
        color: "var(--fg-muted)",
        cursor: "pointer",
        transition: "all .12s ease",
        position: "relative",
      }}
    >
      {/* Sun — visible in light mode */}
      <svg
        className="theme-icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ width: 18, height: 18, transition: "opacity .2s ease, transform .3s cubic-bezier(.2,.8,.2,1)" }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      {/* Moon — visible in dark mode */}
      <svg
        className="theme-icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          position: "absolute",
          opacity: 0,
          transform: "rotate(-30deg) scale(0.6)",
          transition: "opacity .2s ease, transform .3s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
