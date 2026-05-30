/**
 * HeadingForm — form body for block_type = "heading".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.heading.form
 * Fields: Display level · Text (AI) · Alignment · Leading icon
 *
 * FIX-HEAD-001: Merged Style + Size into one "Display" dropdown per mockup.
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

export type HeadingLevel = "hero" | "h1" | "h2" | "h3" | "p";
export type HeadingAlign = "left" | "center" | "right";

export interface HeadingFormValue {
  level: HeadingLevel;
  text: string;
  align: HeadingAlign;
  icon: string | null;
}

export const HEADING_FORM_DEFAULTS: HeadingFormValue = {
  level: "h2",
  text: "My latest releases",
  align: "center",
  icon: null,
};

export interface HeadingFormProps {
  value: HeadingFormValue;
  onChange: (next: HeadingFormValue) => void;
}

export function HeadingForm({ value, onChange }: HeadingFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="heading-form">
      {/* Display level */}
      <div className="field">
        <label htmlFor="hf-level">Display</label>
        <select
          id="hf-level"
          value={value.level}
          onChange={(e) => onChange({ ...value, level: e.target.value as HeadingLevel })}
        >
          <option value="hero">Hero (largest, display weight)</option>
          <option value="h1">Heading 1 (large, bold)</option>
          <option value="h2">Heading 2 (medium, bold)</option>
          <option value="h3">Heading 3 (small, semibold)</option>
          <option value="p">Paragraph (regular text)</option>
        </select>
        <div className="help">
          One choice that controls visual size + semantic level. Hero for landing-style page tops; H1–H3 for sections; Paragraph for body copy.
        </div>
      </div>

      {/* Text */}
      <div className="field with-ai">
        <label htmlFor="hf-text">
          Text
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest text">
            ✨ Suggest
          </button>
        </label>
        <input
          id="hf-text"
          type="text"
          value={value.text}
          placeholder="My latest releases"
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      </div>

      {/* Alignment */}
      <div className="field">
        <label htmlFor="hf-align">Alignment</label>
        <select
          id="hf-align"
          value={value.align}
          onChange={(e) => onChange({ ...value, align: e.target.value as HeadingAlign })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Leading icon */}
      <div className="field">
        <label>Leading icon (optional)</label>
        <IconPicker
          value={value.icon}
          onChange={(id) => onChange({ ...value, icon: id })}
          clearable
        />
        <div className="help">Show a small icon next to the text — leave empty for plain text.</div>
      </div>
    </div>
  );
}
