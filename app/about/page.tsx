import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name}, front-end developer.`,
  alternates: { canonical: "/about" },
};

// Set to a real path once the photo exists. Until then the typographic
// treatment below stands in, so a missing photo never blocks launch.
const PHOTO: { src: string; alt: string } | null = null;

export default function AboutPage() {
  return (
    <>
      <PageHeader>
        <h1 className="enter enter--solid text-step-5">About</h1>
      </PageHeader>

      <div className="container-page grid gap-12 py-16 md:grid-cols-[1fr_17rem]">
        <div>
          <p className="text-step-1">
            {`I'm ${SITE.name}, a front-end developer based in Accra, Ghana. I'm in my final year of a computer science degree at KNUST.`}
          </p>
          <p className="mt-5 text-fg-muted">
            {
              "Most of my work is in React and TypeScript. I'm proudest of the unglamorous work: data models typed so mistakes fail the build instead of reaching a user, loading states that show what is really happening, and interfaces that work from the keyboard."
            }
          </p>
          <p className="mt-5 text-fg-muted">
            {
              "Beyond the front end, I have a working knowledge of backend development and databases, and I can query databases with SQL. I know networking fundamentals well, and I'm proficient with AI coding tools, which I use to work faster. The details are on "
            }
            <Link href="/skills" className="link-grow text-accent">
              my skills page
            </Link>
            .
          </p>
          {/* The home hero's pair, exactly: same look, same order, and the
              same magnetic lean toward the mouse. */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="btn btn-solid magnetic rounded-full bg-fg px-6 py-3 text-step-xs font-medium text-ground"
            >
              See the work
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline magnetic rounded-full border border-fg-muted/30 px-6 py-3 text-step-xs"
            >
              Get in touch
            </Link>
          </div>
        </div>

        <aside>
          {PHOTO ? (
            <Image
              src={PHOTO.src}
              alt={PHOTO.alt}
              width={544}
              height={680}
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="rounded-2xl border border-fg-muted/15 bg-surface/40 p-6">
              <p className="font-display text-step-2 leading-[1.1]">{SITE.name}</p>
              <p className="mt-3 font-mono text-step-xs text-fg-muted">
                {SITE.role}
                <br />
                Accra, Ghana
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
