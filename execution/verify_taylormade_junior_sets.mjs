import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4514").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const sku = "GK-JR001";
const slug = sku.toLowerCase();
const officialSource = "https://www.taylormadegolf.com/Team-TaylorMade-Junior-Sets/DW-TC602.html?lang=en_US";
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/taylormade-junior-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(catalog.categories.find((item) => item.slug === "junior_sets")), "catalog: Junior Sets category missing");
check(Boolean(product), "catalog: Team TaylorMade Junior Golf Set missing");
check(product?.categorySlug === "junior_sets", `catalog: category is ${product?.categorySlug}`);
check(product?.priceKes === 102234, `catalog: price changed to ${product?.priceKes}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability is not out of stock / zero");
check(product?.images?.length === 7, `catalog: expected seven product images, found ${product?.images?.length}`);
for (const size of ["Size 1", "Size 2", "Size 3"]) check(product?.sizes?.includes(size), `catalog: ${size} details missing`);

const imagePairs = [
  ["V98596_zoom_D3.jpg", "taylormade-junior-set-bag.jpg"],
  ["TMJR24-FnB-3_2024-04-11-174508_kzrg~W1250_H900_Mcrop_P50-50.jpg", "taylormade-junior-set-woods.jpg"],
  ["TMJR24-FnB-4_2024-04-11-174323_egvg~W1250_H900_Mcrop_P50-50.jpg", "taylormade-junior-set-irons-putter.jpg"],
  ["Rectangle-15~W1200_H900_Mcrop_CZ1_P50-50.jpg", "taylormade-junior-set-bag-closeup.jpg"],
  ["V98596_zoom_D4.jpg", "taylormade-junior-set-fairway.jpg"],
  ["V98596_zoom_D5.jpg", "taylormade-junior-set-seven-iron.jpg"],
  ["V98596_zoom_D7.jpg", "taylormade-junior-set-putter.jpg"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Downloads/${source}`));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from supplied file`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from supplied file`);
}
check(hash(await readFile("C:/Users/mikae/Downloads/V98596_zoom_D3.jpg")) === hash(await readFile("images/categories/junior_sets.jpg")), "category source image mismatch");
check(hash(await readFile("C:/Users/mikae/Downloads/V98596_zoom_D3.jpg")) === hash(await readFile("public/images/shop/categories-v2/junior_sets.jpg")), "public category image mismatch");
check(hash(await readFile("C:/Users/mikae/Downloads/Gemini_Generated_Image_e1a4t5e1a4t5e1a4.jpg")) === hash(await readFile("public/images/shop/kids-v2.jpg")), "Kids department image mismatch");

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/OutOfStock"), "static page: out-of-stock schema missing");
check(html.includes('priceCurrency":"KES'), "static page: KES offer missing");
check(html.includes("taylormade-junior-set-bag.jpg"), "static page: primary image missing");
for (const removed of ["First rounds", "Practice", "On course"]) check(!html.includes(`>${removed}</span>`), `static page: removed ${removed} gallery label remains`);
check(!html.includes(">Confidence</span>"), "static page: removed Confidence gallery label remains");

if (!local) {
  const response = await fetch(`${base}/api/storefront-products?sku=${sku}`);
  const live = response.ok ? (await response.json()).products?.[0] : null;
  check(Boolean(live), `live API: ${sku} missing (HTTP ${response.status})`);
  check(live?.priceKes === 102234, `live API: price ${live?.priceKes}`);
  check(live?.status === "Out of Stock" && Number(live?.stock) === 0, "live API: availability mismatch");
  results.liveApi = live;
}

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
    const dynamicImage = response.url().includes("/api/product-images/");
    const localStorefront = response.url().includes("/api/storefront-products");
    if (response.status() >= 400 && !(local && (dynamicImage || localStorefront))) errors.push(`${response.status()} ${response.url()}`);
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
    imageLabels: [...document.querySelectorAll('[aria-label^="Show "][aria-label$=" photo"]')].map((node) => node.getAttribute("aria-label")),
    groups: [...document.querySelectorAll(".catalog-configurator legend")].map((node) => node.textContent?.trim()),
    options: [...document.querySelectorAll(".catalog-configurator button")].map((node) => node.textContent?.trim()),
    source: document.querySelector(".club-source")?.getAttribute("href"),
    scrollCraftMounted: document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true",
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/product-images/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "Team TaylorMade Junior Golf Set", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 102,234"), `${label}: KES price missing`);
  check(result.gallery === 7, `${label}: gallery count ${result.gallery}`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 3, `${label}: specification row count ${result.specRows}`);
  check(result.equipment === 3, `${label}: equipment card count ${result.equipment}`);
  check(result.imageLabels.length === 7 && !["First rounds", "Confidence", "Practice", "On course"].some((removed) => result.imageLabels.some((label) => label?.includes(removed))), `${label}: removed lifestyle labels are still present`);
  check(["42–47 in", "48–53 in", "54–59 in", "ages 4–6", "ages 7–9", "ages 10–12"].every((text) => result.text.includes(text)), `${label}: size and age guide incomplete`);
  if (options.javaScriptEnabled) {
    check(result.scrollCraftMounted, `${label}: Scroll Craft did not mount`);
    check(["Size", "Hand"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
    check(result.options.some((option) => option?.includes("Size 3") && option.includes("ages 10–12")), `${label}: size options incomplete`);
  }
  check(result.source === officialSource, `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);

  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await page.getByRole("button", { name: "Size 3 · 54–59 in · ages 10–12", exact: true }).click();
    await page.getByRole("button", { name: "Left handed", exact: true }).click();
    const whatsapp = await page.locator(".catalog-configurator .contact-button").getAttribute("href");
    check(whatsapp?.includes("Size%3A%20Size%203") && whatsapp.includes("Hand%3A%20Left%20handed"), "desktop: WhatsApp inquiry omitted selected junior set options");
    await page.getByRole("button", { name: "Enlarge Complete set photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
  }
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

const routeChecks = [
  { route: "/shop/", selector: 'a[href="/shop/kids"]', label: "Kids department" },
  { route: "/shop/kids/", selector: 'a[href="/shop/kids/junior_sets"]', label: "Junior Sets category" },
  { route: "/shop/kids/", selector: `a[href="/shop/product/${slug}"]`, label: "junior product card" },
  { route: "/shop/kids/junior_sets/", selector: `a[href="/shop/product/${slug}"]`, label: "junior product card" },
];
for (const { route, selector, label } of routeChecks) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const response = await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(response?.status() === 200, `${route}: HTTP ${response?.status()}`);
  check(await page.locator(selector).count() > 0, `${route}: ${label} missing`);
  await page.close();
}
for (const route of ["/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock junior set leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
