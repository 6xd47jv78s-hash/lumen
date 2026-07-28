"use client";

import type { LiveState } from "@/hooks/useLive";
import { useAgeLabel } from "@/hooks/useLive";

/**
 * Provenance badge. Every live surface carries one.
 *
 * This site spends a whole lesson teaching students to ask where a number came
 * from and who benefits from them believing it. It would be incoherent to then
 * show them data without saying which provider it came from, how old it is, or
 * that it failed to load and they're looking at a generated stand-in.
 */
export function LiveStatus<T>({
  state,
  fallbackLabel = "sample data",
}: {
  state: LiveState<T>;
  fallbackLabel?: string;
}) {
  const age = useAgeLabel(state.fetchedAt);

  if (state.status === "loading") {
    return (
      <span className="flex items-center gap-1.5 font-mono text-2xs text-faint">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-line-strong" />
        connecting…
      </span>
    );
  }

  if (state.status === "failed") {
    return (
      <span
        className="flex items-center gap-1.5 font-mono text-2xs text-signal"
        title={state.error ?? undefined}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-signal" />
        {fallbackLabel}
      </span>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted">
      <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-up" />
      <span className="text-up">live</span>
      <span className="text-faint">· {state.provider}</span>
      {age && <span className="text-faint">· {age}</span>}
      {state.attempts.length > 0 && (
        <span
          className="text-faint"
          title={state.attempts.map((a) => `${a.provider}: ${a.error}`).join("\n")}
        >
          · {state.attempts.length} fallback{state.attempts.length > 1 ? "s" : ""}
        </span>
      )}
    </span>
  );
}

/** Explains the fallback in prose, shown only when live data genuinely failed. */
export function LiveFailureNote<T>({ state }: { state: LiveState<T> }) {
  if (state.status !== "failed") return null;
  return (
    <div className="mt-3 rounded-md border border-signal/40 bg-signal/[0.07] px-3.5 py-3">
      <p className="eyebrow text-signal">Live data didn&rsquo;t load</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
        Showing generated sample data instead, so the page still works. This usually means the
        provider is rate-limiting, is blocked on your network, or is unavailable in your region —
        the browser deliberately doesn&rsquo;t say which.
      </p>
      {state.error && (
        <p className="mt-2 break-words font-mono text-2xs text-faint">{state.error}</p>
      )}
      <button onClick={state.refresh} className="btn-ghost btn-sm mt-3">
        Try again
      </button>
    </div>
  );
}
