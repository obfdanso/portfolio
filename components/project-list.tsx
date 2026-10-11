"use client";

import type { CSSProperties } from "react";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { Project } from "@/lib/content";
import { ProjectSlide } from "@/components/project-carousel";
import { ChevronDownIcon } from "@/components/icons";
import { CarouselControls } from "@/components/carousel-controls";
import { useCarousel } from "@/lib/use-carousel";
import { cn } from "@/lib/cn";

const ALL = "All";

// Only filter changes carry this type, so the cards' enter and exit
// animations never run on route navigations (where the card morph plays).
const FILTER = "project-filter";

const select = (setFilter: (tag: string) => void, tag: string) =>
  startTransition(() => {
    addTransitionType(FILTER);
    setFilter(tag);
  });

export function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>(ALL);

  const tags = useMemo(
    () => [ALL, ...Array.from(new Set(projects.flatMap((p) => p.stack))).sort()],
    [projects],
  );

  const visible = filter === ALL ? projects : projects.filter((p) => p.stack.includes(filter));

  // The home page carousel's behaviour: it advances on its own, holds under
  // the pointer or focus, and starts over from the first card on a new filter.
  const { trackRef, current, goTo, running, playing, setPlaying, rootProps } = useCarousel(
    visible.length,
    filter,
  );

  // The arrow keys step the carousel; focus follows to the new middle card's
  // name once it is there (the others' names are hidden, as on the home page).
  const focusAfterMove = useRef(false);
  useEffect(() => {
    if (!focusAfterMove.current) return;
    focusAfterMove.current = false;
    trackRef.current?.children[current]?.querySelector<HTMLElement>("h2 a")?.focus({
      preventScroll: true,
    });
  }, [current, trackRef]);

  /** Steps between projects, holding at the ends rather than wrapping. */
  function move(direction: -1 | 1) {
    const next = Math.min(Math.max(current + direction, 0), visible.length - 1);
    if (next === current) return;
    focusAfterMove.current = true;
    goTo(next);
  }

  return (
    <div>
      <div className="container-page">
        {/* Folded behind a "Stack" pill, like each card's tags. The pill names
          the active filter, so a filtered list says so even while closed. */}
        <details className="stack-disclosure filter-disclosure">
          <summary className="pill pill-muted inline-flex list-none items-center gap-1.5 rounded-full border border-fg-muted/25 px-3.5 py-1.5 text-step-xs text-fg-muted">
            Stack
            {filter !== ALL && <span className="text-accent">· {filter}</span>}
            <ChevronDownIcon className="stack-disclosure__chevron size-3.5" />
          </summary>
          <div
            className="mt-3 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter by stack"
          >
            {tags.map((tag, index) => (
              // The pop-in runs on this wrapper, not the button: an animation's
              // fill would otherwise override the button's hover lift.
              <span
                key={tag}
                className="stack-disclosure__tag inline-flex"
                style={{ "--tag-index": index } as CSSProperties}
              >
                <button
                  type="button"
                  aria-pressed={filter === tag}
                  onClick={() => select(setFilter, tag)}
                  className={cn(
                    "pill relative isolate rounded-full border px-3.5 py-1.5 text-step-xs",
                    filter === tag
                      ? "pill-primary border-accent text-accent"
                      : "pill-muted border-fg-muted/20 text-fg-muted",
                  )}
                >
                  {filter === tag && (
                    <ViewTransition name="filter-highlight" share="morph" default="none">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full bg-accent/10"
                      />
                    </ViewTransition>
                  )}
                  {tag}
                </button>
              </span>
            ))}
          </div>
        </details>
      </div>

      {/* The home page's carousel, slide for slide: across the whole page,
          the name and actions under each screenshot. These lean toward the
          mouse as well. */}
      <section
        aria-roledescription="carousel"
        aria-label="Projects"
        className="carousel mt-6"
        {...rootProps}
      >
        <div
          ref={trackRef}
          className="carousel__track"
          aria-live={running ? "off" : "polite"}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
          }}
        >
          {visible.map((project, index) => (
            <ViewTransition
              key={project.slug}
              enter={{ [FILTER]: "card-in", default: "none" }}
              exit={{ [FILTER]: "card-out", default: "none" }}
              update={{ [FILTER]: "card-move", default: "none" }}
              default="none"
            >
              {/* Plain divs: a list item may not take the group role. */}
              <div
                className="carousel__slide"
                data-current={index === current || undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${visible.length}`}
              >
                <ProjectSlide project={project} headingLevel={2} tilt />
              </div>
            </ViewTransition>
          ))}
        </div>

        {visible.length > 1 && (
          <CarouselControls
            labels={visible.map((project) => project.title)}
            current={current}
            playing={playing}
            onSelect={goTo}
            onTogglePlay={() => setPlaying((value) => !value)}
          />
        )}
      </section>

      {visible.length === 0 && (
        <p className="container-page mt-8 text-fg-muted">No projects use {filter}.</p>
      )}
    </div>
  );
}
