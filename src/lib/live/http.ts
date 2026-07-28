/**
 * Shared fetch plumbing for live data.
 *
 * Everything here runs in the browser. The site is a static export, so there is
 * no server to proxy through and nowhere to keep a secret — which is exactly
 * why the default providers are all keyless. See `src/lib/live/README.md`.
 *
 * Two rules hold across every adapter:
 *   1. A failing provider must never break the page. Callers fall back to the
 *      generated sample data and tell the reader which they're looking at.
 *   2. Every request is time-boxed. A provider that hangs is worse than one
 *      that errors, because the UI would sit in a loading state indefinitely.
 */

export class LiveDataError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "LiveDataError";
  }
}

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchJson<T>(
  url: string,
  provider: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: "application/json" },
      // Live data should never be served from a stale cache entry.
      cache: "no-store",
    });
  } catch (err) {
    // Network failure, CORS rejection and timeout all land here, and the
    // browser deliberately hides which — so don't pretend to know.
    throw new LiveDataError(
      `${provider} unreachable (network, CORS or timeout): ${(err as Error).message}`,
      provider,
    );
  }

  if (!res.ok) {
    throw new LiveDataError(
      `${provider} returned HTTP ${res.status}`,
      provider,
      res.status,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new LiveDataError(`${provider} returned a malformed response`, provider);
  }
}

export interface SourceAttempt {
  provider: string;
  error: string;
}

export interface LiveResult<T> {
  data: T;
  /** Which provider actually answered. */
  provider: string;
  /** Providers tried and rejected before this one, for the diagnostics panel. */
  attempts: SourceAttempt[];
  fetchedAt: number;
}

export interface Provider<T> {
  name: string;
  load: () => Promise<T>;
}

/**
 * Try providers in order, returning the first that answers.
 *
 * Sequential rather than parallel on purpose: these are free public endpoints
 * with rate limits, and firing every request on every page load would burn the
 * allowance for no benefit when the first provider is usually fine.
 */
export async function firstWorking<T>(providers: Provider<T>[]): Promise<LiveResult<T>> {
  const attempts: SourceAttempt[] = [];

  for (const provider of providers) {
    try {
      const data = await provider.load();
      return { data, provider: provider.name, attempts, fetchedAt: Date.now() };
    } catch (err) {
      attempts.push({ provider: provider.name, error: (err as Error).message });
    }
  }

  throw new LiveDataError(
    `No provider answered. Tried: ${attempts.map((a) => a.provider).join(", ")}`,
    "all",
  );
}

/** Optional API key, supplied at build time. Read the README before using one. */
export function publicKey(name: string): string | undefined {
  const key = process.env[`NEXT_PUBLIC_${name}`];
  return key && key.length > 0 ? key : undefined;
}
