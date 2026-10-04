import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";

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
      className="card-lift relative flex h-full flex-col rounded-2xl border border-fg-muted/15 bg-surface/40 p-6"
    >
      <div className="card-media mb-6 rounded-lg">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={1200}
          height={630}
          className="aspect-[1200/630] w-full object-cover"
          sizes="(max-width: 768px) 100vw, 480px"
        />
      </div>

      <Heading className="text-step-1">
        {/* The stretched link makes the whole card clickable; the demo links
            above sit on z-10 so they stay individually reachable. */}
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
          {project.title}
        </Link>
      </Heading>

      <p className="mt-2 text-step-xs text-fg-muted">{project.summary}</p>

      <p className="mt-3 text-step-xs text-fg-muted">
        {project.timeframe} · {project.contribution}
      </p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-fg-muted/20 px-3 py-1 text-step-xs text-fg-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <DemoLinks project={project} />
      </div>
    </Reveal>
  );
}
