"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** How long each slide shows before the next slides in, in milliseconds. */
const SLIDE_INTERVAL = 5000;

/**
 * The behaviour behind both project carousels, after the entertainment row on
 * apple.com. The track is a native horizontal scroller with snap points, so
 * swiping, trackpads and keyboard focus all move it; the timer only calls
 * scrollTo. It advances every five seconds, and holds while the pointer or
 * keyboard focus is in it, while it is off screen, when the visitor pauses
 * it, and always under reduced motion (WCAG 2.2.2).
 *
 * `resetKey` changing (a new filter, say) sends the track back to the start.
 */
export function useCarousel(count: number, resetKey?: unknown) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [nearest, setNearest] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();
  const running = playing && !hovered && !focused && visible && !reduced && count > 1;
  // Clamped: after a filter there may be fewer slides than before.
  const current = Math.min(nearest, Math.max(count - 1, 0));

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const slide = track?.children[index] as HTMLElement | undefined;
      if (!track || !slide) return;
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );

  // The current slide is whichever is nearest the middle of the track.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const middle = track.scrollLeft + track.clientWidth / 2;
      let best = Infinity;
      let index = 0;
      Array.from(track.children).forEach((child, i) => {
        const slide = child as HTMLElement;
        const distance = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - middle);
        if (distance < best) {
          best = distance;
          index = i;
        }
      });
      setNearest(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    track.addEventListener("scroll", schedule, { passive: true });
    return () => {
      track.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // A new set of slides starts from the first, and is measured afresh.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: 0, behavior: "auto" });
    const frame = requestAnimationFrame(() => setNearest(0));
    return () => cancelAnimationFrame(frame);
  }, [resetKey]);

  // Only runs while it can be seen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.4 },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => goTo((current + 1) % count), SLIDE_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, current, goTo, count]);

  /** Spread on the carousel's root: these are what hold it still. */
  const rootProps = {
    "data-running": running || undefined,
    onPointerEnter: (event: PointerEvent) => event.pointerType === "mouse" && setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    },
  };

  return { trackRef, current, goTo, running, playing, setPlaying, rootProps };
}
