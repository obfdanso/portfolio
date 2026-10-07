import { Fragment, type CSSProperties } from "react";

/**
 * The home headline, word by word. Each word rises inside its own mask. The
 * real spaces stay between the masks, so the heading's accessible name,
 * copy-paste and find-in-page all read the sentence normally.
 */
export function HeroHeadline({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <h1 className={className} style={style}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="hero-word">
            <span
              className="hero-word__inner"
              style={{ "--word-index": String(index) } as CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}
