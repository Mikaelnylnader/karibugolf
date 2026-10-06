import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4514").replace(/\/$/, "");
const sku = "GK-PT037";
const slug = sku.toLowerCase();
const officialSource = "https://www.scottycameron.com/articles/introducing-the-scotty-cameron-2025-h25-limited-teryllium-newport-2/";
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/scotty-cameron-h25-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: H25 Limited product missing");
check(product?.categorySlug === "putters", `catalog: category is ${product?.categorySlug}`);
check(product?.priceKes === 20000, `catalog: price is ${product?.priceKes}`);
check(product?.priceCny === 1052.63, `catalog: selling RMB is ${product?.priceCny}`);
check(product?.priceUsd === 154.44, `catalog: selling USD is ${product?.priceUsd}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability is not out of stock / zero");
check(product?.images?.length === 4, `catalog: expected four images, found ${product?.images?.length}`);
check(product?.sizes === "34.5 in", `catalog: official length is ${product?.sizes}`);

const imagePairs = [
  ["2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-3.jpg", "scotty-cameron-h25-teryllium-newport-2-sole.jpg"],
  ["2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-2.jpg", "scotty-cameron-h25-teryllium-newport-2-insert.jpg"],
  ["2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-1.jpg", "scotty-cameron-h25-teryllium-newport-2-face.jpg"],
  ["2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-5.jpg", "scotty-cameron-h25-teryllium-newport-2-address.jpg"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Downloads/${source}`));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from supplied file`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from supplied file`);
}

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/OutOfStock"), "static page: out-of-stock schema missing");
check(html.includes('priceCurrency":"KES'), "static page: KES offer missing");
check(html.includes("scotty-cameron-h25-teryllium-newport-2-sole.jpg"), "static page: primary image missing");
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
  if (options.javaScriptEnabled) {
    await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true", null, { timeout: 8000 }).catch(() => {});
  }
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
    options: [...document.querySelectorAll(".catalog-configurator button")].map((node) => node.textContent?.trim()),
    source: document.querySelector(".club-source")?.getAttribute("href"),
    scrollCraftMounted: document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true",
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "Scotty Cameron H25 Limited Teryllium Newport 2", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 20,000"), `${label}: KES price missing`);
  check(result.gallery === 4, `${label}: gallery count ${result.gallery}`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 9, `${label}: specification row count ${result.specRows}`);
  check(result.equipment === 3, `${label}: equipment card count ${result.equipment}`);
  check(["Teryllium", "Black PVD", "34.5 in", "Tour Black", "Baby T"].every((text) => result.text.includes(text)), `${label}: official H25 details incomplete`);
  if (options.javaScriptEnabled) {
    check(result.scrollCraftMounted, `${label}: Scroll Craft did not mount`);
    check(["Length", "Hand"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
    check(result.options.includes("34.5 in") && result.options.includes("Confirm handedness"), `${label}: configuration values incomplete`);
  }
  check(result.source === officialSource, `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);

  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    const whatsapp = await page.locator(".catalog-configurator .contact-button").getAttribute("href");
    check(whatsapp?.includes("Length%3A%2034.5%20in") && whatsapp.includes("Hand%3A%20Confirm%20handedness"), "desktop: WhatsApp inquiry omitted configuration");
    await page.getByRole("button", { name: "Enlarge Sole photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
  }
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

for (const route of ["/shop/clubs/putters/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const response = await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(response?.status() === 200, `${route}: HTTP ${response?.status()}`);
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, `${route}: H25 product card missing`);
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const response = await page.goto(`${base}/shop/clubs/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(response?.status() === 200, `/shop/clubs/: HTTP ${response?.status()}`);
  check(await page.locator('a[href="/shop/clubs/putters"]').count() > 0, "/shop/clubs/: Putters category link missing");
  await page.close();
}
for (const route of ["/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock H25 leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
