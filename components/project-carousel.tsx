"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, ViewTransition } from "react";
import type { Project } from "@/lib/content";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { projectTransitionName } from "@/lib/transitions";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

/** How long each slide shows before the next slides in, in milliseconds. */
export const SLIDE_INTERVAL = 5000;

/**
 * The home page's projects, after the entertainment row on apple.com: wide
 * slides with the next one peeking in, a caption over each screenshot, and
 * an automatic advance every five seconds with dots and a pause button.
 *
 * It is a native horizontal scroller with snap points, so swiping, trackpads
 * and keyboard focus all move it; the timer only calls scrollTo. It stops
 * while the pointer or keyboard focus is in it, while it is off screen, when
 * the visitor pauses it, and never starts under reduced motion (WCAG 2.2.2).
 */
export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();
  const running = playing && !hovered && !focused && visible && !reduced;

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
      let nearest = 0;
      let best = Infinity;
      Array.from(track.children).forEach((child, index) => {
        const slide = child as HTMLElement;
        const distance = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - middle);
        if (distance < best) {
          best = distance;
          nearest = index;
        }
      });
      setCurrent(nearest);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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
    const timer = window.setTimeout(() => goTo((current + 1) % projects.length), SLIDE_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, current, goTo, projects.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Selected work"
      className="carousel"
      data-running={running || undefined}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* Announces slide changes only when the visitor is driving them. */}
      <div ref={trackRef} className="carousel__track" aria-live={running ? "off" : "polite"}>
        {projects.map((project, index) => (
          // Plain divs: a list item may not take the group role slides need.
          <div
            key={project.slug}
            className="carousel__slide"
            data-current={index === current || undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${projects.length}`}
          >
            <Slide project={project} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="bubble flex items-center rounded-full px-2 py-2.5">
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              aria-label={`Show ${project.title}`}
              aria-current={index === current || undefined}
              onClick={() => goTo(index)}
              className="carousel__dot"
            >
              {/* A 24px button around a small pip, so it is easy to hit. */}
              <span aria-hidden="true" className="carousel__pip">
                {index === current && (
                  // Keyed by slide, so the fill starts over on every slide.
                  <span key={current} className="carousel__progress" />
                )}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
          className="bubble grid size-11 place-items-center rounded-full text-fg"
        >
          {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
        </button>
      </div>
    </section>
  );
}

const PILL = "pill relative z-10 rounded-full px-4 py-1.5 text-step-xs";

function Slide({ project }: { project: Project }) {
  const { demo, showcase } = project;
  return (
    <article className="carousel__card relative">
      <ViewTransition
        name={projectTransitionName(project.slug, "cover")}
        share="morph"
        default="none"
      >
        <div className="carousel__media overflow-hidden rounded-3xl bg-surface">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={1200}
            height={630}
            sizes="(max-width: 768px) 92vw, 82vw"
            className="h-full w-full object-cover"
          />
        </div>
      </ViewTransition>

      {/* Under the screenshot, never over it: just the name and the actions.
          Shown for the slide in the middle only, so the next slide's name
          never crowds these buttons. */}
      <div className="carousel__meta mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-1">
        <ViewTransition
          name={projectTransitionName(project.slug, "title")}
          share="morph"
          default="none"
        >
          <h3 className="text-step-2">
            {/* Stretched over the slide, above the screenshot. */}
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 after:z-[1]"
            >
              {project.title}
            </Link>
          </h3>
        </ViewTransition>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className={cn(PILL, "btn-solid bg-fg font-medium text-ground")}
          >
            Case study
          </Link>
          {demo.kind === "live" && (
            <a href={demo.url} className={cn(PILL, "pill-muted border border-fg-muted/30")}>
              Live site
            </a>
          )}
          {showcase?.kind === "video" && (
            <a href={showcase.src} className={cn(PILL, "pill-muted border border-fg-muted/30")}>
              Demo video
            </a>
          )}
          <a href={demo.repoUrl} className={cn(PILL, "pill-muted border border-fg-muted/30")}>
            Source
          </a>
        </div>
      </div>
    </article>
  );
}
