"use client";

import { useEffect } from "react";
import { applyTheme, useTheme } from "@/store/theme";

/**
 * Re-applies the theme class after React has rendered.
 *
 * The pre-paint boot script in the root layout sets the class before first
 * paint, and on ordinary pages that is the end of it — the root layout's
 * `<html suppressHydrationWarning>` stops React from touching the attribute it
 * doesn't know about.
 *
 * `notFound()` from a nested route is the exception. Next renders it inside its
 * own `__next_error__` document, whose `<html>` carries no suppression, so
 * React resets `className` and takes the theme class with it. The store has
 * rehydrated correctly by then — only the DOM is wrong — so re-applying in an
 * effect, which runs after render, is enough to repair it.
 */
export function ThemeSync() {
  const theme = useTheme((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}
