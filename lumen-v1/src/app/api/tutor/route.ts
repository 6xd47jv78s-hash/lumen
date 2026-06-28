import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser, withinQuota } from "@/lib/auth";
import { getTutorReply } from "@/lib/generate";
import type { TutorMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  curriculum: z.string(),
  subject: z.string(),
  topic: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!withinQuota(user)) return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { curriculum, subject, topic } = parsed.data;
  const messages: TutorMessage[] = parsed.data.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    return NextResponse.json(await getTutorReply(curriculum, subject, topic, messages));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
