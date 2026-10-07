import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetworkDiagram } from "@/components/network-diagram";

describe("NetworkDiagram", () => {
  it("is decoration, hidden from assistive technology", () => {
    const { container } = render(<NetworkDiagram />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws two clients and a server joined by two links, with packets on them", () => {
    const { container } = render(<NetworkDiagram />);
    expect(container.querySelectorAll(".network-diagram__node")).toHaveLength(3);
    expect(container.querySelectorAll(".network-diagram__link")).toHaveLength(2);
    expect(container.querySelectorAll(".network-diagram__packet").length).toBeGreaterThanOrEqual(2);
  });
});
