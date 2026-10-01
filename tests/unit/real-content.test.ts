import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadProjects } from "@/lib/content";

describe("real project content", () => {
  const projects = loadProjects();

  it("loads and validates all three launch projects", () => {
    expect(projects.map((p) => p.slug)).toEqual(["medispace", "pos", "bitby"]);
  });

  it("features MediSpace", () => {
    expect(projects.find((p) => p.slug === "medispace")?.featured).toBe(true);
  });

  it("states a frontend-only contribution on every project", () => {
    for (const project of projects) {
      expect(project.contribution.toLowerCase()).toContain("frontend");
    }
  });

  it("never describes Danso as full-stack", () => {
    for (const project of projects) {
      expect(`${project.role} ${project.contribution} ${project.body}`).not.toMatch(
        /full[- ]stack/i,
      );
    }
  });

  it("never offers a live link for bitby, which is not deployed", () => {
    // repo-only until the screen recording exists; then it becomes "recording".
    const kind = projects.find((p) => p.slug === "bitby")?.demo.kind;
    expect(["repo-only", "recording"]).toContain(kind);
  });

  it("points every cover and recording at a file that exists", () => {
    // A recording demo with a missing file ships a player that cannot play.
    // This is what makes flipping bitby to "recording" safe.
    const pub = (src: string) => path.join(process.cwd(), "public", src);
    for (const project of projects) {
      expect(fs.existsSync(pub(project.cover.src)), `${project.slug} cover`).toBe(true);
      if (project.demo.kind === "recording") {
        expect(fs.existsSync(pub(project.demo.videoSrc)), `${project.slug} video`).toBe(true);
        expect(fs.existsSync(pub(project.demo.posterSrc)), `${project.slug} poster`).toBe(true);
      }
    }
  });

  it("labels bitby as a reconstruction study with no affiliation", () => {
    const bitby = projects.find((p) => p.slug === "bitby");
    // Whitespace-tolerant: the requirement is that the disclaimer is present,
    // not that it happens to fit on one line.
    expect(bitby?.body).toMatch(/reconstruction\s+study/i);
    expect(bitby?.body).toMatch(/not\s+affiliated\s+with,\s+endorsed\s+by/i);
  });

  it("covers all five case-study sections in every project", () => {
    const headings = [
      "## Context",
      "## My role",
      "## Key decisions",
      "## The hard part",
      "## Outcome",
    ];
    for (const project of projects) {
      for (const heading of headings) {
        expect(project.body, `${project.slug} is missing "${heading}"`).toContain(heading);
      }
    }
  });

  it("points every repo link at Danso's GitHub account", () => {
    for (const project of projects) {
      expect(project.demo.repoUrl).toMatch(/^https:\/\/github\.com\/obfdanso\//);
    }
  });
});
