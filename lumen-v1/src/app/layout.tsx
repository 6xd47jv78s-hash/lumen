import type { ReactNode } from "react";
import "./globals.css";
import { clerkEnabled } from "@/lib/clerk";

export const metadata = {
  title: "Lumen — AI study platform",
  description:
    "Notes, flashcards, quizzes, past papers and an AI tutor, built around your exact course.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tree = (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );

  // Wrap with ClerkProvider only when real Clerk keys are present. In dev the
  // provider is omitted entirely, so Clerk never initialises without keys.
  if (clerkEnabled) {
    const { ClerkProvider } = require("@clerk/nextjs");
    return <ClerkProvider>{tree}</ClerkProvider>;
  }
  return tree;
}
