"use client";

import { PauseIcon, PlayIcon } from "@/components/icons";

/**
 * The dots and the pause button under a project carousel. The current dot
 * stretches into a pill that fills while its slide is shown.
 */
export function CarouselControls({
  labels,
  current,
  playing,
  onSelect,
  onTogglePlay,
}: {
  labels: string[];
  current: number;
  playing: boolean;
  onSelect: (index: number) => void;
  onTogglePlay: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <div className="bubble flex items-center rounded-full px-2 py-2.5">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-label={`Show ${label}`}
            aria-current={index === current || undefined}
            onClick={() => onSelect(index)}
            className="carousel__dot"
          >
            {/* A 24px button around a small pip, so it is easy to hit. */}
            <span aria-hidden="true" className="carousel__pip">
              {index === current && (
                // Keyed by slide, so the fill starts over on every slide.
                <span key={current} className="carousel__progress" />
              )}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
        className="bubble grid size-11 place-items-center rounded-full text-fg"
      >
        {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
      </button>
    </div>
  );
}
