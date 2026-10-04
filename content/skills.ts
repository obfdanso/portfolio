/**
 * The /skills page renders entirely from this object, the same way /resume
 * renders from content/resume.ts. Updating a skill is an edit here, with no
 * layout work.
 *
 * Project evidence names a slug only. lib/skills.ts looks up the title and URL
 * at build time, so a renamed project cannot leave a stale title behind, and a
 * slug with no case study fails the build.
 */

// Danso's own words for how well he knows each area. Being plain about a
// "working knowledge" makes the rest more credible.
export const SKILL_LEVELS = ["Working knowledge", "Good knowledge", "Proficient"] as const;
type SkillLevel = (typeof SKILL_LEVELS)[number];

type Evidence =
  | { kind: "project"; slug: string; note: string }
  | { kind: "link"; href: string; label: string; note: string };

export type SkillSection = {
  /** Also the section's anchor, as in /skills#networking. */
  id: string;
  title: string;
  level: SkillLevel;
  statement: string;
  tags: string[];
  evidence: Evidence[];
};

export const skills: SkillSection[] = [
  {
    id: "backend",
    title: "Backend",
    level: "Working knowledge",
    statement:
      "I can build a working backend in Node.js and Express and connect it to a database. I built the POS backend and database myself, along with its interfaces.",
    tags: ["Node.js", "Express"],
    evidence: [{ kind: "project", slug: "pos", note: "Backend built solo in Node.js and Express" }],
  },
  {
    id: "databases",
    title: "Databases and SQL",
    level: "Working knowledge",
    statement:
      "I can query databases with SQL, and I've worked with PostgreSQL and MySQL. POS keeps its data in a PostgreSQL database I set up.",
    tags: ["SQL", "PostgreSQL", "MySQL"],
    evidence: [{ kind: "project", slug: "pos", note: "PostgreSQL database, set up by me" }],
  },
  {
    id: "networking",
    title: "Networking",
    level: "Good knowledge",
    statement:
      "I know the TCP/IP and OSI models, IP addressing and subnetting, and how routers and switches forward traffic. I used some of it in intercli, a client-server chat over TCP that encrypts every message.",
    tags: ["TCP/IP", "OSI model", "IP addressing", "Subnetting", "Routing", "Switching"],
    evidence: [
      {
        kind: "project",
        slug: "intercli",
        note: "Client-server chat over TCP, every connection encrypted",
      },
    ],
  },
  {
    id: "ai-tools",
    title: "AI tools",
    level: "Proficient",
    statement:
      "I use AI coding tools to work faster, and I check what they produce the way I'd check a teammate's code. I built this site with Claude Code. I made the design calls and sent back the changes I didn't like.",
    tags: ["Claude Code", "Cursor", "GitHub Copilot", "Gemini"],
    evidence: [
      { kind: "project", slug: "intercli", note: "Built with an AI assistant throughout" },
      { kind: "project", slug: "smartsocket", note: "Polished with an AI assistant" },
    ],
  },
];
