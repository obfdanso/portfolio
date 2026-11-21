import type { Metadata } from "next";
import { SkillSection } from "@/components/skill-section";
import { skills } from "@/content/skills";
import { loadProjects } from "@/lib/content";
import { resolveEvidence } from "@/lib/skills";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Backend, databases and SQL, networking and AI tools, linked to the projects that use them.",
  alternates: { canonical: "/skills" },
};

// Reached only from the "See my other skills" button and the About page, never
// from the sidebar: these skills sit one click away from the front-end work,
// not beside it.
export default function SkillsPage() {
  // All projects, not just front-end ones: intercli is evidence here.
  const projects = loadProjects();

  return (
    <>
      <PageHeader>
        <h1 className="enter enter--solid text-step-4">Beyond the front end</h1>
        <p className="mt-5 max-w-2xl text-fg-muted">
          {
            "The projects on this site lean toward front-end work. These are the skills behind the rest: backend, databases, networking, and the AI tools I learn with. Where a project uses one, it is linked."
          }
        </p>
      </PageHeader>

      {/* The line down the left draws itself as the sections scroll by. */}
      <div className="container-page py-16">
        <div className="scroll-line space-y-6">
          {skills.map((section) => (
            <SkillSection
              key={section.id}
              section={section}
              evidence={resolveEvidence(section, projects)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
