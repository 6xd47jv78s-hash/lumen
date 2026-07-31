"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  /** True once the persisted value has been rehydrated on the client. */
  ready: boolean;
  toggle: () => void;
  set: (t: Theme) => void;
}

export const THEME_KEY = "marketlab.theme";

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      ready: false,
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
      set: (t) => {
        applyTheme(t);
        set({ theme: t });
      },
    }),
    {
      name: THEME_KEY,
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          state.ready = true;
        }
      },
    },
  ),
);

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  // Light is the opt-in class, not dark — see the note in globals.css. Anything
  // that renders without the boot script must land on dark, the real default.
  document.documentElement.classList.toggle("light", t === "light");
  document.documentElement.style.colorScheme = t;
  // Charts read their palette from CSS variables; tell them to re-read.
  window.dispatchEvent(new CustomEvent("marketlab:theme", { detail: t }));
}

/**
 * Runs before first paint so a returning light-mode user never sees a dark
 * flash. Kept in sync with THEME_KEY above.
 *
 * It only ever *adds* the light class. If it throws, or never runs at all, the
 * page stays dark — which is the default anyway, so the failure is invisible
 * rather than a full inversion.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_KEY}');var t=s?JSON.parse(s).state.theme:'dark';if(t==='light'){document.documentElement.classList.add('light');}document.documentElement.style.colorScheme=t;}catch(e){}})();`;
