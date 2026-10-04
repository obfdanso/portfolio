import type { Metadata } from "next";
import { getFrontendProjects } from "@/lib/content";
import { ProjectList } from "@/components/project-list";
import { OtherSkillsCta } from "@/components/other-skills-cta";

export const metadata: Metadata = {
  title: "Projects",
  description: "Front-end projects, each with a written case study.",
};

export default function ProjectsPage() {
  return (
    <div className="container-page py-24">
      <h1 className="enter enter--solid text-step-4">Projects</h1>
      <p className="mt-4 max-w-2xl text-fg-muted">
        Each project has a written case study covering the decisions I made and what I would change.
      </p>
      <div className="mt-12">
        <ProjectList projects={getFrontendProjects()} />
      </div>
      <OtherSkillsCta className="mt-20" />
    </div>
  );
}
