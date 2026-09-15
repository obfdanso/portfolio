"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Renders the final value on the server and counts up only after the element
 * has been scrolled into view, so the correct number is present even if
 * JavaScript never runs.
 */
export function SectionNumber({ value }: { value: number }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!armed || reduced) return;

    let frame = 0;
    const start = performance.now();
    const DURATION = 400;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      setShown(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [armed, reduced, value]);

  return (
    <span ref={ref} className="font-mono text-fg-muted tabular-nums">
      {String(shown).padStart(2, "0")}
    </span>
  );
}
