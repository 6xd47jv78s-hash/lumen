"use client";

import { useEffect, useState } from "react";

/** Live "time until" that renders a stable placeholder until mounted. */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export type Phase = "future" | "imminent" | "live" | "past";

export function phaseOf(at: string, now: number): Phase {
  const delta = new Date(at).getTime() - now;
  if (delta < -45 * 60000) return "past";
  if (delta <= 0) return "live";
  if (delta <= 60 * 60000) return "imminent";
  return "future";
}

export function formatDelta(at: string, now: number): string {
  const ms = new Date(at).getTime() - now;
  if (ms <= 0) return ms > -45 * 60000 ? "released" : "done";

  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export function Countdown({
  at,
  className,
  prefix = "in ",
}: {
  at: string;
  className?: string;
  prefix?: string;
}) {
  const now = useNow();
  if (now === null) {
    return <span className={className}>&nbsp;</span>;
  }
  const phase = phaseOf(at, now);
  const text = formatDelta(at, now);
  return (
    <span className={className}>
      {phase === "future" || phase === "imminent" ? `${prefix}${text}` : text}
    </span>
  );
}

/** Local date/time label for an event, rendered only on the client. */
export function LocalTime({ at, withDate = true }: { at: string; withDate?: boolean }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date(at);
    setLabel(
      withDate
        ? d.toLocaleString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    );
  }, [at, withDate]);
  return <>{label ?? " "}</>;
}
