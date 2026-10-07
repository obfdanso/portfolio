"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { switchTheme } from "@/lib/theme-transition";

const OPTIONS = ["light", "dark", "system"] as const;

// Long enough to cross the small gap between the button and the menu without
// the menu closing on the way; short enough that leaving feels immediate.
const LEAVE_GRACE_MS = 150;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const leaveTimer = useRef(0);

  // Close the menu first, synchronously, so the reveal's "before" snapshot
  // doesn't freeze an open menu outside the growing circle. Then apply the
  // theme inside the transition. data-theme is set directly as well, so the
  // "after" snapshot already has the new colours; next-themes then records
  // the choice.
  const choose = (option: (typeof OPTIONS)[number]) => {
    flushSync(() => setOpen(false));
    switchTheme(() => {
      const resolved =
        option === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : option;
      document.documentElement.setAttribute("data-theme", resolved);
      setTheme(option);
    }, buttonRef.current);
  };

  // While open, a press anywhere outside closes the menu, and so does Escape,
  // which also hands focus back to the button so keyboard users stay put.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(leaveTimer.current);
    };
  }, [open]);

  // No `mounted` flag: the menu only renders once `open` is true, which can
  // never happen during SSR, so `theme` is never read on the server and there
  // is nothing to mismatch on hydration. This also keeps us clear of
  // react-hooks/set-state-in-effect, which Next 16 enforces.
  return (
    <div
      ref={rootRef}
      className="relative"
      // Mouse only: a touch pointer "leaves" as soon as the finger lifts,
      // which would close the menu the moment it opened.
      onPointerLeave={(event) => {
        if (!open || event.pointerType !== "mouse") return;
        leaveTimer.current = window.setTimeout(() => setOpen(false), LEAVE_GRACE_MS);
      }}
      onPointerEnter={() => window.clearTimeout(leaveTimer.current)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-outline rounded-full border border-fg-muted/30 px-3 py-1.5 text-sm"
      >
        Theme
      </button>
      {open && (
        <ul
          role="menu"
          // Opens upward: this control sits at the foot of the sidebar, so a
          // downward menu rendered past the bottom of the panel and could not
          // be reached.
          className="menu-pop absolute bottom-full left-0 z-50 mb-2 w-32 rounded-lg border border-fg-muted/20 bg-surface p-1 shadow-lg"
        >
          {OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="menuitem"
                aria-current={theme === option ? "true" : undefined}
                onClick={() => choose(option)}
                className="nav-item w-full rounded px-2 py-1.5 text-left text-sm capitalize hover:bg-ground aria-[current]:text-accent"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
