import { NextResponse } from "next/server";
import { clerkEnabled } from "@/lib/clerk";
import { clerkMiddleware } from "@clerk/nextjs/server";

// When real Clerk keys are present, run Clerk's middleware so `auth()` /
// `currentUser()` work in route handlers and server components. With NO Clerk
// keys (dev), we just pass every request through — clerkMiddleware() is only
// CALLED when clerkEnabled, so it never throws in dev.
const handler: any = clerkEnabled ? clerkMiddleware() : () => NextResponse.next();
export default handler;

export const config = {
  matcher: [
    // run on everything except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf)).*)",
    // always run on API routes
    "/(api|trpc)(.*)",
  ],
};
