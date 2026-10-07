import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

const base = (process.argv[2] || "http://127.0.0.1:4515").replace(/\/$/, "");
const sku = "GK-PT038";
const slug = sku.toLowerCase();
const officialSource = "https://www.scottycameron.com/putters/studio-style/newport-2/";
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/scotty-cameron-studio-style-newport-2-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: Studio Style Newport 2 missing");
check(product?.categorySlug === "putters", `catalog: category is ${product?.categorySlug}`);
check(product?.priceKes === 170053, `catalog: price is ${product?.priceKes}`);
check(product?.priceCny === 8950.16, `catalog: selling RMB is ${product?.priceCny}`);
check(product?.priceUsd === 1313.15, `catalog: selling USD is ${product?.priceUsd}`);
check(product?.status === "Out of Stock" && String(product?.stock) === "0", "catalog: availability mismatch");
check(product?.images?.length === 5, `catalog: expected five images, found ${product?.images?.length}`);

const database = new DatabaseSync("backend/golf_kenya.db", { readOnly: true });
const databaseProduct = database.prepare("SELECT * FROM products WHERE sku=?").get(sku);
database.close();
check(databaseProduct?.price_kes === 170053, `database: KES price is ${databaseProduct?.price_kes}`);
check(databaseProduct?.cost_kes === "Ksh64,620", `database: cost basis is ${databaseProduct?.cost_kes}`);
check(databaseProduct?.status === "Out of Stock" && String(databaseProduct?.stock) === "0", "database: availability mismatch");
check(databaseProduct?.website_visible === 1, "database: product is not public");

const imagePairs = [
  ["C:/Users/mikae/Downloads/specs_newport2.jpg", "scotty-cameron-studio-style-newport-2-hero.jpg"],
  ["C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-06 215123.png", "scotty-cameron-studio-style-newport-2-sole.png"],
  ["C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-06 215136.png", "scotty-cameron-studio-style-newport-2-cavity.png"],
  ["C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-06 215151.png", "scotty-cameron-studio-style-newport-2-address.png"],
  ["C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-06 215206.png", "scotty-cameron-studio-style-newport-2-face.png"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(source));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from supplied file`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from supplied file`);
}

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/OutOfStock"), "static page: out-of-stock schema missing");
check(html.includes('priceCurrency\":\"KES'), "static page: KES offer missing");
check(html.includes("scotty-cameron-studio-style-newport-2-hero.jpg"), "static page: primary image missing");
check(html.includes("in Kenya"), "static page: Kenya SEO title or content missing");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

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
    const ignoredLocalApi = /127\.0\.0\.1|localhost/.test(base) && response.url().includes("/api/");
    if (response.status() >= 400 && !ignoredLocalApi) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(`${base}/shop/product/${slug}/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  if (options.javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true", null, { timeout: 8000 }).catch(() => {});
  await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
  await page.waitForTimeout(400);
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
    mounted: document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true",
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "Scotty Cameron Studio Style Newport 2 Putter", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 170,053"), `${label}: KES price missing`);
  check(result.gallery === 5, `${label}: gallery count ${result.gallery}`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 11, `${label}: specification row count ${result.specRows}`);
  check(result.equipment === 3, `${label}: equipment card count ${result.equipment}`);
  check(["Studio Carbon Steel", "Chain-link", "303 stainless steel", "Full Contact Slim", "Medium"].every((value) => result.text.includes(value)), `${label}: official details incomplete`);
  if (options.javaScriptEnabled) {
    check(result.mounted, `${label}: Scroll Craft did not mount`);
    check(["Length", "Hand"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
  }
  check(result.source === officialSource, `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);

  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await page.getByRole("button", { name: "Enlarge Studio Style photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
  }
  if (label === "mobile") await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

for (const route of ["/shop/clubs/putters/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const response = await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("body").waitFor({ state: "attached" });
  check(response?.status() === 200, `${route}: HTTP ${response?.status()}`);
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, `${route}: product card missing`);
  await page.close();
}

for (const route of ["/", "/shop/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("body").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock product leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
