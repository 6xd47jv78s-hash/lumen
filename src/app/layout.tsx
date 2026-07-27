import type { Metadata } from "next";
import Link from "next/link";
import { AlertRunner } from "@/components/alerts/AlertRunner";
import { Nav } from "@/components/layout/Nav";
import { THEME_BOOT_SCRIPT } from "@/store/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MarketLab — learn how markets actually work",
    template: "%s · MarketLab",
  },
  description:
    "A serious, free course in reading financial markets: chart reading, strategy, risk management and market psychology, taught to a professional standard for 14–18 year olds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <AlertRunner />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[86rem] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-ink">MarketLab</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            A free, serious education in how financial markets work — built so that when you&rsquo;re
            old enough to trade, you aren&rsquo;t starting from zero.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow">Learn</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["/learn", "All courses"],
              ["/practice", "Chart practice"],
              ["/watch", "Market Watch"],
              ["/news", "Market news"],
              ["/glossary", "Glossary"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-muted transition-colors hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Important</p>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            MarketLab is educational material, not financial advice. Nothing here is a
            recommendation to buy or sell anything. All charts are generated for teaching and do
            not represent real historical prices. You must be 18 or over to open a brokerage
            account in most countries — the point of learning now is to be ready then.
          </p>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-2xs leading-relaxed text-faint sm:px-6">
        Progress is stored locally in your browser. Nothing is uploaded anywhere.
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> · </span>
        Charts powered by{" "}
        <a
          href="https://www.tradingview.com/lightweight-charts/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line-strong underline-offset-2 hover:text-muted"
        >
          Lightweight Charts™ by TradingView
        </a>
        .
      </div>
    </footer>
  );
}
