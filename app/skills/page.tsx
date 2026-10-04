import type { Metadata } from "next";
import { SkillSection } from "@/components/skill-section";
import { skills } from "@/content/skills";
import { loadProjects } from "@/lib/content";
import { resolveEvidence } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Backend, databases and SQL, networking and AI tools, each shown next to work that uses it.",
};

// Reached only from the "See my other skills" button and the About page, never
// from the sidebar: these skills sit one click away from the front-end work,
// not beside it.
export default function SkillsPage() {
  // All projects, not just front-end ones: intercli is evidence here.
  const projects = loadProjects();

  return (
    <div className="container-page py-24">
      <h1 className="enter enter--solid text-step-4">Beyond the front end</h1>
      <p className="mt-5 max-w-2xl text-fg-muted">
        {
          "Front-end work is what I do best, and it's what the rest of this site covers. These are my other skills, each shown next to work that uses it."
        }
      </p>

      <div className="mt-16 space-y-20">
        {skills.map((section) => (
          <SkillSection
            key={section.id}
            section={section}
            evidence={resolveEvidence(section, projects)}
          />
        ))}
      </div>
    </div>
  );
}
