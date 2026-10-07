"use client";

import { useEffect } from "react";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * One listener for the whole site. It moves the glow on whichever .spotlight
 * card the mouse is over, and the lean on .tilt cards, at most once per frame. No listener at all on touch
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

      // Cards that opt into .tilt lean toward the mouse: -1 at one edge, 1 at
      // the other. CSS turns these into a few degrees of rotation.
      if (card.classList.contains("tilt")) {
        const tx = ((last.clientX - rect.left) / rect.width) * 2 - 1;
        const ty = ((last.clientY - rect.top) / rect.height) * 2 - 1;
        card.style.setProperty("--tilt-x", tx.toFixed(3));
        card.style.setProperty("--tilt-y", ty.toFixed(3));
      }
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
