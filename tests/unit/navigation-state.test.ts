import { describe, expect, it } from "vitest";
import { isInAppNavigation } from "@/components/navigation-state";

type ClickInit = {
  href?: string;
  target?: string;
  button?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  defaultPrevented?: boolean;
  download?: boolean;
};

function click(init: ClickInit) {
  const a = document.createElement("a");
  if (init.href !== undefined) a.setAttribute("href", init.href);
  if (init.target) a.setAttribute("target", init.target);
  if (init.download) a.setAttribute("download", "");
  const span = document.createElement("span");
  a.appendChild(span);
  document.body.appendChild(a);

  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: init.button ?? 0,
    ctrlKey: init.ctrlKey,
    metaKey: init.metaKey,
    shiftKey: init.shiftKey,
    altKey: init.altKey,
  });
  if (init.defaultPrevented) event.preventDefault();
  // The click usually lands on a child of the link, not the link itself.
  Object.defineProperty(event, "target", { value: span });
  return event;
}

describe("isInAppNavigation", () => {
  it("is true for a plain click on an internal link", () => {
    expect(isInAppNavigation(click({ href: "/projects" }))).toBe(true);
  });

  it("is false for links to other sites", () => {
    expect(isInAppNavigation(click({ href: "https://github.com/obfdanso" }))).toBe(false);
  });

  it("is false for in-page anchors such as the skip link", () => {
    expect(isInAppNavigation(click({ href: "#main" }))).toBe(false);
  });

  it("is false for mailto links", () => {
    expect(isInAppNavigation(click({ href: "mailto:ddanso3000@gmail.com" }))).toBe(false);
  });

  it("is false when the link opens elsewhere", () => {
    expect(isInAppNavigation(click({ href: "/projects", target: "_blank" }))).toBe(false);
    expect(isInAppNavigation(click({ href: "/Danso_Daniel.pdf", download: true }))).toBe(false);
  });

  it("is false for modified or non-primary clicks, which open new tabs", () => {
    expect(isInAppNavigation(click({ href: "/projects", ctrlKey: true }))).toBe(false);
    expect(isInAppNavigation(click({ href: "/projects", metaKey: true }))).toBe(false);
    expect(isInAppNavigation(click({ href: "/projects", shiftKey: true }))).toBe(false);
    expect(isInAppNavigation(click({ href: "/projects", button: 1 }))).toBe(false);
  });

  it("is false when something already cancelled the click", () => {
    expect(isInAppNavigation(click({ href: "/projects", defaultPrevented: true }))).toBe(false);
  });

  it("is false for clicks that are not on a link at all", () => {
    const event = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(event, "target", { value: document.body });
    expect(isInAppNavigation(event)).toBe(false);
  });
});
