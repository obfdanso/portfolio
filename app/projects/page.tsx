import type { Metadata } from "next";
import { loadProjects } from "@/lib/content";
import { ProjectList } from "@/components/project-list";

export const metadata: Metadata = {
  title: "Projects",
  description: "Frontend projects, each with a written case study.",
};

export default function ProjectsPage() {
  return (
    <div className="container-page py-24">
      <h1 className="enter enter--solid text-step-4">Projects</h1>
      <p className="mt-4 max-w-2xl text-fg-muted">
        Five projects, each with a written case study covering the decisions I made and what I would
        change.
      </p>
      <div className="mt-12">
        <ProjectList projects={loadProjects()} />
      </div>
    </div>
  );
}
