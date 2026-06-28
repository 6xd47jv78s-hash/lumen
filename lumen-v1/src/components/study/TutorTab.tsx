"use client";

// AI Tutor tab — a chat scoped to the current topic. Seeds with an intro line
// and three suggested-prompt chips; on send it appends the user message + a
// "thinking…" placeholder, calls api.tutor with the history (mapping our local
// roles to user/assistant), then swaps the placeholder for the reply. Errors
// are handled gracefully in-line. Ported from renderTutor in the prototype.

import { useEffect, useRef, useState } from "react";
import type { TutorMessage } from "@/lib/types";
import { api } from "@/lib/api-client";
import styles from "./study.module.css";

// Local chat turn. `role` uses the prototype's user/bot; `thinking` marks the
// placeholder bubble shown while we wait for the tutor.
export type ChatMsg = { role: "user" | "bot"; text: string; thinking?: boolean };

const SUGGESTIONS = [
  "Explain this topic simply",
  "Give me a worked example",
  "What do examiners look for?",
];

export default function TutorTab({
  curriculum,
  subject,
  topic,
  messages,
  setMessages,
}: {
  curriculum: string;
  subject: string;
  topic: string;
  messages: ChatMsg[];
  setMessages: (updater: (prev: ChatMsg[]) => ChatMsg[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Keep the conversation pinned to the latest message.
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    // history = real turns only (exclude the thinking placeholder we add next)
    const history: TutorMessage[] = [...messages, { role: "user", text: trimmed }].map(
      (m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })
    );

    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "bot", text: "thinking…", thinking: true },
    ]);
    setDraft("");
    setBusy(true);

    try {
      const { reply } = await api.tutor(curriculum, subject, topic, history);
      setMessages((prev) => [
        ...dropThinking(prev),
        { role: "bot", text: reply || "(no response)" },
      ]);
    } catch {
      setMessages((prev) => [
        ...dropThinking(prev),
        {
          role: "bot",
          text:
            "I couldn't reach the tutor just now — check the connection and try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.tutor}>
      <div className={styles.chat} ref={chatRef}>
        {messages.length === 0 ? (
          <div className={styles.msg + " " + styles.msgBot}>
            Ask me anything about {topic}. I can explain a concept, walk through a
            question, or check your understanding.
          </div>
        ) : null}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              styles.msg +
              " " +
              (m.role === "user" ? styles.msgUser : styles.msgBot) +
              (m.thinking ? " " + styles.msgThinking : "")
            }
          >
            {m.thinking ? (
              <span className={styles.thinkDots}>
                thinking<span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              m.text
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 ? (
        <div className={styles.chips}>
          {SUGGESTIONS.map((p) => (
            <button key={p} onClick={() => send(p)}>
              {p}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.composer}>
        <input
          type="text"
          placeholder={`Ask Lumen about ${topic}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(draft);
          }}
        />
        <button
          className={styles.send}
          aria-label="Send"
          disabled={busy || !draft.trim()}
          onClick={() => send(draft)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function dropThinking(msgs: ChatMsg[]): ChatMsg[] {
  return msgs.filter((m) => !m.thinking);
}
