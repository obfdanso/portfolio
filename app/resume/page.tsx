import type { Metadata } from "next";
import { resume, type Entry } from "@/content/resume";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Resume", description: resume.summary };

function Section({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section className="mt-14">
      <h2 className="text-step-2">{title}</h2>
      <ul className="mt-6 space-y-8">
        {entries.map((entry) => (
          <li key={`${entry.org}-${entry.title}`}>
            <h3 className="text-step-1">
              {entry.title} — {entry.org}
            </h3>
            <p className="mt-1 font-mono text-step-xs text-fg-muted">{entry.period}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-fg-muted">
              {entry.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="container-page py-24">
      <h1 className="text-step-4">Resume</h1>
      <p className="mt-5 max-w-2xl text-fg-muted">{resume.summary}</p>

      <a
        href={resume.pdfPath}
        download
        className="mt-8 inline-block rounded-full border border-fg-muted/30 px-5 py-2.5 text-step-xs hover:border-accent hover:text-accent"
      >
        Download PDF
      </a>

      <Section title="Experience" entries={resume.experience} />
      <Section title="Education" entries={resume.education} />

      <section className="mt-14">
        <h2 className="text-step-2">Skills</h2>
        <dl className="mt-6 space-y-4">
          {resume.skills.map((group) => (
            <div key={group.group}>
              <dt className="font-mono text-step-xs text-fg-muted">{group.group}</dt>
              <dd className="mt-1">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-14 text-step-xs text-fg-muted">
        Prefer to talk?{" "}
        <a href={`mailto:${SITE.email}`} className="text-accent underline underline-offset-4">
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
