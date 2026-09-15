import { describe, expect, it } from "vitest";
import { projectFrontmatterSchema } from "@/lib/schemas";

const valid = {
  title: "MediSpace",
  slug: "medispace",
  summary: "A student-friendly web app for managing on-campus medication.",
  role: "Frontend Developer",
  contribution: "Frontend only",
  timeframe: "2025",
  stack: ["TypeScript", "React"],
  featured: true,
  order: 1,
  accentHue: 0,
  demo: {
    kind: "live",
    url: "https://medispace.vercel.app",
    repoUrl: "https://github.com/obfdanso/MediSpace",
  },
  cover: { src: "/projects/medispace.png", alt: "MediSpace dashboard" },
};

describe("projectFrontmatterSchema", () => {
  it("accepts a well-formed project", () => {
    expect(projectFrontmatterSchema.parse(valid)).toMatchObject({ slug: "medispace" });
  });

  it("rejects a live demo without a url", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: { kind: "live", repoUrl: "https://github.com/obfdanso/MediSpace" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a repo-only demo that smuggles in a url", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: { kind: "repo-only", repoUrl: "https://github.com/obfdanso/POS", url: "https://x.com" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a recording demo", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: {
        kind: "recording",
        posterSrc: "/projects/bitby-poster.png",
        videoSrc: "/projects/bitby.mp4",
        repoUrl: "https://github.com/obfdanso/bitby",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown demo kind", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: { kind: "coming-soon", repoUrl: "https://github.com/obfdanso/POS" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an accentHue outside 0-360", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, accentHue: 400 }).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse({ ...valid, accentHue: -1 }).success).toBe(false);
  });

  it("rejects a non-url repo", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: { kind: "repo-only", repoUrl: "not-a-url" },
    });
    expect(result.success).toBe(false);
  });

  it("requires non-empty alt text on the cover", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      cover: { src: "/projects/medispace.png", alt: "" },
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one stack entry", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, stack: [] }).success).toBe(false);
  });

  it("rejects a slug that is not lowercase kebab-case", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, slug: "MediSpace" }).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse({ ...valid, slug: "medi space" }).success).toBe(false);
  });

  it("rejects a non-integer order", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, order: 1.5 }).success).toBe(false);
  });
});
