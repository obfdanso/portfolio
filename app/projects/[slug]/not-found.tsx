import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="container-page py-32">
      <h1 className="text-step-4">Project not found</h1>
      <p className="mt-4 text-fg-muted">
        That project does not exist, or the link has changed since it was shared.
      </p>
      <Link href="/projects" className="mt-8 inline-block text-accent underline underline-offset-4">
        All projects
      </Link>
    </div>
  );
}
