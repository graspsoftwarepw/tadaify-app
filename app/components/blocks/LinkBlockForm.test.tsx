/**
 * Unit tests — LinkBlockForm + link-block-save helpers.
 *
 * No JSDOM in the project (vitest env=node, see vitest.config.ts), so we
 * exercise the component via `renderToStaticMarkup` for SSR shape and call
 * the pure helpers (`buildLinkBlockPayload`, `validateLinkBlock`,
 * `saveLinkBlock`) directly.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 */

import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  LinkBlockForm,
  LINK_BLOCK_FORM_DEFAULTS,
  LABEL_MAX_CHARS,
  type LinkBlockFormValue,
} from "./LinkBlockForm";
import {
  buildLinkBlockPayload,
  validateLinkBlock,
  saveLinkBlock,
} from "~/lib/link-block-save";

const PAGE_ID = "11111111-2222-3333-4444-555555555555";

function value(overrides: Partial<LinkBlockFormValue> = {}): LinkBlockFormValue {
  return { ...LINK_BLOCK_FORM_DEFAULTS, ...overrides };
}

describe("LinkBlockForm — render", () => {
  it("renders the label, URL, icon, newtab toggle, and helper copy", () => {
    const html = renderToStaticMarkup(
      <LinkBlockForm
        value={value({ label: "Listen on Spotify", url: "https://x.test", newtab: true })}
        onChange={() => {}}
      />,
    );
    expect(html).toContain("Button label");
    expect(html).toContain("URL");
    expect(html).toContain("Icon");
    expect(html).toContain("Open in new tab");
    expect(html).toContain("Short and clickable");
    expect(html).toContain('data-testid="link-block-form"');
    expect(html).toContain('data-testid="link-block-label-input"');
    expect(html).toContain('data-testid="link-block-url-input"');
    expect(html).toContain('data-testid="link-block-newtab-toggle"');
  });

  it("enforces the label max-length attribute (cap at LABEL_MAX_CHARS=60)", () => {
    const html = renderToStaticMarkup(
      <LinkBlockForm value={value()} onChange={() => {}} />,
    );
    expect(html).toContain(`maxLength="${LABEL_MAX_CHARS}"`);
  });

  it("renders inline errors when urlError / labelError are set", () => {
    const html = renderToStaticMarkup(
      <LinkBlockForm
        value={value()}
        onChange={() => {}}
        labelError="Label is required."
        urlError="URL is required."
      />,
    );
    expect(html).toContain("Label is required.");
    expect(html).toContain("URL is required.");
    expect(html).toContain('data-testid="link-block-label-error"');
    expect(html).toContain('data-testid="link-block-url-error"');
  });

  it("aria-checked on the newtab toggle reflects value.newtab", () => {
    const onWhen = renderToStaticMarkup(
      <LinkBlockForm value={value({ newtab: true })} onChange={() => {}} />,
    );
    const offWhen = renderToStaticMarkup(
      <LinkBlockForm value={value({ newtab: false })} onChange={() => {}} />,
    );
    expect(onWhen).toContain('aria-checked="true"');
    expect(offWhen).toContain('aria-checked="false"');
  });
});

describe("validateLinkBlock", () => {
  it("returns no errors when both label and URL are filled", () => {
    const result = validateLinkBlock(
      value({ label: "Listen", url: "https://x.test" }),
    );
    expect(result).toEqual({ labelError: null, urlError: null });
  });

  it("reports both errors when both fields are empty", () => {
    const result = validateLinkBlock(value({ label: "  ", url: "" }));
    expect(result.labelError).toBeTruthy();
    expect(result.urlError).toBeTruthy();
  });
});

describe("buildLinkBlockPayload", () => {
  it("normalises a bare URL to https:// (AC#4)", () => {
    const payload = buildLinkBlockPayload({
      pageId: PAGE_ID,
      value: value({ label: "Listen", url: "spotify.com/x" }),
    });
    expect(payload).toEqual({
      page_id: PAGE_ID,
      block_type: "link",
      title: "Listen",
      url: "https://spotify.com/x",
      meta: { icon: null, newtab: true },
    });
  });

  it("preserves an explicit https:// URL", () => {
    const payload = buildLinkBlockPayload({
      pageId: PAGE_ID,
      value: value({ label: "x", url: "https://foo.test" }),
    });
    expect(payload.url).toBe("https://foo.test");
  });

  it("stores icon + newtab=false from meta", () => {
    const payload = buildLinkBlockPayload({
      pageId: PAGE_ID,
      value: value({
        label: "x",
        url: "https://foo.test",
        icon: "simple-icons:spotify",
        newtab: false,
      }),
    });
    expect(payload.meta).toEqual({
      icon: "simple-icons:spotify",
      newtab: false,
    });
  });
});

describe("saveLinkBlock", () => {
  it("posts to /api/blocks with credentials and the built payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ block: { id: "b1" } }), { status: 201 }),
    );
    const res = await saveLinkBlock(
      {
        pageId: PAGE_ID,
        value: value({ label: "Hi", url: "example.com" }),
      },
      fetchMock as unknown as typeof fetch,
    );
    expect(res.ok).toBe(true);
    expect(res.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/blocks");
    expect((init as RequestInit).method).toBe("POST");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.page_id).toBe(PAGE_ID);
    expect(body.url).toBe("https://example.com");
    expect(body.block_type).toBe("link");
    expect(body.meta).toEqual({ icon: null, newtab: true });
  });

  it("surfaces server error message on non-OK response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Validation failed" }), {
        status: 400,
      }),
    );
    const res = await saveLinkBlock(
      { pageId: PAGE_ID, value: value({ label: "x", url: "x" }) },
      fetchMock as unknown as typeof fetch,
    );
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
    expect(res.error).toBe("Validation failed");
  });
});
