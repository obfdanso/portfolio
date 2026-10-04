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
  category: "frontend",
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

  it("rejects the removed recording demo kind", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: {
        kind: "recording",
        posterSrc: "/projects/bitby-poster.png",
        videoSrc: "/projects/bitby.mp4",
        repoUrl: "https://github.com/obfdanso/bitby",
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a project with no showcase", () => {
    expect(projectFrontmatterSchema.parse(valid).showcase).toBeUndefined();
  });

  it("accepts an image showcase", () => {
    const showcase = { kind: "image", src: "/projects/pos-showcase.png", alt: "POS checkout" };
    expect(projectFrontmatterSchema.parse({ ...valid, showcase }).showcase).toEqual(showcase);
  });

  it("accepts a video showcase with a poster", () => {
    const showcase = {
      kind: "video",
      src: "/projects/bitby-demo.mp4",
      poster: "/projects/bitby-poster.png",
      alt: "bitby walkthrough",
    };
    expect(projectFrontmatterSchema.parse({ ...valid, showcase }).showcase).toEqual(showcase);
  });

  it("rejects a video showcase without a poster", () => {
    const showcase = { kind: "video", src: "/projects/bitby-demo.mp4", alt: "bitby" };
    expect(projectFrontmatterSchema.safeParse({ ...valid, showcase }).success).toBe(false);
  });

  it("rejects a showcase with an empty src or an unknown kind", () => {
    expect(
      projectFrontmatterSchema.safeParse({
        ...valid,
        showcase: { kind: "image", src: "", alt: "x" },
      }).success,
    ).toBe(false);
    expect(
      projectFrontmatterSchema.safeParse({
        ...valid,
        showcase: { kind: "gif", src: "/x.gif", alt: "x" },
      }).success,
    ).toBe(false);
  });

  it("accepts a recording that is still on its way", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: { kind: "recording-pending", repoUrl: "https://github.com/obfdanso/bitby" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a pending recording that already names a video file", () => {
    // Pending means there is nothing to play. A videoSrc here would let a
    // template render a player that cannot play.
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      demo: {
        kind: "recording-pending",
        repoUrl: "https://github.com/obfdanso/bitby",
        videoSrc: "/projects/bitby-demo.mp4",
      },
    });
    expect(result.success).toBe(false);
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
    expect(projectFrontmatterSchema.safeParse({ ...valid, slug: "medi space" }).success).toBe(
      false,
    );
  });

  it("rejects a non-integer order", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, order: 1.5 }).success).toBe(false);
  });

  it("requires a category, so a new project cannot land on the wrong page", () => {
    const withoutCategory: Partial<typeof valid> = { ...valid };
    delete withoutCategory.category;
    const result = projectFrontmatterSchema.safeParse(withoutCategory);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["category"]);
  });

  it("rejects an unknown category", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, category: "backend" }).success).toBe(
      false,
    );
  });

  it("accepts the other category", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, category: "other" }).success).toBe(true);
  });
});
