import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroHeadline } from "@/components/hero-headline";

const TEXT = "Front-end developer building fast, accessible interfaces.";

describe("HeroHeadline", () => {
  it("reads as the whole sentence", () => {
    render(<HeroHeadline text={TEXT} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(TEXT);
  });

  it("wraps each word with its place in the stagger", () => {
    const { container } = render(<HeroHeadline text={TEXT} />);
    const words = container.querySelectorAll(".hero-word__inner");
    expect(words).toHaveLength(6);
    expect((words[5] as HTMLElement).style.getPropertyValue("--word-index")).toBe("5");
    expect(words[5].textContent).toBe("interfaces.");
  });
});
