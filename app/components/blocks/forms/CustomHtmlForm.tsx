/**
 * CustomHtmlForm — form body for block_type = "custom-html".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.custom-html.form
 * Fields: HTML / CSS / JS code textarea
 * Tier gate: Pro+
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";

export interface CustomHtmlFormValue {
  html: string;
}

export const CUSTOM_HTML_FORM_DEFAULTS: CustomHtmlFormValue = {
  html: '<div style="background:#fff;color:#111;padding:12px;border-radius:10px">\n  <b>Hi from custom HTML.</b>\n</div>',
};

export interface CustomHtmlFormProps {
  value: CustomHtmlFormValue;
  onChange: (next: CustomHtmlFormValue) => void;
}

export function CustomHtmlForm({ value, onChange }: CustomHtmlFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="custom-html-form">
      <div className="field">
        <label htmlFor="ch-html">HTML / CSS / JS</label>
        <textarea
          id="ch-html"
          value={value.html}
          placeholder="<div>Your custom HTML here…</div>"
          rows={12}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            lineHeight: 1.6,
            minHeight: "180px",
            resize: "vertical",
          }}
          onChange={(e) => onChange({ ...value, html: e.target.value })}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <div className="help">
          Raw HTML, inline CSS, and script tags are all accepted. Rendered in an isolated iframe on the public page.
          This feature is available on <strong>Pro</strong> ($19.99/mo) and above.
        </div>
      </div>
    </div>
  );
}
