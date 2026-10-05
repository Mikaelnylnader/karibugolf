import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4512").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const sku = "GK-DR001";
const slug = sku.toLowerCase();
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/sim2-max-driver-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: SIM2 Max Driver missing");
check(product?.priceKes === 119274, `catalog: price ${product?.priceKes}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability mismatch");
check(product?.images?.length === 5, `catalog: expected five images, found ${product?.images?.length}`);

const imagePairs = [
  ["JJI65_zoom_D.jpg", "taylormade-sim2-max-driver-sole.jpg"],
  ["JJI65_zoom_D2.jpg", "taylormade-sim2-max-driver-crown.jpg"],
  ["JJI65_zoom_D3.jpg", "taylormade-sim2-max-driver-face.jpg"],
  ["JJI65_zoom_D4.jpg", "taylormade-sim2-max-driver-profile.jpg"],
  ["JJI65_zoom_D5.jpg", "taylormade-sim2-max-driver-headcover.jpg"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Downloads/${source}`));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from source`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from source`);
}

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/OutOfStock"), "static page: out-of-stock schema missing");
check(html.includes('priceCurrency":"KES'), "static page: KES offer missing");

if (!local) {
  const response = await fetch(`${base}/api/storefront-products?sku=${sku}`);
  const live = response.ok ? (await response.json()).products?.[0] : null;
  check(Boolean(live), `live API: ${sku} missing (HTTP ${response.status})`);
  check(live?.priceKes === 119274, `live API: price ${live?.priceKes}`);
  check(live?.status === "Out of Stock" && Number(live?.stock) === 0, "live API: availability mismatch");
  check(new URL(live?.image || "/", base).pathname === "/images/products/taylormade-sim2-max-driver-sole.jpg", "live API: image mismatch");
  results.liveApi = live;
}

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
for (const contextOptions of [
  { label: "desktop", viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "compact", viewport: { width: 360, height: 640 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "reduced", viewport: { width: 390, height: 844 }, reducedMotion: "reduce", javaScriptEnabled: true },
  { label: "no-js", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: false },
]) {
  const { label, ...options } = contextOptions;
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    const ignoredLocalApi = local && (response.url().includes("/api/storefront-products") || response.url().includes("/api/product-images/"));
    if (response.status() >= 400 && !ignoredLocalApi) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(`${base}/shop/product/${slug}/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  if (options.javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true");
  await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    stock: document.querySelector(".catalog-stock")?.textContent?.trim(),
    price: document.querySelector(".club-price")?.textContent?.trim(),
    gallery: document.querySelectorAll(".club-thumbnails button").length,
    features: document.querySelectorAll(".product-tech-rail article").length,
    specRows: document.querySelectorAll(".club-specs tbody tr").length,
    equipment: document.querySelectorAll(".product-equipment-grid article").length,
    groups: [...document.querySelectorAll(".catalog-configurator legend")].map((node) => node.textContent?.trim()),
    source: document.querySelector(".club-source")?.getAttribute("href"),
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/product-images/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "TaylorMade SIM2 Max Driver", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 119,274"), `${label}: KES price missing`);
  check(!result.text.includes("$921") && !result.text.includes("¥5,616"), `${label}: foreign public price found`);
  check(result.gallery === 5, `${label}: gallery count ${result.gallery}`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 3, `${label}: specification row count ${result.specRows}`);
  check(result.equipment === 3, `${label}: equipment card count ${result.equipment}`);
  if (options.javaScriptEnabled) check(["Hand", "Loft", "Shaft / flex"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
  check(result.source === "https://www.taylormadegolf.com/SIM2-Max-Driver/DW-JJI65.html?lang=en_US", `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);
  if (label === "desktop") await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

for (const route of ["/shop/clubs/", "/shop/clubs/drivers/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, `${route}: driver card missing`);
  await page.close();
}
for (const route of ["/", "/shop/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock driver leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
