import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Reveal } from "@/components/ui/reveal";

describe("Reveal", () => {
  it("renders a div by default", () => {
    const { container } = render(<Reveal>content</Reveal>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("renders the requested element", () => {
    const { container } = render(<Reveal as="article">content</Reveal>);
    expect(container.firstElementChild?.tagName).toBe("ARTICLE");
  });

  it("exposes the stagger delay as a custom property", () => {
    const { container } = render(<Reveal delay={120}>content</Reveal>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--reveal-delay")).toBe("120ms");
  });

  it("defaults the delay to zero", () => {
    const { container } = render(<Reveal>content</Reveal>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--reveal-delay")).toBe("0ms");
  });

  it("keeps the reveal class alongside any passed class", () => {
    const { container } = render(<Reveal className="card-lift">content</Reveal>);
    const className = container.firstElementChild?.className ?? "";
    expect(className).toContain("reveal");
    expect(className).toContain("card-lift");
  });

  it("renders its children", () => {
    const { getByText } = render(<Reveal>visible content</Reveal>);
    expect(getByText("visible content")).toBeDefined();
  });
});
