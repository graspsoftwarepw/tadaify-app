# grasp-app-structure adoption — tadaify-app

**Phase P1 (foundation).** Issue [#304](https://github.com/graspsoftwarepw/tadaify-app/issues/304),
epic [#303](https://github.com/graspsoftwarepw/tadaify-app/issues/303). tadaify-app is the **first
product repo** to adopt the `grasp-app-structure` skill.

P1 opts the repo in (`docs/app-structure.yml`, `strict: false` → planning / **report-only**),
declares the **complete** local-dev port manifest, runs the validator in `report` mode to inventory
the gap, and lays out the phased conversion roadmap. **No existing file is converted in P1** and
strict enforcement stays off — the only changes are this doc, `docs/app-structure.yml`, and the
`package.json` dev/preview port pins. Strict mode (`strict: true`) is flipped on only by **P8**,
after P2–P7 make the repo actually pass.

Contract: `agents-local/skills/grasp-app-structure/reference/structure-spec.md`. Port-manifest
schema: `.../reference/ports.md`. Central registry: `agents-local/docs/business-app-port-ranges.yml`
(app `tadaify`, range `[54350, 54359]`, `port_namespace: tadaify`).

---

## 1. Grounded current-state gap inventory (verified 2026-06-05)

All counts below are measured against this worktree, not estimated.

### Requirements (BR / TR)

- **Business requirements — flat index, 0 atomic MADR.** BRs live as a **flat Markdown table** in
  `docs/BUSINESS_REQUIREMENTS.md` (`## BR Index`), keyed `BR-…` with a spec-section/issue ref and a
  free-text status column. There is exactly **one** file under `docs/requirements/` that is named
  like an atomic BR — `docs/requirements/BR-OTP-RATE-LIMIT-001.md` — but it is **prose with no YAML
  frontmatter**, so it is **not** a conformant atomic MADR record. Net: **0 atomic business MADR
  records** carry the required `id/area/status/title/authorized_by` frontmatter the contract
  (`reference/requirements.md`) demands.
- **Technical requirements — 30 MADR records, generator ABSENT.** `docs/requirements/technical/`
  holds **30** numbered MADR records (`0001-…` … `0029-…`, plus a duplicate `0024-…`). Their IDs are
  spelled `TR-001`, `TR-AUTH-03`, `TR-tadaify-005`, etc. The migration/generator tool
  `bin/migrate-records.mjs` referenced by the contract is **ABSENT** (`bin/` contains only
  `e2e-bootstrap.sh`, `e2e-local-env.sh`, `worktree-env-init.sh`, `worktree-env-init.test.sh`).

### Module registry & maps

- **No `docs/modules/registry.yml`** — the module node and ownership graph do not exist.
- **No `docs/maps/`** — none of `views.md` / `modules.md` / `e2e.md` generated maps exist.
- **No `@module` / `@covers` source annotations** — `grep -rE "@module|@covers" app/ src/` → **0**
  files. (tadaify's source lives under `app/`, RR7 framework-mode.)

### Migrations

- **19 migrations, 0 with the mandatory header block.** `supabase/migrations/` holds **19** `*.sql`
  files. **None** carries the mandatory `/* … */` header comment with a BR/TR reference — they use
  `--` line comments (`-- Migration:`, `-- Story:`, `-- PR:`) instead. Most filenames also miss the
  canonical `YYYYMMDDHHMMSS_<module>_<verb_noun>.sql` grammar (e.g.
  `20260501000001_profiles.sql`), so the validator grandfathers them as legacy (forward-only,
  header-not-required WARN) rather than failing.

### E2E specs

- **41 feature-flat e2e specs, no `e2e/modules/`.** `e2e/` holds **41** `*.spec.ts` files, all at
  the top level (e.g. `e2e/landing-no-guest-mode.spec.ts`, `e2e/sso-providers-list.spec.ts`). There
  is **no** `e2e/modules/` directory and the specs carry no `Module:` / `Covers:` header, so each is
  reported as missing a valid header (planning-mode WARN).

### Local-dev ports (P1 deliverable — DONE)

- `supabase/config.toml` `project_id = "tadaify"`; the manifest `port_namespace` matches.
- **Every** config.toml port is now mirrored in `docs/app-structure.yml` `local_dev.services`:
  `supabase_api 54351` · `db 54352` · `shadow 54350` · `pooler 54359` · `studio 54353` ·
  `inbucket 54354` · `analytics 54357` · `edge_inspector 8083` — no hidden defaults.
- App dev/preview host ports are **pinned** in `package.json` and declared in the manifest:
  - `dev`: `react-router dev --port 5173 --strictPort` → `app: 5173`
    (`react-router@7.14.0` `react-router-dev/cli/run.ts` defines `--port` (Number, `-p`) and
    `--strictPort` (Boolean); matches `shared_host_ports.app_vite` and `playwright.config.ts`'s
    `--port 5173` webServer, and `docs/LOCAL_DEVELOPMENT.md` App URL `http://127.0.0.1:5173`).
  - `preview`: `react-router build && vite preview --port 4321 --strictPort` → `test_preview: 4321`
    (Vite `preview` accepts `--port`/`--strictPort`; matches `shared_host_ports.test_preview_astro`).

---

## 2. Validator report output (report mode, P1 acceptance evidence)

Run from the worktree root:

```
$ python3 ~/git/graspsoftwarepw/agents-local/skills/grasp-app-structure/scripts/validate_structure.py --root . --mode report
```

**Exit code: `0`.**
**Classification: `in_scope_planning`.**
**Summary: `pass=4 warn=282 fail=0 mode=report classification=in_scope_planning`.**

There are **zero** `port … not present in the local_dev manifest` warnings and **zero**
`undeclared/hidden default` warnings — AC4 is satisfied. The 282 warnings are the expected
planning-mode gap inventory the roadmap below converts; in report mode they never affect the exit
code.

Warning breakdown by check:

| check | warn | what it flags |
|---|---:|---|
| `frontmatter` | 192 | records missing required keys / optional edge arrays (TR records + the flat BR index) |
| `e2e` | 41 | the 41 feature-flat specs missing a `Module:` + `Covers:` header |
| `ids` | 23 | `TR-001`…`TR-029` not matching the `TR-<AREA\|app>-NNN` grammar |
| `migrations` | 21 | 19 migrations missing the mandatory header / non-canonical filenames (legacy) |
| `gdpr` | 4 | user-data migrations without the declared delete/export pair |
| `ports` | 1 | the `db` finding below (validator-scanner artifact, **not** a manifest defect) |

The four `PASS` findings are the port matches: `supabase_api 54351`, `studio 54353`,
`inbucket 54354`, `analytics 54357`.

### Known validator artifact — the single `ports` WARN

```
WARN ports db Declared local_dev port 54352 for 'db' != supabase/config.toml value 54359.
```

This is **not** a manifest error. The validator's `load_config_ports()` keys ports by their
**top-level** TOML section, so `[db.pooler] port = 54359` collapses onto the same `db` key and
overwrites `[db] port = 54352`. The validator therefore compares our (correct) `db: 54352` against
the wrong "actual" value 54359. The manifest is right per the spec and `config.toml`
(`[db] port = 54352`, `[db.pooler] port = 54359`, both declared). The fix belongs in the validator
(distinguish `db` vs `db.pooler` in the scanner), tracked separately in `agents-local`; in P1
planning mode it is a demoted WARN that does not change exit 0.

---

## 3. Conversion roadmap (P2 – P8)

Each phase is its own **approved** sub-issue under epic #303, gated by independent `grasp-review`
approval (no self-approval). P1 converts nothing; the phases below do the work, and only P8 flips
`strict: true`.

| Phase | Issue | Scope | Clears |
|---|---|---|---|
| **P2** | [#305](https://github.com/graspsoftwarepw/tadaify-app/issues/305) | Restore/author the record **generator** (`bin/migrate-records.mjs`) — the tooling P3–P7 lean on. | enables atomic-record generation |
| **P3** | [#306](https://github.com/graspsoftwarepw/tadaify-app/issues/306) | **BR → atomic MADR**: split `docs/BUSINESS_REQUIREMENTS.md` into per-BR files with full frontmatter (`id/area/status/title/authorized_by` + edge arrays). | bulk of `frontmatter` + `ids` WARN |
| **P4** | [#307](https://github.com/graspsoftwarepw/tadaify-app/issues/307) | **Module registry**: author `docs/modules/registry.yml`, assign `owns` globs over `app/`, add `@module`. | `ownership`, `module_br` |
| **P5** | [#308](https://github.com/graspsoftwarepw/tadaify-app/issues/308) | **Maps**: generate `docs/maps/{views,modules,e2e}.md` + `test-coverage-matrix.md`. | `staleness` baseline |
| **P6** | [#309](https://github.com/graspsoftwarepw/tadaify-app/issues/309) | **Migrations**: add the mandatory `/* … BR/TR … */` header to non-legacy migrations; adopt the filename grammar going forward. | `migrations`, `gdpr` |
| **P7** | [#310](https://github.com/graspsoftwarepw/tadaify-app/issues/310) | **E2E module-first**: add `Module:` + `Covers:` headers to the 41 legacy specs **in place** (grandfathered — not relocated); `e2e/modules/<AREA>/` is the target for new/adopted specs only; wire the requirement↔test edge. | 41 `e2e` WARN + `requirement_test_edge` |
| **P8** | [#311](https://github.com/graspsoftwarepw/tadaify-app/issues/311) | **Flip `strict: true`** once the validator reports `fail=0` in strict mode. | turns enforcement on |

Until P8, the validator runs report-only: it never fails the build, and the WARN count is the
burn-down metric for P2–P7.
