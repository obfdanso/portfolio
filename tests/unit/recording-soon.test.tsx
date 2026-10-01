import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecordingSoon } from "@/components/recording-soon";

const REPO = "https://github.com/obfdanso/bitby";

describe("RecordingSoon", () => {
  it("says plainly that the recording is coming", () => {
    render(<RecordingSoon hue={48} repoUrl={REPO} />);
    expect(screen.getByText(/screen recording coming soon/i)).toBeDefined();
  });

  it("offers the source in the meantime", () => {
    render(<RecordingSoon hue={48} repoUrl={REPO} />);
    expect(screen.getByRole("link", { name: /view the source/i }).getAttribute("href")).toBe(REPO);
  });

  it("is not a player and offers nothing to press play on", () => {
    const { container } = render(<RecordingSoon hue={48} repoUrl={REPO} />);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("hides the animated decoration from assistive technology", () => {
    const { container } = render(<RecordingSoon hue={48} repoUrl={REPO} />);
    const decoration = container.querySelector(".recording-soon__icon");
    expect(decoration?.getAttribute("aria-hidden")).toBe("true");
  });

  it("tints its gradient with the project hue", () => {
    const { container } = render(<RecordingSoon hue={48} repoUrl={REPO} />);
    const mesh = container.querySelector(".mesh") as HTMLElement;
    expect(mesh.style.getPropertyValue("--mesh-hue")).toBe("48deg");
  });
});
