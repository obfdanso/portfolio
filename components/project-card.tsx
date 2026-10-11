import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Project } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import { StackDisclosure } from "@/components/stack-disclosure";
import { projectTransitionName } from "@/lib/transitions";

// Pills, matching the stack tags above them. Accent-bordered for the primary
// action, muted for the source link.
const PILL = "pill relative z-10 rounded-full border px-3 py-1 text-step-xs";
const PILL_PRIMARY = `${PILL} pill-primary border-accent/50 text-accent`;
const PILL_MUTED = `${PILL} pill-muted border-fg-muted/25 text-fg-muted`;

function DemoLinks({ project }: { project: Project }) {
  // The discriminated union is what guarantees there is no dead "Live site"
  // button: a repo-only project has no url field to render.
  const { demo, showcase } = project;
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {demo.kind === "live" && (
        <a href={demo.url} className={PILL_PRIMARY}>
          Live site
        </a>
      )}
      {showcase?.kind === "video" && (
        <a href={showcase.src} className={PILL_PRIMARY}>
          Demo video
        </a>
      )}
      <a href={demo.repoUrl} className={PILL_MUTED}>
        Source
      </a>
    </div>
  );
}

/**
 * `headingLevel` exists because the same card appears in two places with
 * different ancestry: on the home page it sits under a "Selected work" h2, so
 * it must be an h3; on /projects it sits directly under the page h1, so an h3
 * would skip a level. Heading order is a real screen-reader navigation aid,
 * not a formality.
 */
export function ProjectCard({
  project,
  index = 0,
  headingLevel = 3,
}: {
  project: Project;
  index?: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Reveal
      as="article"
      delay={index * 40}
      className="project-card spotlight tilt card-lift relative flex h-full flex-col overflow-hidden rounded-3xl border border-fg-muted/12 bg-surface/60"
    >
      {/* The home page slides' look: the screenshot leads, with the title on a
          dark caption over its foot. Named so the cover morphs into the case
          study's showcase, and the title into its heading. default="none"
          keeps them still on every other navigation; share="morph" keeps the
          pair morphing. */}
      {/* The home page slides' look: the screenshot leads and nothing sits
          over it. Named so the cover morphs into the case study's showcase,
          and the title into its heading. default="none" keeps them still on
          every other navigation; share="morph" keeps the pair morphing. */}
      <ViewTransition
        name={projectTransitionName(project.slug, "cover")}
        share="morph"
        default="none"
      >
        <div className="card-media">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={1200}
            height={630}
            className="aspect-[1200/630] w-full object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
          />
        </div>
      </ViewTransition>

      <div className="flex flex-1 flex-col p-6 pt-5">
        <ViewTransition
          name={projectTransitionName(project.slug, "title")}
          share="morph"
          default="none"
        >
          <Heading className="text-step-2">
            {/* The stretched link makes the whole card clickable; the pills
                and the Stack toggle sit on z-10 so they stay individually
                reachable. */}
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 after:z-[1]"
            >
              {project.title}
            </Link>
          </Heading>
        </ViewTransition>
        <p className="mt-1 font-mono text-step-xs text-fg-muted">
          {project.timeframe} · {project.contribution}
        </p>
        <p className="mt-3 text-step-xs text-fg-muted">{project.summary}</p>

        <StackDisclosure stack={project.stack} />

        <div className="mt-auto">
          <DemoLinks project={project} />
        </div>
      </div>
    </Reveal>
  );
}
