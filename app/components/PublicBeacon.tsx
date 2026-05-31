/**
 * PublicBeacon — client-only analytics emitter for the public creator page.
 *
 * Renders nothing. On mount it sends one cookieless pageview beacon, then
 * delegates clicks: any click inside an element carrying `data-block-id`
 * (every public block renderer sets this on its `<article>` wrapper) emits a
 * click beacon for that block. Uses `navigator.sendBeacon` so it never blocks
 * navigation and survives unload.
 *
 * Privacy-first: no cookie, no localStorage, no fingerprint. The server turns
 * the request into a daily-rotating token (DEC-075). All pure payload logic
 * lives in `~/lib/insights/client-beacon` (unit-tested); this is thin glue.
 *
 * Story: F-INSIGHTS-EMIT-001.
 */

import { useEffect } from "react";
import {
  clickBeacon,
  sendClientBeacon,
  viewBeacon,
} from "~/lib/insights/client-beacon";

export function PublicBeacon({ handle }: { handle: string }): null {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Pageview.
    sendClientBeacon(
      viewBeacon({
        handle,
        pathname: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer,
      }),
    );

    // Block clicks (capture phase so we see the event even if the target stops
    // propagation later).
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el =
        target && typeof target.closest === "function"
          ? target.closest("[data-block-id]")
          : null;
      if (!el) return;
      const blockId = el.getAttribute("data-block-id") ?? "";
      if (!blockId) return;
      sendClientBeacon(
        clickBeacon({ handle, pathname: window.location.pathname, blockId }),
      );
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [handle]);

  return null;
}
