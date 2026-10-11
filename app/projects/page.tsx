import type { Metadata } from "next";
import { getFrontendProjects } from "@/lib/content";
import { ProjectList } from "@/components/project-list";
import { OtherSkillsCta } from "@/components/other-skills-cta";
import { MeshGradient } from "@/components/ui/mesh-gradient";

export const metadata: Metadata = {
  title: "Projects",
  description: "Front-end projects, each with a written case study.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      {/* As tall as the Resume header, which has more in it: the two pages
          open the same way. */}
      <section className="mesh-host relative flex min-h-[30rem] items-center overflow-hidden py-24 md:min-h-[27rem] md:rounded-2xl">
        <MeshGradient />
        <div className="container-page w-full">
          <h1 className="enter enter--solid text-step-4">Projects</h1>
          <p className="mt-4 max-w-2xl text-fg-muted">
            Each project has a written case study covering the decisions I made.
          </p>
        </div>
      </section>
      <div className="container-page py-16">
        <ProjectList projects={getFrontendProjects()} />
        <OtherSkillsCta className="mt-20" />
      </div>
    </>
  );
}
