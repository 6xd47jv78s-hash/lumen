import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser, withinQuota } from "@/lib/auth";
import { getObjectiveNote, getAux } from "@/lib/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  curriculum: z.string(),
  subject: z.string(),
  kind: z.enum(["notes", "cards", "quiz", "papers"]),
  topic: z.string().optional(),
  objectiveId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!withinQuota(user)) return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { curriculum, subject, kind, topic, objectiveId } = parsed.data;

  try {
    if (kind === "notes") {
      if (!objectiveId) return NextResponse.json({ error: "objectiveId required" }, { status: 400 });
      return NextResponse.json(await getObjectiveNote(curriculum, subject, objectiveId));
    }
    if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });
    return NextResponse.json(await getAux(curriculum, subject, topic, kind));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
