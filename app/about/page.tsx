import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name}, frontend engineer.`,
};

// Set to a real path once the photo exists. Until then the typographic
// treatment below stands in, so a missing photo never blocks launch.
const PHOTO: { src: string; alt: string } | null = null;

export default function AboutPage() {
  return (
    <>
      <section className="mesh-host relative overflow-hidden py-24 md:rounded-2xl">
        <MeshGradient hue={90} />
        <div className="container-page">
          <h1 className="text-step-5">About</h1>
        </div>
      </section>

      <div className="container-page grid gap-12 py-16 md:grid-cols-[1fr_17rem]">
        <div>
          <p className="text-step-1">
            I am {SITE.name}, a frontend engineer studying computer science at KNUST in Ghana.
          </p>
          <p className="mt-5 text-fg-muted">
            I build web interfaces in TypeScript and React. The work I am proudest of is the
            unglamorous part: typed data models that fail at compile time instead of in front of a
            user, loading states that tell the truth, and interfaces that work from the keyboard.
          </p>
          <p className="mt-5 text-fg-muted">
            I have been the frontend developer on three projects — a medication tracker with an AI
            chatbot, a multi-role point-of-sale system, and a mobile UI reconstruction study. Each
            has a written case study covering what I decided and what I would change.
          </p>
          <p className="mt-5 text-fg-muted">
            I am currently looking for frontend roles and internships.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-accent px-5 py-2.5 text-step-xs font-medium text-ground"
            >
              Get in touch
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-fg-muted/30 px-5 py-2.5 text-step-xs"
            >
              See the work
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
                Kumasi, Ghana
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
