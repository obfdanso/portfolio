import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // The devtools badge renders into a shadow root and showed up under
  // `next start`, which is how Vercel serves the site. Off.
  devIndicators: false,
};

export default nextConfig;
