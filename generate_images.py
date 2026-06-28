#!/usr/bin/env python3
"""
Generate product images for all golf products using Gemini flash model.
Runs 3 concurrent API calls to speed things up.
"""

import csv, io, os, json, base64, re, time, urllib.request, concurrent.futures, sys

API_KEY = ""  # Replace with your actual OpenRouter key
MODEL = "google/gemini-3.1-flash-image-preview"
SHEET_URL = "https://docs.google.com/spreadsheets/d/1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY/export?format=csv"
IMG_DIR = "/c/Users/mikae/workspace/golf-kenya/dist/images/products"

# Get batch from command line args
batch_arg = sys.argv[1] if len(sys.argv) > 1 else "all"

os.makedirs(IMG_DIR, exist_ok=True)

# Fetch products
req = urllib.request.Request(SHEET_URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=30) as resp:
    raw = resp.read().decode("utf-8-sig")
reader = csv.DictReader(io.StringIO(raw))

products = []
for row in reader:
    name = (row.get("Name") or "").strip()
    if not name:
        continue
    products.append({
        "sku": (row.get("SKU") or "").strip(),
        "name": name,
        "category": (row.get("Category") or "").strip(),
        "desc": (row.get("Description") or "").strip(),
        "colors": (row.get("Colors") or "").strip(),
    })

def safe_fn(name):
    return re.sub(r'[^a-zA-Z0-9_-]', '', name.replace(" ", "_").replace("/", "_")) + ".jpg"

def generate_product_image(product):
    fname = safe_fn(product["name"])
    fpath = os.path.join(IMG_DIR, fname)
    
    if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
        return f"SKIP: {product['name']}"
    
    colors = product["colors"]
    desc = product["desc"][:100] if product["desc"] else product["name"]
    
    prompt = (
        f"Professional e-commerce product photo of {product['name']}. "
        f"{desc}. "
        f"Color: {colors}. " if colors else ""
        f"Isolated on white background, clean studio lighting, "
        f"600x600, product catalog photography, high quality, centered."
    )
    
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": [{"type": "text", "text": prompt}]}
        ]
    }
    
    try:
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://golfklcubskenya.netlify.app",
            }
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
        
        msg = result.get("choices", [{}])[0].get("message", {})
        images = msg.get("images", [])
        
        if images and "image_url" in images[0]:
            url = images[0]["image_url"]["url"]
            if url.startswith("data:"):
                _, b64 = url.split(",", 1)
                with open(fpath, "wb") as f:
                    f.write(base64.b64decode(b64))
                size = os.path.getsize(fpath) // 1024
                return f"✅ {product['name']} ({size}KB)"
        return f"❌ {product['name']}: no image"
    except Exception as e:
        return f"❌ {product['name']}: {str(e)[:80]}"

# Determine which products to process
if batch_arg == "all":
    batch = products
elif batch_arg == "1":
    batch = products[:45]
elif batch_arg == "2":
    batch = products[45:90]
elif batch_arg == "3":
    batch = products[90:]
else:
    # Specific SKU
    batch = [p for p in products if p["sku"] == batch_arg]
    if not batch:
        print(f"No product found with SKU: {batch_arg}")
        sys.exit(1)

total = len(batch)
print(f"\n{'='*50}")
print(f"Generating {total} product images (batch {batch_arg})")
print(f"{'='*50}\n")

results = []
start_time = time.time()

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(generate_product_image, p): p for p in batch}
    done = 0
    for future in concurrent.futures.as_completed(futures):
        done += 1
        result = future.result()
        results.append(result)
        elapsed = time.time() - start_time
        rate = done / elapsed * 60 if elapsed > 0 else 0
        print(f"  [{done}/{total}] {result}")
        if done % 10 == 0:
            print(f"  → Rate: {rate:.1f} images/min, Elapsed: {elapsed/60:.1f}min")

elapsed = time.time() - start_time
success = sum(1 for r in results if r.startswith("✅"))
failed = sum(1 for r in results if r.startswith("❌"))
skipped = sum(1 for r in results if r.startswith("SKIP"))

print(f"\n{'='*50}")
print(f"Batch {batch_arg} complete!")
print(f"  ✅ Success: {success}")
print(f"  ❌ Failed: {failed}")
print(f"  ⏭ Skipped: {skipped}")
print(f"  ⏱ Time: {elapsed/60:.1f} minutes")
print(f"  📁 Images: {IMG_DIR}")
print(f"{'='*50}")
