import Link from "next/link";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { Reveal } from "@/components/ui/reveal";
import { SectionNumber } from "@/components/ui/section-number";
import { loadProjects } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const projects = loadProjects();

  return (
    <>
      <section className="mesh-host relative flex min-h-[calc(100dvh-1.5rem)] items-center overflow-hidden md:rounded-2xl">
        <MeshGradient className="mesh--scroll-linked" />
        <div className="container-page w-full py-24">
          <p className="font-mono text-step-xs text-fg-muted">{SITE.name}</p>
          <h1 className="hero-reveal mt-6 max-w-[15ch] text-step-5">
            Frontend engineer building fast, accessible interfaces.
          </h1>
          <p className="mt-6 max-w-xl text-step-1 text-fg-muted">
            I build web interfaces in TypeScript and React. Below is the work, with a written case
            study for each project.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="rounded-full bg-fg px-6 py-3 text-step-xs font-medium text-ground"
            >
              See the work
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-fg-muted/30 px-6 py-3 text-step-xs"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-24">
        <h2 className="flex items-baseline gap-4 text-step-3">
          <SectionNumber value={1} /> Selected work
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal
              as="li"
              key={project.slug}
              delay={index * 40}
              className="card-lift rounded-2xl border border-fg-muted/15 bg-surface/40 p-6"
            >
              <h3 className="text-step-1">
                <Link href={`/projects/${project.slug}`}>{project.title}</Link>
              </h3>
              <p className="mt-2 text-step-xs text-fg-muted">{project.summary}</p>
              <p className="mt-3 text-step-xs text-fg-muted">
                {project.timeframe} · {project.contribution}
              </p>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
