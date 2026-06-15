// bin/lib/maps-lib.mjs
//
// Shared library for the Pillar-0 generated maps (grasp-app-structure, tadaify-app#308).
//
// Single source of the input model that `bin/maps-gen` renders, `bin/maps-check`
// hashes, and `bin/req` reads. Nothing here parses application code at query time:
// `buildModel()` parses the RR7 route registry (app/routes.ts) + the P3 BR records +
// the P4 module registry once, and emits a deterministic model. The digest is computed
// over the *inputs* (route tuples + joined frontmatter + annotations), never the rendered
// table, so cosmetic re-rendering does not churn the hash while any governing change does.
//
// Contract: bin/lib/maps-lib.mjs
//
// IMPORTANT (validator interplay): the rendered map text must NEVER contain the literal
// words "STALE" / "regenerate" / "<!-- stale -->" — validate_structure.py check 10 treats
// any of those tokens in docs/maps/*.md as a committed staleness signal and FAILs. The
// staleness *runtime* signalling therefore lives only in bin/maps-check stderr, not in the
// committed files.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

export const MAP_FILES = ["views.md", "modules.md", "e2e.md"];
export const DIGEST_RE = /<!--\s*generated:\s*bin\/maps-gen\s+sha=([0-9a-f]+)\s+DO NOT EDIT\s*-->/;

// A feature id: F-<WORD>(-<WORD>)*-<NNN>[slice], i.e. UPPERCASE/digit words ending in a
// numeric segment with an optional lowercase slice suffix (F-APP-DASHBOARD-001a,
// F-REGISTER-001a, F-LANDING-001). Requiring the trailing numeric segment rejects bare
// prose fragments like "F-BLOCK-LINK" that carry no story number.
const FEATURE_SRC = "F-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-[0-9]+[a-z]?";
const FEATURE_RE = new RegExp(`\\b(${FEATURE_SRC})\\b`);
const FEATURE_RE_G = new RegExp(`\\b(${FEATURE_SRC})\\b`, "g");

// ── repo helpers ─────────────────────────────────────────────────────────────

export function repoRoot() {
  // bin/lib/maps-lib.mjs → repo root is two dirs up.
  return new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
}

function read(root, rel) {
  return readFileSync(join(root, rel), "utf8");
}

// routes.ts writes app/-relative module paths ("routes/$handle.tsx"); maps record
// repo-relative ("app/routes/$handle.tsx") so who-governs matches what an agent greps.
export function toRepoRel(appRelModule) {
  return appRelModule.startsWith("app/") ? appRelModule : `app/${appRelModule}`;
}

// ── route registry parse (app/routes.ts) ─────────────────────────────────────
//
// Captures every index()/route()/layout() entry: { url, module(app-rel), feature, parent }.
// `feature` is the F-… token from the nearest preceding line comment (the route-table
// feature comment the contract names as the governs source). `parent` is the layout()
// shell module for nested routes.

export function parseRoutes(root) {
  const src = read(root, "app/routes.ts");
  const lines = src.split("\n");
  const entries = [];

  // Track the most recent F-… feature comment seen above the current line.
  let pendingFeature = null;
  // layout() nesting: a stack of { module, depth } by brace depth.
  let layoutStack = [];

  const featureRe = FEATURE_RE;
  const indexRe = /\bindex\(\s*["']([^"']+)["']/;
  const routeRe = /\broute\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/;
  const layoutRe = /\blayout\(\s*["']([^"']+)["']/;

  let depth = 0;
  for (const raw of lines) {
    const line = raw;

    // Refresh the pending feature from any comment on this line.
    const cm = line.match(/\/\/(.*)$|\/\*(.*?)\*\//);
    if (cm) {
      const fm = (cm[1] || cm[2] || "").match(featureRe);
      if (fm) pendingFeature = fm[1];
    }

    // layout("module", [  — opens a nesting scope.
    const lay = line.match(layoutRe);
    if (lay) {
      layoutStack.push({ module: toRepoRel(lay[1]), atDepth: depth });
    }

    // index("module")
    const idx = line.match(indexRe);
    if (idx) {
      entries.push({
        url: "/",
        module: idx[1],
        feature: pendingFeature,
        parent: currentLayout(layoutStack),
      });
    }

    // route("/url", "module")
    const rt = line.match(routeRe);
    if (rt) {
      entries.push({
        url: rt[1],
        module: rt[2],
        feature: pendingFeature,
        parent: currentLayout(layoutStack),
      });
    }

    // Brace bookkeeping to close layout() scopes.
    for (const ch of line) {
      if (ch === "[" || ch === "{" || ch === "(") depth++;
      if (ch === "]" || ch === "}" || ch === ")") {
        depth--;
        if (layoutStack.length && depth <= layoutStack[layoutStack.length - 1].atDepth) {
          layoutStack.pop();
        }
      }
    }
  }
  return entries;
}

function currentLayout(stack) {
  return stack.length ? stack[stack.length - 1].module : null;
}

// ── module header annotations (@module / @covers / Story: F-…) ────────────────

export function readModuleAnnotations(root, repoRelModule) {
  const abs = join(root, repoRelModule);
  if (!existsSync(abs)) return { area: null, covers: [], features: [] };
  const head = readFileSync(abs, "utf8").split("\n").slice(0, 40).join("\n");

  const area = (head.match(/@module\s+([A-Z0-9-]+)/) || [])[1] || null;
  const covers = [...head.matchAll(/@covers\s+([A-Za-z0-9-]+)/g)].map((m) => m[1]);

  // Feature ids are taken ONLY from structured carriers — `Story:`/`@story` lines and
  // a parenthesised `(F-… )` route summary — never free prose, so an in-passing mention
  // like "(F-BLOCK-LINK, etc.)" does not leak a partial id into governs.
  const features = [];
  for (const line of head.split("\n")) {
    const structured = /(^|\s)(Story:|@story\b)/i.test(line) || /\([^)]*\bF-/.test(line);
    if (!structured) continue;
    for (const m of line.matchAll(FEATURE_RE_G)) features.push(m[1]);
  }
  return { area, covers, features: [...new Set(features)] };
}

// ── co-located test sibling resolution ───────────────────────────────────────
//
// tadaify tests are co-located *.test.tsx / *.test.ts siblings of the module.
// A module may have several (e.g. InsightsPanel.kpi.test.tsx + .render.test.tsx).

export function findTestSiblings(root, repoRelModule) {
  const abs = join(root, repoRelModule);
  const dir = abs.replace(/\/[^/]+$/, "");
  if (!existsSync(dir)) return [];
  const stem = basename(repoRelModule).replace(/\.(tsx?|jsx?)$/, "");
  const out = [];
  for (const f of readdirSync(dir)) {
    // <stem>.test.ts(x) or <stem>.<variant>.test.ts(x)
    if (new RegExp(`^${escapeRe(stem)}(\\.[^.]+)?\\.test\\.tsx?$`).test(f)) out.push(f);
  }
  return out.sort();
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── e2e spec index (e2e/*.spec.ts) ───────────────────────────────────────────
//
// Each Playwright spec header carries the F-… feature id(s) it exercises
// (e.g. "App Dashboard (F-APP-DASHBOARD-001a, #171)"). We index spec → features
// and join by shared feature id to fill the e2e column.

export function indexE2eSpecs(root) {
  const dir = join(root, "e2e");
  const specs = [];
  if (!existsSync(dir)) return specs;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".spec.ts")) continue;
    const head = readFileSync(join(dir, f), "utf8").split("\n").slice(0, 25).join("\n");
    const features = [...new Set([...head.matchAll(FEATURE_RE_G)].map((m) => m[1]))];
    const covers = [...new Set([...head.matchAll(/\b(BR-[A-Za-z0-9-]+|TR-[A-Za-z0-9-]+)\b/g)].map((m) => m[1]))];
    specs.push({ spec: f, features, covers });
  }
  return specs.sort((a, b) => a.spec.localeCompare(b.spec));
}

function e2eForFeatures(specs, features) {
  const hits = [];
  for (const s of specs) {
    if (s.features.some((f) => features.includes(f))) hits.push(`e2e/${s.spec}`);
  }
  return [...new Set(hits)].sort();
}

// ── P3 BR records (docs/requirements/business/*.md frontmatter) ──────────────

export function readBrRecords(root) {
  const dir = join(root, "docs/requirements/business");
  const records = [];
  if (!existsSync(dir)) return records;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const txt = readFileSync(join(dir, f), "utf8");
    const fm = txt.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const id = (fm[1].match(/^id:\s*(\S+)/m) || [])[1] || null;
    const routes = parseYamlList(fm[1].match(/^routes:\s*(.*)$/m)?.[1]);
    const related = parseYamlList(fm[1].match(/^related_files:\s*(.*)$/m)?.[1]);
    if (id) records.push({ id, routes, related, file: `docs/requirements/business/${f}` });
  }
  return records.sort((a, b) => a.id.localeCompare(b.id));
}

function parseYamlList(inline) {
  if (!inline) return [];
  const m = inline.match(/\[(.*)\]/);
  if (!m) return [];
  return m[1].split(",").map((s) => s.trim()).filter(Boolean);
}

// ── P4 module registry (docs/modules/registry.yml) ───────────────────────────
//
// Minimal area→owns/requirements reader. We do not need a full YAML parser: the
// fields consumed are `owns:` globs and business/technical requirement ids per area.

export function readRegistry(root) {
  const txt = read(root, "docs/modules/registry.yml");
  const areas = {};
  let curArea = null;
  let section = null; // owns | uses | business | technical | routes
  for (const raw of txt.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (/^modules:\s*$/.test(line)) continue;
    const areaM = line.match(/^ {2}([A-Z][A-Z0-9-]*):\s*$/);
    if (areaM) {
      curArea = areaM[1];
      areas[curArea] = { owns: [], requirements: { business: [], technical: [] }, routes: [] };
      section = null;
      continue;
    }
    if (!curArea) continue;
    if (/^ {4}owns:\s*$/.test(line)) { section = "owns"; continue; }
    if (/^ {4}uses:\s*$/.test(line)) { section = "uses"; continue; }
    if (/^ {4}routes:/.test(line)) { section = "routes"; continue; }
    if (/^ {4}requirements:\s*$/.test(line)) { section = "req"; continue; }
    if (/^ {6}business:\s*$/.test(line)) { section = "business"; continue; }
    if (/^ {6}technical:\s*$/.test(line)) { section = "technical"; continue; }
    const item = line.match(/^ {6,8}- (.+)$/);
    if (item) {
      const v = item[1].trim();
      if (section === "owns") areas[curArea].owns.push(v);
      else if (section === "routes") areas[curArea].routes.push(v);
      else if (section === "business") areas[curArea].requirements.business.push(v);
      else if (section === "technical") areas[curArea].requirements.technical.push(v);
    }
  }
  return areas;
}

// ── curated panel registry (host = app/routes/app.tsx) ───────────────────────
//
// query-panel / non-url-panel views are agent entry points the route registry does
// NOT list as standalone URLs (contract §kind taxonomy), so they cannot be derived
// from routes.ts alone. They are selected on the /app host via parseTab (?tab=…) or
// rendered as host children. This is the curated host→panel mapping, the semantic
// input the generator joins against the parsed registry. Each carries its host
// (required `parent`), the rendering module, and the governing feature id, which the
// generator then expands with frontmatter @covers + e2e links.
//
// Encoded explicitly (not scraped from JSX) because the tab→component binding and the
// query/non-url classification are a semantic contract, not a syntactic fact — and
// keeping it as data keeps the generator deterministic. It is part of the hashed input.

export const PANEL_HOST = "app/routes/app.tsx";

export const PANELS = [
  // query-panel — selected by ?tab= on /app via parseTab.
  { id: "V-TAD-DESIGN",   url: "/app?tab=design",   kind: "query-panel",   module: "app/components/DesignPanel.tsx",   feature: "F-APP-DASHBOARD-001a" },
  { id: "V-TAD-INSIGHTS", url: "/app?tab=insights", kind: "query-panel",   module: "app/components/InsightsPanel.tsx", feature: "F-APP-DASHBOARD-001a" },
  // non-url-panel — host children with no addressable URL.
  { id: "V-TAD-PREVIEW",  url: "—",                 kind: "non-url-panel", module: "app/components/LivePreviewPane.tsx", feature: "F-APP-DASHBOARD-001a" },
  { id: "V-TAD-SIDEBAR",  url: "—",                 kind: "non-url-panel", module: "app/components/AppSidebar.tsx",      feature: "F-APP-DASHBOARD-001a" },
  { id: "V-TAD-APPBAR",   url: "—",                 kind: "non-url-panel", module: "app/components/AppAppbar.tsx",       feature: "F-APP-DASHBOARD-001a" },
];

// Top-level route views to surface in views.md with a stable V-TAD-… id.
// (Resource api.* routes go to modules.md, not views.md.) Keyed by app/-relative module.
// Only routes whose module has a co-located test sibling are surfaced as views
// (orphans treats a testless view as a gap); pricing.tsx has no sibling yet and is
// intentionally omitted until P-later adds its test.
export const ROUTE_VIEW_IDS = {
  "routes/_index.tsx": "V-TAD-LANDING",
  "routes/$handle.tsx": "V-TAD-CREATOR",
  "routes/app.tsx": "V-TAD-APP",
  "routes/register.tsx": "V-TAD-REGISTER",
  "routes/login.tsx": "V-TAD-LOGIN",
  "routes/onboarding.welcome.tsx": "V-TAD-ONBOARDING-WELCOME",
};

// ── model assembly ───────────────────────────────────────────────────────────

export function buildModel(root) {
  const routes = parseRoutes(root);
  const brRecords = readBrRecords(root);
  const registry = readRegistry(root);
  const e2eSpecs = indexE2eSpecs(root);

  const brByRoute = new Map();
  for (const r of brRecords) {
    for (const rt of r.routes) brByRoute.set(normalizeUrl(rt), r.id);
  }

  // ---- views.md rows ----
  const views = [];

  for (const e of routes) {
    const repoMod = toRepoRel(e.module);
    const vid = ROUTE_VIEW_IDS[e.module];
    if (!vid) continue; // only curated top-level route views become views.md rows
    const ann = readModuleAnnotations(root, repoMod);
    const governs = mergeGoverns([e.feature], ann.features, ann.covers, brForUrl(brByRoute, e.url));
    const tests = findTestSiblings(root, repoMod);
    const e2e = e2eForFeatures(e2eSpecs, dedupe([e.feature, ...ann.features]));
    views.push({
      id: vid,
      url: e.url,
      kind: "rr7-route",
      module: repoMod,
      governs,
      parent: e.parent || "—",
      tests: tests.length ? tests : [],
      e2e,
    });
  }

  for (const p of PANELS) {
    const ann = readModuleAnnotations(root, p.module);
    const governs = mergeGoverns([p.feature], ann.features, ann.covers);
    let tests = findTestSiblings(root, p.module);
    // A panel rendered only by its host (no co-located sibling, e.g. LivePreviewPane)
    // is exercised through the host route's unit tests; fall back to the host test so
    // the panel is not a spurious tests-orphan. Documented fallback, not a guess.
    if (!tests.length) tests = findTestSiblings(root, PANEL_HOST);
    const e2e = e2eForFeatures(e2eSpecs, dedupe([p.feature, ...ann.features]));
    views.push({
      id: p.id,
      url: p.url,
      kind: p.kind,
      module: p.module,
      governs,
      parent: PANEL_HOST,
      tests,
      e2e,
    });
  }

  // ---- modules.md rows ----
  const viewsByModule = new Map();
  for (const v of views) {
    if (!viewsByModule.has(v.module)) viewsByModule.set(v.module, []);
    viewsByModule.get(v.module).push(v.id);
  }

  const modules = [];
  // route + resource modules from the registry
  for (const e of routes) {
    const repoMod = toRepoRel(e.module);
    const isApi = /\/api\./.test(repoMod) || /routes\/api\./.test(repoMod);
    const isResource = isApi && /\.ts$/.test(repoMod); // api.*.ts → resource route (no view)
    const ann = readModuleAnnotations(root, repoMod);
    const vids = viewsByModule.get(repoMod) || [];
    if (isResource) {
      modules.push({
        module: repoMod,
        kind: "rr7-resource",
        mounted_by: e.url,
        views: [],
        governs: mergeGoverns([e.feature], ann.features, ann.covers),
        api: "yes",
        e2e: e2eForFeatures(e2eSpecs, dedupe([e.feature, ...ann.features])),
      });
    } else if (vids.length) {
      // host/route module that renders ≥1 view
      modules.push({
        module: repoMod,
        kind: "rr7-route",
        mounted_by: e.url,
        views: vids,
        governs: mergeGoverns([e.feature], ann.features, ann.covers),
        api: "—",
        e2e: e2eForFeatures(e2eSpecs, dedupe([e.feature, ...ann.features])),
      });
    }
  }
  // panel modules (rendered by the host, no own URL)
  for (const p of PANELS) {
    const ann = readModuleAnnotations(root, p.module);
    modules.push({
      module: p.module,
      kind: "panel",
      mounted_by: p.url === "—" ? PANEL_HOST : p.url,
      views: viewsByModule.get(p.module) || [],
      governs: mergeGoverns([p.feature], ann.features, ann.covers),
      api: "—",
      e2e: e2eForFeatures(e2eSpecs, dedupe([p.feature, ...ann.features])),
    });
  }

  // ---- e2e.md rows ----
  const e2eRows = [];
  // co-located unit-test siblings, joined back to the view that owns them
  const seen = new Set();
  for (const v of views) {
    for (const t of v.tests) {
      const key = `${t}|${v.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      e2eRows.push({ spec: t, views: [v.id], governs: v.governs, module: v.module });
    }
  }
  // Playwright e2e specs, joined by feature id back to the views they exercise
  for (const s of e2eSpecs) {
    const owning = views.filter((v) => v.e2e.includes(`e2e/${s.spec}`));
    if (!owning.length) continue;
    e2eRows.push({
      spec: `e2e/${s.spec}`,
      views: owning.map((v) => v.id),
      governs: dedupe(owning.flatMap((v) => v.governs)),
      module: owning[0].module,
    });
  }
  e2eRows.sort((a, b) => a.spec.localeCompare(b.spec));

  return { routes, brRecords, registry, e2eSpecs, views, modules, e2eRows };
}

// ── governs helpers ──────────────────────────────────────────────────────────

function mergeGoverns(...lists) {
  const flat = [];
  for (const l of lists) for (const v of l || []) if (v) flat.push(v);
  return dedupe(flat);
}

function brForUrl(brByRoute, url) {
  const id = brByRoute.get(normalizeUrl(url));
  return id ? [id] : [];
}

function dedupe(arr) {
  return [...new Set(arr.filter(Boolean))];
}

// Normalize a URL/route for reverse lookup: strip trailing slash, lowercase host part,
// collapse RR7 $param and RRv6 :param to a canonical :param form, drop the query.
export function normalizeUrl(u) {
  if (!u) return "";
  let s = u.trim();
  const q = s.indexOf("?");
  if (q >= 0) s = s.slice(0, q);
  s = s.replace(/\/+$/, "") || "/";
  s = s.replace(/\$([A-Za-z0-9_]+)/g, ":$1"); // $handle → :handle
  return s;
}

// ── digest over inputs ───────────────────────────────────────────────────────
//
// Hash the route registry tuples + joined frontmatter (BR routes/ids) + module
// annotations + the curated panel registry — the *governing* inputs, not the rendered
// table. Any registry/frontmatter/annotation change flips the hash; a cosmetic
// re-render does not.

export function computeDigest(root) {
  const model = buildModel(root);
  const canon = {
    routes: model.routes.map((r) => [r.url, r.module, r.feature || "", r.parent || ""]),
    panels: PANELS.map((p) => [p.id, p.url, p.kind, p.module, p.feature]),
    brRoutes: model.brRecords.map((r) => [r.id, [...r.routes].sort()]),
    annotations: collectAnnotations(root, model),
    e2e: model.e2eSpecs.map((s) => [s.spec, [...s.features].sort()]),
    // The // req: annotation convention does not exist in tadaify yet → hashes empty.
    reqAnnotations: [],
  };
  const json = JSON.stringify(canon);
  return createHash("sha256").update(json).digest("hex").slice(0, 12);
}

function collectAnnotations(root, model) {
  const mods = new Set();
  for (const r of model.routes) mods.add(toRepoRel(r.module));
  for (const p of PANELS) mods.add(p.module);
  const out = [];
  for (const m of [...mods].sort()) {
    const a = readModuleAnnotations(root, m);
    out.push([m, a.area || "", [...a.covers].sort(), [...a.features].sort()]);
  }
  return out;
}

// ── rendering ────────────────────────────────────────────────────────────────

function cell(v) {
  if (Array.isArray(v)) return v.length ? v.join(",") : "—";
  return v == null || v === "" ? "—" : String(v);
}

export function digestHeader(sha) {
  return `<!-- generated: bin/maps-gen sha=${sha} DO NOT EDIT -->`;
}

export function renderViews(model, sha) {
  const cols = ["id", "url", "kind", "module", "governs", "parent", "tests", "e2e"];
  return renderTable(sha, cols, model.views.map((v) => [
    v.id, v.url, v.kind, v.module, cell(v.governs), v.parent, cell(v.tests), cell(v.e2e),
  ]));
}

export function renderModules(model, sha) {
  const cols = ["module", "kind", "mounted_by", "views", "governs", "api", "e2e"];
  return renderTable(sha, cols, model.modules.map((m) => [
    m.module, m.kind, m.mounted_by, cell(m.views), cell(m.governs), m.api, cell(m.e2e),
  ]));
}

export function renderE2e(model, sha) {
  const cols = ["spec", "views", "governs", "module"];
  return renderTable(sha, cols, model.e2eRows.map((r) => [
    r.spec, cell(r.views), cell(r.governs), r.module,
  ]));
}

function renderTable(sha, cols, rows) {
  const head = `| ${cols.join(" | ")} |`;
  const sep = `|${cols.map(() => "----").join("|")}|`;
  const body = rows.map((r) => `| ${r.map(cell).join(" | ")} |`).join("\n");
  return `${digestHeader(sha)}\n\n${head}\n${sep}\n${body}\n`;
}

export function readMapDigest(root, file) {
  const abs = join(root, "docs/maps", file);
  if (!existsSync(abs)) return null;
  const m = readFileSync(abs, "utf8").match(DIGEST_RE);
  return m ? m[1] : null;
}
