import { cn } from "@/lib/cn";

export function MeshGradient({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("mesh", className)}>
      <span className="mesh__blob mesh__blob--teal" />
      <span className="mesh__blob mesh__blob--emerald" />
      <span className="mesh__blob mesh__blob--lime" />
    </div>
  );
}
