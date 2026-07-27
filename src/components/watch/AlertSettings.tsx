"use client";

import { useEffect, useState } from "react";
import type { MarketEvent } from "@/content/events";
import { notificationState, useAlerts, type NotificationState } from "@/store/alerts";

const LEADS = [10, 30, 60, 120];

export function AlertSettings({ events }: { events: MarketEvent[] }) {
  const a = useAlerts();
  const [perm, setPerm] = useState<NotificationState>("unsupported");
  const [open, setOpen] = useState(false);

  useEffect(() => setPerm(notificationState()), []);

  async function enable() {
    if (perm === "unsupported") return;
    if (perm !== "granted") {
      const result = await Notification.requestPermission();
      setPerm(result as NotificationState);
      if (result !== "granted") return;
    }
    a.set({ eventAlerts: true });
  }

  if (!a.hydrated) return null;

  const watched = events.filter((e) => !a.highImpactOnly || e.impact === "high").length;

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
      >
        <span
          aria-hidden
          className={`h-2 w-2 shrink-0 rounded-full ${
            a.eventAlerts && perm === "granted" ? "bg-up" : "bg-line-strong"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">Alerts</span>
          <span className="mt-0.5 block text-xs text-muted">
            {a.eventAlerts && perm === "granted"
              ? `On — ${a.leadMinutes} min before ${a.highImpactOnly ? "high-impact" : "all"} events`
              : "Off — get a reminder before scheduled events, and a nudge to keep studying"}
          </span>
        </span>
        <span className="shrink-0 text-xs text-accent">{open ? "Close" : "Configure"}</span>
      </button>

      {open && (
        <div className="animate-fade-up space-y-5 border-t border-line px-5 py-5">
          <div className="rounded-md border border-signal/40 bg-signal/[0.07] px-3.5 py-3">
            <p className="eyebrow text-signal">What these alerts are</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
              A reminder that a <strong>scheduled event</strong> is about to happen, so you know
              when markets are likely to move — and, if you ever hold a position, when to have
              decided what you&rsquo;re doing about it. They will never tell you to buy or sell
              anything. Nobody who does that has any idea what your situation is.
            </p>
          </div>

          {/* -------------------------------------------------- event alerts */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Event reminders</p>
                <p className="mt-0.5 text-xs text-muted">
                  {watched} matching {watched === 1 ? "event" : "events"} in the next 45 days
                </p>
              </div>
              {perm === "unsupported" ? (
                <span className="shrink-0 font-mono text-2xs text-faint">not supported</span>
              ) : perm === "denied" ? (
                <span className="shrink-0 font-mono text-2xs text-down">blocked in browser</span>
              ) : (
                <Toggle
                  on={a.eventAlerts && perm === "granted"}
                  onChange={(v) => (v ? enable() : a.set({ eventAlerts: false }))}
                  label="Event reminders"
                />
              )}
            </div>

            {a.eventAlerts && (
              <div className="mt-3.5 space-y-3">
                <div>
                  <p className="eyebrow mb-1.5">Warning time</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LEADS.map((m) => (
                      <button
                        key={m}
                        onClick={() => a.set({ leadMinutes: m })}
                        className={`rounded-md border px-2.5 py-1.5 font-mono text-xs tnum transition-colors ${
                          a.leadMinutes === m
                            ? "border-accent/50 bg-accent-soft text-ink"
                            : "border-line bg-raised text-muted hover:border-line-strong"
                        }`}
                      >
                        {m < 60 ? `${m} min` : `${m / 60} hr`}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={a.highImpactOnly}
                    onChange={(e) => a.set({ highImpactOnly: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[rgb(var(--c-accent))]"
                  />
                  High-impact events only
                </label>
              </div>
            )}
          </div>

          {/* ------------------------------------------------ study reminder */}
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Daily study nudge</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  A reminder to do a lesson or write up your journal, if you haven&rsquo;t studied
                  that day. Consistency is the thing that compounds.
                </p>
              </div>
              {perm !== "unsupported" && perm !== "denied" && (
                <Toggle
                  on={a.studyReminder}
                  onChange={async (v) => {
                    if (v && perm !== "granted") {
                      const r = await Notification.requestPermission();
                      setPerm(r as NotificationState);
                      if (r !== "granted") return;
                    }
                    a.set({ studyReminder: v });
                  }}
                  label="Daily study nudge"
                />
              )}
            </div>

            {a.studyReminder && (
              <div className="mt-3">
                <label className="eyebrow mb-1.5 block" htmlFor="study-hour">
                  Time of day
                </label>
                <select
                  id="study-hour"
                  value={a.studyHour}
                  onChange={(e) => a.set({ studyHour: Number(e.target.value) })}
                  className="rounded-md border border-line bg-raised px-2.5 py-1.5 font-mono text-xs text-ink tnum"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <p className="border-t border-line pt-4 text-xs leading-relaxed text-faint">
            Alerts are delivered by your browser and only fire while a MarketLab tab is open —
            there is no push server and nothing about you is sent anywhere. Preferences are stored
            locally, like the rest of your progress.
          </p>
        </div>
      )}
    </section>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        on ? "border-accent bg-accent" : "border-line-strong bg-raised"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
          on ? "left-[1.55rem] bg-white" : "left-[0.15rem] bg-line-strong"
        }`}
      />
    </button>
  );
}
