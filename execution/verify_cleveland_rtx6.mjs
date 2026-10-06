import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4513").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const sku = "GK-WG006";
const slug = sku.toLowerCase();
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/cleveland-rtx6-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: RTX 6 missing");
check(product?.name === "Cleveland RTX 6 ZipCore Tour Satin Wedge", `catalog: name ${product?.name}`);
check(product?.priceKes === 12694, `catalog: price ${product?.priceKes}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability mismatch");
check(product?.images?.length === 6, `catalog: expected six images, found ${product?.images?.length}`);
check(product?.colors === "Tour Satin", `catalog: finish ${product?.colors}`);

const imagePairs = [
  ["CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-1.jpg", "cleveland-rtx6-zipcore-tour-satin-back.jpg"],
  ["CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-2.jpg", "cleveland-rtx6-zipcore-tour-satin-face.jpg"],
  ["CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-3.jpg", "cleveland-rtx6-zipcore-tour-satin-grooves.jpg"],
  ["CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-4.jpg", "cleveland-rtx6-zipcore-tour-satin-cavity.jpg"],
  ["CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-5.jpg", "cleveland-rtx6-zipcore-tour-satin-sole.jpg"],
  ["CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-6.webp", "cleveland-rtx6-zipcore-tour-satin-topline.webp"],
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
check(html.includes("Cleveland RTX 6 ZipCore Tour Satin Wedge"), "static page: title missing");

if (!local) {
  const response = await fetch(`${base}/api/storefront-products?sku=${sku}`);
  const live = response.ok ? (await response.json()).products?.[0] : null;
  check(Boolean(live), `live API: ${sku} missing (HTTP ${response.status})`);
  check(live?.priceKes === 12694, `live API: price ${live?.priceKes}`);
  check(live?.status === "Out of Stock" && Number(live?.stock) === 0, "live API: availability mismatch");
  check(new URL(live?.image || "/", base).pathname === "/images/products/cleveland-rtx6-zipcore-tour-satin-back.jpg", "live API: image mismatch");
  results.liveApi = live;
}

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const contexts = local ? [
  { label: "desktop", viewport: { width: 1440, height: 1000 }, javaScriptEnabled: true },
  { label: "mobile", viewport: { width: 390, height: 844 }, javaScriptEnabled: true },
  { label: "no-js", viewport: { width: 390, height: 844 }, javaScriptEnabled: false },
] : [
  { label: "production", viewport: { width: 1440, height: 1000 }, javaScriptEnabled: false },
];

for (const contextOptions of contexts) {
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
    sources: [...document.querySelectorAll(".club-thumbnails img")].map((image) => image.getAttribute("src")),
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
  check(result.title === "Cleveland RTX 6 ZipCore Tour Satin Wedge", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 12,694"), `${label}: KES price missing`);
  check(result.gallery === 6, `${label}: gallery count ${result.gallery}`);
  check(result.sources.some((source) => source?.includes("tour-satin-topline.webp")), `${label}: topline image missing`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 4, `${label}: specification row count ${result.specRows}`);
  check(result.equipment === 3, `${label}: equipment card count ${result.equipment}`);
  if (options.javaScriptEnabled) check(["Hand", "Loft / bounce / grind", "Finish", "Shaft"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
  check(result.text.includes("HydraZip") && result.text.includes("ZipCore") && result.text.includes("UltiZip"), `${label}: technology copy missing`);
  check(result.source === "https://us.dunlopsports.com/cleveland-golf/clubs/wedges/rtx-6-zipcore/rtx-6-zipcore-tour-satin-wedge/30227308.html", `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);
  if (label === "desktop") await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

if (local) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}/shop/clubs/wedges/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, "/shop/clubs/wedges/: RTX 6 card missing");
  await page.close();

  const clubs = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await clubs.goto(`${base}/shop/clubs/`, { waitUntil: "commit" });
  await clubs.locator("footer.shared-footer").waitFor({ state: "attached" });
  const wedgesText = (await clubs.locator("#wedges").innerText()).replace(/\s+/g, " ").toLowerCase();
  check(wedgesText.includes("3 products"), `/shop/clubs/: Wedges product count missing (${wedgesText})`);
  await clubs.close();

  for (const route of ["/", "/shop/", "/shop/stock/"]) {
    const selection = await browser.newPage({ viewport: { width: 1180, height: 820 } });
    await selection.goto(`${base}${route}`, { waitUntil: "commit" });
    await selection.locator("footer.shared-footer").waitFor({ state: "attached" });
    check(await selection.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock RTX 6 leaked into in-stock selection`);
    await selection.close();
  }
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, failures }, null, 2));
if (failures.length) process.exitCode = 1;
