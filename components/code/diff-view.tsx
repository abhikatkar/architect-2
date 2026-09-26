import type { DiffRow, DiffSide, FileDiff } from "@/lib/seed/types";
import { addedLines, removedLines } from "@/lib/seed/totals";

/**
 * One diff, rendered twice from one array.
 *
 * A modified line is one row side by side and two rows unified, so no single
 * markup can be both. Both renderers are a plain map over the same
 * `DiffRow[]`, which is what makes them unable to drift: the pairing lives in
 * the data, not in either view.
 *
 * Four details are load bearing, and all four only misbehave with long lines,
 * which is to say in every real diff and in none of the short ones you build
 * with:
 *
 * - `table-fixed` with an explicit colgroup. Auto layout takes the longest code
 *   line as a column's width and pushes the table past its container.
 * - `align-top` on every cell. The default is middle, so as soon as one side
 *   wraps, the opposite line number floats to the centre of the row.
 * - `whitespace-pre-wrap` with `overflow-wrap: anywhere`, so code wraps instead
 *   of scrolling the page sideways.
 * - A non-breaking space for an empty side, so the row keeps its height and the
 *   stripes stay in rhythm.
 */

const TINT: Record<DiffRow["kind"], { old: string; new: string }> = {
  same: { old: "", new: "" },
  mod: { old: "bg-fault/10", new: "bg-live/10" },
  add: { old: "bg-graphite/5", new: "bg-live/10" },
  del: { old: "bg-fault/10", new: "bg-graphite/5" },
};

function markFor(kind: DiffRow["kind"], side: "old" | "new") {
  if (kind === "same") return " ";
  if (side === "old") return kind === "add" ? " " : "-";
  return kind === "del" ? " " : "+";
}

function Cells({
  side,
  mark,
  tint,
}: {
  side: DiffSide | null;
  mark: string;
  tint: string;
}) {
  if (!side) {
    return (
      <>
        <td className={`border-r border-rule/40 ${tint}`} aria-hidden="true" />
        <td className={tint} aria-hidden="true" />
        <td className={tint} aria-hidden="true">
          &nbsp;
        </td>
      </>
    );
  }
  return (
    <>
      <td
        className={`select-none border-r border-rule/40 pr-1 text-right align-top font-mono text-graphite ${tint}`}
      >
        {side.line}
      </td>
      <td
        className={`select-none text-center align-top font-mono ${tint} ${
          mark === "+" ? "text-live" : mark === "-" ? "text-fault" : "text-graphite"
        }`}
      >
        {mark === " " ? "" : mark}
        <span className="sr-only">
          {mark === "+" ? "added " : mark === "-" ? "removed " : ""}
        </span>
      </td>
      <td
        className={`min-w-0 whitespace-pre-wrap align-top font-mono [overflow-wrap:anywhere] ${tint}`}
      >
        {side.text || " "}
      </td>
    </>
  );
}

function SplitDiff({ rows, path }: { rows: DiffRow[]; path: string }) {
  return (
    <table className="hidden w-full table-fixed border-collapse text-caption lg:table">
      <caption className="sr-only">
        {path}, before on the left and after on the right
      </caption>
      <colgroup>
        <col className="w-8" />
        <col className="w-4" />
        <col />
        <col className="w-8" />
        <col className="w-4" />
        <col />
      </colgroup>
      <thead className="sr-only">
        <tr>
          <th colSpan={3} scope="col">
            Before
          </th>
          <th colSpan={3} scope="col">
            After
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <Cells side={row.old} mark={markFor(row.kind, "old")} tint={TINT[row.kind].old} />
            <Cells side={row.new} mark={markFor(row.kind, "new")} tint={TINT[row.kind].new} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Phone and tablet: one column, a removed line then the added line. */
function UnifiedDiff({ rows, path }: { rows: DiffRow[]; path: string }) {
  const lines: { side: DiffSide; mark: string; tint: string }[] = [];
  for (const row of rows) {
    if (row.kind === "same") {
      lines.push({ side: row.new, mark: " ", tint: "" });
    } else if (row.kind === "add") {
      lines.push({ side: row.new, mark: "+", tint: "bg-live/10" });
    } else if (row.kind === "del") {
      lines.push({ side: row.old, mark: "-", tint: "bg-fault/10" });
    } else {
      lines.push({ side: row.old, mark: "-", tint: "bg-fault/10" });
      lines.push({ side: row.new, mark: "+", tint: "bg-live/10" });
    }
  }

  return (
    <table className="w-full table-fixed border-collapse text-caption lg:hidden">
      <caption className="sr-only">{path}, changes in one column</caption>
      <colgroup>
        <col className="w-8" />
        <col className="w-4" />
        <col />
      </colgroup>
      <tbody>
        {lines.map((line, i) => (
          <tr key={i}>
            <Cells side={line.side} mark={line.mark} tint={line.tint} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DiffView({ diff, path }: { diff: FileDiff; path: string }) {
  const added = addedLines(diff);
  const removed = removedLines(diff);

  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-baseline gap-x-2 text-caption text-graphite">
        <span className="font-mono text-ink">{path}</span>
        <span className="text-live">+{added}</span>
        <span className="text-fault">-{removed}</span>
        <span>{diff.status === "added" ? "new file" : "modified"}</span>
      </p>
      <div className="mt-2 min-w-0 rounded-input border border-rule p-2">
        <SplitDiff rows={diff.rows} path={path} />
        <UnifiedDiff rows={diff.rows} path={path} />
      </div>
    </div>
  );
}
