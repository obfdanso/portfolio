"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Project } from "@/lib/content";
import { CarouselControls } from "@/components/carousel-controls";
import { projectTransitionName } from "@/lib/transitions";
import { useCarousel } from "@/lib/use-carousel";
import { cn } from "@/lib/cn";

/**
 * The home page's projects, after the entertainment row on apple.com: wide
 * slides with the next one peeking in, the name and actions under each
 * screenshot, and an automatic advance every five seconds with dots and a
 * pause button. The behaviour lives in useCarousel, shared with the Projects
 * page.
 */
export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const { trackRef, current, goTo, running, playing, setPlaying, rootProps } = useCarousel(
    projects.length,
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Selected work"
      className="carousel"
      {...rootProps}
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
            <ProjectSlide project={project} />
          </div>
        ))}
      </div>

      <CarouselControls
        labels={projects.map((project) => project.title)}
        current={current}
        playing={playing}
        onSelect={goTo}
        onTogglePlay={() => setPlaying((value) => !value)}
      />
    </section>
  );
}

const PILL = "pill relative z-10 rounded-full px-4 py-1.5 text-step-xs";

/**
 * One project slide: the screenshot, then the name and its actions under it.
 * The home page and the Projects page use the same one. `tilt` makes it lean
 * toward the mouse, as the Projects page cards always have.
 */
export function ProjectSlide({
  project,
  headingLevel = 3,
  tilt = false,
}: {
  project: Project;
  headingLevel?: 2 | 3;
  tilt?: boolean;
}) {
  const { demo, showcase } = project;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={cn("carousel__card relative", tilt && "tilt")}>
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
          <Heading className="text-step-2">
            {/* Stretched over the slide, above the screenshot. */}
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 after:z-[1]"
            >
              {project.title}
            </Link>
          </Heading>
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
