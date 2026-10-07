import type { Page } from "@playwright/test";

/**
 * Records the pseudo-element animations of every view transition into
 * window.__vt, one line per animation: `${pseudo}|${duration}|${name}`.
 * Client-side navigation keeps `window`, so the record survives route changes.
 */
export async function recordTransitions(page: Page): Promise<void> {
  await page.evaluate(() => {
    const record: string[] = [];
    (window as unknown as { __vt: string[] }).__vt = record;
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
      const transition = original(arg);
      transition.ready.then(() => {
        for (const animation of document.getAnimations()) {
          const effect = animation.effect as KeyframeEffect | null;
          if (effect?.pseudoElement) {
            const name = (animation as CSSAnimation).animationName ?? "";
            record.push(`${effect.pseudoElement}|${effect.getTiming().duration}|${name}`);
          }
        }
      });
      return transition;
    }) as typeof document.startViewTransition;
  });
}

export const recorded = (page: Page): Promise<string> =>
  page.evaluate(() => (window as unknown as { __vt: string[] }).__vt.join("\n"));
