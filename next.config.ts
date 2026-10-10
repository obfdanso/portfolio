import type { NextConfig } from "next";

/**
 * Static headers, so every page stays prerendered and served from the CDN.
 * A nonce-based policy would force every page to render per request; with no
 * accounts or private data here, that cost buys nothing. 'unsafe-inline'
 * scripts cover Next's inline bootstrap and next-themes' pre-hydration theme
 * script; inline styles cover the style props behind entrance delays and
 * accent hues. Everything else is same-origin: fonts are self-hosted by
 * next/font, and Vercel Analytics lives under /_vercel.
 */
export function contentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    // React's dev tooling evaluates code; production never needs it.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const securityHeaders = (isDev: boolean) => [
  { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
  // .dev is HSTS-preloaded as a TLD already; this covers any other alias.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // For browsers that ignore frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // The devtools badge renders into a shadow root and showed up under
  // `next start`, which is how Vercel serves the site. Off.
  devIndicators: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders(process.env.NODE_ENV === "development") }];
  },
};

export default nextConfig;
