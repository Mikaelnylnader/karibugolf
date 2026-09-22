import shutil
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

import app as admin_app


class AdminPricingTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_database = Path(self.temp_dir.name) / "golf_kenya.db"
        shutil.copy2(PROJECT_ROOT / "backend" / "golf_kenya.db", self.temp_database)
        self.original_database = admin_app.DATABASE
        admin_app.DATABASE = self.temp_database
        admin_app.init_db()
        admin_app.app.config.update(TESTING=True)
        self.client = admin_app.app.test_client()

    def tearDown(self):
        admin_app.DATABASE = self.original_database
        self.temp_dir.cleanup()

    def test_cny_landed_cost_profit_and_currency_formulas(self):
        result = admin_app.calc_margin(
            50_000,
            "1200",
            "2500",
            {"cny_to_kes": 19.0, "usd_to_kes": 129.5},
        )
        self.assertEqual(result["cost_kes_from_cny"], 22_800)
        self.assertEqual(result["cost_kes_total"], 25_300)
        self.assertEqual(result["cost_usd_total"], 195.37)
        self.assertEqual(result["profit_kes"], 24_700)
        self.assertEqual(result["profit_usd"], 190.73)
        self.assertEqual(result["margin_pct"], 49.4)

    def test_product_form_has_one_working_field_per_currency(self):
        response = self.client.get("/products/new")
        html = response.get_data(as_text=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(html.count('name="price_cny"'), 1)
        self.assertEqual(html.count('name="price_kes"'), 1)
        self.assertEqual(html.count('name="price_usd"'), 1)
        self.assertEqual(html.count('name="cost_cny"'), 1)
        self.assertEqual(html.count('name="cost_kes"'), 1)
        self.assertIn('id="priceInput" readonly', html)
        self.assertIn('id="priceUsdInput" readonly', html)
        self.assertIn("const CNY_TO_KES = 19.0", html)
        self.assertIn("const USD_TO_KES = 129.5", html)

    def test_create_and_edit_apply_server_side_conversions(self):
        create_data = {
            "sku": "TEST-FX-001",
            "name": "Currency Formula Test Club",
            "category_slug": "drivers",
            "description": "Disposable test product",
            "cost_cny": "1000.50",
            "cost_kes": "2500",
            "price_cny": "3000",
            "price_kes": "",
            "price_usd": "",
            "status": "In Stock",
            "stock": "1",
            "feature_rows": "[]",
        }
        with patch.object(admin_app, "trigger_auto_publish"), patch.object(admin_app, "sync_to_sheet"):
            response = self.client.post("/products/new", data=create_data)
        self.assertEqual(response.status_code, 302)

        connection = sqlite3.connect(self.temp_database)
        created = connection.execute(
            "SELECT price_cny, price_kes, price_usd, cost_cny, cost_kes FROM products WHERE sku=?",
            ("TEST-FX-001",),
        ).fetchone()
        connection.close()
        self.assertAlmostEqual(created[0], 3_000.00, places=2)
        self.assertEqual(created[1], 57_000)
        self.assertAlmostEqual(created[2], 440.15, places=2)
        self.assertEqual(created[3], "1000.5")
        self.assertEqual(created[4], "2500")

        edit_data = dict(create_data)
        edit_data.update({"price_cny": "3500", "price_usd": "1", "price_kes": "1"})
        with patch.object(admin_app, "trigger_auto_publish"), patch.object(admin_app, "sync_to_sheet"):
            response = self.client.post("/products/TEST-FX-001/edit", data=edit_data)
        self.assertEqual(response.status_code, 302)

        connection = sqlite3.connect(self.temp_database)
        edited = connection.execute(
            "SELECT price_cny, price_kes, price_usd FROM products WHERE sku=?", ("TEST-FX-001",)
        ).fetchone()
        connection.close()
        self.assertAlmostEqual(edited[0], 3_500.00, places=2)
        self.assertEqual(edited[1], 66_500)
        self.assertAlmostEqual(edited[2], 513.51, places=2)

    def test_exchange_rates_can_be_saved_in_settings(self):
        response = self.client.post(
            "/settings",
            data={
                "shop_name": "Karibu Golf",
                "currency": "KES",
                "tax_rate": "16",
                "cny_to_kes": "18.25",
                "usd_to_kes": "129.75",
            },
        )
        self.assertEqual(response.status_code, 302)
        connection = sqlite3.connect(self.temp_database)
        settings = dict(
            connection.execute(
                "SELECT key, value FROM settings WHERE key IN ('cny_to_kes', 'usd_to_kes')"
            ).fetchall()
        )
        connection.close()
        self.assertEqual(settings, {"cny_to_kes": "18.25", "usd_to_kes": "129.75"})


if __name__ == "__main__":
    unittest.main()
