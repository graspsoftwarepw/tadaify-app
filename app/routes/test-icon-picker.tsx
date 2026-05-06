/**
 * Test harness page for IconPicker Playwright tests (S1–S6).
 *
 * Route: /test-icon-picker
 *
 * This page exists ONLY for automated testing — it mounts IconPicker directly
 * so Playwright can exercise it without requiring the full block-editor flow.
 *
 * The page provides:
 *   - An IconPicker mounted with current value state
 *   - A [data-selected-id] element reflecting the last selected iconId
 *   - A clearable="true" variant for ECN-ICON-PICKER-09 testing
 *
 * No auth required — test harness mounts component directly.
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: Playwright S1–S6
 */

import { useState } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

export default function TestIconPicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [changeCount, setChangeCount] = useState(0);

  const handleChange = (id: string) => {
    setSelectedId(id);
    setChangeCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Page title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        IconPicker Test Harness
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Test harness for Playwright S1–S6. No auth required.
      </p>

      {/* Primary icon picker (S1–S5) */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Primary picker (clearable)
        </h2>
        <IconPicker
          value={selectedId}
          onChange={handleChange}
          clearable
        />
      </div>

      {/* Selected icon indicator — Playwright spy */}
      <div
        data-selected-id={selectedId ?? ""}
        data-testid="icon-picker-selected-output"
        data-change-count={changeCount}
        className={[
          "mb-6 px-3 py-2 rounded-lg text-sm font-mono border",
          selectedId
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-gray-100 border-gray-200 text-gray-500",
        ].join(" ")}
      >
        {selectedId ? (
          <>
            <span>onChange called with: </span>
            <b>{selectedId}</b>
            <span className="ml-2 text-gray-400">(×{changeCount})</span>
          </>
        ) : (
          <span>No icon selected yet</span>
        )}
      </div>

      {/* Second independent picker (ECN-ICON-PICKER-10: two independent pickers) */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Secondary picker (independent state — ECN-ICON-PICKER-10)
        </h2>
        <SecondPicker />
      </div>

      {/* Scroll content — background noise */}
      <div className="mt-8 space-y-3">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="p-3 bg-white rounded-md border border-gray-200 text-sm text-gray-500"
          >
            Page content row {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Second isolated picker — proves ECN-ICON-PICKER-10 (independent state). */
function SecondPicker() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <IconPicker
      value={value}
      onChange={setValue}
      clearable
    />
  );
}
