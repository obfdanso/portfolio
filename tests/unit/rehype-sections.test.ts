import { describe, expect, it } from "vitest";
import { rehypeSections } from "@/lib/rehype-sections";

type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  value?: string;
};

const el = (tagName: string, text: string): Node => ({
  type: "element",
  tagName,
  properties: {},
  children: [{ type: "text", value: text }],
});

const run = (children: Node[]) => {
  const tree: Node = { type: "root", children };
  rehypeSections()(tree);
  return tree.children!;
};

const classes = (node: Node) => node.properties?.className as string[];

describe("rehypeSections", () => {
  it("puts each heading and the text under it in a card beside a dot", () => {
    const out = run([el("h2", "Context"), el("p", "One."), el("h2", "My role"), el("p", "Two.")]);
    expect(out).toHaveLength(2);
    for (const section of out) {
      expect(section.tagName).toBe("section");
      expect(classes(section)).toContain("scroll-entry");
      const [dot, card] = section.children!;
      expect(classes(dot)).toEqual(["scroll-dot"]);
      expect(dot.properties?.ariaHidden).toBe("true");
      expect(classes(card)).toContain("scroll-slide");
      expect(classes(card)).toContain("case-card");
    }
    const firstCard = out[0].children![1];
    expect(firstCard.children!.map((n) => n.tagName)).toEqual(["h2", "p"]);
  });

  it("leaves anything before the first heading where it is", () => {
    const out = run([el("p", "Intro."), el("h2", "Context"), el("p", "One.")]);
    expect(out.map((n) => n.tagName)).toEqual(["p", "section"]);
  });

  it("changes nothing when there are no headings", () => {
    const out = run([el("p", "Only text.")]);
    expect(out.map((n) => n.tagName)).toEqual(["p"]);
  });
});
