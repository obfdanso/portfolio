import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/content";

const base: Project = {
  title: "POS",
  slug: "pos",
  summary: "A point-of-sale web app.",
  role: "Front-end Developer",
  contribution: "Front end only",
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

describe("ProjectCard", () => {
  it("never renders a live demo link for a repo-only project", () => {
    render(<ProjectCard project={base} />);
    expect(screen.queryByRole("link", { name: /live site/i })).toBeNull();
    expect(screen.getByRole("link", { name: /source/i })).toBeDefined();
  });

  it("renders a live link when the project has one", () => {
    const live: Project = {
      ...base,
      demo: {
        kind: "live",
        url: "https://medi-space-xzz7.vercel.app",
        repoUrl: "https://github.com/obfdanso/MediSpace",
      },
    };
    render(<ProjectCard project={live} />);
    const link = screen.getByRole("link", { name: /live site/i });
    expect(link.getAttribute("href")).toBe("https://medi-space-xzz7.vercel.app");
  });

  it("offers a demo video when the showcase is a video", () => {
    const withVideo: Project = {
      ...base,
      showcase: {
        kind: "video",
        src: "/projects/pos-demo.mp4",
        poster: "/projects/pos-poster.png",
        alt: "POS walkthrough",
      },
    };
    render(<ProjectCard project={withVideo} />);
    expect(screen.getByRole("link", { name: /demo video/i }).getAttribute("href")).toBe(
      "/projects/pos-demo.mp4",
    );
    expect(screen.queryByRole("link", { name: /live site/i })).toBeNull();
  });

  it("offers no demo video for an image showcase", () => {
    render(
      <ProjectCard
        project={{
          ...base,
          showcase: { kind: "image", src: "/projects/pos-showcase.png", alt: "POS" },
        }}
      />,
    );
    expect(screen.queryByRole("link", { name: /demo video/i })).toBeNull();
  });

  it("states the contribution scope", () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByText(/front end only/i)).toBeDefined();
  });

  it("always links to the case study", () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByRole("link", { name: "POS" }).getAttribute("href")).toBe("/projects/pos");
  });

  it("gives the cover image its alt text", () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByAltText("POS cashier screen")).toBeDefined();
  });

  it("renders an h3 by default, for use under a section heading", () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByRole("heading", { level: 3, name: "POS" })).toBeDefined();
  });

  it("renders an h2 when it sits directly under the page heading", () => {
    render(<ProjectCard project={base} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "POS" })).toBeDefined();
  });

  it("lists every stack tag", () => {
    render(<ProjectCard project={{ ...base, stack: ["JavaScript", "React"] }} />);
    expect(screen.getByText("JavaScript")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
  });
});
