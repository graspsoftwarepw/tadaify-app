/**
 * ThemeToggle — the prototype's light/dark switch.
 *
 * Drives a real theme change: toggles the `dark` class on <html>, which flips
 * every `--token` under `.dark` (see theme/proto-tokens.css) and activates
 * Tailwind `dark:` variants. This is the user-facing control the prototype
 * isolation check requires (active dark-class mutation + accessible label).
 *
 * @implements fr-globalui-theme-and-colours
 */
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "./theme";

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const [dark, setDark] = useState(prefersDark);

  // Keep local state in sync if another surface flipped the class.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    setDark(toggleTheme());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark theme"
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] dark:text-[var(--fg-muted)]"
    >
      {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
