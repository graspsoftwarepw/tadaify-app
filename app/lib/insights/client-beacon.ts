/**
 * client-beacon — pure helpers for the public-page analytics emitter.
 *
 * The DOM/effect wiring lives in `~/components/PublicBeacon`; everything that
 * can be pure (payload shape, UTM parsing) lives here so it is unit-testable in
 * the project's node test environment.
 *
 * Payloads match the `/api/beacon` contract (see `beacon-event.ts`).
 *
 * Story: F-INSIGHTS-EMIT-001.
 */

export interface ViewBeacon {
  handle: string;
  type: "view";
  path: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export interface ClickBeacon {
  handle: string;
  type: "click";
  path: string;
  blockId: string;
}

export type ClientBeacon = ViewBeacon | ClickBeacon;

export interface Utm {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

/** Extract utm_source/medium/campaign from a location search string. */
export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search || "");
  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  };
}

export function viewBeacon(opts: {
  handle: string;
  pathname: string;
  search: string;
  referrer: string;
}): ViewBeacon {
  return {
    handle: opts.handle,
    type: "view",
    path: opts.pathname || "/",
    referrer: opts.referrer || "",
    ...parseUtm(opts.search),
  };
}

export function clickBeacon(opts: {
  handle: string;
  pathname: string;
  blockId: string;
}): ClickBeacon {
  return {
    handle: opts.handle,
    type: "click",
    path: opts.pathname || "/",
    blockId: opts.blockId,
  };
}

export const BEACON_ENDPOINT = "/api/beacon";

/**
 * Send a beacon. Prefers `navigator.sendBeacon` (survives page unload, doesn't
 * block) and falls back to `fetch(..., {keepalive})`. Best-effort: never throws.
 */
export function sendClientBeacon(
  payload: ClientBeacon,
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
  fetchImpl: typeof fetch | undefined = typeof fetch !== "undefined" ? fetch : undefined,
): void {
  const body = JSON.stringify(payload);
  try {
    if (nav && typeof nav.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      nav.sendBeacon(BEACON_ENDPOINT, blob);
      return;
    }
    if (fetchImpl) {
      void fetchImpl(BEACON_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "omit",
      }).catch(() => undefined);
    }
  } catch {
    // Analytics must never break the page.
  }
}
