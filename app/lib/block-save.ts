/**
 * block-save — serialize the canonical block editor's state into a
 * `POST/PATCH /api/blocks` payload, and perform the request.
 *
 * Design (per Owner decision 2026-05-31):
 *   - The block's PRIMARY content is variant A. `block_type`, `title`, `url`
 *     and the top-level `meta` fields come from variant A's form value.
 *   - A/B variant B is stored INSIDE `meta.variantB` (no schema migration).
 *     It is only included when the creator is on the Business tier AND the two
 *     variants actually differ — matching the tier gate's "keeps Variant A
 *     live" partial-save semantics for lower tiers.
 *   - The public renderers (app/components/blocks/public/*) read `meta.<field>`
 *     using the SAME field names as each form value, so storing the form value
 *     as `meta` satisfies the read contract. `meta.variantB` is ignored by the
 *     renderers (they render the primary content only).
 *
 * SECURITY: the newsletter form value carries provider secrets (apiKey_*,
 * listId_*, webhookUrl, gsheet*). Those are deliberately stripped here — they
 * must NOT land in `blocks.meta`, which is read by the public page loader. Only
 * presentational fields are persisted; the provider submit backend (a separate,
 * future slice) will own secret storage server-side.
 *
 * Story: F-BLOCK-SAVE-001 (tadaify-app#56) — wires the previously-stubbed
 * `doSave()` in BlockEditorCanonical.
 */

import { normalizeUrl } from "~/lib/normalize-url";

export type BlockSaveType =
  | "link"
  | "image"
  | "embed"
  | "heading"
  | "divider"
  | "social"
  | "newsletter"
  | "product"
  | "video"
  | "accordion"
  | "custom-html"
  | "countdown";

/** Presentational newsletter fields that are safe to persist in public meta. */
const NEWSLETTER_PUBLIC_KEYS = [
  "provider",
  "heading",
  "subhead",
  "cta",
  "ctaIcon",
  "placeholder",
  "success",
  "captureName",
] as const;

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object"
    ? { ...(data as Record<string, unknown>) }
    : {};
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export interface SerializedContent {
  title: string;
  url: string | null;
  meta: Record<string, unknown>;
}

/**
 * Map one variant's form value into `{ title, url, meta }`. `meta` mirrors the
 * form value (minus secrets) so the matching public renderer can read it back.
 */
export function serializeContent(
  type: BlockSaveType,
  data: unknown,
): SerializedContent {
  const raw = asRecord(data);

  // Newsletter: keep only presentational keys — never persist provider secrets.
  let meta: Record<string, unknown>;
  if (type === "newsletter") {
    meta = {};
    for (const key of NEWSLETTER_PUBLIC_KEYS) {
      if (key in raw) meta[key] = raw[key];
    }
  } else {
    meta = raw;
  }

  let title = "";
  let url: string | null = null;

  switch (type) {
    case "link": {
      title = str(raw.label).trim();
      url = normalizeUrl(str(raw.url)) || null;
      break;
    }
    case "heading": {
      title = str(raw.text);
      break;
    }
    case "video": {
      title = str(raw.caption);
      url = normalizeUrl(str(raw.url)) || null;
      break;
    }
    case "embed": {
      url = normalizeUrl(str(raw.url)) || null;
      break;
    }
    case "image": {
      title = str(raw.alt);
      const href = str(raw.href);
      url = href ? normalizeUrl(href) || null : null;
      break;
    }
    case "newsletter": {
      title = str(raw.heading);
      break;
    }
    case "countdown": {
      title = str(raw.label);
      break;
    }
    case "product": {
      title = str(raw.title);
      const purl = str(raw.url);
      url = purl ? normalizeUrl(purl) || null : null;
      break;
    }
    // divider / social / accordion / custom-html: no title/url.
    default:
      break;
  }

  return { title, url, meta };
}

/** Keys that `buildBlockSavePayload` injects into meta but are NOT form fields. */
const NON_FORM_META_KEYS = ["variantB", "schedule"] as const;

/**
 * Inverse of `serializeContent` for EDIT mode: recover a variant's form-value
 * record from a stored block's `meta`. Strips the non-form meta keys
 * (`variantB` / `schedule`) injected by `buildBlockSavePayload`. The caller
 * merges the result over the block type's form defaults so any field absent
 * from an older save still gets a sane default.
 *
 * Note: newsletter provider secrets were never persisted (see serialize), so
 * they cannot — and must not — be recovered here.
 */
export function deserializeContent(meta: unknown): Record<string, unknown> {
  const raw = asRecord(meta);
  for (const key of NON_FORM_META_KEYS) delete raw[key];
  return raw;
}

export interface BuildPayloadInput {
  type: BlockSaveType;
  variantA: unknown;
  variantB: unknown;
  /** Include variant B in meta (Business tier + variants differ). */
  includeVariantB: boolean;
  /** Block visibility (only applied on update / a follow-up patch on create). */
  visible: boolean;
  /** Optional schedule window, persisted in meta when both tier-allowed + set. */
  schedule?: { start: string; end: string } | null;
}

export interface BlockSavePayload {
  block_type: BlockSaveType;
  title: string;
  url: string | null;
  is_visible: boolean;
  meta: Record<string, unknown>;
}

/** Build the full save payload from the editor's variant state. */
export function buildBlockSavePayload(input: BuildPayloadInput): BlockSavePayload {
  const a = serializeContent(input.type, input.variantA);
  const meta: Record<string, unknown> = { ...a.meta };

  if (input.includeVariantB) {
    meta.variantB = serializeContent(input.type, input.variantB).meta;
  }

  if (input.schedule && (input.schedule.start || input.schedule.end)) {
    meta.schedule = { start: input.schedule.start, end: input.schedule.end };
  }

  return {
    block_type: input.type,
    title: a.title,
    url: a.url,
    is_visible: input.visible,
    meta,
  };
}

export interface SaveBlockArgs {
  payload: BlockSavePayload;
  /** Existing block id → PATCH (edit). Null/undefined → POST (create). */
  blockId?: string | null;
  /** Owning page id — required for create. */
  pageId?: string | null;
}

export interface SaveBlockResult {
  ok: boolean;
  status: number;
  block?: unknown;
  error?: string;
}

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Persist a block. Edits PATCH `/api/blocks/:id`; creates POST `/api/blocks`.
 * On create with `is_visible === false` a follow-up PATCH applies visibility,
 * because the create endpoint does not accept `is_visible` (DB defaults true).
 */
export async function saveBlock(
  args: SaveBlockArgs,
  fetchImpl: typeof fetch = fetch,
): Promise<SaveBlockResult> {
  const { payload, blockId, pageId } = args;

  // ── Update ──
  if (blockId) {
    const res = await fetchImpl(`/api/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        block_type: payload.block_type,
        title: payload.title,
        url: payload.url,
        is_visible: payload.is_visible,
        meta: payload.meta,
      }),
    });
    const body = await parseJson(res);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (body as { error?: string } | null)?.error ?? `HTTP ${res.status}`,
      };
    }
    return { ok: true, status: res.status, block: (body as { block?: unknown } | null)?.block };
  }

  // ── Create ──
  if (!pageId) {
    return { ok: false, status: 0, error: "Cannot create block without a page id" };
  }

  const res = await fetchImpl("/api/blocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      page_id: pageId,
      block_type: payload.block_type,
      title: payload.title,
      url: payload.url,
      meta: payload.meta,
    }),
  });
  const body = await parseJson(res);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: (body as { error?: string } | null)?.error ?? `HTTP ${res.status}`,
    };
  }
  const block = (body as { block?: { id?: string } } | null)?.block;

  // Create endpoint can't set is_visible; apply a follow-up patch if hidden.
  if (payload.is_visible === false && block && typeof block.id === "string") {
    await fetchImpl(`/api/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ is_visible: false }),
    }).catch(() => undefined);
  }

  return { ok: true, status: res.status, block };
}
