/**
 * AccordionBlockRenderer — public-page renderer for `block_type = "accordion"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * Renders an FAQ as a list of native `<details>`/`<summary>` disclosures
 * (no client JS needed — works with SSR + progressive enhancement). Items can
 * be plain Q&A or `section` group headings that break the list into labelled
 * groups.
 *
 * Block shape (PublicBlock):
 *   - `title` is unused.
 *   - `meta`  mirrors `AccordionFormValue`: `{ sectionIcon?: string | null,
 *             items?: Array<{kind:"qa",id,q,a} | {kind:"section",id,title}> }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-accordion*`.
 *
 * Story: F-BLOCK-ACCORDION-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

interface QaItem {
  kind: "qa";
  id: string;
  q: string;
  a: string;
}
interface SectionItem {
  kind: "section";
  id: string;
  title: string;
}
type AccordionItem = QaItem | SectionItem;

interface AccordionBlockMeta {
  items: AccordionItem[];
}

function readAccordionMeta(meta: unknown): AccordionBlockMeta {
  if (!meta || typeof meta !== "object") return { items: [] };
  const m = meta as Record<string, unknown>;
  const rawItems = Array.isArray(m.items) ? m.items : [];
  const items: AccordionItem[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const it = rawItems[i];
    if (!it || typeof it !== "object") continue;
    const r = it as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : `item-${i}`;
    if (r.kind === "section") {
      const title = typeof r.title === "string" ? r.title : "";
      items.push({ kind: "section", id, title });
    } else if (r.kind === "qa") {
      const q = typeof r.q === "string" ? r.q : "";
      const a = typeof r.a === "string" ? r.a : "";
      items.push({ kind: "qa", id, q, a });
    }
  }
  return { items };
}

export function AccordionBlockRenderer(block: PublicBlock): ReactNode {
  const { items } = readAccordionMeta(block.meta);

  return (
    <article
      data-block-type="accordion"
      data-block-id={block.id}
      className="block-accordion-wrap"
    >
      <div className="block-accordion" data-testid={`block-accordion-${block.id}`}>
        {items.length === 0 ? (
          <p className="block-accordion-empty">No questions added yet.</p>
        ) : (
          items.map((item) =>
            item.kind === "section" ? (
              <h3 key={item.id} className="block-accordion-section">
                {item.title}
              </h3>
            ) : (
              <details key={item.id} className="block-accordion-item">
                <summary className="block-accordion-q">{item.q}</summary>
                <div className="block-accordion-a">{item.a}</div>
              </details>
            ),
          )
        )}
      </div>
    </article>
  );
}
