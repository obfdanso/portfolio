import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

describe("reduced-motion CSS", () => {
  it("never lists ::details-content beside another selector", () => {
    // Browsers without ::details-content drop the whole rule it appears in,
    // which would silently switch off the reduced-motion override for the
    // other selectors in the same list.
    const rules = css.match(/[^{}]+\{/g) ?? [];
    const mixed = rules
      .map((rule) => rule.replace("{", "").trim())
      .filter((selector) => selector.includes("::details-content") && selector.includes(","));
    expect(mixed).toEqual([]);
  });
});
