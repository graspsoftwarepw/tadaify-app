/**
 * CountdownForm — form body for block_type = "countdown".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.countdown.form
 * Fields: Event label (AI) · Label icon · Target date+time · Style · Link label (AI) · Link URL
 *   · Auto-hide toggle · Replacement copy · Schedule visibility (Creator+)
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

export type CountdownStyle = "boxed" | "inline" | "compact" | "flip";

export interface CountdownFormValue {
  label: string;
  icon: string | null;
  targetAt: string;
  style: CountdownStyle;
  linkLabel: string;
  linkUrl: string;
  autoHide: boolean;
  replacementCopy: string;
  scheduleVisibilityEnabled: boolean;
  scheduleStartsAt: string;
  scheduleEndsAt: string;
}

export const COUNTDOWN_FORM_DEFAULTS: CountdownFormValue = {
  label: "Next live in",
  icon: "flame",
  targetAt: "2026-05-15T19:00",
  style: "boxed",
  linkLabel: "",
  linkUrl: "",
  autoHide: true,
  replacementCopy: "Live now!",
  scheduleVisibilityEnabled: false,
  scheduleStartsAt: "",
  scheduleEndsAt: "",
};

export interface CountdownFormProps {
  value: CountdownFormValue;
  onChange: (next: CountdownFormValue) => void;
}

export function CountdownForm({ value, onChange }: CountdownFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="countdown-form">
      {/* Event label */}
      <div className="field with-ai">
        <label htmlFor="cd-label">
          Event label
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest label">✨ Suggest</button>
        </label>
        <input
          id="cd-label"
          type="text"
          value={value.label}
          placeholder="Next live in"
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </div>

      {/* Label icon */}
      <div className="field">
        <label>Label icon</label>
        <IconPicker
          value={value.icon}
          onChange={(id) => onChange({ ...value, icon: id })}
          clearable
        />
        <div className="help">A flame, lightning, or live dot signals urgency. Leave empty for plain text.</div>
      </div>

      {/* Target date + time */}
      <div className="field">
        <label htmlFor="cd-target">Target date + time</label>
        <input
          id="cd-target"
          type="datetime-local"
          value={value.targetAt}
          onChange={(e) => onChange({ ...value, targetAt: e.target.value })}
        />
      </div>

      {/* Style */}
      <div className="field">
        <label htmlFor="cd-style">Style</label>
        <select
          id="cd-style"
          value={value.style}
          onChange={(e) => onChange({ ...value, style: e.target.value as CountdownStyle })}
        >
          <option value="boxed">Boxed cells</option>
          <option value="inline">Inline text</option>
          <option value="compact">Compact pills</option>
          <option value="flip">Flip clock</option>
        </select>
      </div>

      {/* Link label */}
      <div className="field with-ai">
        <label htmlFor="cd-link-label">
          Link label (optional)
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest link label">✨ Suggest</button>
        </label>
        <input
          id="cd-link-label"
          type="text"
          value={value.linkLabel}
          placeholder="Get tickets →"
          onChange={(e) => onChange({ ...value, linkLabel: e.target.value })}
        />
        <div className="help">Shown below the timer when a link URL is also present.</div>
      </div>

      {/* Link URL */}
      <div className="field">
        <label htmlFor="cd-link-url">Link URL (optional)</label>
        <input
          id="cd-link-url"
          type="url"
          value={value.linkUrl}
          placeholder="https://…"
          onChange={(e) => onChange({ ...value, linkUrl: e.target.value })}
        />
        <div className="help">Must be a valid URL if you want the link to render.</div>
      </div>

      {/* Auto-hide */}
      <div className="toggle-row" style={{ padding: "4px 0" }}>
        <div className="lbl">
          <div className="t">Auto-hide after target</div>
          <div className="s">When on, the block disappears after the countdown reaches zero.</div>
        </div>
        <span
          className={`switch${value.autoHide ? " on" : ""}`}
          role="switch"
          aria-checked={value.autoHide}
          tabIndex={0}
          onClick={() => onChange({ ...value, autoHide: !value.autoHide })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange({ ...value, autoHide: !value.autoHide });
            }
          }}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* Replacement copy */}
      {!value.autoHide && (
        <div className="field">
          <label htmlFor="cd-replacement">Replacement copy (when auto-hide is off)</label>
          <input
            id="cd-replacement"
            type="text"
            value={value.replacementCopy}
            placeholder="Live now!"
            onChange={(e) => onChange({ ...value, replacementCopy: e.target.value })}
          />
          <div className="help">Shown instead of 0 0 0 0 after the target passes.</div>
        </div>
      )}

      {/* Schedule visibility (Creator+) */}
      <div className="toggle-row" style={{ padding: "4px 0" }}>
        <div className="lbl">
          <div className="t">Schedule visibility (Creator+)</div>
          <div className="s">Show the countdown only during a creator-defined lead-up window.</div>
        </div>
        <span
          className={`switch${value.scheduleVisibilityEnabled ? " on" : ""}`}
          role="switch"
          aria-checked={value.scheduleVisibilityEnabled}
          tabIndex={0}
          onClick={() => onChange({ ...value, scheduleVisibilityEnabled: !value.scheduleVisibilityEnabled })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange({ ...value, scheduleVisibilityEnabled: !value.scheduleVisibilityEnabled });
            }
          }}
          style={{ cursor: "pointer" }}
        />
      </div>

      {value.scheduleVisibilityEnabled && (
        <div className="field-row">
          <div className="field">
            <label htmlFor="cd-sched-start">Schedule starts at</label>
            <input
              id="cd-sched-start"
              type="datetime-local"
              value={value.scheduleStartsAt}
              onChange={(e) => onChange({ ...value, scheduleStartsAt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="cd-sched-end">Schedule ends at</label>
            <input
              id="cd-sched-end"
              type="datetime-local"
              value={value.scheduleEndsAt}
              onChange={(e) => onChange({ ...value, scheduleEndsAt: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
