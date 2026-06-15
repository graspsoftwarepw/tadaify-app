# Local development

## Supabase stack

This repository runs its own local Supabase stack alongside other projects on
the same machine. Each project owns a fixed, non-overlapping port range.

### Port allocation

| Service | App   | Preview | API   | DB    | Studio | Inbucket | Analytics | Pooler | Shadow |
| ------- | ----- | ------- | ----- | ----- | ------ | -------- | --------- | ------ | ------ |
| tadaify | 44200 | 44201   | 44210 | 44211 | 44213  | 44214    | 44217     | 44219  | 44212  |

Ports are governed by **`ports.yaml`** at the repo root — the single source of truth
(grasp-running-local-apps). `supabase/config.toml` and this table mirror it; there is no
cross-project port registry any more (each repo owns its own reserved band). tadaify owns
**`44200`–`44229`**: the app at the range start, the Supabase stack in the "second ten"
(`44210`–`44219`), and a `dynamic` ad-hoc pool (`44220`–`44229`). Change a port in
`ports.yaml` first, run its lint, then update `supabase/config.toml` in lockstep.

### First-time setup

```bash
cd ~/git/graspsoftwarepw/tadaify-app
npm run setup
```

`npm run setup` delegates to `bin/e2e-bootstrap.sh`, which:

1. Verifies Docker is installed and running.
2. Verifies Node is available.
3. Verifies or installs the Supabase CLI where safe.
4. Runs `npm install` if `node_modules` is not populated.
5. Installs the Playwright Chromium browser if missing.
6. Starts Supabase Local, resets the DB with `supabase/seed.sql`, and writes
   `.env.local` plus `.dev.vars`.

Use `bash bin/e2e-bootstrap.sh --no-reset` to keep the existing local DB volume.

If you only need to refresh Supabase Local and env files:

```bash
npm run test:local:prepare
```

### Running Playwright locally

```bash
npm run test:e2e:local
```

Local mode uses:

- Supabase Local API: `http://127.0.0.1:44210`
- Supabase Studio: `http://127.0.0.1:44213`
- Inbucket UI: `http://127.0.0.1:44214`
- App URL: `http://127.0.0.1:44200`

For the interactive Playwright UI after local env preparation:

```bash
npm run test:local:prepare
npm run test:e2e:ui:local -- e2e/register-cascade.spec.ts
```

### Port collisions

`tadaify-app` permanently reserves the Supabase ports `44210`, `44211`, `44212`,
`44213`, `44214`, `44217`, and `44219` (see `ports.yaml`). `bin/e2e-local-env.sh`
detects collisions before starting Supabase and reports the exact container or
process holding the port.

If another Supabase Local project is holding one of these ports, stop that
project non-destructively:

```bash
supabase stop --project-id <project-id>
```

Do not add `--no-backup` unless you intentionally want to delete that project's
local data volume.
