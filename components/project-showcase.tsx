import Image from "next/image";
import { ViewTransition } from "react";
import type { Project } from "@/lib/content";
import { projectTransitionName } from "@/lib/transitions";

/**
 * What a case study opens with: the project's own photo or video, or its
 * cover until one exists. It is usually the largest thing on screen, so it
 * loads eagerly and never animates in from hidden.
 */
export function ProjectShowcase({ project }: { project: Project }) {
  const media = project.showcase ?? {
    kind: "image" as const,
    src: project.cover.src,
    alt: project.cover.alt,
  };

  return (
    <ViewTransition
      name={projectTransitionName(project.slug, "cover")}
      share="morph"
      default="none"
    >
      <div className="project-showcase overflow-hidden rounded-xl border border-fg-muted/15">
        {media.kind === "video" ? (
          // preload="none" with a poster: the recording costs nothing until
          // someone presses play, which protects the performance budget. The
          // fixed 1200×630 frame matches the cover: no layout shift when the
          // poster loads, and a portrait phone recording letterboxes instead
          // of towering over the page.
          <video
            controls
            preload="none"
            poster={media.poster}
            aria-label={media.alt}
            width={1200}
            height={630}
            className="block aspect-[1200/630] w-full bg-surface object-contain"
          >
            <source src={media.src} type="video/mp4" />
            Your browser does not support embedded video. Use the Source link to view the code.
          </video>
        ) : (
          <Image
            src={media.src}
            alt={media.alt}
            width={1200}
            height={630}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 59rem"
            className="block aspect-[1200/630] w-full object-cover"
          />
        )}
      </div>
    </ViewTransition>
  );
}
