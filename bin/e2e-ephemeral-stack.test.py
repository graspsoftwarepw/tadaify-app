#!/usr/bin/env python3
from __future__ import annotations

import base64
import importlib.util
import json
from importlib.machinery import SourceFileLoader
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT = Path(__file__).with_name("e2e-ephemeral-stack")
LOADER = SourceFileLoader("tadaify_e2e_ephemeral", str(SCRIPT))
SPEC = importlib.util.spec_from_loader(LOADER.name, LOADER)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class EphemeralStackContractTest(unittest.TestCase):
    def test_hook_secret_uses_the_standard_base64_contract_required_by_the_cli(self) -> None:
        secret = MODULE.hook_secret()
        self.assertTrue(secret.startswith("v1,whsec_"))
        self.assertEqual(len(base64.b64decode(secret.removeprefix("v1,whsec_"))), 32)

    def test_render_config_moves_every_binding_into_the_reserved_band(self) -> None:
        source = """project_id = \"main\"
[api]
port = 44210
[db]
port = 44211
shadow_port = 44212
[inbucket]
enabled = true
port = 44214
[studio]
enabled = true
port = 44213
[auth]
site_url = \"http://127.0.0.1:44200\"
additional_redirect_urls = [\"http://127.0.0.1:44200\"]
[auth.hook.before_user_created]
enabled = true
uri = \"http://host.docker.internal:44210/functions/v1/before-user-created\"
[edge_runtime]
inspector_port = 44218
[analytics]
enabled = true
port = 44217
"""
        rendered = MODULE.render_config(source, "branch-owned", 45_400)
        self.assertIn('project_id = "branch-owned"', rendered)
        self.assertIn("port = 45401", rendered)
        self.assertIn("port = 45402", rendered)
        self.assertIn("shadow_port = 45400", rendered)
        self.assertIn("port = 45404", rendered)
        self.assertIn('site_url = "http://127.0.0.1:45406"', rendered)
        self.assertIn(
            'uri = "http://host.docker.internal:45401/functions/v1/before-user-created"',
            rendered,
        )
        self.assertIn("inspector_port = 45405", rendered)
        self.assertNotIn("442", rendered)
        self.assertEqual(rendered.count("enabled = false"), 2)

    def test_status_exports_every_browser_consumer_from_the_ephemeral_band(self) -> None:
        exported = MODULE.parse_status(
            'API_URL="http://127.0.0.1:45401"\n'
            'ANON_KEY="anon"\n'
            'SERVICE_ROLE_KEY="service"\n',
            45_400,
        )
        self.assertEqual(exported["PLAYWRIGHT_BASE_URL"], "http://127.0.0.1:45406")
        self.assertEqual(exported["TEST_BASE_URL"], "http://127.0.0.1:45406")
        self.assertEqual(exported["APP_URL"], "http://127.0.0.1:45406")
        self.assertEqual(exported["SUPABASE_URL"], "http://127.0.0.1:45401")
        self.assertEqual(exported["INBUCKET_URL"], "http://127.0.0.1:45404")
        self.assertEqual(exported["E2E_ISOLATED_STACK"], "1")

    def test_run_enters_runtime_slot_before_reentering_the_inner_lifecycle(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            helper = Path(directory) / "runtime-slots"
            helper.touch()
            completed = subprocess.CompletedProcess([], 17)
            with (
                mock.patch.object(MODULE, "RUNTIME_SLOTS", helper),
                mock.patch.object(MODULE, "project_slug", return_value="owned-0123456789"),
                mock.patch.object(MODULE.subprocess, "run", return_value=completed) as run,
            ):
                self.assertEqual(
                    MODULE.run_admitted(["npx", "playwright", "test", "focused.spec.ts"]), 17
                )
        command = run.call_args.args[0]
        self.assertEqual(
            command[:9],
            [
                str(helper),
                "run",
                "--repo",
                str(MODULE.REPO),
                "--purpose",
                MODULE.PURPOSE,
                "--mode",
                "test",
                "--",
            ],
        )
        self.assertEqual(
            command[-5:], ["--", "npx", "playwright", "test", "focused.spec.ts"]
        )
        self.assertLess(command.index("run"), command.index("_run-inner"))

    def test_public_cli_forwards_no_args_spec_and_playwright_flags(self) -> None:
        cases = [
            (["npx", "playwright", "test"], ["npx", "playwright", "test"]),
            (
                ["npx", "playwright", "test", "e2e/focused.spec.ts"],
                ["npx", "playwright", "test", "e2e/focused.spec.ts"],
            ),
            (
                ["npx", "playwright", "test", "--ui", "--project=desktop"],
                ["npx", "playwright", "test", "--ui", "--project=desktop"],
            ),
        ]
        with tempfile.TemporaryDirectory() as directory:
            skill = Path(directory)
            scripts = skill / "scripts"
            scripts.mkdir()
            helper = scripts / "runtime-slots"
            helper.write_text(
                "#!/bin/sh\nprintf '%s\\n' \"$@\"\nexit 17\n",
                encoding="utf-8",
            )
            helper.chmod(0o755)
            for supplied, expected in cases:
                completed = subprocess.run(
                    [sys.executable, str(SCRIPT), "run", "--", *supplied],
                    text=True,
                    capture_output=True,
                    env={**os.environ, "GRASP_LOCAL_RUNTIME_SKILL_DIR": str(skill)},
                )
                self.assertEqual(completed.returncode, 17, completed.stderr)
                forwarded = completed.stdout.splitlines()
                marker = forwarded.index("_run-inner")
                inner_args = forwarded[marker + 3 :]
                if inner_args[:1] == ["--"]:
                    inner_args = inner_args[1:]
                self.assertEqual(inner_args, expected)

    def test_public_cli_rejects_an_implicit_or_non_playwright_command(self) -> None:
        for supplied in ([], ["focused.spec.ts"], ["true"]):
            completed = subprocess.run(
                [sys.executable, str(SCRIPT), "run", "--", *supplied],
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("explicit command boundary", completed.stderr)

    def test_local_package_scripts_publish_the_explicit_playwright_boundary(self) -> None:
        package = json.loads((MODULE.REPO / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(
            package["scripts"]["test:e2e:local"],
            "bin/e2e-ephemeral-stack run -- npx playwright test",
        )
        self.assertEqual(
            package["scripts"]["test:e2e:ui:local"],
            "bin/e2e-ephemeral-stack run -- npx playwright test --ui",
        )

    def test_executable_e2e_code_has_no_fixed_main_stack_urls(self) -> None:
        fixed = re.compile(r"https?://(?:localhost|127\.0\.0\.1):442(?:00|10|14)")
        offenders: list[str] = []
        for path in sorted((MODULE.REPO / "e2e").rglob("*.ts")):
            for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                stripped = line.lstrip()
                if stripped.startswith(("//", "*", "/*")):
                    continue
                if fixed.search(line):
                    offenders.append(f"{path.relative_to(MODULE.REPO)}:{number}")
        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
