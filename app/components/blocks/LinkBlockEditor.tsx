/**
 * LinkBlockEditor — composed editor controller for `block_type = "link"`.
 *
 * Wraps the generic `BlockEditorModal` shell (#200) with the link-specific
 * form body (#56 slice A), a tiny live preview, and the save flow to
 * `POST /api/blocks`. Slice A only handles CREATE — the UPDATE path will
 * land alongside the dashboard edit-pencil wiring in a later slice.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 * Covers: BR-BLOCK-LINK-001/002 (creator add+edit flow), AC#1, AC#2, AC#4.
 */

import { useCallback, useState } from "react";
import {
  BlockEditorModal,
  BlockEditorModalBody,
} from "~/components/blocks/BlockEditorModal";
import {
  LinkBlockForm,
  LINK_BLOCK_FORM_DEFAULTS,
  type LinkBlockFormValue,
} from "~/components/blocks/LinkBlockForm";
import {
  saveLinkBlock,
  validateLinkBlock,
} from "~/lib/link-block-save";
import { renderIcon } from "~/lib/icon-resolve";

export interface LinkBlockEditorProps {
  /** Whether the editor modal is open. */
  open: boolean;
  /** Open/close callback (Esc, X button, backdrop). */
  onOpenChange: (open: boolean) => void;
  /** Target page id (creator's homepage id). */
  pageId: string;
  /** Optional initial form value — used by the edit path (slice B). */
  initialValue?: LinkBlockFormValue;
  /** Fired after a successful save with the API response block. */
  onSaved?: (block: unknown) => void;
}

export function LinkBlockEditor({
  open,
  onOpenChange,
  pageId,
  initialValue,
  onSaved,
}: LinkBlockEditorProps) {
  const [formValue, setFormValue] = useState<LinkBlockFormValue>(
    initialValue ?? LINK_BLOCK_FORM_DEFAULTS,
  );
  const [labelError, setLabelError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback((next: LinkBlockFormValue) => {
    setFormValue(next);
    // Clear validation errors as the user edits.
    setLabelError(null);
    setUrlError(null);
    setServerError(null);
  }, []);

  const handleDiscard = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = useCallback(async () => {
    const v = validateLinkBlock(formValue);
    if (v.labelError || v.urlError) {
      setLabelError(v.labelError);
      setUrlError(v.urlError);
      return;
    }
    setSaving(true);
    setServerError(null);
    try {
      const result = await saveLinkBlock({ pageId, value: formValue });
      if (!result.ok) {
        setServerError(result.error ?? "Save failed");
        return;
      }
      onSaved?.(result.block);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }, [formValue, pageId, onOpenChange, onSaved]);

  const previewIcon = formValue.icon
    ? renderIcon(formValue.icon, { size: 20 })
    : null;

  return (
    <BlockEditorModal
      open={open}
      onOpenChange={onOpenChange}
      blockType="link"
      blockId={null}
    >
      <BlockEditorModal.Header
        typeIcon="🔗"
        title="Link button"
        blockType="link"
      />
      <BlockEditorModalBody>
        <BlockEditorModal.Form>
          <LinkBlockForm
            value={formValue}
            onChange={handleChange}
            labelError={labelError}
            urlError={urlError}
          />
          {serverError ? (
            <p
              role="alert"
              data-testid="link-block-server-error"
              className="text-[12px] text-[var(--danger,#dc2626)] font-medium mt-[8px]"
            >
              {serverError}
            </p>
          ) : null}
        </BlockEditorModal.Form>
        <BlockEditorModal.Preview>
          <div className="text-sm font-medium text-[var(--fg)] mb-2">
            Preview · what visitors see
          </div>
          <div
            data-testid="link-block-preview"
            className="block-link"
            style={{
              cursor: "default",
              pointerEvents: "none",
              opacity: formValue.label || formValue.url ? 1 : 0.6,
            }}
          >
            {previewIcon ? (
              <span className="block-link-icon" aria-hidden="true">
                {previewIcon}
              </span>
            ) : null}
            <span className="block-link-label">
              {formValue.label || "Your button label"}
            </span>
          </div>
        </BlockEditorModal.Preview>
      </BlockEditorModalBody>
      <BlockEditorModal.Footer
        onDiscard={handleDiscard}
        onSave={handleSave}
        saving={saving}
      />
    </BlockEditorModal>
  );
}
