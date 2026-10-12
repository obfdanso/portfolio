import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { resume, type Entry } from "@/content/resume";
import { PageHeader } from "@/components/page-header";
import { SectionNumber } from "@/components/ui/section-number";

export const metadata: Metadata = {
  title: "Resume",
  description: resume.summary,
  alternates: { canonical: "/resume" },
};

const index = (i: number) => ({ "--i": i }) as CSSProperties;

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="flex items-baseline gap-4 text-step-3">
      <SectionNumber value={number} /> <span className="fill-on-scroll">{title}</span>
    </h2>
  );
}

/**
 * A section of the resume as a timeline: a line that draws itself down as
 * the section scrolls by, a dot per entry that lights up as the entry
 * reaches the middle of the screen, and each entry sliding in as a card with
 * its points following one after another. All scroll-driven CSS; see
 * "Resume timeline" in globals.css.
 */
function Timeline({ number, title, entries }: { number: number; title: string; entries: Entry[] }) {
  return (
    <section className="mt-20">
      <SectionHeading number={number} title={title} />
      <ol className="scroll-line mt-10 space-y-6">
        {entries.map((entry) => (
          <li key={`${entry.org}-${entry.title}`} className="scroll-entry">
            <span aria-hidden="true" className="scroll-dot" />
            <article className="scroll-slide spotlight relative rounded-2xl border border-fg-muted/15 bg-surface/40 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h3 className="text-step-1">
                  {entry.title} · {entry.org}
                </h3>
                <p className="rounded-full border border-fg-muted/25 px-3 py-0.5 font-mono text-step-xs text-fg-muted">
                  {entry.period}
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-fg-muted">
                {entry.points.map((point, i) => (
                  <li key={point} className="scroll-point" style={index(i)}>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function ResumePage() {
  return (
    <>
      <PageHeader>
        <h1 className="enter enter--solid text-step-4">Resume</h1>
        <p className="mt-5 max-w-2xl text-fg-muted">{resume.summary}</p>

        <a
          href={resume.pdfPath}
          download
          className="btn btn-outline magnetic mt-8 inline-block rounded-full border border-fg-muted/30 px-6 py-3 text-step-xs"
        >
          Download PDF
        </a>
      </PageHeader>

      <div className="container-page pb-16">
        <Timeline number={1} title="Experience" entries={resume.experience} />
        <Timeline number={2} title="Education" entries={resume.education} />

        <section className="mt-20">
          <SectionHeading number={3} title="Skills" />
          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            {resume.skills.map((group) => (
              <div
                key={group.group}
                className="resume-skills spotlight relative rounded-2xl border border-fg-muted/15 bg-surface/40 p-5"
              >
                <dt className="font-mono text-step-xs text-fg-muted">{group.group}</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item, i) => (
                    <span
                      key={item}
                      className="resume-chip pill pill-muted rounded-full border border-fg-muted/25 px-3 py-1 text-step-xs"
                      style={index(i)}
                    >
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
