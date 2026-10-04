import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

/**
 * The route to /skills, placed after the front-end work on home and Projects.
 * It is deliberately not a sidebar item: the other skills sit one click away
 * from the front-end projects, never on the same page as them.
 *
 * reveal--solid because it can sit at the fold, where a fade would leave its
 * text half transparent for the contrast audit.
 */
export function OtherSkillsCta({ className }: { className?: string }) {
  return (
    <Reveal
      className={cn(
        "reveal--solid flex flex-col items-start gap-5 rounded-2xl border border-fg-muted/15 bg-surface/40 p-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="max-w-xl text-fg-muted">
        Front end is my focus, but I also know my way around backends, databases, networking and AI
        tools.
      </p>
      <Link
        href="/skills"
        className="btn btn-outline shrink-0 rounded-full border border-fg-muted/30 px-5 py-2.5 text-step-xs"
      >
        See my other skills
      </Link>
    </Reveal>
  );
}
