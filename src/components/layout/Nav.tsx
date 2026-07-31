"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useProgress } from "@/store/progress";
import { useTheme } from "@/store/theme";
import { NextEvent } from "./NextEvent";

const LINKS = [
  { href: "/learn", label: "Courses" },
  { href: "/practice", label: "Practice" },
  { href: "/live", label: "Live" },
  { href: "/watch", label: "Watch" },
  { href: "/news", label: "News" },
  { href: "/glossary", label: "Glossary" },
  { href: "/dashboard", label: "Progress" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[86rem] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="MarketLab home">
          <Mark />
          <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
            Market<span className="text-accent">Lab</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 md:flex" aria-label="Main">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-raised text-ink" : "text-muted hover:bg-raised/60 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <NextEvent />
          <Streak />
          <SearchDialog />
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="btn-ghost h-8 w-8 !px-0 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-surface px-4 py-2 md:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-md px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Mark() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-accent/40 bg-accent-soft">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
        <path d="M4 18l5-6 4 3 7-9" />
      </svg>
    </span>
  );
}

function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggle}
      className="btn-ghost h-8 w-8 !px-0"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
        {mounted && theme === "light" ? (
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        )}
      </svg>
    </button>
  );
}

function Streak() {
  const streak = useProgress((s) => s.streak);
  const hydrated = useProgress((s) => s.hydrated);
  if (!hydrated || streak < 1) return null;
  return (
    <Link
      href="/dashboard"
      title={`${streak}-day streak`}
      className="hidden items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-2xs text-muted transition-colors hover:border-line-strong hover:text-ink sm:flex"
    >
      <span className="text-signal" aria-hidden>
        ▲
      </span>
      <span className="tnum">{streak}d</span>
    </Link>
  );
}
