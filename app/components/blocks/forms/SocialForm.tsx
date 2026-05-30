/**
 * SocialForm — form body for block_type = "social".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.social.form
 * Fields: Social cards (per-platform handle + icon style picker) · Wrapper shape
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement, useState } from "react";

export type SocialShape = "circle" | "square" | "none";

export interface SocialHandle {
  handle: string;
  iconStyle: string;
}

export interface SocialFormValue {
  handles: Record<string, SocialHandle>;
  handlesOrder: string[];
  shape: SocialShape;
}

export const SOCIAL_FORM_DEFAULTS: SocialFormValue = {
  handles: {
    instagram: { handle: "@alexandra", iconStyle: "instagram" },
    tiktok: { handle: "@alexandra", iconStyle: "tiktok" },
    youtube: { handle: "Alexandra Silva", iconStyle: "youtube" },
  },
  handlesOrder: ["instagram", "tiktok", "youtube"],
  shape: "circle",
};

const SOCIAL_PLATFORMS: Array<{ id: string; name: string; color: string }> = [
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "tiktok", name: "TikTok", color: "#000000" },
  { id: "youtube", name: "YouTube", color: "#FF0000" },
  { id: "x", name: "X (Twitter)", color: "#000000" },
  { id: "spotify", name: "Spotify", color: "#1DB954" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { id: "discord", name: "Discord", color: "#5865F2" },
  { id: "telegram", name: "Telegram", color: "#26A5E4" },
  { id: "whatsapp", name: "WhatsApp", color: "#25D366" },
  { id: "facebook", name: "Facebook", color: "#1877F2" },
  { id: "pinterest", name: "Pinterest", color: "#BD081C" },
  { id: "threads", name: "Threads", color: "#000000" },
  { id: "bluesky", name: "Bluesky", color: "#0085FF" },
  { id: "github", name: "GitHub", color: "#181717" },
  { id: "substack", name: "Substack", color: "#FF6719" },
  { id: "patreon", name: "Patreon", color: "#F96854" },
  { id: "twitch", name: "Twitch", color: "#9146FF" },
];

export interface SocialFormProps {
  value: SocialFormValue;
  onChange: (next: SocialFormValue) => void;
}

export function SocialForm({ value, onChange }: SocialFormProps): ReactElement {
  const [addPopOpen, setAddPopOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !(p.id in value.handles) && p.name.toLowerCase().includes(addSearch.toLowerCase()),
  );

  function addPlatform(platformId: string) {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return;
    onChange({
      ...value,
      handles: {
        ...value.handles,
        [platformId]: { handle: "", iconStyle: platformId },
      },
      handlesOrder: [...value.handlesOrder, platformId],
    });
    setAddPopOpen(false);
    setAddSearch("");
  }

  function removePlatform(platformId: string) {
    const { [platformId]: _removed, ...rest } = value.handles;
    onChange({
      ...value,
      handles: rest,
      handlesOrder: value.handlesOrder.filter((id) => id !== platformId),
    });
  }

  function updateHandle(platformId: string, handle: string) {
    onChange({
      ...value,
      handles: {
        ...value.handles,
        [platformId]: { ...value.handles[platformId], handle },
      },
    });
  }

  return (
    <div className="section-body" data-testid="social-form">
      {/* Social cards field */}
      <div className="field social-cards-field">
        <label>Your social platforms</label>
        <div className="social-cards-toolbar">
          <button
            type="button"
            className="add-social-btn"
            aria-expanded={addPopOpen}
            onClick={() => setAddPopOpen((o) => !o)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add social
          </button>
          <span className="social-cards-count">{value.handlesOrder.length} platform{value.handlesOrder.length !== 1 ? "s" : ""}</span>

          {/* Add social popover */}
          {addPopOpen && (
            <div className="add-social-pop">
              <div className="add-social-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search platforms…"
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="add-social-list">
                {availablePlatforms.length === 0 ? (
                  <div className="add-social-empty">No platforms found</div>
                ) : (
                  availablePlatforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="add-social-row"
                      onClick={() => addPlatform(p.id)}
                    >
                      <span className="add-social-row-glyph" style={{ color: p.color, fontSize: "18px" }}>●</span>
                      <span className="add-social-row-name">{p.name}</span>
                      <span className="add-social-row-cta">Add</span>
                    </button>
                  ))
                )}
                {value.handlesOrder.length > 0 && (
                  <div className="add-social-already">
                    Already added: {value.handlesOrder.map((id) => {
                      const p = SOCIAL_PLATFORMS.find((pp) => pp.id === id);
                      return p ? p.name : id;
                    }).join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Social cards list */}
        {value.handlesOrder.length === 0 ? (
          <div className="social-empty">
            <div className="social-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div className="social-empty-title">No social platforms yet</div>
            <div className="social-empty-copy">
              Click <strong>+ Add social</strong> above to pick a platform. Each card lets you set your handle and choose an icon style.
            </div>
          </div>
        ) : (
          <div className="social-cards-list">
            {value.handlesOrder.map((platformId) => {
              const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
              const entry = value.handles[platformId];
              if (!platform || !entry) return null;
              return (
                <div key={platformId} className="social-card">
                  <div className="social-card-drag" title="Drag to reorder" aria-label="Drag to reorder">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </div>
                  {/* Icon style indicator */}
                  <div className="social-card-style-trigger">
                    <button
                      type="button"
                      className="social-style-btn"
                      aria-label={`${platform.name} icon style`}
                      title="Change icon style"
                    >
                      <span style={{ color: platform.color, fontSize: "18px", lineHeight: 1 }}>●</span>
                      <svg className="ipk-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {/* TODO: wire social style popover */}
                  </div>
                  <div className="social-card-body">
                    <div className="social-card-name">{platform.name}</div>
                    <div className="social-card-handle">
                      <span className="social-card-handle-prefix">@</span>
                      <input
                        type="text"
                        placeholder={`your${platform.id}handle`}
                        value={entry.handle.replace(/^@/, "")}
                        onChange={(e) => updateHandle(platformId, e.target.value)}
                        aria-label={`${platform.name} handle`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="social-card-remove"
                    aria-label={`Remove ${platform.name}`}
                    onClick={() => removePlatform(platformId)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div className="help">Click &ldquo;+ Add social&rdquo; to register a platform. Each card lets you pick a per-platform icon style. Drag to reorder.</div>
      </div>

      {/* Wrapper shape */}
      <div className="field">
        <label htmlFor="sc-shape">Wrapper shape on the public page</label>
        <select
          id="sc-shape"
          value={value.shape}
          onChange={(e) => onChange({ ...value, shape: e.target.value as SocialShape })}
        >
          <option value="circle">Circle</option>
          <option value="square">Rounded square</option>
          <option value="none">No wrapper — bare icons</option>
        </select>
        <div className="help">The chosen icon style still applies — wrapper sits behind it (or is removed for &ldquo;bare icons&rdquo;).</div>
      </div>
    </div>
  );
}
