import { MeshGradient } from "@/components/ui/mesh-gradient";

export default function HomePage() {
  return (
    <section className="mesh-host relative flex min-h-[calc(100dvh-1.5rem)] items-center overflow-hidden md:rounded-2xl">
      <MeshGradient />
      <div className="container-page w-full py-24">
        <h1 className="max-w-[15ch] text-step-5">
          Frontend engineer building fast, accessible interfaces.
        </h1>
        <p className="mt-6 max-w-xl text-step-1 text-fg-muted">
          I build web interfaces in TypeScript and React. Below is the work, with a written case
          study for each project.
        </p>
      </div>
    </section>
  );
}
