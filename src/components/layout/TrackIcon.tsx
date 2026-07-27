import type { Track } from "@/lib/content/types";

const PATHS: Record<Track["icon"], string> = {
  // Order book / stacked levels
  foundations: "M3 6h7M3 10h11M3 14h6M3 18h9M17 5v14",
  // Candlestick
  charts: "M6 4v3m0 10v3M6 7h0a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1zM14 2v5m0 10v5m0-15h0a1 1 0 011 1v8a1 1 0 01-1 1h0a1 1 0 01-1-1V8a1 1 0 011-1z",
  // Target / crosshair
  strategy: "M12 3v3m0 12v3M3 12h3m12 0h3M12 7a5 5 0 100 10 5 5 0 000-10z",
  // Shield
  risk: "M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3z",
  // Globe / broadcast
  macro: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3z",
  // Path forward
  path: "M5 20l4-16M15 20l4-16M4 9h16M4 15h16",
};

export function TrackIcon({
  icon,
  className = "h-5 w-5",
}: {
  icon: Track["icon"];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={PATHS[icon]} />
    </svg>
  );
}
