import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { lookupTerm, slugifyTerm } from "@/content/glossary";
import { GlossaryTerm } from "./GlossaryTerm";

/**
 * Inline markup used throughout lesson content:
 *   [[term]] / [[term|label]]  → contextual glossary link with hover definition
 *   **bold**  *italic*  `code`
 *   [label](https://example.com)
 *   ^up^text^ / ^down^text^    → semantically coloured price language
 *
 * Deliberately tiny. A full markdown parser would let content authors reach for
 * constructs the design system has no answer for.
 */

const TOKEN =
  /(\[\[[^\]]+\]\])|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\^(?:up|down)\^[^^]+\^)/g;

export function renderInline(text: string, keyPrefix = ""): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const raw = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (raw.startsWith("[[")) {
      const inner = raw.slice(2, -2);
      const [termRaw, labelRaw] = inner.split("|");
      const term = termRaw.trim();
      const label = (labelRaw ?? termRaw).trim();
      const entry = lookupTerm(term);
      nodes.push(
        entry ? (
          <GlossaryTerm
            key={key}
            label={label}
            term={entry.term}
            definition={entry.definition}
            href={`/glossary#${slugifyTerm(entry.term)}`}
          />
        ) : (
          // Unknown term: render plainly rather than a dead link. The content
          // audit script flags these at build time.
          <Fragment key={key}>{label}</Fragment>
        ),
      );
    } else if (raw.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (raw.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded border border-line bg-raised px-1 py-0.5 font-mono text-[0.85em] text-ink"
        >
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (raw.startsWith("^")) {
      const dir = raw.startsWith("^up^") ? "up" : "down";
      const body = raw.slice(dir.length + 2, -1);
      nodes.push(
        <span key={key} className={dir === "up" ? "text-up" : "text-down"}>
          {body}
        </span>,
      );
    } else if (raw.startsWith("[")) {
      const cut = raw.indexOf("](");
      const label = raw.slice(1, cut);
      const href = raw.slice(cut + 2, -1);
      const external = /^https?:/.test(href);
      nodes.push(
        <Link
          key={key}
          href={href}
          className="link"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {raw.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + raw.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text)}</span>;
}
