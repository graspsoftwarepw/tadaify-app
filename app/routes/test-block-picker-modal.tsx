/**
 * Test harness page for BlockPickerModal Playwright tests (S1–S7).
 *
 * Route: /test-block-picker-modal
 *
 * This page exists ONLY for automated testing — it mounts the BlockPickerModal
 * component directly so Playwright can exercise it without requiring the full
 * block-editor flow (wired later by parent composition issue tadaify-app#56).
 *
 * The page provides:
 *   - A "+ Add block" button to open the picker modal (S1–S6)
 *   - A [data-selected-type] element reflecting the last selected blockType (S3)
 *   - Tier switcher buttons (S4 — test Free tier locked card)
 *   - Viewport-responsive layout (S7 uses multiple viewport sizes)
 *
 * No auth required — test harness mounts modal directly.
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: Playwright S1–S7
 */

import { useState } from "react";
import { BlockPickerModal } from "~/components/blocks/BlockPickerModal";
import type { TierLevel } from "~/lib/block-types";

export default function TestBlockPickerModal() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [tier, setTier] = useState<TierLevel>("creator");

  const handleSelect = (blockType: string) => {
    setSelectedType(blockType);
    // Modal closes automatically inside BlockPickerModal after onSelect
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Page title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        BlockPickerModal Test Harness
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Test harness for Playwright S1–S7. No auth required.
      </p>

      {/* Tier switcher (S4) */}
      <div className="flex gap-2 mb-6" role="group" aria-label="Tier selector">
        {(["free", "creator", "pro", "business"] as TierLevel[]).map((t) => (
          <button
            key={t}
            type="button"
            id={`tier-${t}`}
            data-testid={`tier-btn-${t}`}
            className={[
              "px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
              tier === t
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400",
            ].join(" ")}
            onClick={() => setTier(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {tier === t && " ✓"}
          </button>
        ))}
      </div>

      {/* Open picker button (S1) */}
      <button
        id="open-picker-btn"
        data-testid="open-picker-btn"
        type="button"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        onClick={() => setOpen(true)}
      >
        + Add block
      </button>

      {/* Selected type indicator — Playwright spy (S3, S4) */}
      {selectedType !== null && (
        <div
          data-selected-type={selectedType}
          data-testid="selected-type"
          className="mt-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-mono text-green-800"
        >
          onSelect called with: <b>{selectedType}</b>
        </div>
      )}

      {/* Scroll content — background noise */}
      <div className="mt-8 space-y-3">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="p-3 bg-white rounded-md border border-gray-200 text-sm text-gray-500"
          >
            Page content row {i + 1}
          </div>
        ))}
      </div>

      {/* Picker modal */}
      <BlockPickerModal
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        currentTier={tier}
      />
    </div>
  );
}
