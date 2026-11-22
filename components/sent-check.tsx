/**
 * A ring and a tick that draw themselves once, to confirm a message went.
 * Decorative: the text beside it says the same thing. pathLength="1" lets
 * the CSS draw both strokes with the same 0-to-1 dash, whatever their size.
 */
export function SentCheck({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 48"
      className={`sent-check size-10 shrink-0 ${className ?? ""}`}
    >
      <circle cx="24" cy="24" r="21" pathLength="1" />
      <path d="M15 24.5l6 6 12-13" pathLength="1" />
    </svg>
  );
}
