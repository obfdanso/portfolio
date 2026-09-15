"use client";

import { useMemo, useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/cn";

const ALL = "All";

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

    // Nothing focused yet (the prev/next buttons were clicked): start at the
    // first card rather than jumping to the end.
    const next =
      current === -1 ? 0 : Math.min(Math.max(current + direction, 0), cards.length - 1);

    const target = cards[next];
    if (!target) return;

    target.querySelector("a")?.focus();
    target.scrollIntoView({ block: "nearest", inline: "center" });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by stack">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={filter === tag}
            onClick={() => setFilter(tag)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-step-xs transition-colors",
              filter === tag
                ? "border-accent text-accent"
                : "border-fg-muted/20 text-fg-muted hover:text-fg",
            )}
          >
            {tag}
          </button>
        ))}
      </div>


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
          <li key={project.slug} className="project-rail__item">
            <ProjectCard project={project} index={index} headingLevel={2} />
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="mt-8 text-fg-muted">No projects use {filter}.</p>
      )}
    </div>
  );
}
