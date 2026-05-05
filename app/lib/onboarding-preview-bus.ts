/**
 * onboarding-preview-bus — debounced event bus for preview pane state broadcast.
 *
 * Publishes/subscribes to the `tdf:onboarding:state-update` DOM custom event.
 * Debounces rapid `publish()` calls to a single fire after 150ms.
 *
 * TR-tadaify-006 contract:
 *   Event name:  tdf:onboarding:state-update
 *   Payload:     OnboardingPreviewState
 *   Debounce:    150ms (configurable for tests)
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U1 (debounce tests in onboarding-preview-bus.test.ts)
 */

export interface OnboardingPreviewState {
  handle: string;
  name: string | null;
  bio: string | null;
  av: string | null;
  platforms: string[];
  socials: Record<string, string>;
  tpl: string | null;
}

export const PREVIEW_EVENT = "tdf:onboarding:state-update";
export const DEBOUNCE_MS = 150;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Publishes a state update event with 150ms debounce.
 * If called multiple times within the debounce window, only the LAST payload fires.
 *
 * @param state - current preview state
 * @param debounceMs - override for tests (default: DEBOUNCE_MS)
 */
export function publish(state: OnboardingPreviewState, debounceMs = DEBOUNCE_MS): void {
  if (typeof window === "undefined") return;
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const event = new CustomEvent<OnboardingPreviewState>(PREVIEW_EVENT, {
      detail: state,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, debounceMs);
}

/**
 * Subscribes to preview state updates.
 * Returns an unsubscribe function.
 */
export function subscribe(
  listener: (state: OnboardingPreviewState) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const ce = e as CustomEvent<OnboardingPreviewState>;
    listener(ce.detail);
  };

  window.addEventListener(PREVIEW_EVENT, handler);
  return () => {
    window.removeEventListener(PREVIEW_EVENT, handler);
  };
}
