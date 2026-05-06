/**
 * BlockEditorModal — reusable block-editor modal shell.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html lines 2045-2310
 *
 * Compound component usage:
 * ```tsx
 * <BlockEditorModal open={open} onOpenChange={setOpen} blockType="link" blockId="123">
 *   <BlockEditorModal.Header typeIcon="🔗" title="Link button" blockType="link" onTypeChange={...} />
 *   <BlockEditorModal.Form>{/* form fields * /}</BlockEditorModal.Form>
 *   <BlockEditorModal.Preview>{/* live preview * /}</BlockEditorModal.Preview>
 *   <BlockEditorModal.Footer savedHint="Last saved 12s ago" onDiscard={...} onSave={...} />
 * </BlockEditorModal>
 * ```
 *
 * Tech: @radix-ui/react-dialog (TR-tadaify-008, DEC-375=B)
 * SSR-safe: Dialog.Portal mounts client-side only (Radix handles)
 * A11y: Radix provides role=dialog, aria-modal, focus trap, scroll lock
 * Responsive: 2-col ≥1024px, 1-col tablet (600-1023px), 1-col mobile (<600px)
 *
 * Story: tadaify-app#200 F-BLOCK-INFRA-EDITOR-MODAL-001
 * Covers: BR-BLOCK-EDITOR-001, BR-BLOCK-EDITOR-002, BR-BLOCK-EDITOR-003, BR-BLOCK-EDITOR-004
 */

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Pure exported logic (testable without DOM)
// ---------------------------------------------------------------------------

/** Z-index tiers for modal stacking (TR-tadaify-008 sub-modal contract). */
export const MODAL_Z_INDEX = {
  /** Block editor, pickers, settings modals (base level). */
  base: 50,
  /** Delete confirm, AI suggest, tier-gate (sub-modal nested inside base). */
  subModal: 60,
} as const;

export type ModalLevel = keyof typeof MODAL_Z_INDEX;

/** Resolve z-index for a given nesting level. */
export function resolveZIndex(nested: boolean): number {
  return nested ? MODAL_Z_INDEX.subModal : MODAL_Z_INDEX.base;
}

/** ARIA label for the close button — locked string per visual checklist. */
export const CLOSE_BUTTON_ARIA_LABEL = "Close editor" as const;

/** Close button keyboard hint (title attribute). */
export const CLOSE_BUTTON_TITLE = "Close (Esc)" as const;

/** Validate that a blockType string is non-empty (component guard). */
export function isValidBlockType(blockType: string | undefined | null): boolean {
  return typeof blockType === "string" && blockType.trim().length > 0;
}

/** Derive compound-slot display names for debugging. */
export const COMPOUND_SLOTS = ["Header", "Form", "Preview", "Footer"] as const;
export type CompoundSlot = (typeof COMPOUND_SLOTS)[number];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockEditorModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Callback when modal open state changes (false = close requested). */
  onOpenChange: (open: boolean) => void;
  /** Block type key — e.g. "link", "text", "image". */
  blockType: string;
  /** Block ID (UUID) or null for new blocks. */
  blockId: string | null;
  /**
   * When true, modal renders as a sub-modal (z-index 60) stacked on top of
   * a base-level editor. Used for delete confirm + AI suggest dialogs.
   * Default: false (z-index 50).
   */
  nested?: boolean;
  /**
   * Accessible title for the dialog. When a Header compound slot is used,
   * the Header renders its own Dialog.Title — pass this prop to suppress the
   * visually-hidden fallback. When no Header is used (e.g. delete confirm
   * sub-modals), this prop provides the required accessible name via a
   * visually-hidden Dialog.Title.
   */
  ariaLabel?: string;
  /** Modal children — typically compound slots (Header, Form, Preview, Footer). */
  children?: ReactNode;
}

export interface BlockEditorHeaderProps {
  /** Emoji or icon element displayed as block type icon (38×38 chip). */
  typeIcon?: ReactNode;
  /** Block title shown in the header (e.g. "Link button"). */
  title?: string;
  /** Current block type key. */
  blockType?: string;
  /** Called when user selects a different block type from the dropdown. */
  onTypeChange?: (newType: string) => void;
  /** Available block type options for the type-switch select. */
  typeOptions?: Array<{ value: string; label: string }>;
}

export interface BlockEditorFooterProps {
  /** "Last saved N ago" hint text. */
  savedHint?: string;
  /** Called when user clicks Discard. */
  onDiscard?: () => void;
  /** Called when user clicks Save. */
  onSave?: () => void;
  /** When true, Save button shows a loading state. */
  saving?: boolean;
}

// ---------------------------------------------------------------------------
// Compound slot: Header
// ---------------------------------------------------------------------------

function Header({
  typeIcon,
  title,
  blockType,
  onTypeChange,
  typeOptions = [],
}: BlockEditorHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-[22px] py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex-shrink-0 flex-wrap max-[540px]:px-4 max-[540px]:py-[14px] max-[540px]:gap-2">
      {/* Type icon chip */}
      <span
        className="w-[38px] h-[38px] rounded-[10px] bg-indigo-100/50 flex items-center justify-center text-[19px] flex-shrink-0"
        aria-hidden="true"
      >
        {typeIcon ?? "📦"}
      </span>

      {/* Meta: label + title */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.06em] font-semibold">
          Editing block
        </div>
        <Dialog.Title
          className="font-display text-[20px] font-semibold text-[var(--fg)] tracking-[-0.01em] truncate"
          id="block-editor-title"
        >
          {title ?? "Block"}
        </Dialog.Title>
      </div>

      {/* Type-switch dropdown */}
      {typeOptions.length > 0 && (
        <select
          className="py-[7px] px-[11px] rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg)] text-[12.5px] font-medium text-[var(--fg)] cursor-pointer font-sans max-w-[240px] max-[540px]:order-3 max-[540px]:w-full max-[540px]:max-w-none"
          aria-label="Switch block type"
          value={blockType}
          onChange={(e) => onTypeChange?.(e.target.value)}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Close button */}
      <Dialog.Close asChild>
        <button
          type="button"
          className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] text-[var(--fg-subtle)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] transition-colors flex-shrink-0"
          aria-label={CLOSE_BUTTON_ARIA_LABEL}
          title={CLOSE_BUTTON_TITLE}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </Dialog.Close>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Compound slot: Form (left column)
// ---------------------------------------------------------------------------

function Form({ children }: { children?: ReactNode }) {
  return (
    <div
      className="
        flex-1 min-w-0 px-[22px] py-[18px]
        flex flex-col gap-[18px]
        border-r border-[var(--border)]
        max-[1023px]:border-r-0 max-[1023px]:border-b max-[1023px]:border-[var(--border)]
      "
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compound slot: Preview (right column)
// ---------------------------------------------------------------------------

function Preview({ children }: { children?: ReactNode }) {
  return (
    <div
      className="
        flex-1 min-w-0 px-[22px] py-[18px]
        flex flex-col gap-[14px]
        bg-[var(--bg)]
      "
      id="col-preview"
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compound slot: Footer
// ---------------------------------------------------------------------------

function Footer({ savedHint, onDiscard, onSave, saving = false }: BlockEditorFooterProps) {
  return (
    <footer className="flex items-center gap-[10px] px-[22px] py-3 border-t border-[var(--border)] bg-[var(--bg-elevated)] flex-shrink-0 flex-wrap sticky bottom-0">
      {/* Saved hint — left side */}
      <div className="flex-1 min-w-[140px] text-[12px] text-[var(--fg-subtle)]">
        {savedHint && <b className="text-[var(--fg-muted)] font-medium">{savedHint}</b>}
      </div>

      {/* Discard button */}
      <button
        type="button"
        className="px-4 py-[9px] rounded-[9px] border border-[var(--border-strong)] bg-transparent text-[13px] font-semibold text-[var(--fg-muted)] cursor-pointer font-sans hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] transition-colors"
        onClick={onDiscard}
      >
        Discard
      </button>

      {/* Save button */}
      <button
        type="button"
        className="px-[18px] py-[9px] rounded-[9px] bg-[var(--brand-primary)] text-white border-0 text-[13px] font-semibold cursor-pointer font-sans shadow-[var(--shadow-brand)] hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onSave}
        disabled={saving}
        aria-busy={saving}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

/**
 * BlockEditorModal root.
 *
 * Wraps Radix Dialog with tadaify design tokens.
 * Children are expected to be BlockEditorModal.Header / Form / Preview / Footer
 * slots, but any ReactNode is accepted (progressive enhancement).
 *
 * The 2-column body layout (form left, preview right) is achieved via a
 * flex-row container at ≥1024px that stacks to flex-col below 1024px.
 * At ≤720px the modal fills the full viewport (no rounded corners, no padding).
 */
function BlockEditorModalRoot({
  open,
  onOpenChange,
  blockType: _blockType,
  blockId: _blockId,
  nested = false,
  ariaLabel,
  children,
}: BlockEditorModalProps) {
  const zIndex = resolveZIndex(nested);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop — clicks here close the modal (Radix default) */}
        <Dialog.Overlay
          className="
            fixed inset-0
            bg-[rgba(11,15,30,0.55)] backdrop-blur-[3px]
            data-[state=open]:animate-fadeIn
            data-[state=closed]:animate-fadeOut
          "
          style={{ zIndex }}
        />

        {/*
          Modal panel — Dialog.Content IS the modal box (not a full-screen wrapper).
          Radix treats pointer events outside this element as "outside the dialog",
          which makes backdrop/overlay click-to-close work correctly (Finding 1).
        */}
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            bg-[var(--bg-elevated)]
            border border-[var(--border)]
            rounded-[18px]
            shadow-[var(--shadow-xl)]
            w-[min(960px,calc(100vw-32px))]
            max-h-[calc(100vh-32px)]
            flex flex-col
            overflow-hidden
            data-[state=open]:animate-modalIn
            data-[state=closed]:animate-modalOut
            max-[720px]:rounded-none max-[720px]:max-h-screen max-[720px]:h-screen max-[720px]:w-screen
            max-[720px]:left-0 max-[720px]:top-0 max-[720px]:translate-x-0 max-[720px]:translate-y-0
          "
          style={{ zIndex }}
          aria-describedby={undefined}
          data-testid="block-editor-modal-box"
        >
          {/*
            Accessible title fallback: when no Header compound slot is used
            (e.g. delete confirm sub-modals), ariaLabel provides the required
            accessible name via a visually-hidden Dialog.Title (Finding 4).
          */}
          {ariaLabel && (
            <Dialog.Title className="sr-only">{ariaLabel}</Dialog.Title>
          )}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Body helper
// ---------------------------------------------------------------------------

/**
 * Helper: render the 2-column body wrapper.
 * Wrap Form + Preview in this container to get the 2-col / 1-col responsive
 * layout. Usage:
 *
 * ```tsx
 * <BlockEditorModalBody>
 *   <BlockEditorModal.Form>…</BlockEditorModal.Form>
 *   <BlockEditorModal.Preview>…</BlockEditorModal.Preview>
 * </BlockEditorModalBody>
 * ```
 */
export function BlockEditorModalBody({ children }: { children?: ReactNode }) {
  return (
    <div
      className="
        flex-1 overflow-y-auto
        grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]
        max-[1023px]:grid-cols-1
      "
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typed compound component (Finding 2)
// ---------------------------------------------------------------------------

/** Compound component type — root + static slot properties. */
type BlockEditorModalCompound = typeof BlockEditorModalRoot & {
  Header: typeof Header;
  Form: typeof Form;
  Preview: typeof Preview;
  Footer: typeof Footer;
  Body: typeof BlockEditorModalBody;
};

export const BlockEditorModal: BlockEditorModalCompound = Object.assign(
  BlockEditorModalRoot,
  {
    Header,
    Form,
    Preview,
    Footer,
    Body: BlockEditorModalBody,
  },
);

// ---------------------------------------------------------------------------
// Named exports for tree-shaking
// ---------------------------------------------------------------------------

export { Header as BlockEditorHeader };
export { Form as BlockEditorForm };
export { Preview as BlockEditorPreview };
export { Footer as BlockEditorFooter };
