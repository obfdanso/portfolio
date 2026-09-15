import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";

function DemoLinks({ demo }: { demo: Project["demo"] }) {
  // The discriminated union is what guarantees there is no dead "Live site"
  // button: a repo-only project has no url field to render.
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-step-xs">
      {demo.kind === "live" && (
        <a href={demo.url} className="relative z-10 text-accent underline underline-offset-4">
          Live site
        </a>
      )}
      {demo.kind === "recording" && (
        <a href={demo.videoSrc} className="relative z-10 text-accent underline underline-offset-4">
          Demo video
        </a>
      )}
      <a
        href={demo.repoUrl}
        className="relative z-10 text-fg-muted underline underline-offset-4 hover:text-fg"
      >
        Source
      </a>
    </div>
  );
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <Reveal
      as="article"
      delay={index * 40}
      className="card-lift relative flex h-full flex-col rounded-2xl border border-fg-muted/15 bg-surface/40 p-6"
    >
      <Image
        src={project.cover.src}
        alt={project.cover.alt}
        width={1200}
        height={630}
        className="mb-6 aspect-[1200/630] w-full rounded-lg object-cover"
        sizes="(max-width: 768px) 100vw, 480px"
      />

      <h3 className="text-step-1">
        {/* The stretched link makes the whole card clickable; the demo links
            above sit on z-10 so they stay individually reachable. */}
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
          {project.title}
        </Link>
      </h3>

      <p className="mt-2 text-step-xs text-fg-muted">{project.summary}</p>

      <p className="mt-3 font-mono text-step-xs text-fg-muted">
        {project.timeframe} · {project.contribution}
      </p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-fg-muted/20 px-2.5 py-0.5 font-mono text-step-xs"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <DemoLinks demo={project.demo} />
      </div>
    </Reveal>
  );
}
