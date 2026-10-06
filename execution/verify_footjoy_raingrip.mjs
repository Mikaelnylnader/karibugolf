import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4514").replace(/\/$/, "");
const sku = "GK-GL007";
const slug = sku.toLowerCase();
const officialSource = "https://www.footjoy.eu/en/men/gloves/raingrip-pair/024PAI.html?dwvar_024PAI_color=66083E";
const output = `.tmp/footjoy-raingrip-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
async function navigate(page, route) {
  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await page.goto(`${base}${route}`, { waitUntil: "commit" });
    await page.locator("footer.shared-footer").waitFor({ state: "attached" });
    const title = await page.locator("h1").first().textContent().catch(() => "");
    if (response?.ok() && title !== "This page couldn’t load") return response;
  }
  return response;
}

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: RainGrip missing");
check(product?.name === "FootJoy RainGrip Pair Golf Gloves", `catalog: name is ${product?.name}`);
check(product?.categorySlug === "gloves", `catalog: category is ${product?.categorySlug}`);
check(product?.priceKes === 5294, `catalog: preserved price is ${product?.priceKes}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability is not out of stock / zero");
check(product?.images?.length === 5, `catalog: expected five images, found ${product?.images?.length}`);

const pairs = [
  ["Skärmbild 2026-10-04 172252.png", "footjoy-raingrip-pair-set.png"],
  ["Skärmbild 2026-10-04 172313.png", "footjoy-raingrip-pair-packaging.png"],
  ["Skärmbild 2026-10-04 172323.png", "footjoy-raingrip-pair-grip.png"],
  ["Skärmbild 2026-10-04 172330.png", "footjoy-raingrip-pair-palm-left.png"],
  ["Skärmbild 2026-10-04 172340.png", "footjoy-raingrip-pair-palm-right.png"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of pairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Pictures/Screenshots/${source}`));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from supplied file`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from supplied file`);
}

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/OutOfStock"), "static page: out-of-stock schema missing");
check(html.includes('priceCurrency":"KES'), "static page: KES offer missing");
check(html.includes("footjoy-raingrip-pair-set.png"), "static page: primary image missing");

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
  const response = await navigate(page, `/shop/product/${slug}/`);
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
    groups: [...document.querySelectorAll(".catalog-configurator legend")].map((node) => node.textContent?.trim()),
    options: [...document.querySelectorAll(".catalog-configurator button")].map((node) => node.textContent?.trim()),
    source: document.querySelector(".club-source")?.getAttribute("href"),
    guide: Boolean(document.querySelector("#glove-size-guide")),
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "FootJoy RainGrip Pair Golf Gloves", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 5,294"), `${label}: preserved KES price missing`);
  check(result.gallery === 5, `${label}: gallery count ${result.gallery}`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 9, `${label}: specification row count ${result.specRows}`);
  check(result.guide, `${label}: shared glove size guide missing`);
  check(["Sure-Grip", "Quick-Dry", "Regular pair", "Black", "XXL"].every((text) => result.text.includes(text)), `${label}: official RainGrip details incomplete`);
  if (options.javaScriptEnabled) {
    check(["Size", "Pack", "Colour"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
    check(result.options.includes("Small (S)") && result.options.includes("Regular pair") && result.options.includes("Black"), `${label}: configuration values incomplete`);
  }
  check(result.source === officialSource, `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);
  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    const whatsapp = await page.locator(".catalog-configurator .contact-button").getAttribute("href");
    check(whatsapp?.includes("Size%3A%20Small%20(S)") && whatsapp.includes("Pack%3A%20Regular%20pair") && whatsapp.includes("Colour%3A%20Black"), "desktop: WhatsApp inquiry omitted selected options");
    await page.getByRole("button", { name: "Enlarge Pair + packaging photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
  }
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

for (const route of ["/shop/accessories/", "/shop/accessories/gloves/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const response = await navigate(page, route);
  check(response?.status() === 200, `${route}: HTTP ${response?.status()}`);
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, `${route}: RainGrip product card missing`);
  await page.close();
}
for (const route of ["/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await navigate(page, route);
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock RainGrip leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
