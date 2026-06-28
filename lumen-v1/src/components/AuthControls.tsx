import { clerkEnabled } from "@/lib/clerk";

/**
 * Sign-in / account controls for the header.
 *
 * Server Component. In dev (no Clerk keys) there is no real auth, so we show a
 * subtle "Dev mode" badge. With real Clerk keys we render Clerk's own buttons:
 * the UserButton when signed in, or Sign in / Sign up when not.
 */
export default async function AuthControls() {
  if (!clerkEnabled) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid var(--line, rgba(255,255,255,0.12))",
          fontSize: 12,
          letterSpacing: "0.02em",
          color: "var(--muted, #9aa0aa)",
          textTransform: "uppercase",
        }}
      >
        Dev mode
      </span>
    );
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { SignInButton, SignUpButton, UserButton } = await import("@clerk/nextjs");
  const { userId } = await auth();

  return userId ? (
    <UserButton />
  ) : (
    <span style={{ display: "flex", gap: 8 }}>
      <SignInButton />
      <SignUpButton />
    </span>
  );
}
