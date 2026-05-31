/**
 * block-save unit tests.
 *
 * Story: F-BLOCK-SAVE-001 (tadaify-app#56)
 */

import { describe, it, expect, vi } from "vitest";
import {
  serializeContent,
  buildBlockSavePayload,
  saveBlock,
} from "./block-save";

describe("serializeContent", () => {
  it("link → title=label, url normalized, meta carries icon/newtab", () => {
    const r = serializeContent("link", {
      label: "  Listen  ",
      url: "spotify.com/x",
      icon: "spotify",
      newtab: true,
    });
    expect(r.title).toBe("Listen");
    expect(r.url).toBe("https://spotify.com/x");
    expect(r.meta).toMatchObject({ icon: "spotify", newtab: true });
  });

  it("heading → title=text, no url", () => {
    const r = serializeContent("heading", { text: "Hi", level: "h2", align: "center" });
    expect(r.title).toBe("Hi");
    expect(r.url).toBeNull();
    expect(r.meta).toMatchObject({ level: "h2", align: "center" });
  });

  it("video → title=caption, url normalized", () => {
    const r = serializeContent("video", {
      url: "youtu.be/abc",
      provider: "youtube",
      caption: "BTS",
    });
    expect(r.title).toBe("BTS");
    expect(r.url).toBe("https://youtu.be/abc");
  });

  it("image → url from href, title from alt", () => {
    expect(serializeContent("image", { alt: "Cover", href: "shop.com/x" })).toMatchObject({
      title: "Cover",
      url: "https://shop.com/x",
    });
    expect(serializeContent("image", { alt: "Cover", href: "" }).url).toBeNull();
  });

  it("divider/social/accordion/custom-html → no title/url, meta mirrors data", () => {
    expect(serializeContent("divider", { style: "line" })).toMatchObject({
      title: "",
      url: null,
      meta: { style: "line" },
    });
    expect(serializeContent("custom-html", { html: "<b>x</b>" }).meta).toEqual({
      html: "<b>x</b>",
    });
  });

  it("newsletter → ONLY presentational fields, NEVER secrets", () => {
    const r = serializeContent("newsletter", {
      provider: "kit",
      heading: "Join",
      subhead: "weekly",
      cta: "Subscribe",
      ctaIcon: "send",
      placeholder: "you@x.com",
      success: "Thanks!",
      captureName: true,
      apiKey_kit: "SECRET_123",
      listId_kit: "list_9",
      webhookUrl: "https://hooks.example.com/secret",
      apiKey_mailchimp: "SECRET_MC",
    });
    expect(r.title).toBe("Join");
    expect(r.meta).toEqual({
      provider: "kit",
      heading: "Join",
      subhead: "weekly",
      cta: "Subscribe",
      ctaIcon: "send",
      placeholder: "you@x.com",
      success: "Thanks!",
      captureName: true,
    });
    const serialized = JSON.stringify(r.meta);
    expect(serialized).not.toContain("SECRET_123");
    expect(serialized).not.toContain("SECRET_MC");
    expect(serialized).not.toContain("hooks.example.com");
    expect(serialized).not.toContain("list_9");
  });
});

describe("buildBlockSavePayload", () => {
  const variantA = { text: "A", level: "h1", align: "left" };
  const variantB = { text: "B", level: "h2", align: "right" };

  it("includes variantB in meta only when includeVariantB is true", () => {
    const without = buildBlockSavePayload({
      type: "heading",
      variantA,
      variantB,
      includeVariantB: false,
      visible: true,
    });
    expect(without.meta.variantB).toBeUndefined();
    expect(without.title).toBe("A");

    const withB = buildBlockSavePayload({
      type: "heading",
      variantA,
      variantB,
      includeVariantB: true,
      visible: true,
    });
    expect(withB.meta.variantB).toMatchObject({ text: "B", level: "h2" });
  });

  it("persists schedule only when provided + non-empty", () => {
    const p = buildBlockSavePayload({
      type: "heading",
      variantA,
      variantB,
      includeVariantB: false,
      visible: true,
      schedule: { start: "2026-06-01", end: "" },
    });
    expect(p.meta.schedule).toEqual({ start: "2026-06-01", end: "" });

    const none = buildBlockSavePayload({
      type: "heading",
      variantA,
      variantB,
      includeVariantB: false,
      visible: true,
      schedule: { start: "", end: "" },
    });
    expect(none.meta.schedule).toBeUndefined();
  });
});

describe("saveBlock", () => {
  function okResponse(body: unknown, status = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as unknown as Response;
  }

  const payload = {
    block_type: "heading" as const,
    title: "Hi",
    url: null,
    is_visible: true,
    meta: { level: "h2" },
  };

  it("POSTs to /api/blocks with page_id on create", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ block: { id: "new-1" } }, 201));
    const res = await saveBlock({ payload, blockId: null, pageId: "page-1" }, fetchMock);
    expect(res.ok).toBe(true);
    expect(res.block).toMatchObject({ id: "new-1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/blocks");
    expect(init.method).toBe("POST");
    const sent = JSON.parse(init.body);
    expect(sent.page_id).toBe("page-1");
    expect(sent.is_visible).toBeUndefined(); // create endpoint ignores it
  });

  it("PATCHes /api/blocks/:id on update, including is_visible", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ block: { id: "b-1" } }));
    await saveBlock({ payload: { ...payload, is_visible: false }, blockId: "b-1" }, fetchMock);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/blocks/b-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body).is_visible).toBe(false);
  });

  it("follows create with a visibility PATCH when hidden", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse({ block: { id: "new-2" } }, 201))
      .mockResolvedValueOnce(okResponse({ block: { id: "new-2" } }));
    await saveBlock(
      { payload: { ...payload, is_visible: false }, blockId: null, pageId: "page-1" },
      fetchMock,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url2, init2] = fetchMock.mock.calls[1];
    expect(url2).toBe("/api/blocks/new-2");
    expect(JSON.parse(init2.body)).toEqual({ is_visible: false });
  });

  it("returns an error result on a non-OK response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ error: "nope" }, 422));
    const res = await saveBlock({ payload, blockId: "b-1" }, fetchMock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("nope");
  });

  it("refuses to create without a page id", async () => {
    const fetchMock = vi.fn();
    const res = await saveBlock({ payload, blockId: null, pageId: null }, fetchMock);
    expect(res.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
