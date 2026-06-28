// The accuracy contract, ported from the prototype + pipeline. Generation covers
// EXACTLY one objective and omits rather than guesses; the critic grades it.

const NOTE_SCHEMA =
  '{"summary":"1-2 sentence overview","sections":[{"heading":"string","points":["string"]}],' +
  '"keyTerms":[{"term":"string","definition":"string"}],"examTips":["string"]}';

export const prompts = {
  noteSystem: (ctx: string) =>
    `You write accurate, exam-board-appropriate revision notes for ${ctx}. You stay strictly ` +
    `within the given specification objective, use correct terminology, and omit rather than guess.`,

  noteUser: (specRef: string, objective: string) =>
    `Write revision notes covering EXACTLY this specification objective and nothing outside it: ` +
    `[${specRef}] ${objective}. Respond with ONLY valid JSON, no markdown: ${NOTE_SCHEMA}. ` +
    `3-4 sections, 2-4 key terms, 2-3 exam tips. Original wording, factually accurate, plain text only.`,

  criticSystem: (ctx: string) =>
    `You are a meticulous ${ctx} examiner and fact-checker reviewing AI-generated revision notes.`,

  criticUser: (objective: string, noteJson: string) =>
    `Specification objective: ${objective}\n\nNotes under review (JSON): ${noteJson}\n\n` +
    `Check factual accuracy, scope (no drift), and completeness. Respond with ONLY valid JSON: ` +
    `{"verdict":"pass" or "revise","flags":["a specific wrong/out-of-scope/missing point"]}. ` +
    `Use "pass" only if accurate, on-topic and adequately complete.`,

  topicsSystem: () => `You output accurate, concise exam-board syllabus topic lists.`,
  topicsUser: (ctx: string) =>
    `List the main syllabus topics for ${ctx}. Respond with ONLY valid JSON: ` +
    `{"topics":["Topic name"]}. 10-16 concise topic titles covering the whole course. No numbering.`,

  // ---- whole-topic notes (no manifest objective; topic-scoped) ----
  topicNoteSystem: (ctx: string) =>
    `You are Lumen, an expert ${ctx} tutor. Write accurate, exam-board-appropriate revision notes. Be precise and concise.`,

  topicNoteUser: (ctx: string, topic: string) =>
    `Create revision notes for the topic "${topic}" in ${ctx}. Respond with ONLY valid JSON, no markdown: ${NOTE_SCHEMA}. ` +
    `3-4 sections, 3-5 points each, 3-4 key terms, 2-3 exam tips. Plain text only.`,

  criticUserTopic: (topic: string, noteJson: string) =>
    `Topic: ${topic}\n\nNotes under review (JSON): ${noteJson}\n\n` +
    `Check factual accuracy, scope (stays on the topic, no drift), and completeness. Respond with ONLY valid JSON: ` +
    `{"verdict":"pass" or "revise","flags":["a specific wrong/out-of-scope/missing point"]}. ` +
    `Use "pass" only if accurate, on-topic and adequately complete.`,

  // ---- AI tutor (multi-turn chat) ----
  tutorSystem: (ctx: string, topic: string) =>
    `You are Lumen, a friendly and accurate ${ctx} tutor helping a student with the topic "${topic}". ` +
    `Keep answers concise, correct and exam-focused, using proper terminology for this level. Use short paragraphs.`,

  auxSystem: (ctx: string, kind: string) => `You are an expert ${ctx} tutor producing ${kind}.`,
  auxUser: (ctx: string, topic: string, kind: string) => {
    switch (kind) {
      case "cards":
        return `Create 8 flashcards for "${topic}" in ${ctx}. ONLY JSON: {"cards":[{"front":"","back":""}]}.`;
      case "quiz":
        return `Create 5 MCQs for "${topic}" in ${ctx}. ONLY JSON: {"questions":[{"q":"","options":["","","",""],"answer":0,"explanation":""}]}.`;
      case "papers":
        return `Create 2 exam-style questions for "${topic}" in ${ctx}. ONLY JSON: {"questions":[{"question":"","marks":6,"markScheme":[""]}]}.`;
      default:
        return `Create study material for "${topic}" in ${ctx}. Respond with ONLY valid JSON.`;
    }
  },
};
