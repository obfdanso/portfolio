import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

describe("SITE.url", () => {
  it("is the address Vercel serves, not one that redirects", () => {
    // Vercel serves www.danso.dev and redirects danso.dev to it (2026-10-12).
    // Canonical tags, the sitemap and link previews all build on SITE.url, so
    // pointing it at the redirecting address told Google one address and then
    // sent it to another.
    expect(SITE.url).toBe("https://www.danso.dev");
    expect(SITE.url.endsWith("/")).toBe(false);
  });
});
