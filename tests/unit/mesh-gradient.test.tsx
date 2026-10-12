import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MeshGradient } from "@/components/ui/mesh-gradient";

describe("MeshGradient", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<MeshGradient />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders exactly three blobs", () => {
    const { container } = render(<MeshGradient />);
    expect(container.querySelectorAll(".mesh__blob")).toHaveLength(3);
  });

  it("passes through an extra class name", () => {
    const { container } = render(<MeshGradient className="mesh--scroll-linked" />);
    expect(container.firstElementChild?.className).toContain("mesh--scroll-linked");
  });
});
