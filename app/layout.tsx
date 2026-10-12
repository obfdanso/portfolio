import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SpotlightTracker } from "@/components/spotlight-tracker";
import { BackButton } from "@/components/back-button";
import { JsonLd } from "@/components/json-ld";
import { mono, sans } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} · ${SITE.role}`, template: `%s · ${SITE.shortName}` },
  description: "Front-end developer building fast, accessible interfaces.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // `data-scroll-behavior="smooth"`: Next 16 stopped overriding a global
  // `scroll-behavior: smooth` during route changes, so navigations would
  // smoothly crawl to the top instead of jumping. This opts back in.
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-ground text-fg antialiased" suppressHydrationWarning>
        <JsonLd />
        <ThemeProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <SiteSidebar />
          <SpotlightTracker />
          <div className="relative md:pl-[calc(var(--sidebar-width)+1.5rem)]">
            {/* Over the top-left corner of each page, a little clear of the
                sidebar. On desktop its middle lines up with the sidebar's
                "Danso": the sidebar's 0.75rem inset, 1px border and 1rem
                padding, the name's 0.5rem padding and half its line (1.6 x
                text-step-2), less half the 2.75rem button. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-5 pt-4 md:pt-[calc(0.875rem_+_1px_+_var(--text-step-2)_*_0.8)] md:pl-[calc(var(--sidebar-width)+2.5rem)]">
              <BackButton />
            </div>
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
        {/* Vercel serves /_vercel/insights/script.js itself, so anywhere else
            the script 404s: a console error that costs the Best Practices
            score locally and in CI. VERCEL is set only on their builders. */}
        {process.env.VERCEL === "1" && <Analytics />}
      </body>
    </html>
  );
}
