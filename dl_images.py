#!/usr/bin/env python3
import urllib.request, urllib.parse, os, re, time, ssl, json

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

OUTPUT_DIR = "C:/Users/mikae/workspace/golf-kenya/dist/images/products"
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def safe_filename(name):
    safe = name.replace(' ', '_')
    safe = re.sub(r'[^\w\-.()]', '', safe)
    return safe + '.jpg'

def download_url(url, timeout=15, referer=None):
    req = urllib.request.Request(url, headers=dict(HEADERS))
    if referer:
        req.add_header('Referer', referer)
    try:
        resp = urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx)
        data = resp.read()
        if len(data) > 1000:
            return data
        return None
    except Exception as e:
        return None

def save_image(data, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'wb') as f:
        f.write(data)
    print(f"  SAVED: {filename} ({len(data)} bytes)")
    return filepath

def try_download(product_name, urls_to_try):
    fname = safe_filename(product_name)
    filepath = os.path.join(OUTPUT_DIR, fname)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        print(f"  EXISTS: {fname}")
        return True
    for i, url in enumerate(urls_to_try):
        print(f"  Try [{i+1}/{len(urls_to_try)}]: {url[:90]}...")
        data = download_url(url)
        if data:
            save_image(data, fname)
            return True
        time.sleep(0.5)
    print(f"  FAILED: {product_name}")
    return False

nohawk = {
    "Nohawk 450H Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/61x1mMqXWUL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/61x1mMqXWUL._AC_SL1500_.jpg",
    ],
    "Nohawk 600H Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/61QJLpEO7sL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/61QJLpEO7sL._AC_SL1500_.jpg",
    ],
    "Nohawk 800M Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71P5LKbphgL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71P5LKbphgL._AC_SL1500_.jpg",
    ],
    "Nohawk 1000M Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71E0A1MaoBL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71E0A1MaoBL._AC_SL1500_.jpg",
    ],
    "Nohawk 1500M Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71Y1VPs7XCL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71Y1VPs7XCL._AC_SL1500_.jpg",
    ],
    "Nohawk 500m Touch Screen Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/61ZPCm7j3dL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/61ZPCm7j3dL._AC_SL1500_.jpg",
    ],
    "Nohawk 800m Touch Screen Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71XRPNnmhTL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71XRPNnmhTL._AC_SL1500_.jpg",
    ],
    "Nohawk 1200m Touch Screen Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71UwrLl-5eL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71UwrLl-5eL._AC_SL1500_.jpg",
    ],
    "Nohawk 600M W Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/61QJLpEO7sL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/61QJLpEO7sL._AC_SL1500_.jpg",
    ],
    "Nohawk 1000M W Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71E0A1MaoBL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71E0A1MaoBL._AC_SL1500_.jpg",
    ],
    "Nohawk 600M Magnetic Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/61iPdE-LM4L._AC_SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61QJLpEO7sL._AC_SL1500_.jpg",
    ],
    "Nohawk 800M Magnetic Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71P5LKbphgL._AC_SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71P5LKbphgL._AC_SX679_.jpg",
    ],
    "Nohawk 1000M Magnetic Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71E0A1MaoBL._AC_SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71E0A1MaoBL._AC_SX679_.jpg",
    ],
    "Nohawk 1200M Magnetic Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71UwrLl-5eL._AC_SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71UwrLl-5eL._AC_SX679_.jpg",
    ],
    "Nohawk 1500M Magnetic Golf Laser Rangefinder": [
        "https://m.media-amazon.com/images/I/71Y1VPs7XCL._AC_SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71Y1VPs7XCL._AC_SX679_.jpg",
    ],
}

footjoy = {
    "FootJoy Rain Grip Golf Glove": [
        "https://m.media-amazon.com/images/I/71YFKF2ppJL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71YFKF2ppJL._AC_SL1500_.jpg",
    ],
    "FootJoy StaSoft Golf Glove": [
        "https://m.media-amazon.com/images/I/71P2-ezTbVL._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71P2-ezTbVL._AC_SL1500_.jpg",
    ],
    "FootJoy Weather Sof Golf Glove": [
        "https://m.media-amazon.com/images/I/71Cj0EIZP9L._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71Cj0EIZP9L._AC_SL1500_.jpg",
    ],
    "FootJoy Pure Touch Golf Glove": [
        "https://m.media-amazon.com/images/I/71TtqW1cC1L._AC_SX679_.jpg",
        "https://m.media-amazon.com/images/I/71TtqW1cC1L._AC_SL1500_.jpg",
    ],
}

print("="*60)
print("NOHAWK RANGEFINDER IMAGES")
print("="*60)
for p, urls in nohawk.items():
    print(f"\n--- {p} ---")
    try_download(p, urls)
    time.sleep(1)

print("\n" + "="*60)
print("FOOTJOY GLOVE IMAGES")
print("="*60)
for p, urls in footjoy.items():
    print(f"\n--- {p} ---")
    try_download(p, urls)
    time.sleep(1)

print("\n" + "="*60)
print("RESULTS")
print("="*60)
for f in sorted(os.listdir(OUTPUT_DIR)):
    if 'nohawk' in f.lower() or 'footjoy' in f.lower() or any(g in f.lower() for g in ['rain_grip','stasoft','weather_sof','pure_touch']):
        fp = os.path.join(OUTPUT_DIR, f)
        print(f"  {f} ({os.path.getsize(fp)} bytes)")
