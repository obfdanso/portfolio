import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig, { contentSecurityPolicy, securityHeaders } from "@/next.config";

function directive(policy: string, name: string): string | undefined {
  return policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
}

describe("contentSecurityPolicy", () => {
  it("loads everything from the site's own origin by default", () => {
    expect(directive(contentSecurityPolicy(false), "default-src")).toBe("default-src 'self'");
  });

  it("allows inline scripts and styles, which Next and next-themes need", () => {
    const policy = contentSecurityPolicy(false);
    expect(directive(policy, "script-src")).toBe("script-src 'self' 'unsafe-inline'");
    expect(directive(policy, "style-src")).toBe("style-src 'self' 'unsafe-inline'");
  });

  it("adds unsafe-eval in development only", () => {
    expect(directive(contentSecurityPolicy(true), "script-src")).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy(false)).not.toContain("'unsafe-eval'");
  });

  it("blocks plugins, framing, foreign forms and base hijacking", () => {
    const policy = contentSecurityPolicy(false);
    expect(directive(policy, "object-src")).toBe("object-src 'none'");
    expect(directive(policy, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(policy, "form-action")).toBe("form-action 'self'");
    expect(directive(policy, "base-uri")).toBe("base-uri 'self'");
  });

  it("allows the site's own video and images, including data and blob images", () => {
    const policy = contentSecurityPolicy(false);
    expect(directive(policy, "media-src")).toBe("media-src 'self'");
    expect(directive(policy, "img-src")).toBe("img-src 'self' blob: data:");
  });
});

describe("securityHeaders", () => {
  it("sends the full header set", () => {
    const keys = securityHeaders(false).map((header) => header.key);
    expect(keys).toEqual([
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "X-Frame-Options",
    ]);
  });
});

describe("nextConfig.headers", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("applies the headers to every route", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const rules = await nextConfig.headers!();
    expect(rules).toEqual([{ source: "/(.*)", headers: securityHeaders(false) }]);
  });

  it("uses the development policy under next dev", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const [rule] = await nextConfig.headers!();
    const csp = rule.headers.find((header) => header.key === "Content-Security-Policy");
    expect(csp?.value).toContain("'unsafe-eval'");
  });
});
