/**
 * Shared prototype helper for carrying the chosen handle through the
 * register → onboarding chain via a `?handle=` query param. Mock-only:
 * the proto uses plain anchors (full navigations), so each screen reads the
 * param straight off `window.location.search`.
 *
 * Shared infrastructure: carries no `@implements` marker and is not listed in
 * any FR's related_files.
 */

/** Read `?handle=` from the current URL, falling back to a fixture default. */
export function readHandleParam(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const fromUrl = new URLSearchParams(window.location.search).get("handle");
  const trimmed = (fromUrl ?? "").trim();
  return trimmed || fallback;
}

/** Append `?handle=<h>` (URL-encoded) to a `/__proto/*` href. */
export function withHandle(href: string, handle: string): string {
  return `${href}?handle=${encodeURIComponent(handle)}`;
}
