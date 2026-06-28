// Shared content types for Lumen. These are the contract between the API
// routes, the generation pipeline, the browser api-client, and the UI.
// Do NOT change a shape here without updating its counterpart in the
// pipeline (config.py NOTE_SCHEMA) and the note renderer.

/** A single AI-written / verified revision note for a topic or objective. */
export interface NoteBody {
  summary: string;
  sections: { heading: string; points: string[] }[];
  keyTerms: { term: string; definition: string }[];
  examTips: string[];
}

/** Result of the critic model reviewing a draft note. */
export interface NoteCheck {
  verdict: "pass" | "revise";
  flags?: string[];
}

/**
 * What the app shows for a note.
 * - "verified": human-approved (gold badge)
 * - "checked":  AI written + self-critique passed
 * - "flagged":  critic asked for a revision
 */
export interface NoteResult {
  note: NoteBody;
  status: "verified" | "checked" | "flagged" | string;
  check?: NoteCheck | null;
}

/** Flashcards. */
export interface Flashcard {
  front: string;
  back: string;
}
export interface CardsResult {
  cards: Flashcard[];
}

/** Multiple-choice quiz. `answer` is the 0-based index of the correct option. */
export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface QuizResult {
  questions: QuizQuestion[];
}

/** Exam-style past-paper practice questions with a mark scheme. */
export interface PaperQuestion {
  question: string;
  marks: number;
  markScheme: string[];
}
export interface PapersResult {
  questions: PaperQuestion[];
}

/**
 * Topic list for a subject.
 * `fromSpec` is true when the topics come from a seeded specification in the DB
 * (the verified source of truth) rather than being generated on demand.
 */
export interface TopicsResult {
  topics: string[];
  fromSpec: boolean;
}

/** A single turn in an AI Tutor conversation. */
export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}
export interface TutorResult {
  reply: string;
}

/** The signed-in student's saved course selection. */
export interface Account {
  curriculum: string | null;
  subjects: string[];
}
