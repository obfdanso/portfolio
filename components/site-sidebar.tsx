"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {LINKS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-step-0 transition-colors",
                "duration-[--duration-fast] ease-(--ease-brand)",
                active
                  ? "bg-fg/8 font-medium text-accent"
                  : "text-fg-muted hover:bg-fg/5 hover:text-fg",
              )}
            >
              <Icon className="size-[1.15rem] shrink-0" />
              {label}
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
        className="fixed inset-y-3 left-3 z-50 hidden w-(--sidebar-width) flex-col rounded-2xl border border-fg-muted/12 bg-surface/70 p-4 backdrop-blur-xl md:flex"
      >
        <Link href="/" className="block rounded-lg px-3 py-2">
          <span className="block font-display text-step-1 font-semibold tracking-tight">
            {SITE.shortName}
          </span>
          <span className="mt-0.5 block font-mono text-step-xs text-fg-muted">{SITE.role}</span>
        </Link>

        <nav className="mt-6 flex-1">
          <NavList pathname={pathname} />
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
            className="rounded-lg border border-fg-muted/20 p-2"
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
