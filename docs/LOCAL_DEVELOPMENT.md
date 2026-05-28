# Local development

## Supabase stack

This repository runs its own local Supabase stack alongside other projects on
the same machine. Each project owns a fixed, non-overlapping port range.

### Port allocation

| Project       | Base port | API   | DB    | Studio | Inbucket | Analytics | Pooler | Shadow DB |
| ------------- | --------- | ----- | ----- | ------ | -------- | --------- | ------ | --------- |
| untiltify-app | 54320     | 54321 | 54322 | 54323  | 54324    | 54327     | 54329  | 54320     |
| tadaify-app   | 54350     | 54351 | 54352 | 54353  | 54354    | 54357     | 54359  | 54350     |

The full Tadaify port map is defined in `supabase/config.toml`. Do not edit
these ports ad hoc; local Supabase projects must keep unique ranges.

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

- Supabase Local API: `http://127.0.0.1:54351`
- Supabase Studio: `http://127.0.0.1:54353`
- Inbucket UI: `http://127.0.0.1:54354`
- App URL: `http://127.0.0.1:5173`

For the interactive Playwright UI after local env preparation:

```bash
npm run test:local:prepare
npm run test:e2e:ui:local -- e2e/register-cascade.spec.ts
```

### Port collisions

`tadaify-app` permanently reserves `54350`, `54351`, `54352`, `54353`,
`54354`, `54357`, and `54359`. `bin/e2e-local-env.sh` detects collisions before
starting Supabase and reports the exact container or process holding the port.

If another Supabase Local project is holding one of these ports, stop that
project non-destructively:

```bash
supabase stop --project-id <project-id>
```

Do not add `--no-backup` unless you intentionally want to delete that project's
local data volume.
