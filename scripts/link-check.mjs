/*
  Checks every link in docs/ and README.md.

  Two kinds, both of which have broken here before:

  - A relative path that does not exist. The README pointed at
    docs/09-roadmap-and-metrics.md for several slices before that file was
    written.
  - An anchor that no heading produces. The decision log links between entries
    by anchor, and those anchors contain the entry's date, so correcting a date
    silently breaks every link pointing at it. That is what prompted this.

  Run:

    node scripts/link-check.mjs

  Exits non-zero on any dead link.
*/
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = process.cwd();

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

/** GitHub's heading slug: lowercase, drop punctuation, spaces to hyphens. */
function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function headingsOf(file) {
  return new Set(
    readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => /^#{1,6}\s/.test(l))
      .map((l) => slug(l.replace(/^#{1,6}\s+/, ""))),
  );
}

const files = [
  join(ROOT, "README.md"),
  ...walk(join(ROOT, "docs")).filter((f) => f.endsWith(".md")),
];

const headings = new Map(files.map((f) => [f, headingsOf(f)]));
const dead = [];
let checked = 0;

for (const file of files) {
  const body = readFileSync(file, "utf8");
  // [text](target), skipping external links and bare anchors in code fences.
  for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m.group?.(1) ?? m[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    checked++;

    const [path, hash] = target.split("#");
    const resolved = path ? resolve(dirname(file), path) : file;

    if (path && !existsSync(resolved)) {
      dead.push(`${relative(ROOT, file)} -> ${target} (no such file)`);
      continue;
    }
    if (!hash) continue;

    const known = headings.get(resolved) ?? (resolved.endsWith(".md") && existsSync(resolved) ? headingsOf(resolved) : null);
    if (!known) continue; // Not a markdown file, so it has no headings to check.
    if (!known.has(hash.toLowerCase())) {
      dead.push(`${relative(ROOT, file)} -> ${target} (no heading makes that anchor)`);
    }
  }
}

for (const d of dead) console.log(`  DEAD  ${d}`);
console.log(
  `\n${checked - dead.length} of ${checked} links resolve across ${files.length} files.`,
);
process.exit(dead.length ? 1 : 0);
