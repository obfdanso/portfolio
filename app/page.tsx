import type { CSSProperties } from "react";
import Link from "next/link";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionNumber } from "@/components/ui/section-number";
import { getFrontendProjects } from "@/lib/content";
import { OtherSkillsCta } from "@/components/other-skills-cta";
import { SITE } from "@/lib/site";

/** Staggered entrance delay, in the order the eye reads down the hero. */
const stagger = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

export default function HomePage() {
  // Front-end work only; the other skills are one click away, on /skills.
  // Featured first, then by order.
  const frontend = getFrontendProjects();
  const projects = [
    ...frontend.filter((project) => project.featured),
    ...frontend.filter((project) => !project.featured),
  ];

  return (
    <>
      <section className="mesh-host relative flex min-h-[calc(100dvh-1.5rem)] items-center overflow-hidden md:rounded-2xl">
        <MeshGradient className="mesh--scroll-linked" />
        <div className="container-page w-full py-24">
          <p className="enter font-mono text-step-xs text-fg-muted" style={stagger(0)}>
            {SITE.name}
          </p>

          <h1 className="enter enter--solid mt-6 max-w-[15ch] text-step-5" style={stagger(80)}>
            Front-end developer building fast, accessible interfaces.
          </h1>

          <p className="enter mt-6 max-w-xl text-step-1 text-fg-muted" style={stagger(160)}>
            I build interfaces in React and TypeScript.
          </p>

          <div className="enter mt-10 flex flex-wrap gap-4" style={stagger(240)}>
            <Link
              href="/projects"
              className="btn btn-solid rounded-full bg-fg px-6 py-3 text-step-xs font-medium text-ground"
            >
              See the work
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline rounded-full border border-fg-muted/30 px-6 py-3 text-step-xs"
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
            <li key={project.slug}>
              <ProjectCard project={project} index={index} />
            </li>
          ))}
        </ul>

        <OtherSkillsCta className="mt-16" />
      </section>

      <Reveal as="section" className="container-page py-8">
        <h2 className="flex items-baseline gap-4 text-step-3">
          <SectionNumber value={2} /> About
        </h2>
        <p className="mt-8 max-w-2xl text-step-1 text-fg-muted">
          I am a computer science student at KNUST. I care about interfaces that stay fast and
          usable, which mostly means typed data, honest loading states, and keyboard support.
        </p>
        <Link href="/about" className="link-grow mt-6 inline-block text-accent">
          More about me
        </Link>
      </Reveal>
    </>
  );
}
