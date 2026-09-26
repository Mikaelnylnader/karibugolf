#!/usr/bin/env python3
"""Configure Netlify secrets for the Karibu online product admin without printing them."""

from __future__ import annotations

import json
import os
import secrets
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE_ID = "925395d9-2336-4f0d-81e0-21a72b3c9074"
CREDENTIALS = ROOT / "backend" / "credentials" / "authorized_user.json"
LOGIN_FILE = ROOT / ".tmp" / "online-admin-login.txt"
BUILD_HOOK_FILE = ROOT / ".tmp" / "online-admin-build-hook.txt"


def set_secret(name: str, value: str, scopes: tuple[str, ...]) -> None:
    executable = shutil.which("netlify.cmd" if os.name == "nt" else "netlify")
    if not executable:
        raise RuntimeError("Netlify CLI was not found on PATH.")
    command = [
        executable, "env:set", name, value, "--site", SITE_ID, "--secret", "--force",
        "--context", "production", "deploy-preview", "branch-deploy",
        "--scope", *scopes,
    ]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=90)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)


def main() -> None:
    credentials = json.loads(CREDENTIALS.read_text(encoding="utf-8"))
    required = {"client_id", "client_secret", "refresh_token"}
    if not required.issubset(credentials):
        raise RuntimeError("The Google OAuth file is missing required refresh credentials.")
    password = secrets.token_urlsafe(18)
    signing_secret = secrets.token_urlsafe(48)
    hook = BUILD_HOOK_FILE.read_text(encoding="utf-8").strip()
    if not hook.startswith("https://api.netlify.com/build_hooks/"):
        raise RuntimeError("Build hook file is missing or invalid.")
    set_secret("GOOGLE_OAUTH_JSON", json.dumps(credentials, separators=(",", ":")), ("builds", "functions"))
    set_secret("KARIBU_ADMIN_PASSWORD", password, ("functions",))
    set_secret("KARIBU_ADMIN_SECRET", signing_secret, ("functions",))
    set_secret("KARIBU_BUILD_HOOK", hook, ("functions",))
    LOGIN_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOGIN_FILE.write_text(f"Karibu Golf online admin\nURL: https://karibugolf.com/admin/\nPassword: {password}\n", encoding="utf-8")
    print(f"Configured Netlify secrets. Login details saved to {LOGIN_FILE}")


if __name__ == "__main__":
    main()
