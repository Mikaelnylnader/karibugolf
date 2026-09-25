import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
import path from "node:path";

const base = (process.argv[2] || "http://127.0.0.1:4501").replace(/\/$/, "");
const catalog = JSON.parse(await readFile(path.resolve("lib/catalog.generated.json"), "utf8"));
const failures = [];
const staticChecks = [];

for (const product of catalog.products) {
  const file = path.resolve("dist/static/shop/product", product.slug, "index.html");
  try {
    const html = await readFile(file, "utf8");
    const standard = html.includes("catalog-standard-product");
    const schema = html.includes('"@type":"Product"');
    staticChecks.push({ slug: product.slug, standard, schema });
    if (!standard || !schema) failures.push(`${product.slug}: missing standard layout or Product schema`);
  } catch {
    failures.push(`${product.slug}: missing static product page`);
  }
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

const p790Page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const p790Response = await p790Page.goto(`${base}/shop/product/gk-ir-tmp/`, { waitUntil: "networkidle" });
await p790Page.getByRole("button", { name: "Left handed" }).click();
const p790 = await p790Page.evaluate(() => ({
  title: document.querySelector(".club-buy-panel h1")?.textContent?.trim(),
  status: document.querySelector(".catalog-stock")?.textContent?.trim(),
  price: document.querySelector(".club-price")?.textContent?.trim(),
  galleryCount: document.querySelectorAll(".club-thumbnails button").length,
  featureCount: document.querySelectorAll(".club-feature-grid article").length,
  specificationRows: document.querySelectorAll(".club-specs tbody tr").length,
  equipmentCards: document.querySelectorAll(".product-equipment-grid article").length,
  source: document.querySelector(".club-source")?.getAttribute("href"),
  whatsapp: document.querySelector(".catalog-configurator .contact-button")?.getAttribute("href"),
  overflow: document.documentElement.scrollWidth - innerWidth,
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
}));
if (p790Response?.status() !== 200) failures.push(`P790: HTTP ${p790Response?.status()}`);
if (p790.title !== "TaylorMade P790") failures.push(`P790: title ${p790.title}`);
if (!p790.status?.includes("out of stock")) failures.push("P790: stock status");
if (!p790.price?.includes("171,000")) failures.push("P790: current KES price");
if (p790.galleryCount !== 4) failures.push(`P790: gallery count ${p790.galleryCount}`);
if (p790.featureCount !== 4) failures.push(`P790: feature count ${p790.featureCount}`);
if (p790.specificationRows !== 7) failures.push(`P790: specification rows ${p790.specificationRows}`);
if (p790.equipmentCards !== 3) failures.push(`P790: equipment cards ${p790.equipmentCards}`);
if (!p790.source?.includes("taylormadegolf.com")) failures.push("P790: official source link");
if (!p790.whatsapp?.includes("Left%20handed")) failures.push("P790: configurable WhatsApp enquiry");
if (p790.overflow > 0) failures.push(`P790: horizontal overflow ${p790.overflow}px`);
if (p790.brokenImages.length) failures.push("P790: broken images");
await p790Page.close();

const legacyPage = await browser.newPage({ viewport: { width: 1180, height: 820 } });
const legacyResponse = await legacyPage.goto(`${base}/shop/taylormade-p790-irons/`, { waitUntil: "networkidle" });
const legacy = await legacyPage.evaluate(() => ({
  standard: Boolean(document.querySelector(".catalog-standard-product")),
  price: document.querySelector(".club-price")?.textContent?.trim(),
  status: document.querySelector(".catalog-stock")?.textContent?.trim(),
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
}));
if (legacyResponse?.status() !== 200 || !legacy.standard || !legacy.price?.includes("171,000") || !legacy.status?.includes("out of stock") || legacy.canonical !== "https://karibugolf.com/shop/product/gk-ir-tmp/" || legacy.brokenImages.length) {
  failures.push("legacy P790 route is inconsistent with the product standard");
}
await legacyPage.close();

const sampleCategories = ["golf_irons", "mens_shoes", "mens_polos", "bags", "balls", "gloves"];
const samples = sampleCategories.map((category) => catalog.products.find((product) => product.categorySlug === category && product.slug !== "gk-ir-tmp")).filter(Boolean);
const sampleResults = [];
for (const product of samples) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const response = await page.goto(`${base}/shop/product/${product.slug}/`, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => ({
    standard: Boolean(document.querySelector(".catalog-standard-product")),
    galleryCount: document.querySelectorAll(".club-thumbnails button").length,
    featureCount: document.querySelectorAll(".club-feature-grid article").length,
    specificationRows: document.querySelectorAll(".club-specs tbody tr").length,
    relatedCount: document.querySelectorAll(".product-related .store-product-card").length,
    overflow: document.documentElement.scrollWidth - innerWidth,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
  }));
  sampleResults.push({ slug: product.slug, category: product.categorySlug, status: response?.status(), ...result });
  if (response?.status() !== 200 || !result.standard || result.galleryCount < 1 || result.featureCount !== 4 || result.specificationRows < 5 || result.relatedCount < 1 || result.overflow > 0 || result.brokenImages.length) {
    failures.push(`${product.slug}: standard product page check failed`);
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify({
  base,
  staticPagesChecked: staticChecks.length,
  p790,
  legacyP790: legacy,
  samples: sampleResults,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
