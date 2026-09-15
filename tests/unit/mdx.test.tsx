import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Mdx } from "@/components/mdx";

describe("Mdx", () => {
  it("renders headings and paragraphs from markdown", async () => {
    const ui = await Mdx({ source: "## Context\n\nSome prose." });
    render(ui);
    expect(screen.getByRole("heading", { level: 2, name: "Context" })).toBeDefined();
    expect(screen.getByText("Some prose.")).toBeDefined();
  });

  it("does not render JSX comments as visible text", async () => {
    // The safety net for the TO CONFIRM drafting notes in content/projects:
    // MDX treats {/* */} as a JSX comment, so the notes can never reach a page
    // even if one is left in by mistake.
    const ui = await Mdx({
      source: "## Context\n\n{/* TO CONFIRM: hidden */}\n\nVisible prose.",
    });
    render(ui);
    expect(screen.queryByText(/TO CONFIRM/)).toBeNull();
    expect(screen.getByText("Visible prose.")).toBeDefined();
  });

  it("renders links and emphasis", async () => {
    const ui = await Mdx({ source: "A [link](https://example.com) and **bold** text." });
    render(ui);
    expect(screen.getByRole("link", { name: "link" })).toBeDefined();
    expect(screen.getByText("bold")).toBeDefined();
  });

  it("supports GitHub-flavoured markdown tables", async () => {
    const ui = await Mdx({ source: "| A | B |\n| - | - |\n| 1 | 2 |" });
    render(ui);
    expect(screen.getByRole("table")).toBeDefined();
  });
});
