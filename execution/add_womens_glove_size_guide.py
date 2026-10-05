"""Install the owner-supplied women's glove guide; read-only unless --apply."""
import argparse
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("C:/Users/mikae/Downloads/ChatGPT Image Oct 4, 2026, 05_48_50 PM-1.png")
FILENAME = "womens-golf-glove-size-guide.png"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main(apply: bool, source: Path) -> None:
    if not source.is_file():
        raise FileNotFoundError(source)
    targets = [ROOT / "images/guides" / FILENAME, ROOT / "public/images/guides" / FILENAME]
    print(json.dumps({
        "source": str(source), "sha256": digest(source),
        "targets": [str(target) for target in targets], "apply": apply,
    }, indent=2))
    if not apply:
        return
    backup = ROOT / ".tmp/backups" / (
        "womens-glove-guide-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    for target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            shutil.copy2(target, backup / f"{target.parent.parent.name}-{FILENAME}")
        shutil.copy2(source, target)
        if digest(target) != digest(source):
            raise AssertionError(f"Copied guide differs from source: {target}")
    print(f"Installed unchanged women's glove guide. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=SOURCE)
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
