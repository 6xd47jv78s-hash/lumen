"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Alert preferences.
 *
 * What these alerts are: a reminder that a scheduled, market-moving event is
 * about to happen, and a nudge to keep up the study habit. What they are
 * explicitly not: a signal to buy or sell anything. That distinction is the
 * reason this feature is built the way it is — see /watch.
 *
 * Delivery is browser Notifications while a MarketLab tab is open. There is no
 * service worker and no push server, so nothing fires when the site is closed.
 * That limitation is stated in the UI rather than hidden.
 */
interface AlertState {
  /** Master switch for event reminders. */
  eventAlerts: boolean;
  /** Minutes of warning before an event. */
  leadMinutes: number;
  /** Only alert on high-impact events. */
  highImpactOnly: boolean;
  /** Daily nudge to journal / do a lesson if there's been no activity. */
  studyReminder: boolean;
  /** Local hour (0-23) for the study nudge. */
  studyHour: number;
  /** Event ids already notified, so a reminder never repeats. */
  fired: string[];
  /** Day key of the last study nudge. */
  lastStudyNudge: string | null;
  hydrated: boolean;

  set: (patch: Partial<Omit<AlertState, "set" | "markFired" | "markNudged">>) => void;
  markFired: (id: string) => void;
  markNudged: (day: string) => void;
}

export const useAlerts = create<AlertState>()(
  persist(
    (set, get) => ({
      eventAlerts: false,
      leadMinutes: 30,
      highImpactOnly: true,
      studyReminder: false,
      studyHour: 18,
      fired: [],
      lastStudyNudge: null,
      hydrated: false,

      set: (patch) => set(patch),
      // Keep the fired list bounded — it only needs to cover the live window.
      markFired: (id) => set({ fired: [...get().fired, id].slice(-80) }),
      markNudged: (day) => set({ lastStudyNudge: day }),
    }),
    {
      name: "marketlab.alerts",
      partialize: ({
        eventAlerts,
        leadMinutes,
        highImpactOnly,
        studyReminder,
        studyHour,
        fired,
        lastStudyNudge,
      }) => ({
        eventAlerts,
        leadMinutes,
        highImpactOnly,
        studyReminder,
        studyHour,
        fired,
        lastStudyNudge,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export type NotificationState = "unsupported" | "default" | "granted" | "denied";

export function notificationState(): NotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as NotificationState;
}
