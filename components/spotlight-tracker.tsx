"use client";

import { useEffect } from "react";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * One listener for the whole site. It moves the glow on whichever .spotlight
 * card the mouse is over, the lean on .tilt cards, and the pull on .magnetic
 * buttons, at most once per frame. No listener at all on touch
 * screens or under reduced motion.
 */
export function SpotlightTracker() {
  useEffect(() => {
    if (!window.matchMedia(QUERY).matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;
    let magnet: HTMLElement | null = null;

    // Magnetic buttons lean a few pixels toward the mouse while it is over
    // them, and settle back (through their CSS transition) when it leaves.
    const release = () => {
      magnet?.style.removeProperty("--mag-x");
      magnet?.style.removeProperty("--mag-y");
      magnet = null;
    };

    const paint = () => {
      frame = 0;
      if (!last) return;
      const target = last.target as Element | null;

      const nextMagnet = target?.closest<HTMLElement>(".magnetic") ?? null;
      if (nextMagnet !== magnet) release();
      if (nextMagnet) {
        magnet = nextMagnet;
        const box = nextMagnet.getBoundingClientRect();
        const pull = (offset: number) => Math.max(-6, Math.min(6, offset * 0.25));
        nextMagnet.style.setProperty(
          "--mag-x",
          `${pull(last.clientX - (box.left + box.width / 2)).toFixed(2)}px`,
        );
        nextMagnet.style.setProperty(
          "--mag-y",
          `${pull(last.clientY - (box.top + box.height / 2)).toFixed(2)}px`,
        );
      }

      const card = target?.closest<HTMLElement>(".spotlight");
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

    // The mouse left the window: let any magnetic button settle.
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) release();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
