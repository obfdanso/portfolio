import { describe, expect, it } from "vitest";
import { projectTransitionName } from "@/lib/transitions";

describe("projectTransitionName", () => {
  it("names the cover and the title per project, so card and page pair up", () => {
    expect(projectTransitionName("pos", "cover")).toBe("project-cover-pos");
    expect(projectTransitionName("pos", "title")).toBe("project-title-pos");
  });
});
