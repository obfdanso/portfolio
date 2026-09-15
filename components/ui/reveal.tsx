import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

/**
 * A server component. The reveal is driven entirely by CSS scroll-driven
 * animations, so the common case ships no JavaScript at all. Callers stagger
 * lists by passing `delay={index * 40}`.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  return (
    <Tag
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
