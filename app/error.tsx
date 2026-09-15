"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-32">
      <h1 className="text-step-4">Something went wrong</h1>
      <p className="mt-4 text-fg-muted">This page failed to render.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full border border-fg-muted/30 px-5 py-2.5"
      >
        Try again
      </button>
    </div>
  );
}
