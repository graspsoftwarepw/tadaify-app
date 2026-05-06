/**
 * Test harness page for BlockEditorModal Playwright tests (S1–S7).
 *
 * Route: /test-block-editor-modal
 *
 * This page exists ONLY for automated testing — it mounts the BlockEditorModal
 * component directly so Playwright can exercise it without requiring the full
 * block-picker flow (which is not yet implemented, per Phase 1 sub-story scope).
 *
 * The page is reachable at http://localhost:5173/test-block-editor-modal and
 * provides:
 *   - A button to open the editor modal (S1, S2, S3, S4, S6, S7)
 *   - Viewport-responsive layout (S5 uses 375×667 viewport)
 *   - A nested sub-modal trigger inside the editor (S6)
 *   - Enough body content to allow scroll lock testing (S7)
 *   - A delete sub-modal to test stacking (S6)
 *
 * Story: tadaify-app#200 F-BLOCK-INFRA-EDITOR-MODAL-001
 * Covers: Playwright S1–S7
 */

import { useState } from "react";
import { BlockEditorModal, BlockEditorModalBody } from "~/components/blocks/BlockEditorModal";

export default function TestBlockEditorModal() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Page title + trigger button */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        BlockEditorModal Test Harness
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        Use this page for Playwright S1–S7 tests. The modal shell is mounted
        directly without a block picker.
      </p>

      {/* Trigger button — focus is restored here on modal close */}
      <button
        id="open-editor-btn"
        type="button"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        onClick={() => setEditorOpen(true)}
      >
        Open Block Editor
      </button>

      {/* S7 scroll content — tall enough to test scroll lock */}
      <div className="mt-8 space-y-4">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
            Page content row {i + 1} — scroll lock test (S7)
          </div>
        ))}
      </div>

      {/* ── Main block editor modal ── */}
      <BlockEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        blockType="link"
        blockId="test-block-123"
      >
        <BlockEditorModal.Header
          typeIcon="🔗"
          title="Link button"
          blockType="link"
          typeOptions={[
            { value: "link", label: "Link button" },
            { value: "text", label: "Text block" },
            { value: "image", label: "Image" },
          ]}
          onTypeChange={() => {}}
        />

        <BlockEditorModalBody>
          <BlockEditorModal.Form>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Link URL</span>
                <input
                  id="link-url-input"
                  type="url"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://example.com"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Label</span>
                <input
                  id="link-label-input"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Click here"
                />
              </label>

              {/* S6: Delete sub-modal trigger */}
              <button
                id="delete-trigger-btn"
                type="button"
                className="mt-4 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => setDeleteOpen(true)}
              >
                Delete block
              </button>
            </div>
          </BlockEditorModal.Form>

          <BlockEditorModal.Preview>
            <div className="text-sm font-medium text-gray-700 mb-2">Preview · what visitors see</div>
            <div
              id="preview-content"
              className="p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
            >
              Link button preview placeholder
            </div>
          </BlockEditorModal.Preview>
        </BlockEditorModalBody>

        <BlockEditorModal.Footer
          savedHint="Last saved 12s ago"
          onDiscard={() => setEditorOpen(false)}
          onSave={() => {}}
        />

        {/* S6: Nested delete confirm sub-modal */}
        <BlockEditorModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          blockType="link"
          blockId="test-block-123"
          nested
        >
          <div
            className="bg-white rounded-[14px] shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-auto mt-auto mb-auto"
            data-testid="delete-submodal-box"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete block?</h2>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                id="delete-cancel-btn"
                type="button"
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                id="delete-confirm-btn"
                type="button"
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => setDeleteOpen(false)}
              >
                Delete
              </button>
            </div>
          </div>
        </BlockEditorModal>
      </BlockEditorModal>
    </div>
  );
}
