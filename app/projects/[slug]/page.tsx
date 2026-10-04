import { ViewTransition, type CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, loadProjects } from "@/lib/content";
import { Mdx } from "@/components/mdx";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { RecordingSoon } from "@/components/recording-soon";
import { ProjectShowcase } from "@/components/project-showcase";
import { projectTransitionName } from "@/lib/transitions";
import { ReadingProgress } from "@/components/reading-progress";

export function generateStaticParams() {
  return loadProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article>
      <ReadingProgress />
      <header className="mesh-host relative overflow-hidden py-28 md:rounded-2xl">
        <MeshGradient hue={project.accentHue} />
        <div className="container-page">
          <p className="enter text-step-xs text-fg-muted">
            {project.timeframe} · {project.contribution}
          </p>
          <ViewTransition
            name={projectTransitionName(project.slug, "title")}
            share="morph"
            default="none"
          >
            <h1
              className="enter enter--solid mt-4 text-step-5"
              style={{ "--enter-delay": "80ms" } as CSSProperties}
            >
              {project.title}
            </h1>
          </ViewTransition>
          <p
            className="enter mt-5 max-w-2xl text-step-1 text-fg-muted"
            style={{ "--enter-delay": "160ms" } as CSSProperties}
          >
            {project.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="pill pill-muted rounded-full border border-fg-muted/25 px-3 py-1 text-step-xs"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-2">
            {project.demo.kind === "live" && (
              <a
                href={project.demo.url}
                className="pill pill-primary rounded-full border border-accent/50 px-4 py-1.5 text-step-xs text-accent"
              >
                Live site
              </a>
            )}
            <a
              href={project.demo.repoUrl}
              className="pill pill-muted rounded-full border border-fg-muted/30 px-4 py-1.5 text-step-xs text-fg-muted"
            >
              Source
            </a>
          </div>
        </div>
      </header>

      <div className="container-page mt-10">
        <ProjectShowcase project={project} />
      </div>

      {project.demo.kind === "recording-pending" && (
        <div className="container-page mt-6">
          <RecordingSoon hue={project.accentHue} repoUrl={project.demo.repoUrl} />
        </div>
      )}

      <div className="container-page py-16">
        <Mdx source={project.body} />
      </div>
    </article>
  );
}
