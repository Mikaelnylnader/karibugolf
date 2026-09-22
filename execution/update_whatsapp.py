"""Apply the approved Karibu contact update without rebuilding or replacing the storefront."""
import argparse
from datetime import datetime
from pathlib import Path
import shutil
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from site_contact import WHATSAPP_NUMBER, WHATSAPP_DISPLAY, WHATSAPP_LINK, WHATSAPP_QR_PATH


def update_text(text):
    for old, new in (
        ("+86 13262570197", WHATSAPP_DISPLAY),
        ("8613262570197", WHATSAPP_NUMBER),
        ("+254 700 000 000", WHATSAPP_DISPLAY),
        ("254700000000", WHATSAPP_NUMBER),
        ("/images/whatsapp-qr.png", WHATSAPP_QR_PATH),
    ):
        text = text.replace(old, new)
    return text


def create_qr(path):
    import qrcode
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(WHATSAPP_LINK)
    qr.make(fit=True)
    image = qr.make_image(fill_color="#1f5132", back_color="white").convert("RGB")
    image.save(path, **({"quality": 100, "subsampling": 0} if path.suffix.lower() == ".jpg" else {}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Default is a dry-run")
    args = parser.parse_args()
    output = ROOT / "dist"
    changes = []
    for path in output.rglob("*"):
        if path.suffix not in (".html", ".js") or not path.is_file() or path.is_symlink():
            continue
        original = path.read_text(encoding="utf-8")
        updated = update_text(original)
        if original != updated:
            changes.append((path, updated))
    aliases = list((output / "images").glob("whatsapp-qr*.png")) + list((output / "images").glob("whatsapp-qr*.jpg"))
    print(f"Contact: {WHATSAPP_DISPLAY} / {WHATSAPP_LINK}")
    print(f"Update {len(changes)} HTML/JS files, {len(aliases)} legacy QR assets and one new cache-safe QR image.")
    if not args.apply:
        print("Dry run only. Use --apply to perform this scoped update.")
        return
    backup = ROOT / ".tmp/backups" / ("whatsapp-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f"))
    backup.mkdir(parents=True)
    for path, content in changes:
        saved = backup / path.relative_to(ROOT)
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, saved)
        path.write_text(content, encoding="utf-8")
    for path in aliases:
        saved = backup / path.relative_to(ROOT)
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, saved)
        create_qr(path)
    create_qr(output / WHATSAPP_QR_PATH.lstrip("/"))
    conn = sqlite3.connect(ROOT / "backend/golf_kenya.db")
    saved_db = sqlite3.connect(backup / "catalog.db")
    try:
        conn.backup(saved_db)
        conn.execute("INSERT INTO settings(key,value) VALUES ('whatsapp_number',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (WHATSAPP_DISPLAY,))
        conn.commit()
    finally:
        saved_db.close()
        conn.close()
    print(f"Updated locally. Backup: {backup}")


if __name__ == "__main__":
    main()
