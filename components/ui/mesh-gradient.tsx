import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function MeshGradient({ hue = 0, className }: { hue?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("mesh", className)}
      style={{ "--mesh-hue": `${hue}deg` } as CSSProperties}
    >
      <span className="mesh__blob mesh__blob--teal" />
      <span className="mesh__blob mesh__blob--emerald" />
      <span className="mesh__blob mesh__blob--lime" />
    </div>
  );
}
