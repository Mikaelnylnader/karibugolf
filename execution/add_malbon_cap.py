"""Reuse the safe offline cap addition flow with owner cost RMB 66."""
import argparse
import add_taylormade_qi4d_cap as cap
cap.SKU = "GK-HC011"
cap.NAME = "Malbon M-Logo Golf Cap"
cap.COST_CNY = 66
cap.BACKUP_PREFIX = "malbon-cap-"
cap.COLOURS = ["Navy", "Green", "White"]
cap.DESCRIPTION = "Malbon M-logo golf cap with curved brim, embroidered front motif, brim mascot badge and perforated panels shown in supplier references. Navy, Green and White colour preferences; adjustable rear closure shown on White. Exact model, fit, fabric and availability must be confirmed. AI-enhanced supplied-photo references."
cap.IMAGES = [f"/images/products/gk-hc011/malbon-cap-{colour}{suffix}.webp" for colour in ["navy","green","white"] for suffix in ["","-right","-left","-rear"]]
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    cap.main(parser.parse_args().apply)
