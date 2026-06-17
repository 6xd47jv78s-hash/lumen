import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { getTopics } from "@/lib/generate";

export const runtime = "nodejs";

const Body = z.object({ curriculum: z.string(), subject: z.string() });

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const { curriculum, subject } = parsed.data;
    return NextResponse.json(await getTopics(curriculum, subject));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "topics_failed" }, { status: 502 });
  }
}
