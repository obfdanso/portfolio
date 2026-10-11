import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroGreeting } from "@/components/hero-greeting";
import { SITE } from "@/lib/site";

describe("HeroGreeting", () => {
  it("says welcome in English, French and Twi, hidden from assistive technology", () => {
    const { container } = render(<HeroGreeting />);
    const words = Array.from(container.querySelectorAll(".greeting__word"));
    expect(words.map((w) => w.textContent)).toEqual(["Welcome", "Bonne arrivée", "Akwaaba"]);
    for (const word of words) expect(word.getAttribute("aria-hidden")).toBe("true");
  });

  it("settles on the name, which assistive technology reads", () => {
    const { container } = render(<HeroGreeting />);
    const name = container.querySelector<HTMLElement>(".greeting__name");
    expect(name?.textContent).toBe(SITE.name);
    expect(name?.hasAttribute("aria-hidden")).toBe(false);
    expect(name?.style.getPropertyValue("--greet-index")).toBe("3");
  });
});
