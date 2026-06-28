import type { NextRequest } from "next/server";
import { clerkEnabled } from "./clerk";
import { prisma } from "./db";

/**
 * Auth + entitlement guard.
 *
 * Two modes, chosen automatically:
 *
 *  - DEV (no real Clerk keys): there is no sign-in. We upsert a single shared
 *    "Dev User" row and return it, so every API route succeeds and the app is
 *    fully usable while you build. See `clerkEnabled` in ./clerk.
 *
 *  - PROD (real Clerk keys present): Clerk handles sign-up / sign-in / sessions.
 *    Here we map the signed-in Clerk identity to our own `User` row (matched by
 *    email, created on first sign-in) and read the plan from `Subscription`.
 *
 * Returns the signed-in user (with plan) or null. The `_req` param is unused
 * (Clerk reads the request context itself) but kept so callers using
 * `getUser(req)` need no change.
 */
export interface SessionUser {
  id: string;
  email: string;
  plan: "free" | "pro";
}

export async function getUser(_req?: NextRequest): Promise<SessionUser | null> {
  // --- Dev mode: no Clerk, no sign-in. Always return the shared dev user. ---
  if (!clerkEnabled) {
    const user = await prisma.user.upsert({
      where: { email: "dev@lumen.local" },
      update: {},
      create: { email: "dev@lumen.local", name: "Dev User" },
      include: { subscription: true },
    });

    return {
      id: user.id,
      email: user.email,
      plan: user.subscription?.plan === "pro" ? "pro" : "free",
    };
  }

  // --- Real auth: resolve the signed-in Clerk identity to our DB user. ---
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ?? cu?.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  const name = [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") || null;

  // find-or-create our DB user for this Clerk identity, and read the plan
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name },
    include: { subscription: true },
  });

  return {
    id: user.id,
    email: user.email,
    plan: user.subscription?.plan === "pro" ? "pro" : "free",
  };
}

/** Free tier: limited daily generations; pro: unlimited. Enforce here. */
export function withinQuota(_user: SessionUser): boolean {
  // TODO: check a per-user daily counter (Redis / DB) against the plan limit.
  return true;
}
