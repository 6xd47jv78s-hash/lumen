import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// GET: return the signed-in student's saved course selection.
export async function GET(req: NextRequest) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const full = await prisma.user.findUnique({ where: { id: u.id } });
  return NextResponse.json({
    curriculum: full?.curriculum ?? null,
    subjects: full?.subjects ?? [],
  });
}

const Body = z.object({
  curriculum: z.string(),
  subjects: z.array(z.string()),
});

// POST: persist the chosen curriculum + subjects.
export async function POST(req: NextRequest) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { curriculum, subjects } = parsed.data;

  await prisma.user.update({
    where: { id: u.id },
    data: { curriculum, subjects },
  });
  return NextResponse.json({ ok: true });
}
