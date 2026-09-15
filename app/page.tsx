import { MeshGradient } from "@/components/ui/mesh-gradient";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <main>
      <section className="mesh-host relative flex min-h-[78svh] items-center overflow-hidden">
        <MeshGradient />
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <h1 className="mt-8 max-w-[14ch] text-step-5">
            Frontend engineer building fast, accessible interfaces.
          </h1>
          <p className="mt-6 max-w-xl text-step-1 text-fg-muted">
            I build web interfaces in TypeScript and React.
          </p>
        </div>
      </section>
    </main>
  );
}
