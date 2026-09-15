"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

const OPTIONS = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // No `mounted` flag: the menu only renders once `open` is true, which can
  // never happen during SSR, so `theme` is never read on the server and there
  // is nothing to mismatch on hydration. This also keeps us clear of
  // react-hooks/set-state-in-effect, which Next 16 enforces.
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-fg-muted/30 px-3 py-1.5 text-sm"
      >
        Theme
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 mt-2 w-32 rounded-lg border border-fg-muted/20 bg-surface p-1"
        >
          {OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="menuitem"
                aria-current={theme === option ? "true" : undefined}
                onClick={() => {
                  setTheme(option);
                  setOpen(false);
                }}
                className="w-full rounded px-2 py-1.5 text-left text-sm capitalize hover:bg-ground aria-[current]:text-accent"
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
