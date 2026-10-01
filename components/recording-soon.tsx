import { MeshGradient } from "@/components/ui/mesh-gradient";

/**
 * Stands in for a screen recording that does not exist yet. Deliberately not a
 * video element: a player with nothing to play shows an error when pressed.
 *
 * All motion is CSS (the mesh drift plus two expanding rings), so it costs no
 * JavaScript and stops under prefers-reduced-motion.
 */
export function RecordingSoon({ hue, repoUrl }: { hue: number; repoUrl: string }) {
  return (
    <div className="mesh-host relative grid aspect-video w-full place-items-center overflow-hidden rounded-xl border border-fg-muted/15 bg-surface/40">
      <MeshGradient hue={hue} />

      <div className="flex flex-col items-center px-6 text-center">
        <span aria-hidden="true" className="recording-soon__icon">
          <span className="recording-soon__ring" />
          <span className="recording-soon__ring recording-soon__ring--late" />
          <span className="recording-soon__disc">
            <svg viewBox="0 0 24 24" className="size-6 translate-x-px" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
        </span>

        <p className="mt-6 text-step-1 font-semibold">Screen recording coming soon</p>
        <p className="mt-1 text-step-xs text-fg/80">The source is on GitHub in the meantime.</p>

        <a
          href={repoUrl}
          // A translucent backing keeps the label legible over the brightest
          // part of the gradient, which muted text alone was not.
          className="pill pill-muted mt-5 rounded-full border border-fg-muted/30 bg-ground/45 px-4 py-1.5 text-step-xs text-fg backdrop-blur-sm"
        >
          View the source
        </a>
      </div>
    </div>
  );
}
