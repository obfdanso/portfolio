import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The "already played" flag lives in module scope, so each test loads a
// fresh copy of the module: a fresh page load.
async function load() {
  vi.resetModules();
  return (await import("@/components/hero-greeting")).HeroGreeting;
}

describe("HeroGreeting", () => {
  it("says Welcome, hidden from assistive technology", async () => {
    const HeroGreeting = await load();
    const { container } = render(
      <HeroGreeting>
        <h1>Hero</h1>
      </HeroGreeting>,
    );
    const words = Array.from(container.querySelectorAll(".greeting__word"));
    expect(words.map((w) => w.textContent)).toEqual(["Welcome"]);
    expect(container.querySelector(".greeting-layer")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".greeting-stage")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Hero" })).toBeTruthy();
  });

  it("plays once per page load: coming back goes straight to the hero", async () => {
    const HeroGreeting = await load();
    const first = render(
      <HeroGreeting>
        <h1>Hero</h1>
      </HeroGreeting>,
    );
    first.unmount();

    const { container } = render(
      <HeroGreeting>
        <h1>Hero</h1>
      </HeroGreeting>,
    );
    expect(container.querySelector(".greeting-layer")).toBeNull();
    expect(container.querySelector(".greeting-stage")).toBeNull();
    expect(screen.getByRole("heading", { name: "Hero" })).toBeTruthy();
  });

  it("plays again after a refresh", async () => {
    const HeroGreeting = await load();
    const { container } = render(
      <HeroGreeting>
        <h1>Hero</h1>
      </HeroGreeting>,
    );
    expect(container.querySelector(".greeting-layer")).not.toBeNull();
  });
});
