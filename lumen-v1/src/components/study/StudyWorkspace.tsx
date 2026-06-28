"use client";

// StudyWorkspace — the interactive study app (client). Holds all UI state:
//   • which subjects are expanded in the sidebar + their resolved topic lists
//   • the active subject / topic / tab
//   • a per-(subject+topic+tab) cache of fetched content so switching is instant
//   • per-(subject+topic) tutor chat history
//   • mobile sidebar open/close
// The five tab panels live in sibling components; this file owns the topbar,
// sidebar (subject tree + topic resolution) and main-panel orchestration.
//
// Ported from the #app shell of lumen-study.html. Topic resolution mirrors
// resolveTopics(): instant via seedTopics(), else api.topics() with a shimmer
// while generating and a retry on error.

import { useState } from "react";
import Link from "next/link";
import { seedTopics, subjColor, slug, label, TABS } from "@/lib/curriculum";
import { api } from "@/lib/api-client";
import styles from "./study.module.css";
import NotesTab from "./NotesTab";
import FlashcardsTab from "./FlashcardsTab";
import QuizTab from "./QuizTab";
import PapersTab from "./PapersTab";
import TutorTab, { type ChatMsg } from "./TutorTab";

// Topic resolution state for a subject.
type TopicState = {
  topics?: string[];
  loading?: boolean;
  error?: boolean;
};

// A cache cell for a generated tab (notes/cards/quiz/papers).
type Cell = { data?: any; error?: boolean };

export default function StudyWorkspace({
  curriculum,
  subjects,
  email,
}: {
  curriculum: string;
  subjects: string[];
  email: string;
}) {
  // sidebar: which subjects are open, and the resolved topics per subject
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [topicState, setTopicState] = useState<Record<string, TopicState>>({});

  // active selection
  const [subject, setSubject] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("notes");

  // per-tab content cache (notes/cards/quiz/papers), keyed by subject+topic+tab
  const [cache, setCache] = useState<Record<string, Cell>>({});
  // tutor chats keyed by subject+topic
  const [chats, setChats] = useState<Record<string, ChatMsg[]>>({});

  // mobile sidebar
  const [menu, setMenu] = useState(false);

  /* -------------------------------------------------- topic resolution --- */
  function resolveTopics(s: string) {
    // already resolved or in flight
    const cur = topicState[s];
    if (cur?.topics || cur?.loading) return;

    const seed = seedTopics(s);
    if (seed) {
      setTopicState((t) => ({ ...t, [s]: { topics: seed } }));
      return;
    }

    setTopicState((t) => ({ ...t, [s]: { loading: true } }));
    api
      .topics(curriculum, s)
      .then((res) => {
        setTopicState((t) => ({ ...t, [s]: { topics: res.topics || [] } }));
      })
      .catch(() => {
        setTopicState((t) => ({ ...t, [s]: { error: true } }));
      });
  }

  function toggleSubject(s: string) {
    const willOpen = !open[s];
    setOpen((o) => ({ ...o, [s]: willOpen }));
    if (willOpen) resolveTopics(s);
  }

  function pickTopic(s: string, t: string) {
    setSubject(s);
    setTopic(t);
    setTab("notes");
    setMenu(false);
    // scroll main panel to top
    const main = document.getElementById("studyMain");
    if (main) main.scrollTop = 0;
  }

  /* ---------------------------------------------------------- render ---- */
  const sc = subject ? subjColor(subject) : "var(--gold)";
  const cacheKey =
    subject && topic
      ? `${slug(curriculum)}:${slug(subject)}:${slug(topic)}:${tab}`
      : "";
  const chatKey =
    subject && topic ? `${slug(curriculum)}:${slug(subject)}:${slug(topic)}` : "";

  const count = subjects.length;

  return (
    <div className={styles.app}>
      {/* ---------------------------------------------------- topbar --- */}
      <div className={styles.topbar}>
        <div className={styles.tbLeft}>
          <button
            className={styles.menuBtn}
            aria-label="Toggle subjects"
            onClick={() => setMenu((m) => !m)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="brand">
            <span className="monogram">L</span>
            <span className="brand-name">Lumen</span>
            <span className="brand-sub">{curriculum}</span>
          </div>
        </div>
        <div className={styles.tbRight}>
          <span className="pill">
            {count} subject{count === 1 ? "" : "s"}
          </span>
          <Link className="link-btn" href="/onboarding">
            Change subjects
          </Link>
          <span className={styles.tbEmail}>{email}</span>
        </div>
      </div>

      {menu ? (
        <div
          className={styles.scrim + " " + styles.show}
          onClick={() => setMenu(false)}
        />
      ) : null}

      <div className={styles.shell}>
        {/* ------------------------------------------------ sidebar --- */}
        <aside className={styles.sidebar + (menu ? " " + styles.open : "")}>
          <div className={styles.sideH}>Your subjects</div>
          {subjects.map((s) => (
            <SubjectBlock
              key={s}
              subject={s}
              color={subjColor(s)}
              expanded={!!open[s]}
              state={topicState[s]}
              activeSubject={subject}
              activeTopic={topic}
              onToggle={() => toggleSubject(s)}
              onRetry={() => {
                setTopicState((t) => {
                  const next = { ...t };
                  delete next[s];
                  return next;
                });
                resolveTopics(s);
              }}
              onPickTopic={(t) => pickTopic(s, t)}
            />
          ))}
        </aside>

        {/* --------------------------------------------------- main --- */}
        <main
          className={styles.main}
          id="studyMain"
          style={{ ["--sc" as string]: sc }}
        >
          <div className={styles.mainInner}>
            {!subject || !topic ? (
              <EmptyState curriculum={curriculum} />
            ) : (
              <>
                <div className={styles.topicHeader}>
                  <div className={styles.tag}>
                    <span className={styles.dot} />
                    {label(curriculum, subject)} · {curriculum}
                  </div>
                  <h2>{topic}</h2>
                </div>

                <div className={styles.tabbar} role="tablist">
                  {TABS.map(([slugId, name]) => (
                    <button
                      key={slugId}
                      role="tab"
                      aria-selected={tab === slugId}
                      className={styles.tab + (tab === slugId ? " " + styles.active : "")}
                      onClick={() => setTab(slugId)}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className={styles.panel} key={cacheKey}>
                  {tab === "notes" && (
                    <NotesTab
                      curriculum={curriculum}
                      subject={subject}
                      topic={topic}
                      cacheKey={cacheKey}
                      cache={cache}
                      setCache={setCache}
                    />
                  )}
                  {tab === "cards" && (
                    <FlashcardsTab
                      curriculum={curriculum}
                      subject={subject}
                      topic={topic}
                      cacheKey={cacheKey}
                      cache={cache}
                      setCache={setCache}
                    />
                  )}
                  {tab === "quiz" && (
                    <QuizTab
                      curriculum={curriculum}
                      subject={subject}
                      topic={topic}
                      cacheKey={cacheKey}
                      cache={cache}
                      setCache={setCache}
                    />
                  )}
                  {tab === "papers" && (
                    <PapersTab
                      curriculum={curriculum}
                      subject={subject}
                      topic={topic}
                      cacheKey={cacheKey}
                      cache={cache}
                      setCache={setCache}
                    />
                  )}
                  {tab === "tutor" && (
                    <TutorTab
                      curriculum={curriculum}
                      subject={subject}
                      topic={topic}
                      messages={chats[chatKey] ?? []}
                      setMessages={(updater) =>
                        setChats((c) => ({
                          ...c,
                          [chatKey]: updater(c[chatKey] ?? []),
                        }))
                      }
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Sidebar subject block: header (dot + name + caret) and topic list with    */
/* shimmer-while-loading / retry-on-error, ported from resolveTopics().      */
/* ===================================================================== */
function SubjectBlock({
  subject,
  color,
  expanded,
  state,
  activeSubject,
  activeTopic,
  onToggle,
  onRetry,
  onPickTopic,
}: {
  subject: string;
  color: string;
  expanded: boolean;
  state?: TopicState;
  activeSubject: string | null;
  activeTopic: string | null;
  onToggle: () => void;
  onRetry: () => void;
  onPickTopic: (t: string) => void;
}) {
  return (
    <div className={styles.subjBlock} style={{ ["--sc" as string]: color }}>
      <button
        className={styles.subjHead + (expanded ? " " + styles.open : "")}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className={styles.dot} />
        <span>{subject}</span>
        <span className={styles.caret} aria-hidden="true">
          ▶
        </span>
      </button>

      <div className={styles.topicList + (expanded ? " " + styles.open : "")}>
        <div className={styles.topicListInner}>
          {state?.loading ? (
            <div>
              <div className={styles.topicLoad}>
                <span className="spark" /> generating topics…
              </div>
              {[78, 64, 70].map((w, i) => (
                <div
                  className={"shimmer " + styles.shimLine}
                  key={i}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : state?.error ? (
            <div className={styles.topicRetry}>
              <button onClick={onRetry}>Couldn&rsquo;t load — retry</button>
            </div>
          ) : (
            (state?.topics ?? []).map((t) => {
              const active = activeSubject === subject && activeTopic === t;
              return (
                <button
                  key={t}
                  className={styles.topicItem + (active ? " " + styles.active : "")}
                  onClick={() => onPickTopic(t)}
                >
                  {t}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ empty ---- */
function EmptyState({ curriculum }: { curriculum: string }) {
  return (
    <div className={styles.empty}>
      <div className="orb" />
      <h2>Pick a topic to begin</h2>
      <p>
        Open one of your subjects on the left and choose a topic. Lumen will light
        up its notes, flashcards, quiz, past papers and tutor — built for{" "}
        {curriculum}.
      </p>
    </div>
  );
}
