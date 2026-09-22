from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from site_contact import WHATSAPP_NUMBER, WHATSAPP_DISPLAY, WHATSAPP_LINK, WHATSAPP_QR_PATH
from execution.update_whatsapp import create_qr, update_text
import generate


class WhatsAppTests(unittest.TestCase):
    def test_generators_use_shared_contact(self):
        for content in (generate.render_nav(), generate.render_footer(), generate.generate_script(), generate.seo_jsonld_organization()):
            self.assertIn(WHATSAPP_LINK, content)
            self.assertNotIn("8613262570197", content)
        self.assertIn(WHATSAPP_DISPLAY, generate.render_footer())
        self.assertIn(WHATSAPP_QR_PATH, generate.render_footer())

    def test_surgical_update_preserves_product_message(self):
        old = '<a href="https://wa.me/8613262570197?text=Hi%20Club">+86 13262570197</a>'
        updated = update_text(old)
        self.assertEqual(updated, f'<a href="{WHATSAPP_LINK}?text=Hi%20Club">{WHATSAPP_DISPLAY}</a>')
        self.assertEqual(update_text(updated), updated)

    def test_qr_decodes_to_approved_link_at_footer_size(self):
        try:
            import zxingcpp
        except ImportError:
            self.skipTest("Install tests/requirements.txt for independent QR decoding")
        from PIL import Image
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "qr.png"
            create_qr(path)
            with Image.open(path) as image:
                for size in (100, 120, 124, image.width):
                    result = zxingcpp.read_barcode(image.resize((size, size)))
                    self.assertIsNotNone(result)
                    self.assertEqual(result.text, WHATSAPP_LINK)


if __name__ == "__main__":
    unittest.main()
