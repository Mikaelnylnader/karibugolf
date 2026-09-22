#!/usr/bin/env python3
"""Run the Karibu Golf storefront and product admin together."""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parents[1]
DIST_DIR = PROJECT_DIR / "dist"
ADMIN_APP = PROJECT_DIR / "backend" / "app.py"


def stop_process(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)


def main() -> int:
    if not (DIST_DIR / "index.html").exists():
        raise FileNotFoundError("Storefront is missing. Run: python generate.py")
    if not ADMIN_APP.exists():
        raise FileNotFoundError("Backend application is missing: backend/app.py")

    print("Karibu Golf local development")
    print("  Storefront:    http://localhost:8080")
    print("  Product admin: http://localhost:5000")
    print("  Add product:   http://localhost:5000/products/new")
    print("Press Ctrl+C to stop both services.\n")

    storefront = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "http.server",
            "8080",
            "--bind",
            "127.0.0.1",
            "--directory",
            str(DIST_DIR),
        ],
        cwd=PROJECT_DIR,
    )
    admin = subprocess.Popen(
        [sys.executable, str(ADMIN_APP), "5000"],
        cwd=ADMIN_APP.parent,
    )
    processes = (storefront, admin)

    try:
        while True:
            for process in processes:
                return_code = process.poll()
                if return_code is not None:
                    print(f"A development service stopped with exit code {return_code}.")
                    return return_code
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping Karibu Golf development services...")
        return 0
    finally:
        for process in processes:
            stop_process(process)


if __name__ == "__main__":
    raise SystemExit(main())

