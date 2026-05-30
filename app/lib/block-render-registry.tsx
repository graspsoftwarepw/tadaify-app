/**
 * block-render-registry — per-block-type renderer registration shell
 *
 * Story F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202) ships ONLY the
 * registry shell plus a default `<article data-block-type data-block-id />`
 * wrapper. Per-type renderers (link, image, countdown, …) register themselves
 * from their own F-BLOCK-* stories.
 *
 * Per-block-type render markup is explicitly NOT in scope here; see the
 * per-type stories for their actual markup.
 *
 * Covers: TR (per-block-type render delegation).
 */

import type { ReactNode } from "react";

export interface PublicBlock {
  id: string;
  block_type: string;
  title: string;
  url: string | null;
  position: number;
  is_visible: boolean;
  meta: unknown;
}

export type BlockRenderer = (block: PublicBlock) => ReactNode;

const REGISTRY = new Map<string, BlockRenderer>();

/**
 * Default fallback renderer — emits a single `<article>` wrapper with the
 * required data-attribute contract from the issue body's visual checklist.
 * Per-type stories MUST replace this for their type by calling
 * `registerBlockRenderer(kind, renderer)`.
 */
export const defaultBlockRenderer: BlockRenderer = (block) => (
  <article data-block-type={block.block_type} data-block-id={block.id} />
);

export function registerBlockRenderer(
  kind: string,
  renderer: BlockRenderer,
): void {
  REGISTRY.set(kind, renderer);
}

export function getBlockRenderer(kind: string): BlockRenderer {
  return REGISTRY.get(kind) ?? defaultBlockRenderer;
}

/**
 * Test-only: clear all registered renderers. Used by unit tests to keep
 * registrations isolated between cases.
 */
export function __resetBlockRendererRegistryForTest(): void {
  REGISTRY.clear();
}
