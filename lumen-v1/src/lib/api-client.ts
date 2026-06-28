// Browser-side API client. Drop-in replacement for the prototype's in-browser
// GEN.* calls: the UI keeps its rendering, only the data source changes (browser
// fetch -> secure server-side API). The Anthropic key never touches the client.

import type {
  TopicsResult,
  NoteResult,
  CardsResult,
  QuizResult,
  PapersResult,
  TutorMessage,
  Account,
} from "@/lib/types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.json();
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.json();
}

export const api = {
  // Topic list for a subject (from seeded spec, or generated + cached).
  topics: (curriculum: string, subject: string) =>
    post<TopicsResult>("/api/topics", { curriculum, subject }),

  // A single AI note for a whole topic (+ self-check).
  topicNote: (curriculum: string, subject: string, topic: string) =>
    post<NoteResult>("/api/generate", { curriculum, subject, kind: "notes", topic }),

  // A note scoped to one seeded specification objective.
  objectiveNote: (curriculum: string, subject: string, objectiveId: string) =>
    post<NoteResult>("/api/generate", { curriculum, subject, kind: "notes", objectiveId }),

  // Flashcards / quiz / past papers for a topic.
  aux: (
    curriculum: string,
    subject: string,
    topic: string,
    kind: "cards" | "quiz" | "papers"
  ) =>
    post<CardsResult | QuizResult | PapersResult>("/api/generate", {
      curriculum,
      subject,
      kind,
      topic,
    }),

  // Multi-turn AI Tutor.
  tutor: (
    curriculum: string,
    subject: string,
    topic: string,
    messages: TutorMessage[]
  ) => post<{ reply: string }>("/api/tutor", { curriculum, subject, topic, messages }),

  // Saved course selection.
  getAccount: () => get<Account>("/api/account"),

  saveAccount: (curriculum: string, subjects: string[]) =>
    post<{ ok: true }>("/api/account", { curriculum, subjects }),
};
