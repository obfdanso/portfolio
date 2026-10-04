"use client";

import { useEffect } from "react";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * One listener for the whole site. It moves the glow on whichever .spotlight
 * card the mouse is over, at most once per frame. No listener at all on touch
 * screens or under reduced motion.
 */
export function SpotlightTracker() {
  useEffect(() => {
    if (!window.matchMedia(QUERY).matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      if (!last) return;
      const card = (last.target as Element | null)?.closest<HTMLElement>(".spotlight");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${last.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${last.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
