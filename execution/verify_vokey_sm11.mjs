import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4513").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const sku = "GK-WG010";
const slug = sku.toLowerCase();
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/vokey-sm11-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: Vokey SM11 missing");
check(product?.priceKes === 67816, `catalog: price ${product?.priceKes}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability mismatch");
check(product?.images?.length === 9, `catalog: expected nine images, found ${product?.images?.length}`);
check(product?.sizes === "48.10 F; 50.08 F; 52.08 F; 54.08 M; 56.08 M; 58.04 T; 60.04 T", `catalog: planned models ${product?.sizes}`);
check(product?.colors === "Tour Chrome; Jet Black", `catalog: planned finishes ${product?.colors}`);
check(product?.description?.includes("right-handed only") && product.description.includes("not currently in stock"), "catalog: planned-range description missing");

const imagePairs = [
  ["Skärmbild 2026-10-06 143025.png", "titleist-vokey-sm11-wedge-back.png"],
  ["Skärmbild 2026-10-06 143037.png", "titleist-vokey-sm11-wedge-face.png"],
  ["Skärmbild 2026-10-06 143046.png", "titleist-vokey-sm11-wedge-sole.png"],
  ["Skärmbild 2026-10-06 143055.png", "titleist-vokey-sm11-wedge-profile.png"],
  ["Skärmbild 2026-10-06 143105.png", "titleist-vokey-sm11-wedge-address.png"],
  ["Skärmbild 2026-10-06 155147.png", "titleist-vokey-sm11-wedge-jet-black-back.png"],
  ["Skärmbild 2026-10-06 155156.png", "titleist-vokey-sm11-wedge-jet-black-face.png"],
  ["Skärmbild 2026-10-06 155211.png", "titleist-vokey-sm11-wedge-jet-black-sole.png"],
  ["Skärmbild 2026-10-06 155221.png", "titleist-vokey-sm11-wedge-jet-black-profile.png"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Pictures/Screenshots/${source}`));
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
  check(live?.priceKes === 67816, `live API: price ${live?.priceKes}`);
  check(live?.status === "Out of Stock" && Number(live?.stock) === 0, "live API: availability mismatch");
  check(new URL(live?.image || "/", base).pathname === "/images/products/titleist-vokey-sm11-wedge-back.png", "live API: image mismatch");
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
    gallerySources: [...document.querySelectorAll(".club-thumbnails img")].map((image) => image.getAttribute("src")),
    mainGallerySource: document.querySelector(".club-gallery-stage img")?.getAttribute("src"),
    features: document.querySelectorAll(".product-tech-rail article").length,
    specRows: document.querySelectorAll(".club-specs tbody tr").length,
    specs: [...document.querySelectorAll(".club-specs tbody tr")].map((row) => row.textContent?.replace(/\s+/g, " ").trim()),
    equipment: document.querySelectorAll(".product-equipment-grid article").length,
    groups: [...document.querySelectorAll(".catalog-configurator legend")].map((node) => node.textContent?.trim()),
    configurations: Object.fromEntries([...document.querySelectorAll(".catalog-configurator fieldset")].map((fieldset) => [
      fieldset.querySelector("legend")?.textContent?.trim(),
      [...fieldset.querySelectorAll("button")].map((button) => button.textContent?.trim()),
    ])),
    source: document.querySelector(".club-source")?.getAttribute("href"),
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/product-images/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "Titleist Vokey SM11 Wedge", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 67,816"), `${label}: KES price missing`);
  check(!result.text.includes("$523.68") && !result.text.includes("¥3,193"), `${label}: foreign public price found`);
  check(result.gallery === 5, `${label}: default Tour Chrome gallery count ${result.gallery}`);
  check(result.mainGallerySource?.includes("titleist-vokey-sm11-wedge-back.png"), `${label}: default Tour Chrome image mismatch`);
  check(result.gallerySources.every((source) => !source?.includes("jet-black")), `${label}: Jet Black image leaked into Tour Chrome gallery`);
  check(!/tour black/i.test(result.text), `${label}: obsolete Tour Black wording found`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 4, `${label}: specification row count ${result.specRows}`);
  check(result.specs?.some((row) => row.includes("48°") && row.includes("10° · F")), `${label}: 48.10 F specification missing`);
  check(result.specs?.some((row) => row.includes("50° / 52°") && row.includes("8° · F")), `${label}: gap-wedge specifications missing`);
  check(result.specs?.some((row) => row.includes("54° / 56°") && row.includes("8° · M")), `${label}: sand-wedge specifications missing`);
  check(result.specs?.some((row) => row.includes("58° / 60°") && row.includes("4° · T")), `${label}: lob-wedge specifications missing`);
  check(result.equipment === 4, `${label}: equipment card count ${result.equipment}`);
  if (options.javaScriptEnabled) check(["Hand", "Loft / bounce / grind", "Finish", "Shaft"].every((group) => result.groups.includes(group)), `${label}: configuration groups incomplete`);
  check(JSON.stringify(result.configurations.Hand) === JSON.stringify(["Right handed"]), `${label}: hand options ${JSON.stringify(result.configurations.Hand)}`);
  check(JSON.stringify(result.configurations["Loft / bounce / grind"]) === JSON.stringify(["48.10 F", "50.08 F", "52.08 F", "54.08 M", "56.08 M", "58.04 T", "60.04 T"]), `${label}: model options ${JSON.stringify(result.configurations["Loft / bounce / grind"])}`);
  check(JSON.stringify(result.configurations.Finish) === JSON.stringify(["Tour Chrome", "Jet Black"]), `${label}: finish options ${JSON.stringify(result.configurations.Finish)}`);
  check(JSON.stringify(result.configurations.Shaft) === JSON.stringify(["Standard steel shaft"]), `${label}: shaft options ${JSON.stringify(result.configurations.Shaft)}`);
  check(result.source === "https://www.titleist.com/product/vokey-sm11/862C%3ACA-RH%3ACBW-4410.html", `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);
  if (options.javaScriptEnabled) {
    await page.getByRole("button", { name: "Jet Black", exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll(".club-thumbnails button").length === 4);
    const jetBlackGallery = await page.evaluate(() => ({
      count: document.querySelectorAll(".club-thumbnails button").length,
      sources: [...document.querySelectorAll(".club-thumbnails img")].map((image) => image.getAttribute("src")),
      main: document.querySelector(".club-gallery-stage img")?.getAttribute("src"),
    }));
    check(jetBlackGallery.count === 4, `${label}: Jet Black gallery count ${jetBlackGallery.count}`);
    check(jetBlackGallery.sources.every((source) => source?.includes("jet-black")), `${label}: Tour Chrome image leaked into Jet Black gallery`);
    check(jetBlackGallery.main?.includes("titleist-vokey-sm11-wedge-jet-black-back.png"), `${label}: Jet Black selection did not reset to its first image`);

    await page.getByRole("button", { name: "Tour Chrome", exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll(".club-thumbnails button").length === 5);
    const tourChromeGallery = await page.evaluate(() => ({
      count: document.querySelectorAll(".club-thumbnails button").length,
      sources: [...document.querySelectorAll(".club-thumbnails img")].map((image) => image.getAttribute("src")),
      main: document.querySelector(".club-gallery-stage img")?.getAttribute("src"),
    }));
    check(tourChromeGallery.count === 5, `${label}: Tour Chrome gallery count ${tourChromeGallery.count}`);
    check(tourChromeGallery.sources.every((source) => !source?.includes("jet-black")), `${label}: Jet Black image leaked after returning to Tour Chrome`);
    check(tourChromeGallery.main?.includes("titleist-vokey-sm11-wedge-back.png"), `${label}: Tour Chrome selection did not reset to its first image`);
    results[`${label}GallerySwitch`] = { jetBlackGallery, tourChromeGallery };
  }
  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await page.getByRole("button", { name: "60.04 T", exact: true }).click();
    await page.getByRole("button", { name: "Jet Black", exact: true }).click();
    const whatsapp = await page.locator(".catalog-configurator .contact-button").getAttribute("href");
    check(whatsapp?.includes("Hand%3A%20Right%20handed") && whatsapp.includes("Loft%20%2F%20bounce%20%2F%20grind%3A%2060.04%20T") && whatsapp.includes("Finish%3A%20Jet%20Black") && whatsapp.includes("Shaft%3A%20Standard%20steel%20shaft"), "desktop: WhatsApp inquiry omitted selected SM11 options");
    await page.getByRole("button", { name: "Enlarge Jet Black back photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
    const jetBlackSource = await page.locator(".club-gallery-stage img").getAttribute("src");
    check(jetBlackSource?.includes("titleist-vokey-sm11-wedge-jet-black-back.png"), "desktop: Jet Black gallery selection did not update the main photo");
  }
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}/shop/clubs/wedges/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, "/shop/clubs/wedges/: SM11 card missing");
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}/shop/clubs/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator('a[href="/shop/clubs/wedges"]').count() > 0, "/shop/clubs/: Wedges collection link missing");
  const wedgesText = (await page.locator("#wedges").innerText()).replace(/\s+/g, " ").toLowerCase();
  check(wedgesText.includes("2 products"), `/shop/clubs/: Wedges product count missing (${wedgesText})`);
  await page.close();
}
for (const route of ["/", "/shop/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock SM11 leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
