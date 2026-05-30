/**
 * EmbedBlockRenderer — public-page renderer for `block_type = "embed"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * The editor lists 12 supported providers. We split them into two tiers:
 *
 *   1. iframe-embeddable from the URL alone (no third-party script): Spotify,
 *      SoundCloud, Apple Podcasts, Apple Music, YouTube, Vimeo, Loom. These
 *      render a real inline player.
 *   2. script-only providers (TikTok, X/Twitter, Bluesky, Instagram, Bandcamp).
 *      Embedding these needs a client widget script we deliberately don't load
 *      on public pages, so they degrade to an honest "Open on <provider>" link
 *      card rather than a broken/empty embed (no fake margin).
 *
 * Block shape (PublicBlock):
 *   - `url`  is a fallback for the embed URL if `meta.url` is absent.
 *   - `meta` mirrors `EmbedFormValue`: `{ url?, caption? }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-embed*`.
 *
 * Story: F-BLOCK-EMBED-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

interface EmbedBlockMeta {
  url: string;
  caption: string;
}

function readEmbedMeta(block: PublicBlock): EmbedBlockMeta {
  const m =
    block.meta && typeof block.meta === "object"
      ? (block.meta as Record<string, unknown>)
      : {};
  const metaUrl = typeof m.url === "string" ? m.url : "";
  const url = metaUrl || (typeof block.url === "string" ? block.url : "");
  const caption = typeof m.caption === "string" ? m.caption : "";
  return { url, caption };
}

/** An iframe-based embed with an explicit pixel height. */
interface IframeEmbed {
  kind: "iframe";
  src: string;
  height: number;
  title: string;
}
/** A 16:9 responsive video embed. */
interface VideoEmbed {
  kind: "video";
  src: string;
  title: string;
}
/** A link-card fallback for script-only providers. */
interface LinkEmbed {
  kind: "link";
  href: string;
  providerLabel: string;
  icon: string;
}

type Resolved = IframeEmbed | VideoEmbed | LinkEmbed | null;

function youtubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]+)/,
    /youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)([A-Za-z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Resolve a paste URL into an embed descriptor. URL-pattern detection is the
 * single source of truth (the form's auto-detect is advisory only).
 */
export function resolveEmbed(url: string): Resolved {
  const u = url.trim();
  if (!u) return null;

  // ---- Video providers → 16:9 frame ----
  const yt = youtubeId(u);
  if (yt) {
    return { kind: "video", src: `https://www.youtube-nocookie.com/embed/${yt}`, title: "YouTube video" };
  }
  const vm = vimeoId(u);
  if (vm) {
    return { kind: "video", src: `https://player.vimeo.com/video/${vm}`, title: "Vimeo video" };
  }
  const loom = u.match(/loom\.com\/(?:share|embed)\/([A-Za-z0-9]+)/);
  if (loom) {
    return { kind: "video", src: `https://www.loom.com/embed/${loom[1]}`, title: "Loom video" };
  }

  // ---- Spotify → embed player (taller for collections) ----
  const sp = u.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([A-Za-z0-9]+)/);
  if (sp) {
    const [, type, id] = sp;
    const tall = type === "album" || type === "playlist" || type === "artist" || type === "show";
    return {
      kind: "iframe",
      src: `https://open.spotify.com/embed/${type}/${id}`,
      height: tall ? 352 : 152,
      title: "Spotify player",
    };
  }

  // ---- SoundCloud → widget player ----
  if (/soundcloud\.com\//.test(u)) {
    const src =
      "https://w.soundcloud.com/player/?url=" +
      encodeURIComponent(u) +
      "&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true";
    return { kind: "iframe", src, height: 166, title: "SoundCloud player" };
  }

  // ---- Apple Podcasts / Apple Music → embed subdomain ----
  if (/podcasts\.apple\.com\//.test(u)) {
    const src = u.replace(/^https?:\/\/podcasts\.apple\.com/, "https://embed.podcasts.apple.com");
    return { kind: "iframe", src, height: 175, title: "Apple Podcasts player" };
  }
  if (/music\.apple\.com\//.test(u)) {
    const src = u.replace(/^https?:\/\/music\.apple\.com/, "https://embed.music.apple.com");
    return { kind: "iframe", src, height: 175, title: "Apple Music player" };
  }

  // ---- Script-only providers → honest link card ----
  if (/tiktok\.com\//.test(u)) return { kind: "link", href: u, providerLabel: "TikTok", icon: "tiktok" };
  if (/(twitter\.com|x\.com)\//.test(u)) return { kind: "link", href: u, providerLabel: "X", icon: "x" };
  if (/bsky\.app\//.test(u)) return { kind: "link", href: u, providerLabel: "Bluesky", icon: "bluesky" };
  if (/instagram\.com\//.test(u)) return { kind: "link", href: u, providerLabel: "Instagram", icon: "instagram" };
  if (/\.bandcamp\.com\//.test(u)) return { kind: "link", href: u, providerLabel: "Bandcamp", icon: "bandcamp" };

  // ---- Anything else with a usable URL → generic link card ----
  if (/^https?:\/\//i.test(u)) return { kind: "link", href: u, providerLabel: "this link", icon: "link" };
  return null;
}

export function EmbedBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readEmbedMeta(block);
  const resolved = resolveEmbed(meta.url);

  let body: ReactNode;
  if (!resolved) {
    body = <p className="block-embed-empty">No embed URL set yet.</p>;
  } else if (resolved.kind === "video") {
    body = (
      <div className="block-embed-frame block-embed-video">
        <iframe
          className="block-embed-iframe"
          src={resolved.src}
          title={resolved.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  } else if (resolved.kind === "iframe") {
    body = (
      <iframe
        className="block-embed-iframe block-embed-audio"
        src={resolved.src}
        title={resolved.title}
        style={{ height: `${resolved.height}px` }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  } else {
    body = (
      <a
        className="block-embed-link"
        href={resolved.href}
        target="_blank"
        rel="noopener noreferrer"
        data-provider={resolved.icon}
      >
        Open on {resolved.providerLabel} ↗
      </a>
    );
  }

  return (
    <article
      data-block-type="embed"
      data-block-id={block.id}
      className="block-embed-wrap"
    >
      <figure className="block-embed" data-testid={`block-embed-${block.id}`}>
        {body}
        {meta.caption ? (
          <figcaption className="block-embed-caption">{meta.caption}</figcaption>
        ) : null}
      </figure>
    </article>
  );
}
