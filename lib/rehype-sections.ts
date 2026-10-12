/**
 * Groups a case study's write-up into the resume's timeline entries: each
 * `##` heading and everything up to the next becomes one soft card beside
 * the scroll line, with a dot on the line level with the heading. Anything
 * before the first heading is left as it is.
 *
 * Output, per section:
 *   <section class="scroll-entry ..."><span class="scroll-dot" aria-hidden />
 *     <div class="scroll-slide case-card ...">h2, p, ul...</div></section>
 *
 * The entry and its dot stay put while the card slides in (see "Scroll
 * line" and "Resume timeline" in globals.css).
 */
type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

// The dot sits level with the heading: the card's 1.5rem padding plus half
// the heading's line (1.05 x text-step-2), less half the 1.2rem dot.
const ENTRY = ["scroll-entry", "[--dot-top:calc(1.5rem_+_var(--text-step-2)_*_0.525_-_0.6rem)]"];
const CARD = [
  "scroll-slide",
  "case-card",
  "spotlight",
  "relative",
  "rounded-2xl",
  "border",
  "border-fg-muted/15",
  "bg-surface/40",
  "p-6",
  "[&>:first-child]:mt-0",
];

const element = (tagName: string, className: string[], children: HastNode[] = []): HastNode => ({
  type: "element",
  tagName,
  properties: { className },
  children,
});

export function rehypeSections() {
  return (tree: HastNode) => {
    const children = tree.children ?? [];
    const out: HastNode[] = [];
    // The open card's contents: everything from its heading to the next.
    let card: HastNode[] | null = null;

    for (const child of children) {
      if (child.type === "element" && child.tagName === "h2") {
        card = [];
        const dot = element("span", ["scroll-dot"]);
        dot.properties = { ...dot.properties, ariaHidden: "true" };
        out.push(element("section", ENTRY, [dot, element("div", CARD, card)]));
      }
      if (card) card.push(child);
      else out.push(child);
    }

    tree.children = out;
  };
}
