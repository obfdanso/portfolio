import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroHeadline } from "@/components/hero-headline";

const TEXT = "Systems and software developer, from interface to network.";

describe("HeroHeadline", () => {
  it("reads as the whole sentence", () => {
    render(<HeroHeadline text={TEXT} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(TEXT);
  });

  it("wraps each word with its place in the stagger", () => {
    const { container } = render(<HeroHeadline text={TEXT} />);
    const words = container.querySelectorAll(".hero-word__inner");
    expect(words).toHaveLength(8);
    expect((words[7] as HTMLElement).style.getPropertyValue("--word-index")).toBe("7");
    expect(words[7].textContent).toBe("network.");
  });
});
