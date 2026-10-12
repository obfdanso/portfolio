import { EvidenceCard } from "@/components/evidence-card";
import { SkillDiagram } from "@/components/skill-diagram";
import type { SkillSection as SkillSectionData } from "@/content/skills";
import type { ResolvedEvidence } from "@/lib/skills";

/**
 * One skill: heading, level, statement, topic tags, and the work that proves
 * it. The <section> carries the id so /skills#networking works; scroll-mt
 * keeps the heading clear of the mobile top bar.
 */
export function SkillSection({
  section,
  evidence,
}: {
  section: SkillSectionData;
  evidence: ResolvedEvidence[];
}) {
  const titleId = `${section.id}-title`;

  return (
    // An entry on the Skills page's scroll line, as on the resume: a soft
    // card that slides in, with a dot on the line level with its heading.
    <section
      id={section.id}
      aria-labelledby={titleId}
      className="scroll-entry scroll-mt-24 [--dot-top:calc(1.5rem_+_var(--text-step-3)_*_0.525_-_0.6rem)]"
    >
      <span aria-hidden="true" className="scroll-dot" />
      <div className="scroll-slide spotlight relative rounded-2xl border border-fg-muted/15 bg-surface/40 p-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id={titleId} className="text-step-3">
            {section.title}
          </h2>
          <p className="font-mono text-step-xs text-fg-muted">{section.level}</p>
        </div>

        <p className="mt-5 max-w-2xl text-step-1 text-fg-muted">{section.statement}</p>

        <SkillDiagram id={section.id} />

        <ul aria-label={`${section.title} topics`} className="mt-6 flex flex-wrap gap-2">
          {section.tags.map((tag) => (
            <li
              key={tag}
              className="pill pill-muted rounded-full border border-fg-muted/20 px-3 py-1 text-step-xs text-fg-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <ul aria-label={`${section.title} evidence`} className="mt-8 grid gap-4 sm:grid-cols-2">
          {evidence.map((item) => (
            <li key={`${item.href}-${item.note}`}>
              <EvidenceCard evidence={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
