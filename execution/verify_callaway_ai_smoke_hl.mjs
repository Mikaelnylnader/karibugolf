import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

const base = (process.argv[2] || "http://127.0.0.1:4515").replace(/\/$/, "");
const sku = "GK-IR004";
const slug = sku.toLowerCase();
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/callaway-ai-smoke-hl-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: GK-IR004 missing");
check(product?.priceKes === 100000, `catalog: storefront KES price changed to ${product?.priceKes}`);
check(product?.priceCny === 4204, `catalog: storefront RMB price changed to ${product?.priceCny}`);
check(product?.priceUsd === 689.55, `catalog: storefront USD price changed to ${product?.priceUsd}`);
check(product?.status === "In Stock" && String(product?.stock) === "1", "catalog: storefront availability changed");
check(product?.images?.length === 4, `catalog: expected four images, found ${product?.images?.length}`);

const database = new DatabaseSync("backend/golf_kenya.db", { readOnly: true });
const databaseProduct = database.prepare("SELECT * FROM products WHERE sku=?").get(sku);
database.close();
check(databaseProduct?.price_kes === 89297, `database: KES price changed to ${databaseProduct?.price_kes}`);
check(databaseProduct?.price_cny === 4699.84, `database: RMB price changed to ${databaseProduct?.price_cny}`);
check(databaseProduct?.price_usd === 689.55, `database: USD price changed to ${databaseProduct?.price_usd}`);
check(databaseProduct?.status === "Out of Stock" && String(databaseProduct?.stock) === "0", "database: availability changed");
check(databaseProduct?.website_visible === 0, "database: visibility changed");

const imagePairs = [
  ["irons-2024-paradym-ai-smoke-hl___1.jpg", "callaway-paradym-ai-smoke-hl-cavity.jpg"],
  ["irons-2024-paradym-ai-smoke-hl___3.jpg", "callaway-paradym-ai-smoke-hl-face.jpg"],
  ["irons-2024-paradym-ai-smoke-hl___2.jpg", "callaway-paradym-ai-smoke-hl-address.jpg"],
  ["irons-2024-paradym-ai-smoke-hl___4.jpg", "callaway-paradym-ai-smoke-hl-sole.jpg"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Downloads/${source}`));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from supplied JPG`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from supplied JPG`);
}

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/InStock"), "static page: in-stock schema missing");
check(html.includes('priceCurrency\":\"KES'), "static page: KES offer missing");
check(html.includes("callaway-paradym-ai-smoke-hl-cavity.jpg"), "static page: supplied gallery missing");

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
    const localApiImage = response.url().includes("/api/product-images/");
    if (response.status() >= 400 && !response.url().includes("/api/storefront-products") && !localApiImage) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(`${base}/shop/product/${slug}/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  if (options.javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true");
  await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
  await page.waitForTimeout(350);
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
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "Callaway Paradym Ai Smoke HL Irons", `${label}: title mismatch`);
  check(result.stock?.includes("In stock") && result.stock?.includes("1 available"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 100,000"), `${label}: KES price missing`);
  check(result.gallery === 4, `${label}: gallery count ${result.gallery}`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 8, `${label}: specification row count ${result.specRows}`);
  check(result.equipment === 2, `${label}: equipment card count ${result.equipment}`);
  if (options.javaScriptEnabled) check(["Set", "Shaft / flex", "Hand"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
  check(result.source === "https://www.callawaygolf.com/golf-clubs/irons/irons-2024-paradym-ai-smoke-hl.html", `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);

  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await page.getByRole("button", { name: "Enlarge Cavity photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
  }
  if (label === "mobile") await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
  results[label] = { ...result, errors };
  await context.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
