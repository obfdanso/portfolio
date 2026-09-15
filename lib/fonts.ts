import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

// The `-src` suffix matters: Tailwind's @theme owns `--font-display`,
// `--font-body` and `--font-mono` (they generate the font-* utilities).
// If next/font wrote to those same names it would shadow the theme values
// on every descendant of <html>. These hold the raw family names, and
// globals.css composes them into the theme tokens with fallback stacks.
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-src",
});

export const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-src",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-src",
});
