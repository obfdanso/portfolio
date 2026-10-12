import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
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

  // A video's poster is the page's Largest Contentful Paint, but a poster
  // attribute skips Next's image optimiser and is found late. Run it through
  // the optimiser like every other image (a resized AVIF or WebP instead of
  // the raw PNG) and ask for it early, at high priority. 960 is about the
  // width the showcase is shown at (59rem), so a sharp screen gets 1920px.
  const poster =
    media.kind === "video"
      ? getImageProps({ src: media.poster, alt: "", width: 960, height: 504, quality: 75 }).props
          .src
      : undefined;
  if (poster) preload(poster, { as: "image", fetchPriority: "high" });

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
            poster={poster}
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
