import { Fragment } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * A paragraph that lights up word by word as it scrolls through the
 * viewport, from the muted body colour to full. Each word knows how far
 * through the paragraph it sits; CSS turns that into its slice of the
 * scroll. The real spaces stay between the words, so it reads, copies and
 * searches as one paragraph.
 */
export function ScrollLitText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <p className={cn("scroll-lit", className)}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span
            className="scroll-lit__word"
            style={{ "--word-progress": (index / words.length).toFixed(3) } as CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
