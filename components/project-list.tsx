"use client";

import type { CSSProperties } from "react";
import {
  addTransitionType,
  startTransition,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { Project } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { ChevronDownIcon } from "@/components/icons";
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
  const listRef = useRef<HTMLUListElement>(null);

  const tags = useMemo(
    () => [ALL, ...Array.from(new Set(projects.flatMap((p) => p.stack))).sort()],
    [projects],
  );

  const visible = filter === ALL ? projects : projects.filter((p) => p.stack.includes(filter));

  /**
   * Steps between projects, not between individual links. Walking every anchor
   * would make ArrowRight land on the current card's "Source" link rather than
   * the next project.
   *
   * Driven by focus rather than scroll offsets, so keyboard focus and scroll
   * position can never disagree — the usual failure mode of horizontal rails.
   */
  function move(direction: -1 | 1) {
    const list = listRef.current;
    if (!list) return;

    const cards = Array.from(list.querySelectorAll<HTMLElement>("article"));
    if (cards.length === 0) return;

    const focused = document.activeElement;
    const current = cards.findIndex((card) => card.contains(focused));

    // Clamped, so the ends of the rail hold rather than wrap.
    const next = Math.min(Math.max(current + direction, 0), cards.length - 1);

    const target = cards[next];
    if (!target) return;

    target.querySelector("a")?.focus();
    target.scrollIntoView({ block: "nearest", inline: "center" });
  }

  return (
    <div>
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

      <ul
        ref={listRef}
        aria-label="Projects"
        className="project-rail mt-6"
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
            <li className="project-rail__item">
              <ProjectCard project={project} index={index} headingLevel={2} />
            </li>
          </ViewTransition>
        ))}
      </ul>

      {visible.length === 0 && <p className="mt-8 text-fg-muted">No projects use {filter}.</p>}
    </div>
  );
}
