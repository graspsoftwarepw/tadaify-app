/**
 * VideoBlockRenderer — public-page renderer for `block_type = "video"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * Embeds a YouTube or Vimeo video as a responsive 16:9 iframe. YouTube uses the
 * privacy-friendly `youtube-nocookie.com` host per the editor's product copy
 * ("We embed via youtube-nocookie.com — no tracking cookies"). When the URL
 * can't be parsed into a known embed id, we degrade to an honest "Watch video"
 * link instead of a broken iframe (no fake margin).
 *
 * Block shape (PublicBlock):
 *   - `title` is an optional accessible label for the iframe.
 *   - `url`   is a fallback for the video URL if `meta.url` is absent.
 *   - `meta`  mirrors `VideoFormValue`: `{ url?, provider?: "youtube"|"vimeo",
 *             caption? }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-video*`.
 *
 * Story: F-BLOCK-VIDEO-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

type VideoProvider = "youtube" | "vimeo";

interface VideoBlockMeta {
  url: string;
  provider: VideoProvider | null;
  caption: string;
}

function readVideoMeta(block: PublicBlock): VideoBlockMeta {
  const m =
    block.meta && typeof block.meta === "object"
      ? (block.meta as Record<string, unknown>)
      : {};
  const metaUrl = typeof m.url === "string" ? m.url : "";
  const url = metaUrl || (typeof block.url === "string" ? block.url : "");
  const provider =
    m.provider === "youtube" || m.provider === "vimeo"
      ? (m.provider as VideoProvider)
      : null;
  const caption = typeof m.caption === "string" ? m.caption : "";
  return { url, provider, caption };
}

/** Extract a YouTube video id from the common URL shapes. */
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

/** Extract a numeric Vimeo id from the common URL shapes. */
function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

interface EmbedTarget {
  src: string;
  provider: VideoProvider;
}

/**
 * Resolve an embeddable iframe src from the URL. URL detection wins over the
 * stored `provider` hint so a mis-tagged block still embeds correctly.
 */
function resolveEmbed(meta: VideoBlockMeta): EmbedTarget | null {
  const yt = youtubeId(meta.url);
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt}`, provider: "youtube" };
  const vm = vimeoId(meta.url);
  if (vm) return { src: `https://player.vimeo.com/video/${vm}`, provider: "vimeo" };
  return null;
}

export function VideoBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readVideoMeta(block);
  const embed = resolveEmbed(meta);
  const caption = meta.caption;
  const label = block.title || "Embedded video";

  return (
    <article
      data-block-type="video"
      data-block-id={block.id}
      className="block-video-wrap"
    >
      <figure className="block-video" data-testid={`block-video-${block.id}`}>
        {embed ? (
          <div className="block-video-frame" data-provider={embed.provider}>
            <iframe
              className="block-video-iframe"
              src={embed.src}
              title={label}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : meta.url ? (
          <a
            className="block-video-fallback"
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶︎ Watch video
          </a>
        ) : (
          <p className="block-video-empty">No video URL set yet.</p>
        )}
        {caption ? (
          <figcaption className="block-video-caption">{caption}</figcaption>
        ) : null}
      </figure>
    </article>
  );
}
