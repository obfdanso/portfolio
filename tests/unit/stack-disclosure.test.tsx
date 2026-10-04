import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StackDisclosure } from "@/components/stack-disclosure";

describe("StackDisclosure", () => {
  it("is a closed disclosure labelled Stack", () => {
    const { container } = render(<StackDisclosure stack={["TypeScript", "React"]} />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.hasAttribute("open")).toBe(false);
    expect(container.querySelector("summary")?.textContent).toBe("Stack");
  });

  it("holds every tag, each with its place in the stagger", () => {
    render(<StackDisclosure stack={["TypeScript", "React", "Next.js"]} />);
    const third = screen.getByText("Next.js");
    expect(third.style.getPropertyValue("--tag-index")).toBe("2");
  });

  it("hides the chevron from assistive technology", () => {
    const { container } = render(<StackDisclosure stack={["TypeScript"]} />);
    expect(container.querySelector("summary svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
