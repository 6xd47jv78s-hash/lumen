import type { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";

/**
 * Auth + entitlement guard, wired to Clerk.
 *
 * Clerk handles sign-up / sign-in / sessions; here we map the signed-in Clerk
 * identity to our own `User` row (matched by email, created on first sign-in)
 * and read the plan from `Subscription`.
 *
 * Returns the signed-in user (with plan) or null. The `_req` param is unused
 * (Clerk reads the request context itself) but kept so callers need no change.
 */
export interface SessionUser {
  id: string;
  email: string;
  plan: "free" | "pro";
}

export async function getUser(_req?: NextRequest): Promise<SessionUser | null> {
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
