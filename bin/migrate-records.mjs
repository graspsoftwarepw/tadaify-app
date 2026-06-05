#!/usr/bin/env node
// migrate-records.mjs — regenerate a requirements INDEX from atomic MADR records.
//
// Usage: node bin/migrate-records.mjs --kind=br|tr
//
//   --kind=tr  read every docs/requirements/technical/NNNN-<slug>.md record and
//              (over)write docs/TECHNICAL_REQUIREMENTS.md as an ID-sorted
//              "ID | Level | Title" table.
//   --kind=br  read every docs/requirements/business/NNNN-<slug>.md atomic MADR
//              record (keyed frontmatter: id, title, area, status) and regenerate
//              docs/requirements/business/INDEX.md (an ID-sorted "ID | Title |
//              Status" table) plus one per-area view docs/requirements/business/
//              <AREA>.md per distinct area. When the business/ directory is empty
//              or absent the run exits 0 without writing (no-records message).
//
// Records come in TWO shapes:
//   * keyed YAML frontmatter  — `id:` / `level:` / `status:` … in a leading
//     `---` block. TR records carry NO `title:` key.
//   * prose-header, no frontmatter — id from the first `# TR-… — …` heading,
//     level from a `**Level:** …` line (may be absent), status from `**Status:** …`.
// In BOTH shapes the TITLE is the text of the first `# …` heading after the
// `ID — ` separator (the first ` — `).
//
// Guarantees: deterministic / idempotent (stable ID sort, no per-run timestamp
// inside the table), fail-on-duplicate-ID, fail-on-missing/malformed (exit
// non-zero, NO write). Node ESM, no runtime dependencies.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SELF = "bin/migrate-records.mjs";
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const KINDS = {
  tr: {
    recordsDir: join(REPO_ROOT, "docs", "requirements", "technical"),
    recordsRel: "docs/requirements/technical/",
    linkPrefix: "requirements/technical/",
    outPath: join(REPO_ROOT, "docs", "TECHNICAL_REQUIREMENTS.md"),
    indexRel: "docs/TECHNICAL_REQUIREMENTS.md",
    heading: "Technical Requirements",
    noun: "TR",
    // TR titles come from the first `# ID — Title` heading, NOT frontmatter —
    // some TR records carry a `title:` that intentionally differs from the
    // heading, and the shipped index uses the heading form.
    titleSource: "heading",
  },
  br: {
    recordsDir: join(REPO_ROOT, "docs", "requirements", "business"),
    recordsRel: "docs/requirements/business/",
    // INDEX.md and the per-area views live INSIDE the records dir, so a record
    // link from there is the bare sibling filename (no directory prefix).
    linkPrefix: "",
    indexPath: join(REPO_ROOT, "docs", "requirements", "business", "INDEX.md"),
    indexRel: "docs/requirements/business/INDEX.md",
    heading: "Business Requirements",
    noun: "BR",
    // BR atomic records carry the human title in keyed `title:` frontmatter.
    titleSource: "frontmatter",
  },
};

function usage(message) {
  if (message) process.stderr.write(`error: ${message}\n`);
  process.stderr.write(
    `usage: node ${SELF} --kind=br|tr\n` +
      `  --kind=tr  regenerate docs/TECHNICAL_REQUIREMENTS.md from docs/requirements/technical/\n` +
      `  --kind=br  regenerate docs/requirements/business/INDEX.md + per-area views from docs/requirements/business/\n`,
  );
}

function die(message) {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseKind(argv) {
  let kind;
  for (const arg of argv) {
    const m = /^--kind(?:=(.*))?$/.exec(arg);
    if (!m) {
      usage(`unknown argument: ${arg}`);
      process.exit(2);
    }
    if (m[1] === undefined || m[1] === "") {
      usage("--kind requires a value (br or tr)");
      process.exit(2);
    }
    kind = m[1];
  }
  if (kind === undefined) {
    usage("missing required --kind=br|tr");
    process.exit(2);
  }
  if (!Object.prototype.hasOwnProperty.call(KINDS, kind)) {
    usage(`invalid --kind value: ${kind} (expected br or tr)`);
    process.exit(2);
  }
  return kind;
}

// --- record parsing ---------------------------------------------------------

const RECORD_RE = /^\d{4}-.+\.md$/;
const HEADING_RE = /^#\s+(.+?)\s*$/m;
const SEPARATOR = " — "; // ID — Title (em-dash U+2014, space-padded)

// Extract the title from the first level-1 heading: "ID — Title" -> "Title".
// Splits on the FIRST separator only (titles may contain a later " — ").
function titleFromHeading(heading) {
  const idx = heading.indexOf(SEPARATOR);
  if (idx === -1) return null;
  const title = heading.slice(idx + SEPARATOR.length).trim();
  return title.length ? title : null;
}

function parseFrontmatter(body) {
  // body begins with a leading "---" line.
  const end = body.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = body.slice(body.indexOf("\n") + 1, end + 1);
  const fields = {};
  for (const line of block.split("\n")) {
    const m = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (m) fields[m[1].toLowerCase()] = m[2].trim();
  }
  return fields;
}

function parseRecord(name, body, cfg) {
  const headingMatch = HEADING_RE.exec(body);
  const heading = headingMatch ? headingMatch[1] : null;
  const headingTitle = heading ? titleFromHeading(heading) : null;

  let id;
  let level = "";
  let status = "";
  let area = "";
  let fmTitle = null;

  if (body.startsWith("---")) {
    const fm = parseFrontmatter(body);
    if (fm) {
      if (fm.id) id = fm.id;
      if (fm.level) level = fm.level;
      if (fm.status) status = fm.status;
      if (fm.area) area = fm.area;
      if (fm.title) fmTitle = fm.title;
    }
  } else {
    // prose-header shape: id from heading prefix, level/status from **Key:** lines.
    if (heading) {
      const sepIdx = heading.indexOf(SEPARATOR);
      const idPart = sepIdx === -1 ? heading : heading.slice(0, sepIdx);
      const idm = /^(TR|BR)-[A-Za-z][A-Za-z0-9]*-\d+$/.exec(idPart.trim());
      if (idm) id = idPart.trim();
    }
    const idLine = /^\*\*ID:\*\*\s*(.+?)\s*$/m.exec(body);
    if (!id && idLine) id = idLine[1].trim();
    const levelLine = /^\*\*Level:\*\*\s*(.+?)\s*$/m.exec(body);
    if (levelLine) level = levelLine[1].trim();
    const statusLine = /^\*\*Status:\*\*\s*(.+?)\s*$/m.exec(body);
    if (statusLine) status = statusLine[1].trim();
  }

  // Title source is kind-specific: BR uses keyed `title:` frontmatter; TR uses
  // the first `# ID — Title` heading (some TR records carry a divergent
  // `title:` that must NOT override the shipped heading-derived index).
  const title = cfg.titleSource === "frontmatter" ? fmTitle : headingTitle;

  if (!id) die(`record ${name}: no parseable ID (no frontmatter id: and no \`# ID — …\` heading)`);
  if (!title) {
    die(
      cfg.titleSource === "frontmatter"
        ? `record ${name}: no parseable title (frontmatter \`title:\` missing)`
        : `record ${name}: no parseable title (first \`# …\` heading missing or lacks \`${SEPARATOR.trim()}\` separator)`,
    );
  }

  return { id, level, status, area, title, file: name };
}

function loadRecords(cfg) {
  let entries;
  try {
    entries = readdirSync(cfg.recordsDir, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === "ENOENT") return null; // absent dir
    throw err;
  }
  const files = entries
    .filter((e) => e.isFile() && RECORD_RE.test(e.name))
    .map((e) => e.name)
    .sort();
  const records = [];
  for (const name of files) {
    const body = readFileSync(join(cfg.recordsDir, name), "utf8");
    records.push(parseRecord(name, body, cfg));
  }
  return records;
}

// --- deterministic ID ordering ---------------------------------------------

// Natural compare: split on "-", numeric segments compared numerically and
// ordered before alphabetic segments; alpha segments compared case-sensitively.
function compareIds(a, b) {
  const as = a.split("-");
  const bs = b.split("-");
  const n = Math.max(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    const x = as[i];
    const y = bs[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const xn = /^\d+$/.test(x);
    const yn = /^\d+$/.test(y);
    if (xn && yn) {
      const d = Number(x) - Number(y);
      if (d !== 0) return d;
    } else if (xn !== yn) {
      return xn ? -1 : 1; // numeric segment sorts before alpha
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

// --- rendering --------------------------------------------------------------

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function renderTr(records, cfg) {
  const lines = [];
  lines.push(`# ${cfg.heading} — INDEX`);
  lines.push("");
  lines.push(`> **Auto-generated** on ${today()} by \`${SELF} --kind=tr\`.`);
  lines.push(`> Do NOT hand-edit this file. Edit the individual TR records in \`${cfg.recordsRel}\`.`);
  lines.push(`> To add a new TR: create \`${cfg.recordsRel}NNNN-<slug>.md\` with MADR frontmatter.`);
  lines.push("");
  lines.push(`## All ${cfg.heading}`);
  lines.push("");
  lines.push("| ID | Level | Title |");
  lines.push("|----|-------|-------|");
  for (const r of records) {
    lines.push(`| [${r.id}](${cfg.linkPrefix}${r.file}) | ${r.level} | ${r.title} |`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Generated from ${records.length} MADR records in \`${cfg.recordsRel}\`.*`);
  lines.push("");
  return lines.join("\n");
}

// Render the BR INDEX.md: a flat "ID | Title | Status" table over every record,
// sorted by ID, each ID linking its sibling NNNN-<slug>.md file.
function renderBrIndex(records, cfg) {
  const lines = [];
  lines.push(`# ${cfg.heading} — INDEX`);
  lines.push("");
  lines.push(`> **Auto-generated** on ${today()} by \`${SELF} --kind=br\`.`);
  lines.push(`> Do NOT hand-edit this file. Edit the individual BR records in \`${cfg.recordsRel}\`.`);
  lines.push(`> To add a new BR: create \`${cfg.recordsRel}NNNN-<slug>.md\` with MADR frontmatter.`);
  lines.push("");
  lines.push(`## All ${cfg.heading}`);
  lines.push("");
  lines.push("| ID | Title | Status |");
  lines.push("|----|-------|--------|");
  for (const r of records) {
    lines.push(`| [${r.id}](${cfg.linkPrefix}${r.file}) | ${r.title} | ${r.status} |`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Generated from ${records.length} MADR records in \`${cfg.recordsRel}\`.*`);
  lines.push("");
  return lines.join("\n");
}

// Render a per-area view (<AREA>.md): the records of one area, sorted by ID.
function renderBrArea(area, records, cfg) {
  const lines = [];
  lines.push(`# ${cfg.heading} — ${area}`);
  lines.push("");
  lines.push(`> **Auto-generated** on ${today()} by \`${SELF} --kind=br\`.`);
  lines.push(`> Do NOT hand-edit this file. Edit the individual BR records in \`${cfg.recordsRel}\`.`);
  lines.push("");
  lines.push(`## ${area} ${cfg.heading}`);
  lines.push("");
  lines.push("| ID | Title | Status |");
  lines.push("|----|-------|--------|");
  for (const r of records) {
    lines.push(`| [${r.id}](${cfg.linkPrefix}${r.file}) | ${r.title} | ${r.status} |`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Generated from ${records.length} MADR records in area \`${area}\`.*`);
  lines.push("");
  return lines.join("\n");
}

// Group sorted records by their `area`, preserving ID order within each group;
// areas are emitted in ascending area-name order for deterministic output.
function groupByArea(records) {
  const groups = new Map();
  for (const r of records) {
    if (!r.area) die(`record ${r.file}: no parseable area (frontmatter \`area:\` missing)`);
    if (!groups.has(r.area)) groups.set(r.area, []);
    groups.get(r.area).push(r);
  }
  return new Map([...groups.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
}

// --- main -------------------------------------------------------------------

function main() {
  const kind = parseKind(process.argv.slice(2));
  const cfg = KINDS[kind];

  const records = loadRecords(cfg);

  if (kind === "br") {
    if (records === null || records.length === 0) {
      process.stdout.write(
        `no BR records under ${cfg.recordsRel} — nothing to generate; skipping write.\n`,
      );
      process.exit(0);
    }
  }

  if (records === null) die(`records directory not found: ${cfg.recordsRel}`);

  // fail-on-duplicate ID
  const seen = new Map();
  for (const r of records) {
    if (seen.has(r.id)) {
      die(`duplicate ID ${r.id}: ${seen.get(r.id)} and ${r.file}`);
    }
    seen.set(r.id, r.file);
  }

  records.sort((a, b) => compareIds(a.id, b.id));

  if (kind === "tr") {
    writeFileSync(cfg.outPath, renderTr(records, cfg));
    process.stdout.write(
      `wrote ${cfg.outPath.replace(REPO_ROOT + "/", "")} from ${records.length} ${cfg.noun} records.\n`,
    );
    return;
  }

  // kind === "br": regenerate INDEX.md plus one <AREA>.md per distinct area.
  const byArea = groupByArea(records); // also validates every record has an area
  const written = [join(cfg.recordsDir, "INDEX.md")];
  writeFileSync(join(cfg.recordsDir, "INDEX.md"), renderBrIndex(records, cfg));
  for (const [area, areaRecords] of byArea) {
    const areaPath = join(cfg.recordsDir, `${area}.md`);
    writeFileSync(areaPath, renderBrArea(area, areaRecords, cfg));
    written.push(areaPath);
  }
  process.stdout.write(
    `wrote ${written.length} file(s) (${cfg.indexRel} + ${byArea.size} per-area view(s)) ` +
      `from ${records.length} ${cfg.noun} records.\n`,
  );
}

main();
