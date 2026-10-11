import { describe, expect, it } from "vitest";
import { nameOf, parentOf, step } from "@/lib/nav-trail";

const home = { path: "/", title: "Home" };
const about = { path: "/about", title: "About" };
const resume = { path: "/resume", title: "Resume" };

describe("step", () => {
  it("puts a new page on top", () => {
    expect(step([home], about)).toEqual([home, about]);
  });

  it("takes the current page off when you go back to the one before", () => {
    expect(step([home, about, resume], about)).toEqual([home, about]);
  });

  it("changes nothing on a reload", () => {
    const trail = [home, about];
    expect(step(trail, about)).toBe(trail);
  });

  it("keeps only the last 50 pages", () => {
    const long = Array.from({ length: 50 }, (_, i) => ({ path: `/p${i}`, title: `P${i}` }));
    const next = step(long, about);
    expect(next).toHaveLength(50);
    expect(next.at(-1)).toEqual(about);
  });
});

describe("parentOf", () => {
  it("sends a case study up to Projects and anything else to Home", () => {
    expect(parentOf("/projects/medispace")).toEqual({ path: "/projects", title: "Projects" });
    expect(parentOf("/projects")).toEqual(home);
    expect(parentOf("/resume")).toEqual(home);
  });
});

describe("nameOf", () => {
  it("uses the sidebar names, and a case study's heading", () => {
    expect(nameOf("/", "Front-end developer building fast, accessible interfaces.")).toBe("Home");
    expect(nameOf("/skills", "Beyond the front end")).toBe("Skills");
    expect(nameOf("/projects/pos", " POS ")).toBe("POS");
  });
});
