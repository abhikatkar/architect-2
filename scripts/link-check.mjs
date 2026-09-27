/*
  Checks every link in docs/ and README.md.

  Three kinds, the first two of which have broken here before:

  - A relative path that does not exist. The README pointed at
    docs/09-roadmap-and-metrics.md for several slices before that file was
    written.
  - An anchor that no heading produces. The decision log links between entries
    by anchor, and those anchors contain the entry's date, so correcting a date
    silently breaks every link pointing at it. That is what prompted this.
  - An allowlisted external URL, fetched for a 200. External links are skipped
    as a rule, because checking the open web on every commit would make the
    gate depend on the weather, but a handful of them carry a claim this repo
    cannot otherwise back. Each one also declares the mentions it answers for,
    so a document can never name that evidence without pointing at it.

  Run:

    node scripts/link-check.mjs

  Needs the network for the external allowlist. Exits non-zero on any dead
  link, and a URL that cannot be reached counts as dead rather than as skipped:
  a reviewer clicking it would see the same thing.
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

/*
  External URLs this repo makes a claim on, checked live.

  `mentions` is the name the URL is the evidence for. Every markdown file that
  says that name has to carry the URL somewhere, which is what stops a new
  document from citing the build while leaving a reviewer nowhere to go. Repeat
  mentions inside one file are deliberately not required to be links: one way
  in per document is a pointer, one per paragraph is an advert.
*/
const EXTERNAL = [
  {
    url: "https://www.abhishekkatkar.com/work/groundtruth/",
    what: "the GroundTruth case study",
    mentions: "GroundTruth",
  },
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

for (const ext of EXTERNAL) {
  checked++;
  let status = 0;
  try {
    const res = await fetch(ext.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    status = res.status;
  } catch (err) {
    dead.push(`${ext.url} (${ext.what}: ${err.name}, ${err.message})`);
  }
  if (status && status !== 200) {
    dead.push(`${ext.url} (${ext.what}: HTTP ${status})`);
  }

  const citing = files.filter((f) =>
    readFileSync(f, "utf8").includes(ext.mentions),
  );
  const silent = citing.filter(
    (f) => !readFileSync(f, "utf8").includes(ext.url),
  );
  for (const f of silent) {
    dead.push(
      `${relative(ROOT, f)} names ${ext.mentions} and never links ${ext.url}`,
    );
  }
  console.log(
    `  ${silent.length ? "FAIL" : "ok  "}  ${ext.what}: HTTP ${status || "unreachable"}, ` +
      `${citing.length - silent.length} of ${citing.length} files naming it link it`,
  );
}

for (const d of dead) console.log(`  DEAD  ${d}`);
console.log(
  `\n${checked - dead.length} of ${checked} links resolve across ${files.length} files, ` +
    `${EXTERNAL.length} of them external and fetched.`,
);
process.exit(dead.length ? 1 : 0);
