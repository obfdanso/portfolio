"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import {
  getPrevious,
  getServerPrevious,
  nameOf,
  parentOf,
  record,
  subscribe,
} from "@/lib/nav-trail";

/**
 * An iPhone-style back button: a back arrow in a round glass bubble. Its
 * accessible name says which page it returns to. It goes back through this tab's history
 * when the previous page was on this site; someone who arrived from a search
 * or a shared link goes up a level instead (a case study to Projects,
 * anything else to Home), never off the site. Without JavaScript it is a
 * plain link to that parent. Not shown on the home page.
 */
export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const previous = useSyncExternalStore(subscribe, getPrevious, getServerPrevious);

  useEffect(() => {
    // After the new page has rendered, so a case study's heading is there.
    record({
      path: pathname,
      title: nameOf(pathname, document.querySelector("main h1")?.textContent),
    });
  }, [pathname]);

  if (pathname === "/") return null;

  const target = previous ?? parentOf(pathname);

  // A landmark of its own, so it is not loose content outside the page's
  // regions, and screen readers can jump to it.
  return (
    <nav aria-label="Back">
      <Link
        href={target.path}
        aria-label={`Back to ${target.title}`}
        onClick={(event) => {
          if (!previous) return;
          event.preventDefault();
          router.back();
        }}
        title={`Back to ${target.title}`}
        className="bubble bubble--glass back-button pointer-events-auto grid size-11 place-items-center rounded-full text-fg"
      >
        <ChevronLeftIcon className="back-button__chevron size-6" />
      </Link>
    </nav>
  );
}
