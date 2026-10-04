import type { CSSProperties } from "react";
import { ChevronDownIcon } from "@/components/icons";

/**
 * The card's stack tags, folded behind a "Stack" pill. A native <details>:
 * it works before hydration, screen readers announce it as expandable, and
 * find-in-page still reaches the folded tags. Only the summary sits on
 * z-10, above the card's stretched link: opening it never opens the case
 * study, while the rest of the row still does.
 */
export function StackDisclosure({ stack }: { stack: string[] }) {
  return (
    <details className="stack-disclosure mt-3">
      <summary className="pill pill-muted relative z-10 inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-fg-muted/25 px-3 py-1 text-step-xs text-fg-muted">
        Stack
        <ChevronDownIcon className="stack-disclosure__chevron size-3.5" />
      </summary>
      <ul className="mt-3 flex flex-wrap gap-2">
        {stack.map((tech, index) => (
          <li
            key={tech}
            className="stack-disclosure__tag rounded-full border border-fg-muted/20 px-3 py-1 text-step-xs text-fg-muted"
            style={{ "--tag-index": index } as CSSProperties}
          >
            {tech}
          </li>
        ))}
      </ul>
    </details>
  );
}
