/**
 * A 2px accent line that fills as the case study is scrolled. Pure CSS,
 * driven by the root scroll timeline (see .reading-progress in globals.css).
 * Decorative: the scrollbar already tells assistive technology where the
 * reader is.
 */
export function ReadingProgress() {
  return <div aria-hidden="true" className="reading-progress" />;
}
