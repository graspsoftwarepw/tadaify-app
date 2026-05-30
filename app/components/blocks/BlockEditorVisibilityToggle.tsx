/**
 * BlockEditorVisibilityToggle — inline visibility toggle for the canonical block editor.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html
 *   - Always visible at all tiers, no tier-gate
 *   - Inline in the section-head row, right side
 *   - .switch.on / .switch (off) toggle pill
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";

export interface VisibilityToggleProps {
  visible: boolean;
  onChange: (visible: boolean) => void;
}

export function BlockEditorVisibilityToggle({
  visible,
  onChange,
}: VisibilityToggleProps): ReactElement {
  return (
    <div className="toggle-row" style={{ gap: "6px", flex: "0 0 auto" }}>
      <span style={{ fontSize: "11px", color: "var(--fg-muted)", fontWeight: 600 }}>
        Visible
      </span>
      <span
        className={`switch${visible ? " on" : ""}`}
        role="switch"
        aria-checked={visible}
        tabIndex={0}
        id="d-visible-switch"
        onClick={() => onChange(!visible)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!visible);
          }
        }}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
