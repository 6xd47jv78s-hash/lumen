// Study workspace — SERVER component.
// Guards the route: a signed-in user with a saved curriculum + subjects gets the
// interactive workspace; anyone else is sent to onboarding to set up their course.

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StudyWorkspace from "@/components/study/StudyWorkspace";

export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const u = await getUser();
  if (!u) redirect("/onboarding");

  const full = await prisma.user.findUnique({ where: { id: u.id } });
  const curriculum = full?.curriculum ?? null;
  const subjects = full?.subjects ?? [];

  if (!curriculum || !subjects.length) redirect("/onboarding");

  return (
    <StudyWorkspace curriculum={curriculum} subjects={subjects} email={u.email} />
  );
}
