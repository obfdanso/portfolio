"use client";

import { useEffect } from "react";

/**
 * True when a click will navigate to another page of this site in the same
 * tab. New-tab clicks, downloads, external links and in-page anchors are not
 * in-app navigations.
 */
export function isInAppNavigation(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const link = target.closest("a");
  if (!link) return false;
  if (link.hasAttribute("download")) return false;

  const opensIn = link.getAttribute("target");
  if (opensIn && opensIn !== "_self") return false;

  // A root-relative path such as "/projects". Rules out "#main", "mailto:",
  // full URLs, and protocol-relative "//host" links.
  const href = link.getAttribute("href") ?? "";
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Marks <html data-navigated> once the visitor moves between pages, so the
 * CSS can keep the full staggered entrance for a fresh visit and let later
 * pages swap in quickly.
 *
 * The mark is set on the click itself, in the capture phase, before the
 * router renders the next page. Setting it after render would re-time
 * entrance animations already in flight, which shows as a jump.
 */
export function NavigationState() {
  useEffect(() => {
    const mark = () => document.documentElement.setAttribute("data-navigated", "");
    const onClick = (event: MouseEvent) => {
      if (isInAppNavigation(event)) mark();
    };

    // Back and forward. popstate also fires for in-page anchors such as the
    // skip link, since a hash change is a history entry too, so only a change
    // of path counts as moving to another page.
    let path = location.pathname;
    const onPopState = () => {
      if (location.pathname !== path) mark();
      path = location.pathname;
    };

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
