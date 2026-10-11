import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { HeroHeadline } from "@/components/hero-headline";
import { HeroGreeting } from "@/components/hero-greeting";
import { ScrollLitText } from "@/components/scroll-lit-text";
import { TechMarquee } from "@/components/tech-marquee";
import { ProjectCarousel } from "@/components/project-carousel";
import { Reveal } from "@/components/ui/reveal";
import { SectionNumber } from "@/components/ui/section-number";
import { getFrontendProjects } from "@/lib/content";
import { OtherSkillsCta } from "@/components/other-skills-cta";

/** Staggered entrance delay, in the order the eye reads down the hero. */
const stagger = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

// Only the canonical: title and description come from the root layout.
// A canonical in the layout would be inherited by every route.
export const metadata: Metadata = { alternates: { canonical: "/" } };

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
        <MeshGradient className="mesh--scroll-linked mesh--follow" />
        <HeroGreeting>
          <HeroHeadline
            text="Front-end developer building fast, accessible interfaces."
            className="enter enter--solid max-w-[15ch] text-step-5"
            style={stagger(0)}
          />

          <p className="enter mt-6 max-w-xl text-step-1 text-fg-muted" style={stagger(80)}>
            I build interfaces in React and TypeScript.
          </p>

          <div className="enter mt-10 flex flex-wrap gap-4" style={stagger(160)}>
            <Link
              href="/projects"
              className="btn btn-solid magnetic rounded-full bg-fg px-6 py-3 text-step-xs font-medium text-ground"
            >
              See the work
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline magnetic rounded-full border border-fg-muted/30 px-6 py-3 text-step-xs"
            >
              Get in touch
            </Link>
          </div>
        </HeroGreeting>
      </section>

      <TechMarquee />

      <section className="py-24">
        <h2 className="container-page flex items-baseline gap-4 text-step-3">
          <SectionNumber value={1} /> <span className="fill-on-scroll">Selected work</span>
        </h2>

        {/* Across the whole page, like the hero above it, not held to the
            text column. */}
        <div className="mt-12">
          <ProjectCarousel projects={projects} />
        </div>

        <div className="container-page">
          <OtherSkillsCta className="mt-16" />
        </div>
      </section>

      <Reveal as="section" className="container-page py-8">
        <h2 className="flex items-baseline gap-4 text-step-3">
          <SectionNumber value={2} /> <span className="fill-on-scroll">About</span>
        </h2>
        <ScrollLitText
          className="mt-8 max-w-2xl text-step-1 text-fg-muted"
          text="I am a computer science student at KNUST. I care about interfaces that stay fast and usable, which mostly means typed data, honest loading states, and keyboard support."
        />
        <Link href="/about" className="link-grow mt-6 inline-block text-accent">
          More about me
        </Link>
      </Reveal>
    </>
  );
}
