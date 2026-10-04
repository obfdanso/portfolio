import { describe, expect, it } from "vitest";
import { resume } from "@/content/resume";
import { skills } from "@/content/skills";
import { loadProjects } from "@/lib/content";
import { SITE } from "@/lib/site";

describe("site copy", () => {
  it("presents Danso as a front-end developer", () => {
    expect(SITE.role).toBe("Front-end Developer");
  });

  it("spells front end one way everywhere", () => {
    // "front-end" before a noun, "front end" on its own; never "frontend".
    // `category: "frontend"` is a data value, not copy, so it is left out.
    const projects = loadProjects().map((project) => ({ ...project, category: undefined }));
    const text = JSON.stringify({ resume, skills, projects });
    expect(text).not.toMatch(/frontend/i);
  });

  it("keeps em dashes out of the resume and skills copy", () => {
    expect(JSON.stringify({ resume, skills })).not.toMatch(/—/);
  });

  it("groups the resume skills as Danso set them out", () => {
    expect(resume.skills.map((g) => g.group)).toEqual([
      "Front-end",
      "Mobile and desktop",
      "Other languages",
      "Backend",
      "Databases",
      "Networking",
      "AI tools",
    ]);
  });
});
