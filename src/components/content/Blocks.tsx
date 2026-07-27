import type { Block } from "@/lib/content/types";
import { ChartBlock } from "@/components/chart/ChartBlock";
import { ExerciseBlock } from "@/components/exercise/ExerciseBlock";
import { renderInline } from "./RichText";

const CALLOUT: Record<
  string,
  { label: string; ring: string; bg: string; text: string; glyph: string }
> = {
  key: {
    label: "Key takeaway",
    ring: "border-accent/45",
    bg: "bg-accent-soft/60",
    text: "text-accent",
    glyph: "◆",
  },
  warn: {
    label: "Where people get hurt",
    ring: "border-down/40",
    bg: "bg-down/[0.07]",
    text: "text-down",
    glyph: "▲",
  },
  note: {
    label: "Worth knowing",
    ring: "border-line-strong",
    bg: "bg-raised",
    text: "text-muted",
    glyph: "●",
  },
  desk: {
    label: "From the desk",
    ring: "border-signal/45",
    bg: "bg-signal/[0.07]",
    text: "text-signal",
    glyph: "▮",
  },
  myth: {
    label: "Myth check",
    ring: "border-signal/40",
    bg: "bg-signal/[0.06]",
    text: "text-signal",
    glyph: "✕",
  },
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} index={i} />
      ))}
    </>
  );
}

function BlockView({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    case "p":
      return (
        <p className="my-4 text-[0.975rem] leading-[1.75] text-muted">
          {renderInline(block.text, `p${index}`)}
        </p>
      );

    case "h":
      return block.level === 2 ? (
        <h2 className="mt-11 scroll-mt-24 text-xl font-semibold tracking-tight text-ink">
          {renderInline(block.text, `h${index}`)}
        </h2>
      ) : (
        <h3 className="mt-8 text-base font-semibold tracking-tight text-ink">
          {renderInline(block.text, `h${index}`)}
        </h3>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`my-4 space-y-2 pl-1 text-[0.975rem] leading-[1.7] text-muted ${
            block.ordered ? "[counter-reset:li]" : ""
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="relative pl-6">
              <span
                aria-hidden
                className={`absolute left-0 top-0 font-mono text-xs ${
                  block.ordered ? "text-accent tnum" : "text-line-strong"
                }`}
                style={block.ordered ? undefined : { top: "0.55em", lineHeight: 0 }}
              >
                {block.ordered ? `${i + 1}.` : "—"}
              </span>
              {renderInline(item, `li${index}-${i}`)}
            </li>
          ))}
        </Tag>
      );
    }

    case "callout": {
      const c = CALLOUT[block.variant];
      return (
        <aside className={`my-6 rounded-lg border ${c.ring} ${c.bg} px-4 py-3.5`}>
          <p className={`eyebrow flex items-center gap-1.5 ${c.text}`}>
            <span aria-hidden className="text-[0.7em]">
              {c.glyph}
            </span>
            {block.title ?? c.label}
          </p>
          {block.body.map((line, i) => (
            <p key={i} className="mt-2 text-[0.95rem] leading-[1.7] text-ink/90">
              {renderInline(line, `co${index}-${i}`)}
            </p>
          ))}
        </aside>
      );
    }

    case "table":
      return (
        <figure className="my-6">
          <div className="thin-scroll overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="bg-raised">
                  {block.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`border-b border-line px-3.5 py-2.5 font-mono text-2xs uppercase tracking-wider text-faint ${
                        block.numericFrom != null && i >= block.numericFrom
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="even:bg-raised/40">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`border-b border-line/70 px-3.5 py-2.5 align-top leading-relaxed ${
                          c === 0 ? "font-medium text-ink" : "text-muted"
                        } ${
                          block.numericFrom != null && c >= block.numericFrom
                            ? "tnum text-right font-mono text-[0.82rem]"
                            : ""
                        }`}
                      >
                        {renderInline(cell, `td${index}-${r}-${c}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-xs text-faint">
              {renderInline(block.caption, `tc${index}`)}
            </figcaption>
          )}
        </figure>
      );

    case "chart":
      return (
        <ChartBlock spec={block.spec}>
          {block.caption ? renderInline(block.caption, `ch${index}`) : undefined}
        </ChartBlock>
      );

    case "cards":
      return (
        <div
          className={`my-6 grid gap-3 ${
            block.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          {block.items.map((item, i) => (
            <div key={i} className="panel-raised p-4">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              {item.subtitle && <p className="eyebrow mt-1">{item.subtitle}</p>}
              {item.body && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {renderInline(item.body, `cb${index}-${i}`)}
                </p>
              )}
              {item.bullets && (
                <ul className="mt-2.5 space-y-1.5 text-sm text-muted">
                  {item.bullets.map((bl, k) => (
                    <li key={k} className="relative pl-4 leading-relaxed">
                      <span aria-hidden className="absolute left-0 text-line-strong">
                        —
                      </span>
                      {renderInline(bl, `cbb${index}-${i}-${k}`)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );

    case "steps":
      return (
        <ol className="my-6 space-y-3">
          {block.items.map((s, i) => (
            <li key={i} className="flex gap-3.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft font-mono text-2xs text-accent tnum">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {renderInline(s.body, `st${index}-${i}`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      );

    case "worked":
      return (
        <div className="my-6 overflow-hidden rounded-lg border border-line-strong bg-raised">
          <p className="eyebrow border-b border-line px-4 py-2.5">{block.title}</p>
          <dl className="divide-y divide-line/70">
            {block.rows.map((row, i) => (
              <div
                key={i}
                className={`flex items-baseline justify-between gap-4 px-4 py-2.5 ${
                  row.emphasis ? "bg-accent-soft/50" : ""
                }`}
              >
                <dt className={`text-sm ${row.emphasis ? "font-semibold text-ink" : "text-muted"}`}>
                  {renderInline(row.label, `wl${index}-${i}`)}
                </dt>
                <dd
                  className={`shrink-0 font-mono text-sm tnum ${
                    row.emphasis ? "font-semibold text-accent" : "text-ink"
                  }`}
                >
                  {renderInline(row.value, `wv${index}-${i}`)}
                </dd>
              </div>
            ))}
          </dl>
          {block.note && (
            <p className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-faint">
              {renderInline(block.note, `wn${index}`)}
            </p>
          )}
        </div>
      );

    case "formula":
      return (
        <div className="my-6">
          <pre className="thin-scroll overflow-x-auto rounded-lg border border-line bg-raised px-4 py-3.5 font-mono text-sm text-ink">
            {block.expr}
          </pre>
          {block.note && (
            <p className="mt-2 text-xs leading-relaxed text-faint">
              {renderInline(block.note, `fn${index}`)}
            </p>
          )}
        </div>
      );

    case "story":
      return (
        <div className="my-7 rounded-lg border border-line-strong bg-surface">
          <p className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
            {block.title}
          </p>
          <ol className="divide-y divide-line/60">
            {block.beats.map((beat, i) => (
              <li key={i} className="grid gap-1 px-4 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                <span className="eyebrow pt-0.5">{beat.label}</span>
                <p className="text-sm leading-relaxed text-muted">
                  {renderInline(beat.text, `sb${index}-${i}`)}
                </p>
              </li>
            ))}
          </ol>
          {block.verdict && (
            <p className="border-t border-line bg-raised px-4 py-3 text-sm leading-relaxed text-ink/90">
              {renderInline(block.verdict, `sv${index}`)}
            </p>
          )}
        </div>
      );

    case "checklist":
      return (
        <div className="my-6 rounded-lg border border-line bg-surface p-4">
          {block.title && <p className="eyebrow mb-3">{block.title}</p>}
          <ul className="space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                <span
                  aria-hidden
                  className="mt-[0.3rem] h-3.5 w-3.5 shrink-0 rounded-[3px] border border-line-strong"
                />
                <span>{renderInline(item, `cl${index}-${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "exercise":
      return (
        <ExerciseBlock exerciseId={block.exerciseId}>
          {block.intro ? renderInline(block.intro, `ex${index}`) : undefined}
        </ExerciseBlock>
      );

    case "divider":
      return <hr className="my-9 border-line" />;
  }
}
