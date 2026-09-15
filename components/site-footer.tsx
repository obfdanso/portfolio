import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-fg-muted/12">
      <div className="container-page flex flex-wrap items-center justify-between gap-4 py-10 text-step-xs text-fg-muted">
        <p>
          {SITE.name} — {SITE.role}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          <Link href="/contact" className="hover:text-fg">
            Contact
          </Link>
          <a href={SITE.github} className="hover:text-fg">
            GitHub
          </a>
          <a href={`mailto:${SITE.email}`} className="hover:text-fg">
            Email
          </a>
        </nav>
      </div>
    </footer>
  );
}
