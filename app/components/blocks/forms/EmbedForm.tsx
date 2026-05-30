/**
 * EmbedForm — form body for block_type = "embed".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.embed.form
 * Fields: URL paste · Auto-detect chip · Caption (AI) · Provider list reminder
 * 12 supported providers: Spotify · SoundCloud · Bandcamp · Apple Podcasts · Apple Music
 *   · YouTube · Vimeo · TikTok · Twitter/X · Bluesky · Instagram · Loom
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement, useMemo } from "react";

export interface EmbedFormValue {
  url: string;
  caption: string;
}

export const EMBED_FORM_DEFAULTS: EmbedFormValue = {
  url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
  caption: "",
};

const EMBED_PROVIDERS = [
  { id: "spotify", label: "Spotify", icon: "🎵", pattern: /spotify\.com\/(track|album|artist|playlist)\// },
  { id: "soundcloud", label: "SoundCloud", icon: "☁️", pattern: /soundcloud\.com\// },
  { id: "bandcamp", label: "Bandcamp", icon: "🎸", pattern: /\.bandcamp\.com\// },
  { id: "applepodcasts", label: "Apple Podcasts", icon: "🎙", pattern: /podcasts\.apple\.com\// },
  { id: "applemusic", label: "Apple Music", icon: "🎶", pattern: /music\.apple\.com\// },
  { id: "youtube", label: "YouTube", icon: "▶️", pattern: /(youtube\.com|youtu\.be)\// },
  { id: "vimeo", label: "Vimeo", icon: "🎬", pattern: /vimeo\.com\// },
  { id: "tiktok", label: "TikTok", icon: "🎵", pattern: /tiktok\.com\// },
  { id: "twitter", label: "X (Twitter)", icon: "🐦", pattern: /(twitter\.com|x\.com)\// },
  { id: "bluesky", label: "Bluesky", icon: "🦋", pattern: /bsky\.app\// },
  { id: "instagram", label: "Instagram", icon: "📸", pattern: /instagram\.com\// },
  { id: "loom", label: "Loom", icon: "📹", pattern: /loom\.com\// },
];

type DetectionKind = "empty" | "recognized" | "unsupported";

interface Detection {
  kind: DetectionKind;
  providerId?: string;
  providerLabel?: string;
  icon?: string;
}

function detectProvider(url: string): Detection {
  const trimmed = url.trim();
  if (!trimmed) return { kind: "empty" };
  for (const p of EMBED_PROVIDERS) {
    if (p.pattern.test(trimmed)) {
      return { kind: "recognized", providerId: p.id, providerLabel: p.label, icon: p.icon };
    }
  }
  return { kind: "unsupported" };
}

export interface EmbedFormProps {
  value: EmbedFormValue;
  onChange: (next: EmbedFormValue) => void;
}

export function EmbedForm({ value, onChange }: EmbedFormProps): ReactElement {
  const detection = useMemo(() => detectProvider(value.url), [value.url]);

  return (
    <div className="section-body" data-testid="embed-form">
      {/* URL paste */}
      <div className="field">
        <label htmlFor="emb-url">Paste a URL</label>
        <input
          id="emb-url"
          type="url"
          value={value.url}
          placeholder="https://open.spotify.com/track/…"
          onChange={(e) => onChange({ ...value, url: e.target.value })}
        />
        <div className="help">YouTube, Spotify, TikTok, and 9 more — see the full list at the bottom.</div>
      </div>

      {/* Auto-detect chip */}
      <div className="field">
        <div
          className={`embed-chip${detection.kind === "empty" ? " is-empty" : detection.kind === "recognized" ? " is-recognized" : " is-unsupported"}`}
        >
          {detection.kind === "empty" && (
            <>
              <span className="ec-icon">🔍</span>
              <span className="ec-text">Paste a URL from Spotify, YouTube, TikTok, or 9 more</span>
            </>
          )}
          {detection.kind === "recognized" && (
            <>
              <span className="ec-icon">{detection.icon}</span>
              <span className="ec-text"><strong>{detection.providerLabel}</strong> detected</span>
            </>
          )}
          {detection.kind === "unsupported" && (
            <>
              <span className="ec-icon">❌</span>
              <span className="ec-text">Provider not supported. Try a Link button instead →</span>
            </>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="field with-ai">
        <label htmlFor="emb-caption">
          Caption (optional)
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest caption">
            ✨ Suggest
          </button>
        </label>
        <input
          id="emb-caption"
          type="text"
          value={value.caption}
          placeholder="Shown under the embedded card on the public page"
          onChange={(e) => onChange({ ...value, caption: e.target.value })}
        />
        <div className="help">Shown under the embedded card on the public page.</div>
      </div>

      {/* Provider list reminder */}
      <div className="field embed-provider-reminder">
        <div className="epr-title">Supports embeds from</div>
        <div className="epr-list">
          {EMBED_PROVIDERS.map((p) => p.label).join(" · ")}
        </div>
      </div>
    </div>
  );
}
