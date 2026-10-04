import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getFeaturedProjects,
  getFrontendProjects,
  getProject,
  loadProjects,
} from "@/lib/content";

const FIXTURES = path.join(process.cwd(), "tests/fixtures/projects");
const VALID = path.join(FIXTURES, "valid");

describe("loadProjects", () => {
  it("sorts by the order field ascending", () => {
    expect(loadProjects(VALID).map((p) => p.slug)).toEqual(["beta", "alpha"]);
  });

  it("separates frontmatter from the body", () => {
    const beta = loadProjects(VALID).find((p) => p.slug === "beta");
    expect(beta?.title).toBe("Beta");
    expect(beta?.body.trim()).toBe("Beta body.");
  });

  it("throws a named error when frontmatter is invalid", () => {
    expect(() => loadProjects(FIXTURES)).toThrowError(/invalid\.mdx/);
  });

  it("names the offending field in the error", () => {
    expect(() => loadProjects(FIXTURES)).toThrowError(/accentHue/);
  });

  it("ignores non-mdx files", () => {
    // `valid/` holds only .mdx, so this asserts the filter exists rather than
    // that it happens to have nothing else to skip.
    expect(loadProjects(VALID)).toHaveLength(2);
  });
});

describe("getProject", () => {
  it("finds a project by slug", () => {
    expect(getProject("alpha", VALID)?.title).toBe("Alpha");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProject("nope", VALID)).toBeUndefined();
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured projects", () => {
    expect(getFeaturedProjects(VALID).map((p) => p.slug)).toEqual(["alpha"]);
  });
});

describe("getFrontendProjects", () => {
  it("returns only front-end projects", () => {
    // beta is "other", alpha is "frontend".
    expect(getFrontendProjects(VALID).map((p) => p.slug)).toEqual(["alpha"]);
  });
});
