import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectShowcase } from "@/components/project-showcase";
import type { Project } from "@/lib/content";

const base: Project = {
  title: "POS",
  slug: "pos",
  summary: "A point-of-sale web app.",
  role: "Developer, solo build",
  contribution: "Solo build",
  timeframe: "2025",
  stack: ["JavaScript"],
  featured: false,
  order: 2,
  accentHue: 24,
  category: "frontend",
  demo: { kind: "repo-only", repoUrl: "https://github.com/obfdanso/POS" },
  cover: { src: "/projects/pos-cover.png", alt: "POS cashier screen" },
  body: "",
};

describe("ProjectShowcase", () => {
  it("shows the cover when the project has no showcase", () => {
    render(<ProjectShowcase project={base} />);
    expect(screen.getByAltText("POS cashier screen")).toBeDefined();
  });

  it("shows the showcase image when there is one", () => {
    render(
      <ProjectShowcase
        project={{
          ...base,
          showcase: { kind: "image", src: "/projects/pos-showcase.png", alt: "POS checkout" },
        }}
      />,
    );
    expect(screen.getByAltText("POS checkout")).toBeDefined();
    expect(screen.queryByAltText("POS cashier screen")).toBeNull();
  });

  it("shows a lazy video with its poster for a video showcase", () => {
    const { container } = render(
      <ProjectShowcase
        project={{
          ...base,
          showcase: {
            kind: "video",
            src: "/projects/pos-demo.mp4",
            poster: "/projects/pos-poster.png",
            alt: "POS walkthrough",
          },
        }}
      />,
    );
    const video = container.querySelector("video");
    expect(video?.getAttribute("preload")).toBe("none");
    expect(video?.getAttribute("poster")).toBe("/projects/pos-poster.png");
    expect(video?.getAttribute("aria-label")).toBe("POS walkthrough");
    expect(container.querySelector("source")?.getAttribute("src")).toBe("/projects/pos-demo.mp4");
  });

  it("gives a video the same fixed frame as the cover, so nothing jumps or towers", () => {
    // A portrait phone recording at full width would be ~2000px tall, and an
    // unsized preload="none" video shifts the layout when its poster loads.
    const { container } = render(
      <ProjectShowcase
        project={{
          ...base,
          showcase: {
            kind: "video",
            src: "/projects/pos-demo.mp4",
            poster: "/projects/pos-poster.png",
            alt: "POS walkthrough",
          },
        }}
      />,
    );
    const video = container.querySelector("video");
    expect(video?.getAttribute("width")).toBe("1200");
    expect(video?.getAttribute("height")).toBe("630");
    expect(video?.className).toContain("aspect-[1200/630]");
    expect(video?.className).toContain("object-contain");
  });
});
