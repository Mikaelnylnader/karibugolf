/** Check T200's inventory cover and exported card fallback, without writes. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import catalog from "../lib/catalog.generated.json" with { type: "json" };

const base = (process.argv[2] || "http://127.0.0.1:4517").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const cover = "/images/shop/clubs-editorial/t200-back.webp";
const output = `.tmp/t200-thumbnail-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
let products = catalog.products.map(p => p.sku === "GK-IR-TTT" ? { ...p, image: cover } : p);
if (!local) {
  const response = await fetch(`${base}/api/storefront-products`);
  assert.equal(response.status, 200);
  products = (await response.json()).products;
  assert.equal(new URL(products.find(p => p.sku === "GK-IR-TTT").image, base).pathname, cover);
}
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [], errors = [];
try {
  for (const width of [1440, 390]) for (const mode of local ? ["live", "fallback", "no-js"] : ["live", "no-js"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: mode !== "no-js" });
    // Replay one validated live snapshot to protect the upstream Sheet quota.
    await context.route("**/api/storefront-products*", route => mode === "fallback" ? route.abort() : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ products }) }));
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/shop/", "/shop/stock/", "/shop/clubs/golf_irons/"]) {
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.locator("footer.shared-footer").waitFor({ state: "attached" });
      const images = page.locator('[data-live-product-image="GK-IR-TTT"], a[href*="/shop/product/gk-ir-ttt"] img');
      assert.ok(await images.count(), `${route}: no T200 card`);
      await images.evaluateAll(async images => { for (const image of images) { image.loading = "eager"; await image.decode(); } });
      const sources = await images.evaluateAll(images => images.map(image => new URL(image.currentSrc, location.href).pathname));
      assert.ok(sources.every(src => src === cover), `${route}: old thumbnail ${sources.join(", ")}`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      results.push({ route, width, mode, sources });
      if (route === "/" && mode === "live") {
        const section = page.locator(".home-stock");
        await section.evaluate(e => scrollTo(0, e.getBoundingClientRect().top + scrollY + Math.max(0, e.offsetHeight - innerHeight) * .98));
        if (mode !== "no-js") await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        await page.screenshot({ path: `${output}/home-${width}.png` });
      }
    }
    await context.close();
  }
} finally { await browser.close(); }
assert.deepEqual(errors, []);
await writeFile(`${output}/report.json`, JSON.stringify({ base, output, liveApiSnapshot: !local, results, errors }, null, 2));
console.log(JSON.stringify({ output, checks: results.length, errors }));
