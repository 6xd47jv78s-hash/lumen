import type { ReactNode } from "react";
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "Lumen",
  description: "AI study platform — Notes, Flashcards, Quiz, Past Papers, AI Tutor.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 20px",
              borderBottom: "1px solid #eee",
            }}
          >
            <strong style={{ fontSize: 18 }}>Lumen</strong>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {userId ? (
                <UserButton />
              ) : (
                <>
                  <SignInButton />
                  <SignUpButton />
                </>
              )}
            </div>
          </header>
          <main style={{ padding: 20 }}>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
