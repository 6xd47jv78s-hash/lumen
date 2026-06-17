// Drop-in replacement for the prototype's in-browser GEN.* calls.
// The UI keeps its rendering; only the data source changes (browser fetch -> secure API).

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? res.statusText);
  return res.json();
}

export const api = {
  topics: (curriculum: string, subject: string) =>
    post<{ topics: string[]; fromSpec: boolean }>("/api/topics", { curriculum, subject }),

  note: (curriculum: string, subject: string, objectiveId: string) =>
    post<{ body: unknown; status: "verified" | "checked"; check: unknown }>("/api/generate", {
      curriculum, subject, kind: "notes", objectiveId,
    }),

  aux: (curriculum: string, subject: string, topic: string, kind: "cards" | "quiz" | "papers") =>
    post("/api/generate", { curriculum, subject, topic, kind }),
};
