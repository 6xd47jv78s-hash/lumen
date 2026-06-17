import { NextRequest } from "next/server";

/**
 * Auth + entitlement guard.
 *
 * Wire `getUser` to your auth provider (Clerk, Supabase Auth, NextAuth, etc.).
 * Kept provider-agnostic so the API routes don't hard-code one SDK.
 *
 * Returns the signed-in user (with plan) or null.
 */
export interface SessionUser {
  id: string;
  email: string;
  plan: "free" | "pro";
}

export async function getUser(_req: NextRequest): Promise<SessionUser | null> {
  // TODO: replace with your provider, e.g. Clerk:
  //   const { userId } = auth();
  //   if (!userId) return null;
  //   load plan from Subscription table, return { id, email, plan }
  return null;
}

/** Free tier: limited daily generations; pro: unlimited. Enforce here. */
export function withinQuota(_user: SessionUser): boolean {
  // TODO: check a per-user daily counter (Redis / DB) against the plan limit.
  return true;
}
