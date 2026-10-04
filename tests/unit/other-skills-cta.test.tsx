import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OtherSkillsCta } from "@/components/other-skills-cta";

describe("OtherSkillsCta", () => {
  it("leads to the skills page", () => {
    render(<OtherSkillsCta />);
    expect(screen.getByRole("link", { name: "See my other skills" }).getAttribute("href")).toBe(
      "/skills",
    );
  });

  it("says what is on the other side", () => {
    render(<OtherSkillsCta />);
    expect(screen.getByText(/backends, databases, networking and some AI\s+tools/)).toBeDefined();
  });
});
