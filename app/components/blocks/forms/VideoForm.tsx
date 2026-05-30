/**
 * VideoForm — form body for block_type = "video".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.video.form
 * Fields: YouTube or Vimeo URL · Provider · Caption (AI)
 * No native upload per DEC-097 §15.
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";

export type VideoProvider = "youtube" | "vimeo";

export interface VideoFormValue {
  url: string;
  provider: VideoProvider;
  caption: string;
}

export const VIDEO_FORM_DEFAULTS: VideoFormValue = {
  url: "https://youtu.be/dQw4w9WgXcQ",
  provider: "youtube",
  caption: "Behind the scenes",
};

export interface VideoFormProps {
  value: VideoFormValue;
  onChange: (next: VideoFormValue) => void;
}

export function VideoForm({ value, onChange }: VideoFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="video-form">
      {/* URL */}
      <div className="field">
        <label htmlFor="vf-url">YouTube or Vimeo URL</label>
        <input
          id="vf-url"
          type="url"
          value={value.url}
          placeholder="https://youtu.be/…"
          onChange={(e) => onChange({ ...value, url: e.target.value })}
        />
        <div className="help">
          Paste a YouTube or Vimeo link. We embed via youtube-nocookie.com (no tracking cookies, minimal branding).
        </div>
      </div>

      {/* Provider */}
      <div className="field">
        <label htmlFor="vf-provider">Provider</label>
        <select
          id="vf-provider"
          value={value.provider}
          onChange={(e) => onChange({ ...value, provider: e.target.value as VideoProvider })}
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
        </select>
      </div>

      {/* Caption */}
      <div className="field with-ai">
        <label htmlFor="vf-caption">
          Caption
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest caption">✨ Suggest</button>
        </label>
        <input
          id="vf-caption"
          type="text"
          value={value.caption}
          placeholder="Behind the scenes"
          onChange={(e) => onChange({ ...value, caption: e.target.value })}
        />
      </div>
    </div>
  );
}
