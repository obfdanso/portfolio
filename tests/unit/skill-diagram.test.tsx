import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkillDiagram } from "@/components/skill-diagram";

const IDS = ["backend", "databases", "networking", "ai-tools"];

describe("SkillDiagram", () => {
  it.each(IDS)("draws a decorative diagram for %s", (id) => {
    const { container } = render(<SkillDiagram id={id} />);
    const svg = container.querySelector("svg.skill-diagram");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("data-diagram")).toBe(id);
    expect(container.querySelectorAll(".skill-diagram__node").length).toBeGreaterThanOrEqual(3);
  });

  it("moves something in every diagram", () => {
    for (const id of IDS) {
      const { container } = render(<SkillDiagram id={id} />);
      expect(
        container.querySelectorAll(".skill-diagram__packet, .skill-diagram__row").length,
        id,
      ).toBeGreaterThan(0);
    }
  });

  it("draws nothing for a section without one", () => {
    const { container } = render(<SkillDiagram id="unknown" />);
    expect(container.innerHTML).toBe("");
  });

  it("keeps the networking diagram: two clients, an encrypted server, two links", () => {
    const { container } = render(<SkillDiagram id="networking" />);
    expect(container.querySelectorAll(".skill-diagram__node")).toHaveLength(3);
    expect(container.querySelectorAll(".skill-diagram__link")).toHaveLength(2);
    expect(container.querySelector(".skill-diagram__lock")).not.toBeNull();
  });
});
