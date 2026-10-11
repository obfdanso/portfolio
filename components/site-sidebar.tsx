"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, ViewTransition, type CSSProperties } from "react";
import {
  AboutIcon,
  CloseIcon,
  HomeIcon,
  MenuIcon,
  ProjectsIcon,
  ResumeIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/projects", label: "Projects", Icon: ProjectsIcon },
  { href: "/about", label: "About", Icon: AboutIcon },
  { href: "/resume", label: "Resume", Icon: ResumeIcon },
] as const;
// Contact is deliberately absent: the hero's "Get in touch" button is the
// single route to it, so the sidebar stays about sections of the site.

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  pathname,
  onNavigate,
  deck = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  /** Desktop sidebar: rest as a deck of cards, fan out on hover or focus. */
  deck?: boolean;
}) {
  const current = LINKS.findIndex(({ href }) => isActive(pathname, href));
  // A deck needs a card to put in front: on a page with no link of its
  // own, the links stay a plain list.
  const stacked = deck && current >= 0;
  return (
    <ul className={cn("flex flex-col gap-1", stacked && "nav-deck")}>
      {LINKS.map(({ href, label, Icon }, index) => {
        const active = index === current;
        // In the deck every card slides up to the first slot (--i), and only
        // the current page's card shows there.
        return (
          <li
            key={href}
            className={cn(stacked && "nav-deck__card")}
            data-front={(stacked && active) || undefined}
            style={stacked ? ({ "--i": index } as CSSProperties) : undefined}
          >
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                // The bubble only shows for the current page and under the
                // pointer or keyboard focus. Its fill stays at 9%: the accent
                // text measured above 4.5:1 there in the light theme.
                "nav-item bubble bubble--quiet relative isolate flex h-11 items-center gap-3 rounded-full px-3.5 text-step-0",
                active ? "font-medium text-accent" : "text-fg-muted hover:text-fg",
              )}
            >
              {active && deck && (
                <ViewTransition name="nav-highlight" share="morph" default="none">
                  <span
                    aria-hidden="true"
                    className="nav-highlight absolute -inset-px -z-10 rounded-full border border-accent/50"
                  />
                </ViewTransition>
              )}
              <Icon className="nav-item__icon size-[1.15rem] shrink-0" />
              <span className="nav-item__label">{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: a fixed panel, inset from the window edges. */}
      <aside
        aria-label="Main"
        className="enter enter--left fixed inset-y-3 left-3 z-50 hidden w-(--sidebar-width) flex-col rounded-2xl border border-fg-muted/12 bg-surface/70 p-4 backdrop-blur-xl md:flex"
      >
        <Link
          href="/"
          className="block rounded-lg px-4 py-2 font-display text-step-2 font-semibold tracking-tight"
        >
          {SITE.shortName}
        </Link>

        <nav className="mt-8 flex-1">
          <NavList pathname={pathname} deck />
        </nav>

        <ThemeToggle />
      </aside>

      {/* Mobile: the same panel collapses to a top bar with a disclosure. */}
      <header className="sticky top-0 z-50 border-b border-fg-muted/12 bg-ground/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <Link href="/" className="font-display text-step-1 font-semibold tracking-tight">
            {SITE.shortName}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="btn rounded-lg border border-fg-muted/20 p-2"
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>

        {open && (
          <div id="mobile-nav" className="border-t border-fg-muted/12 px-3 pb-4 pt-3">
            <nav>
              <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>
            <div className="mt-4 px-1">
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
