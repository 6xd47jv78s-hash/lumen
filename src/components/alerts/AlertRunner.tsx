"use client";

import { useEffect } from "react";
import { buildEvents } from "@/content/events";
import { useAlerts } from "@/store/alerts";
import { dayKey, useProgress } from "@/store/progress";

/**
 * Fires the browser notifications the student opted into. Mounted once in the
 * root layout, ticks every 30 seconds while any MarketLab tab is open.
 *
 * Two deliberate constraints:
 *   1. Every notification names a *scheduled event* or a *study habit*. None of
 *      them names an instrument or a direction. This is the line the whole
 *      feature is built around.
 *   2. Each event fires at most once, tracked in the persisted `fired` list, so
 *      leaving a tab open overnight can't produce a stream of duplicates.
 */
export function AlertRunner() {
  const alerts = useAlerts();
  const activeDays = useProgress((s) => s.activeDays);

  useEffect(() => {
    if (!alerts.hydrated) return;
    if (!alerts.eventAlerts && !alerts.studyReminder) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    function tick() {
      const now = Date.now();
      const state = useAlerts.getState();

      if (state.eventAlerts) {
        const window_ = state.leadMinutes * 60000;
        for (const e of buildEvents(new Date(), 3)) {
          if (state.highImpactOnly && e.impact !== "high") continue;
          if (state.fired.includes(e.id)) continue;
          const delta = new Date(e.at).getTime() - now;
          // Fire once inside the lead window, and never for something already out.
          if (delta > 0 && delta <= window_) {
            const mins = Math.max(1, Math.round(delta / 60000));
            new Notification(`${e.title} in ${mins} min`, {
              body: `${e.region} · ${e.impact} impact · affects ${e.assets.join(", ")}. Open MarketLab for what to watch for.`,
              tag: e.id,
              icon: "/icon.svg",
            });
            state.markFired(e.id);
          }
        }
      }

      if (state.studyReminder) {
        const today = dayKey();
        const hour = new Date().getHours();
        const studiedToday = useProgress.getState().activeDays.includes(today);
        if (hour >= state.studyHour && state.lastStudyNudge !== today && !studiedToday) {
          new Notification("A few minutes of MarketLab?", {
            body: "One lesson, one chart exercise, or a journal entry. Consistency is what compounds.",
            tag: `study-${today}`,
            icon: "/icon.svg",
          });
          state.markNudged(today);
        }
      }
    }

    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, [
    alerts.hydrated,
    alerts.eventAlerts,
    alerts.studyReminder,
    alerts.leadMinutes,
    alerts.highImpactOnly,
    alerts.studyHour,
    activeDays,
  ]);

  return null;
}
