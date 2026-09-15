const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const hits = new Map<string, number[]>();

/**
 * In-memory and per-instance. That is deliberate at this scale: the goal is to
 * blunt a script hammering the form, not to be a distributed quota. State
 * resets on redeploy, which is fine.
 *
 * A blocked caller's timestamps are not extended, so hammering while blocked
 * cannot push the window forward and lock them out indefinitely.
 */
export function checkRateLimit(key: string, now: number = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** Test-only. */
export function __resetRateLimit(): void {
  hits.clear();
}
