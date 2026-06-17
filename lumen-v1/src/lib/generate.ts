import { PrismaClient } from "@prisma/client";
import { callModel, parseJson, MODELS } from "./anthropic";
import { prompts } from "./prompts";

const prisma = new PrismaClient();

function ctx(curriculum: string, subject: string) {
  return subject.startsWith(curriculum) ? subject : `${curriculum} ${subject}`;
}

// ---- notes (objective level): verified-from-DB, else generate + critic + cache ----
export async function getObjectiveNote(curriculum: string, subject: string, objectiveId: string) {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: { note: true },
  });
  if (!objective) throw new Error("objective not found");

  // human-approved note wins — instant, trusted, no generation
  if (objective.note?.status === "APPROVED") {
    return { body: objective.note.body, status: "verified", check: objective.note.check };
  }
  // reuse an existing draft instead of regenerating
  if (objective.note) {
    return { body: objective.note.body, status: "checked", check: objective.note.check };
  }

  const c = ctx(curriculum, subject);
  const raw = await callModel(MODELS.gen, prompts.noteSystem(c), prompts.noteUser(objective.specRef, objective.text));
  const body = parseJson(raw);

  // live self-critique with a different model
  let check: unknown = null;
  try {
    const cr = await callModel(MODELS.critic, prompts.criticSystem(c), prompts.criticUser(objective.text, JSON.stringify(body)));
    check = parseJson(cr);
  } catch {
    /* critic best-effort */
  }

  const status = (check as any)?.verdict === "revise" ? "FLAGGED" : "DRAFT";
  await prisma.note.create({
    data: {
      objectiveId,
      body: body as any,
      status: status as any,
      generatedBy: MODELS.gen,
      verifiedBy: MODELS.critic,
      check: check as any,
    },
  });
  return { body, status: "checked", check };
}

// ---- aux tabs + topic lists: cache by scope key --------------------------
export async function getCached(scopeKey: string, kind: string, produce: () => Promise<unknown>) {
  const hit = await prisma.generationCache.findUnique({ where: { scopeKey } });
  if (hit) return hit.payload;
  const payload = await produce();
  await prisma.generationCache.create({ data: { scopeKey, kind, payload: payload as any } });
  return payload;
}

export async function getTopics(curriculum: string, subject: string) {
  // manifest-backed subject? return its topics from the DB (single source of truth)
  const subj = await prisma.subject.findFirst({
    where: { curriculum, name: subject },
    include: { topics: { orderBy: { order: "asc" } } },
  });
  if (subj && subj.topics.length) return { topics: subj.topics.map((t) => t.name), fromSpec: true };

  const c = ctx(curriculum, subject);
  const topics = await getCached(`${curriculum}|${subject}|topics`, "topics", async () =>
    parseJson(await callModel(MODELS.gen, prompts.topicsSystem(), prompts.topicsUser(c)))
  );
  return { ...(topics as object), fromSpec: false };
}

export async function getAux(curriculum: string, subject: string, topic: string, kind: "cards" | "quiz" | "papers") {
  const c = ctx(curriculum, subject);
  return getCached(`${curriculum}|${subject}|${topic}|${kind}`, kind, async () =>
    parseJson(await callModel(MODELS.gen, prompts.auxSystem(c, kind), prompts.auxUser(c, topic, kind)))
  );
}
