import { Inter, JetBrains_Mono } from "next/font/google";

// Inter for display and body. It was designed as a screen-first grotesque in
// the same lineage as SF Pro, which is what the Apple reference uses — and
// unlike SF Pro it is actually licensed for web use. Identical on every
// platform, which matters when we don't know what a recruiter is running.
//
// The `-src` suffix matters: Tailwind's @theme owns --font-display/-body/-mono
// (they generate the font-* utilities), so next/font must not write to those
// names or it would shadow the theme values on every descendant of <html>.
export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-src",
});

// Kept for code, stack tags and section numerals — a different job, not a
// second voice.
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-src",
});
