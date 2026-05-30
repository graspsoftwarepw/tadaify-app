/**
 * link-block-save — payload helper + POST shim for the Link button block.
 *
 * Centralised so both the dashboard wiring and the test harness can reuse
 * the exact same request shape and validation rules. The actual fetch call
 * is wrapped here so unit tests can assert the body without spinning a
 * full DOM.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 * Covers: AC#4 (https auto-prepend), BR-BLOCK-LINK-001 (create flow)
 */

import { normalizeUrl } from "~/lib/normalize-url";
import type { LinkBlockFormValue } from "~/components/blocks/LinkBlockForm";

export interface LinkBlockSaveInput {
  /** The page that owns the new block. */
  pageId: string;
  /** Current form state. */
  value: LinkBlockFormValue;
}

export interface LinkBlockCreatePayload {
  page_id: string;
  block_type: "link";
  title: string;
  url: string;
  meta: { icon: string | null; newtab: boolean };
}

/**
 * Build the exact JSON body that `POST /api/blocks` expects for a link block.
 * URL is normalised through `normalizeUrl` so `spotify.com/x` becomes
 * `https://spotify.com/x` (AC#4 / ECN-BLOCK-LINK-01).
 */
export function buildLinkBlockPayload(
  input: LinkBlockSaveInput,
): LinkBlockCreatePayload {
  const { pageId, value } = input;
  return {
    page_id: pageId,
    block_type: "link",
    title: value.label.trim(),
    url: normalizeUrl(value.url),
    meta: {
      icon: value.icon ?? null,
      // Stored explicitly (not `?? true`) so the renderer can trust the JSON.
      newtab: value.newtab !== false,
    },
  };
}

/** Pure validation — returns first error message, or null when value is OK. */
export function validateLinkBlock(
  value: LinkBlockFormValue,
): { labelError: string | null; urlError: string | null } {
  let labelError: string | null = null;
  let urlError: string | null = null;
  if (!value.label.trim()) {
    labelError = "Label is required.";
  }
  if (!value.url.trim()) {
    urlError = "URL is required.";
  }
  return { labelError, urlError };
}

export interface LinkBlockSaveResult {
  ok: boolean;
  status: number;
  block?: unknown;
  error?: string;
}

/**
 * POST the payload to `/api/blocks`. Thin wrapper so callers can mock
 * `fetch` in tests without re-implementing the body shape.
 */
export async function saveLinkBlock(
  input: LinkBlockSaveInput,
  fetchImpl: typeof fetch = fetch,
): Promise<LinkBlockSaveResult> {
  const payload = buildLinkBlockPayload(input);
  const res = await fetchImpl("/api/blocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const err =
      (body as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
    return { ok: false, status: res.status, error: err };
  }
  const block = (body as { block?: unknown } | null)?.block;
  return { ok: true, status: res.status, block };
}
