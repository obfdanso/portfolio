import type { SkillSection } from "@/content/skills";
import type { Project } from "@/lib/content";

export type ResolvedEvidence = { href: string; title: string; note: string };

/**
 * Turns a section's evidence into links to case studies. An unknown slug
 * throws, and because /skills is statically generated, that fails the build.
 * Without the throw, the page would ship a card that links to a 404.
 */
export function resolveEvidence(
  section: SkillSection,
  projects: Pick<Project, "slug" | "title">[],
): ResolvedEvidence[] {
  return section.evidence.map((item) => {
    const project = projects.find((candidate) => candidate.slug === item.slug);
    if (!project) {
      throw new Error(
        `Unknown project "${item.slug}" in the evidence for skill section "${section.id}"`,
      );
    }
    return { href: `/projects/${project.slug}`, title: project.title, note: item.note };
  });
}
