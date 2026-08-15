import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const subject = join(root, 'bin', 'supabase-cli');

function runWrapper({ declared = '2.114.0', installed = '2.114.0', binary = '2.114.0', omitInstall = false } = {}) {
  const scratch = mkdtempSync(join(tmpdir(), 'supabase-cli-test.'));
  mkdirSync(join(scratch, 'bin'), { recursive: true });
  copyFileSync(subject, join(scratch, 'bin', 'supabase-cli'));
  chmodSync(join(scratch, 'bin', 'supabase-cli'), 0o755);
  writeFileSync(join(scratch, 'package.json'), JSON.stringify({ devDependencies: { supabase: declared } }));

  if (!omitInstall) {
    mkdirSync(join(scratch, 'node_modules', '.bin'), { recursive: true });
    mkdirSync(join(scratch, 'node_modules', 'supabase'), { recursive: true });
    writeFileSync(join(scratch, 'node_modules', 'supabase', 'package.json'), JSON.stringify({ version: installed }));
    writeFileSync(
      join(scratch, 'node_modules', '.bin', 'supabase'),
      `#!/usr/bin/env bash\nif [[ "$1" == "--version" ]]; then printf '%s\\n' "${binary}"; else printf 'ran:%s\\n' "$*"; fi\n`,
    );
    chmodSync(join(scratch, 'node_modules', '.bin', 'supabase'), 0o755);
  }

  const result = spawnSync('bash', [join(scratch, 'bin', 'supabase-cli'), 'status'], {
    cwd: scratch,
    encoding: 'utf8',
  });
  rmSync(scratch, { recursive: true, force: true });
  return result;
}

describe('supabase-cli', () => {
  it('runs the installed exact binary', () => {
    const result = runWrapper();
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('ran:status');
  });

  it('refuses a ranged declaration', () => {
    expect(runWrapper({ declared: '^2.114.0' }).stderr).toContain('must declare one exact');
  });

  it('refuses a missing local install', () => {
    expect(runWrapper({ omitInstall: true }).stderr).toContain("run 'npm ci'");
  });

  it('refuses package and binary mismatches', () => {
    expect(runWrapper({ installed: '2.113.0' }).stderr).toContain('does not match declared');
    expect(runWrapper({ binary: '2.113.0' }).stderr).toContain('binary reports 2.113.0');
  });
});
