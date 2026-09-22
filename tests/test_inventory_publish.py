import shutil
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

import generate
import app as admin_app


class InventoryPublishingTests(unittest.TestCase):
    def test_public_stock_status_and_structured_data(self):
        self.assertEqual(generate.normalize_stock_status("In Stock"), "In Stock")
        for status in ("Out of Stock", "Low Stock", "Pre-order", "Discontinued", ""):
            self.assertEqual(generate.normalize_stock_status(status), "Out of Stock")
        self.assertIn(
            "https://schema.org/OutOfStock",
            generate.seo_jsonld_product("Club", "Description", "SKU-1", "1000", status="Out of Stock"),
        )

    def test_auto_publish_setting_survives_runtime_state_change(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            database = Path(temp_dir) / "golf_kenya.db"
            shutil.copy2(PROJECT_ROOT / "backend" / "golf_kenya.db", database)
            original_database = admin_app.DATABASE
            original_state = admin_app._auto_deploy_enabled
            try:
                admin_app.DATABASE = database
                admin_app.set_auto_deploy(True)
                admin_app._auto_deploy_enabled = False
                self.assertTrue(admin_app.is_auto_deploy_enabled())
                connection = sqlite3.connect(database)
                stored = connection.execute(
                    "SELECT value FROM settings WHERE key='auto_publish'"
                ).fetchone()[0]
                connection.close()
                self.assertEqual(stored, "1")
            finally:
                admin_app.DATABASE = original_database
                admin_app._auto_deploy_enabled = original_state


if __name__ == "__main__":
    unittest.main()
