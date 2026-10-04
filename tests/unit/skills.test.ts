import { describe, expect, it } from "vitest";
import { SKILL_LEVELS, skills, type SkillSection } from "@/content/skills";
import { loadProjects } from "@/lib/content";
import { resolveEvidence } from "@/lib/skills";

const PROJECTS = [
  { slug: "pos", title: "POS" },
  { slug: "intercli", title: "intercli" },
];

const section = (evidence: SkillSection["evidence"]): SkillSection => ({
  id: "backend",
  title: "Backend",
  level: "Working knowledge",
  statement: "Statement.",
  tags: ["Node.js"],
  evidence,
});

describe("resolveEvidence", () => {
  it("takes a project's title and URL from the content, not the skills file", () => {
    const [card] = resolveEvidence(
      section([{ kind: "project", slug: "pos", note: "Backend built solo" }]),
      PROJECTS,
    );
    expect(card).toEqual({
      href: "/projects/pos",
      title: "POS",
      note: "Backend built solo",
      external: false,
    });
  });

  it("passes an external link through and marks it external", () => {
    const [card] = resolveEvidence(
      section([
        {
          kind: "link",
          href: "https://github.com/obfdanso/portfolio",
          label: "This site",
          note: "Built with Claude Code",
        },
      ]),
      PROJECTS,
    );
    expect(card).toEqual({
      href: "https://github.com/obfdanso/portfolio",
      title: "This site",
      note: "Built with Claude Code",
      external: true,
    });
  });

  it("fails loudly on an unknown slug, naming the slug and the section", () => {
    expect(() =>
      resolveEvidence(section([{ kind: "project", slug: "nope", note: "x" }]), PROJECTS),
    ).toThrowError(/"nope".*"backend"/);
  });
});

describe("skills content", () => {
  it("lists the four sections in order", () => {
    expect(skills.map((s) => s.id)).toEqual(["backend", "databases", "networking", "ai-tools"]);
  });

  it("gives every section a valid level and at least one piece of evidence", () => {
    for (const s of skills) {
      expect(SKILL_LEVELS, s.id).toContain(s.level);
      expect(s.evidence.length, s.id).toBeGreaterThan(0);
      expect(s.tags.length, s.id).toBeGreaterThan(0);
    }
  });

  it("points every project evidence slug at a real case study", () => {
    const projects = loadProjects();
    for (const s of skills) {
      expect(() => resolveEvidence(s, projects), s.id).not.toThrow();
    }
  });

  it("uses Danso's own words for each level", () => {
    expect(Object.fromEntries(skills.map((s) => [s.id, s.level]))).toEqual({
      backend: "Working knowledge",
      databases: "Working knowledge",
      networking: "Good knowledge",
      "ai-tools": "Proficient",
    });
  });
});
