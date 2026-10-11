import type { CSSProperties } from "react";
import { SITE } from "@/lib/site";

const GREETINGS = ["Welcome", "Bonne arrivée", "Akwaaba"];

/**
 * The line above the home headline says welcome in English, French and Twi,
 * then settles on Danso's name. The greetings are decoration, hidden from
 * assistive technology; the name is in the markup from the first byte, so
 * screen readers, search engines and visitors without CSS animation get it
 * straight away.
 */
export function HeroGreeting() {
  return (
    <span className="greeting">
      {GREETINGS.map((word, index) => (
        <span
          key={word}
          aria-hidden="true"
          className="greeting__word"
          style={{ "--greet-index": String(index) } as CSSProperties}
        >
          {word}
        </span>
      ))}
      <span
        className="greeting__name"
        style={{ "--greet-index": String(GREETINGS.length) } as CSSProperties}
      >
        {SITE.name}
      </span>
    </span>
  );
}
