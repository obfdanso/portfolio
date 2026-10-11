"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

const GREETINGS = ["Welcome"];

// Module scope: it resets when the page is loaded or refreshed and survives
// moving around the site, so the greeting plays once per visit.
let played = false;

/**
 * The home hero's stage. On a visit's first look at the home page it says
 * Welcome, big and glowing, and only then do the headline, the line under it and the buttons move in. Coming
 * back to the home page later in the visit goes straight to the hero.
 *
 * The first load is pure CSS, painted before any JavaScript runs; the server
 * always renders the greeting, and so does the first client render, so
 * hydration matches. The greetings are decoration, hidden from assistive
 * technology, which reads the hero as usual.
 */
export function HeroGreeting({ children }: { children: React.ReactNode }) {
  const [staged] = useState(() => !played);

  useEffect(() => {
    played = true;
  }, []);

  return (
    <div
      className={cn("container-page relative w-full py-24", staged && "greeting-stage")}
      style={staged ? ({ "--greet-count": GREETINGS.length } as CSSProperties) : undefined}
    >
      {staged && (
        <div aria-hidden="true" className="greeting-layer">
          <span className="greeting">
            {GREETINGS.map((word, index) => (
              <span
                key={word}
                className="greeting__word"
                style={{ "--greet-index": String(index) } as CSSProperties}
              >
                {word}
              </span>
            ))}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
