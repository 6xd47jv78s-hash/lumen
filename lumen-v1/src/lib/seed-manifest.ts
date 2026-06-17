// Seed the spec structure + verified notes into Postgres from a pipeline manifest.json.
// This is the production equivalent of the prototype's "Import verified notes".
//
//   npx tsx src/lib/seed-manifest.ts ./manifest.json

import { PrismaClient, NoteStatus } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

type Obj = { spec_ref: string; objective: string; status: string; note?: unknown };
type Manifest = {
  curriculum: string;
  board: string;
  subjects: Record<string, Record<string, Obj[]>>;
};

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("usage: tsx seed-manifest.ts <manifest.json>");
  const m: Manifest = JSON.parse(readFileSync(file, "utf-8"));

  for (const [subjectName, topics] of Object.entries(m.subjects)) {
    const subject = await prisma.subject.upsert({
      where: { curriculum_board_name: { curriculum: m.curriculum, board: m.board, name: subjectName } },
      update: {},
      create: { curriculum: m.curriculum, board: m.board, name: subjectName },
    });

    let tOrder = 0;
    for (const [topicName, objectives] of Object.entries(topics)) {
      const topic = await prisma.topic.upsert({
        where: { subjectId_name: { subjectId: subject.id, name: topicName } },
        update: { order: tOrder },
        create: { subjectId: subject.id, name: topicName, order: tOrder },
      });
      tOrder++;

      let oOrder = 0;
      for (const o of objectives) {
        const objective = await prisma.objective.upsert({
          where: { topicId_specRef: { topicId: topic.id, specRef: o.spec_ref } },
          update: { text: o.objective, order: oOrder },
          create: { topicId: topic.id, specRef: o.spec_ref, text: o.objective, order: oOrder },
        });
        oOrder++;

        if (o.status === "approved" && o.note) {
          await prisma.note.upsert({
            where: { objectiveId: objective.id },
            update: { body: o.note as any, status: NoteStatus.APPROVED },
            create: { objectiveId: objective.id, body: o.note as any, status: NoteStatus.APPROVED },
          });
        }
      }
    }
    console.log(`seeded ${subjectName}: ${Object.keys(topics).length} topics`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
