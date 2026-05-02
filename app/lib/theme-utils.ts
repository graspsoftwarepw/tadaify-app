/**
 * Theme utility helpers — pure functions extracted from ThemeToggleButton
 * for testability without a DOM environment.
 *
 * The ThemeToggleButton component delegates initial-theme resolution and
 * apply-side-effects to these helpers. Tests in `theme-utils.test.ts` cover
 * the persistence + prefers-color-scheme priority paths via injected stubs
 * for the Storage and Document interfaces.
 *
 * Story: F-REGISTER-001a (visual divergence fix #145, Codex round-1 P3)
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "tadaify.theme";

/**
 * Minimal Storage shape we depend on — narrower than the full DOM Storage
 * interface so tests can pass a plain object stub.
 */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Minimal media-query matcher shape.
 */
export interface MediaQueryMatcher {
  matches: boolean;
}

/**
 * Resolve the initial theme on first paint:
 *   1. Stored value in `THEME_STORAGE_KEY` if it's a valid Theme,
 *   2. otherwise `prefers-color-scheme: dark` if the matcher matches,
 *   3. otherwise default to "light".
 *
 * Pure function — does NOT touch globals. Both inputs are nullable so the
 * caller can safely pass through unavailable browser APIs (private mode
 * blocks localStorage; old browsers lack matchMedia).
 */
export function readInitialTheme(
  storage: ThemeStorage | null,
  prefersDark: MediaQueryMatcher | null
): Theme {
  if (storage) {
    try {
      const stored = storage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // Storage may throw in private mode — fall through.
    }
  }
  if (prefersDark?.matches) return "dark";
  return "light";
}

/**
 * Minimal class-list shape (DOMTokenList subset).
 */
export interface ClassList {
  toggle(token: string, force?: boolean): boolean;
}

/**
 * Apply a theme decision: toggle the `dark-mode` class on the given
 * class-list and persist the choice via the storage stub. Both side effects
 * are injected so tests can assert them in isolation.
 *
 * Returns the theme so chained callers can read the value back.
 */
export function applyTheme(
  theme: Theme,
  bodyClassList: ClassList | null,
  storage: ThemeStorage | null
): Theme {
  if (bodyClassList) {
    bodyClassList.toggle("dark-mode", theme === "dark");
  }
  if (storage) {
    try {
      storage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage may throw in private mode — toggle still works in-memory.
    }
  }
  return theme;
}

/**
 * Flip a theme decision.
 */
export function nextTheme(current: Theme): Theme {
  return current === "light" ? "dark" : "light";
}
