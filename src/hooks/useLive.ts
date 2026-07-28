"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveResult } from "@/lib/live/http";

export type LiveStatus = "loading" | "live" | "failed";

export interface LiveState<T> {
  data: T | null;
  status: LiveStatus;
  /** Which provider answered, once one has. */
  provider: string | null;
  /** Providers that were tried and rejected, for the diagnostics panel. */
  attempts: { provider: string; error: string }[];
  error: string | null;
  fetchedAt: number | null;
  refresh: () => void;
}

/**
 * Load live market data in the browser, with the two behaviours every surface
 * on this site needs:
 *
 *   - **It never throws away what it already has.** A failed refresh keeps the
 *     last good data on screen and just marks it stale, rather than blanking a
 *     chart someone is reading.
 *   - **It reports which provider answered.** Readers are told whether they're
 *     looking at live data or a fallback; a site that teaches scepticism about
 *     sources shouldn't be vague about its own.
 */
export function useLive<T>(
  load: () => Promise<LiveResult<T>>,
  { refreshMs, enabled = true }: { refreshMs?: number; enabled?: boolean } = {},
): LiveState<T> {
  const [state, setState] = useState<Omit<LiveState<T>, "refresh">>({
    data: null,
    status: "loading",
    provider: null,
    attempts: [],
    error: null,
    fetchedAt: null,
  });

  // `load` is typically an inline arrow, so reading it through a ref keeps it
  // from re-triggering the effect on every render.
  const loadRef = useRef(load);
  loadRef.current = load;
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function run() {
      try {
        const result = await loadRef.current();
        if (cancelled) return;
        setState({
          data: result.data,
          status: "live",
          provider: result.provider,
          attempts: result.attempts,
          error: null,
          fetchedAt: result.fetchedAt,
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          // Keep prior data visible; only the freshness claim changes.
          status: prev.data ? "live" : "failed",
          error: (err as Error).message,
        }));
      }
    }

    run();
    if (!refreshMs) return () => void (cancelled = true);

    const timer = setInterval(run, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, refreshMs, nonce]);

  return { ...state, refresh };
}

/** "3 min ago" for a fetch timestamp, recomputed as it ages. */
export function useAgeLabel(at: number | null): string {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  if (!at) return "";
  const secs = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)}h ago`;
}
