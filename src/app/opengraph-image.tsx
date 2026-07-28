import { ImageResponse } from "next/og";
import { TOTAL_LESSONS } from "@/lib/content/registry";

export const runtime = "nodejs";
export const alt = "MarketLab — learn how markets actually work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card. Rendered at build time, so it uses no external fonts or assets —
 * everything here is inline, which is also why it survives an offline build.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#090b10",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: "#142642",
              border: "2px solid #529cff66",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18l5-6 4 3 7-9"
                stroke="#529cff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Satori requires an explicit display on any node with more than
              one child, so this is a flex row rather than inline text. */}
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#e2e8f2" }}>
            <span>Market</span>
            <span style={{ color: "#529cff" }}>Lab</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 600, color: "#e2e8f2", lineHeight: 1.08 }}>
            Learn how markets
          </div>
          <div style={{ fontSize: 66, fontWeight: 600, color: "#e2e8f2", lineHeight: 1.08 }}>
            actually work.
          </div>
          <div style={{ fontSize: 30, color: "#8b95a8", marginTop: 22 }}>
            So when you&apos;re ready to trade, you&apos;re not starting from zero.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 22 }}>
          {[
            `${TOTAL_LESSONS} lessons`,
            "Chart reading",
            "Risk & psychology",
            "Free, no account",
          ].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: "#26a69a" }} />
              <div style={{ color: "#8b95a8" }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
