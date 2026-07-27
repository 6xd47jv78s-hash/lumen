"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Progress persistence.
 *
 * localStorage is deliberate for the MVP: no accounts, no server, nothing to
 * sign up for, and a student's data never leaves their machine. The store is
 * the only place that knows how progress is stored, so swapping in a Prisma /
 * SQLite backend later means reimplementing these actions against an API and
 * leaving every consumer untouched.
 */

export interface LessonRecord {
  completedAt: number;
  /** Correct answers on the attempt that passed the knowledge check. */
  score: number;
  total: number;
  attempts: number;
}

export interface ExerciseRecord {
  attempts: number;
  /** Best score 0-100. */
  best: number;
  lastAt: number;
}

interface ProgressState {
  lessons: Record<string, LessonRecord>;
  exercises: Record<string, ExerciseRecord>;
  /** ISO day strings (local) on which the student did something. */
  activeDays: string[];
  streak: number;
  longestStreak: number;
  lastLesson: string | null;
  hydrated: boolean;

  completeLesson: (slug: string, score: number, total: number) => void;
  recordAttempt: (slug: string) => void;
  recordExercise: (id: string, score: number) => void;
  setLastLesson: (slug: string) => void;
  touch: () => void;
  reset: () => void;
}

export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.round(ms / 86400000);
}

const MAX_DAYS = 180;

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessons: {},
      exercises: {},
      activeDays: [],
      streak: 0,
      longestStreak: 0,
      lastLesson: null,
      hydrated: false,

      touch: () => {
        const today = dayKey();
        const { activeDays, streak, longestStreak } = get();
        const last = activeDays[activeDays.length - 1];
        if (last === today) return;

        const gap = last ? daysBetween(last, today) : Infinity;
        const next = gap === 1 ? streak + 1 : 1;
        set({
          activeDays: [...activeDays, today].slice(-MAX_DAYS),
          streak: next,
          longestStreak: Math.max(longestStreak, next),
        });
      },

      completeLesson: (slug, score, total) => {
        get().touch();
        const prev = get().lessons[slug];
        set({
          lessons: {
            ...get().lessons,
            [slug]: {
              completedAt: Date.now(),
              // Keep the best score if a student revisits a finished lesson.
              score: prev ? Math.max(prev.score, score) : score,
              total,
              attempts: (prev?.attempts ?? 0) + 1,
            },
          },
        });
      },

      recordAttempt: (slug) => {
        const prev = get().lessons[slug];
        if (!prev) return;
        set({ lessons: { ...get().lessons, [slug]: { ...prev, attempts: prev.attempts + 1 } } });
      },

      recordExercise: (id, score) => {
        get().touch();
        const prev = get().exercises[id];
        set({
          exercises: {
            ...get().exercises,
            [id]: {
              attempts: (prev?.attempts ?? 0) + 1,
              best: Math.max(prev?.best ?? 0, score),
              lastAt: Date.now(),
            },
          },
        });
      },

      setLastLesson: (slug) => set({ lastLesson: slug }),

      reset: () =>
        set({
          lessons: {},
          exercises: {},
          activeDays: [],
          streak: 0,
          longestStreak: 0,
          lastLesson: null,
        }),
    }),
    {
      name: "marketlab.progress",
      version: 1,
      partialize: ({ lessons, exercises, activeDays, streak, longestStreak, lastLesson }) => ({
        lessons,
        exercises,
        activeDays,
        streak,
        longestStreak,
        lastLesson,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.hydrated = true;
        // A streak that wasn't continued yesterday or today is over.
        const last = state.activeDays[state.activeDays.length - 1];
        if (last && daysBetween(last, dayKey()) > 1) state.streak = 0;
      },
    },
  ),
);

/** SSR-safe read: returns the fallback until the store has rehydrated. */
export function useHydrated(): boolean {
  return useProgress((s) => s.hydrated);
}
