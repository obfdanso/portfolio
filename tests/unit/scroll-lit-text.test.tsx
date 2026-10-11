import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollLitText } from "@/components/scroll-lit-text";

const TEXT = "I care about interfaces that stay fast.";

describe("ScrollLitText", () => {
  it("reads as the whole paragraph", () => {
    render(<ScrollLitText text={TEXT} />);
    expect(screen.getByText((_, el) => el?.tagName === "P").textContent).toBe(TEXT);
  });

  it("gives each word its place through the paragraph", () => {
    const { container } = render(<ScrollLitText text={TEXT} />);
    const words = container.querySelectorAll<HTMLElement>(".scroll-lit__word");
    expect(words).toHaveLength(7);
    expect(words[0].style.getPropertyValue("--word-progress")).toBe("0.000");
    expect(words[6].style.getPropertyValue("--word-progress")).toBe("0.857");
    expect(words[6].textContent).toBe("fast.");
  });
});
