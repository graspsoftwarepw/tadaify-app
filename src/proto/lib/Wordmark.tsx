/**
 * Wordmark — tada!ify brand lockup (DEC-WORDMARK-01: zero separators, the "!"
 * is part of the mark). Token-coloured so it re-themes in dark automatically.
 *
 * @implements FR-GLOBALUI-THEME-AND-COLOURS
 */
export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`wordmark wordmark-${size}`} aria-label="tada!ify">
      <span className="wm-ta" aria-hidden>tada</span>
      <span className="wm-da" aria-hidden>!</span>
      <span className="wm-ify" aria-hidden>ify</span>
    </span>
  );
}
