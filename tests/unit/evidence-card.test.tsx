import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvidenceCard } from "@/components/evidence-card";

describe("EvidenceCard", () => {
  it("links a project to its case study, naming the project and the proof", () => {
    render(
      <EvidenceCard
        evidence={{ href: "/projects/pos", title: "POS", note: "Backend built solo" }}
      />,
    );
    const link = screen.getByRole("link", { name: /POS.*Backend built solo/ });
    expect(link.getAttribute("href")).toBe("/projects/pos");
  });
});
