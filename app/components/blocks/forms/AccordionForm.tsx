/**
 * AccordionForm — form body for block_type = "accordion" (FAQ).
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.accordion.form
 * Fields: Section icon · Q&A items list (dynamic, draggable, + Add section grouping)
 *
 * FIX-FAQ-001: Dynamic Q&A list with optional section grouping.
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

export interface FaqQaItem {
  kind: "qa";
  id: string;
  q: string;
  a: string;
}

export interface FaqSectionItem {
  kind: "section";
  id: string;
  title: string;
}

export type FaqItem = FaqQaItem | FaqSectionItem;

export interface AccordionFormValue {
  sectionIcon: string | null;
  items: FaqItem[];
}

export const ACCORDION_FORM_DEFAULTS: AccordionFormValue = {
  sectionIcon: null,
  items: [
    { kind: "qa", id: "q1", q: "When does the next drop happen?", a: "Drop dates are announced on my Instagram first — follow @alexandra to stay up to date." },
    { kind: "qa", id: "q2", q: "Do you do custom commissions?", a: "Yes! DM me or fill in the contact form — I take on 2-3 commissions per month." },
  ],
};

let _idCounter = 1000;
function nextId() {
  return `item_${++_idCounter}`;
}

export interface AccordionFormProps {
  value: AccordionFormValue;
  onChange: (next: AccordionFormValue) => void;
}

export function AccordionForm({ value, onChange }: AccordionFormProps): ReactElement {
  function addQa() {
    onChange({
      ...value,
      items: [...value.items, { kind: "qa", id: nextId(), q: "", a: "" }],
    });
  }

  function addSection() {
    onChange({
      ...value,
      items: [...value.items, { kind: "section", id: nextId(), title: "" }],
    });
  }

  function removeItem(id: string) {
    onChange({ ...value, items: value.items.filter((it) => it.id !== id) });
  }

  function updateQa(id: string, field: "q" | "a", val: string) {
    onChange({
      ...value,
      items: value.items.map((it) =>
        it.id === id && it.kind === "qa" ? { ...it, [field]: val } : it,
      ),
    });
  }

  function updateSection(id: string, title: string) {
    onChange({
      ...value,
      items: value.items.map((it) =>
        it.id === id && it.kind === "section" ? { ...it, title } : it,
      ),
    });
  }

  function moveItem(id: string, dir: -1 | 1) {
    const items = [...value.items];
    const idx = items.findIndex((it) => it.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
    onChange({ ...value, items });
  }

  return (
    <div className="section-body" data-testid="accordion-form">
      {/* Section icon */}
      <div className="field">
        <label>Section icon (optional)</label>
        <IconPicker
          value={value.sectionIcon}
          onChange={(id) => onChange({ ...value, sectionIcon: id })}
          clearable
        />
        <div className="help">Shown next to the section title above the FAQ.</div>
      </div>

      {/* Q&A items */}
      <div className="field">
        <label>Questions &amp; answers</label>
        <div className="faq-list">
          {value.items.map((item, idx) =>
            item.kind === "section" ? (
              <div key={item.id} className="faq-row faq-section">
                <button
                  type="button"
                  className="faq-handle"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                >
                  ⋮⋮
                </button>
                <div className="faq-section-body">
                  <div className="faq-section-lbl">Section header</div>
                  <input
                    type="text"
                    value={item.title}
                    placeholder="Section title (e.g. Music, Shop)"
                    onChange={(e) => updateSection(item.id, e.target.value)}
                  />
                </div>
                <div className="faq-row-actions">
                  <button type="button" className="faq-mv" aria-label="Move up" onClick={() => moveItem(item.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="faq-mv" aria-label="Move down" onClick={() => moveItem(item.id, 1)} disabled={idx === value.items.length - 1}>↓</button>
                  <button type="button" className="faq-x" aria-label="Remove" onClick={() => removeItem(item.id)}>×</button>
                </div>
              </div>
            ) : (
              <div key={item.id} className="faq-row">
                <button
                  type="button"
                  className="faq-handle"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                >
                  ⋮⋮
                </button>
                <div className="faq-qa-body">
                  <div className="faq-sub-lbl">Question</div>
                  <input
                    type="text"
                    value={item.q}
                    placeholder="What would visitors ask?"
                    onChange={(e) => updateQa(item.id, "q", e.target.value)}
                  />
                  <div className="faq-sub-lbl with-ai-row">
                    <span>Answer</span>
                    <button type="button" className="ai-btn ai-btn-inline" aria-label="AI suggest answer">✨ Suggest</button>
                  </div>
                  <textarea
                    value={item.a}
                    placeholder="Answer here…"
                    onChange={(e) => updateQa(item.id, "a", e.target.value)}
                  />
                </div>
                <div className="faq-row-actions">
                  <button type="button" className="faq-mv" aria-label="Move up" onClick={() => moveItem(item.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="faq-mv" aria-label="Move down" onClick={() => moveItem(item.id, 1)} disabled={idx === value.items.length - 1}>↓</button>
                  <button type="button" className="faq-x" aria-label="Remove" onClick={() => removeItem(item.id)}>×</button>
                </div>
              </div>
            ),
          )}
        </div>
        <div className="faq-add-row">
          <button type="button" className="faq-add-btn" onClick={addQa}>+ Add question</button>
          <button type="button" className="faq-add-btn faq-add-btn-secondary" onClick={addSection}>+ Add section</button>
        </div>
        <div className="help">Add as many Q&amp;As as you need. Use &ldquo;+ Add section&rdquo; to group questions under a header (e.g. &ldquo;Music&rdquo;, &ldquo;Shop&rdquo;).</div>
      </div>
    </div>
  );
}
