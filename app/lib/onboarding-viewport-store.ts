/**
 * onboarding-viewport-store — sessionStorage-backed viewport preference.
 *
 * Key: tadaify:onboarding:viewport
 * Values: 'desktop' | 'tablet' | 'mobile'
 * Default: 'desktop' (on missing or invalid stored value)
 *
 * TR-tadaify-006 contract:
 *   Viewport state persists in sessionStorage under 'tadaify:onboarding:viewport'.
 *   Valid values: 'desktop' | 'tablet' | 'mobile'. Unknown values fall back to 'desktop'.
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U2 (sessionStorage round-trip tests in onboarding-viewport-store.test.ts)
 */

export type ViewportSize = "desktop" | "tablet" | "mobile";

export const SESSION_KEY = "tadaify:onboarding:viewport";
const VALID_VALUES: ViewportSize[] = ["desktop", "tablet", "mobile"];

/**
 * Returns true if the value is a valid ViewportSize.
 */
function isValidViewport(v: unknown): v is ViewportSize {
  return VALID_VALUES.includes(v as ViewportSize);
}

/**
 * Persists the chosen viewport to sessionStorage.
 */
export function setViewport(viewport: ViewportSize): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, viewport);
  } catch {
    // sessionStorage may be unavailable (private browsing strict mode)
  }
}

/**
 * Retrieves the stored viewport preference.
 * Returns 'desktop' if the key is missing, invalid, or sessionStorage is unavailable.
 */
export function getViewport(): ViewportSize {
  if (typeof window === "undefined") return "desktop";
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(SESSION_KEY);
  } catch {
    return "desktop";
  }
  if (raw === null) return "desktop";
  if (!isValidViewport(raw)) {
    console.warn(
      `[onboarding-viewport-store] invalid stored value "${raw}" — falling back to "desktop"`
    );
    return "desktop";
  }
  return raw;
}
