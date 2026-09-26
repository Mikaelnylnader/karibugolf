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
const p790ConsoleErrors = [];
const p790FailedRequests = [];
p790Page.on("console", (message) => {
  if (message.type() === "error") p790ConsoleErrors.push(message.text());
});
p790Page.on("requestfailed", (request) => {
  if (request.url().startsWith(base)) p790FailedRequests.push(`${request.method()} ${request.url()}`);
});
const p790Response = await p790Page.goto(`${base}/shop/product/gk-ir-tmp/`, { waitUntil: "networkidle" });
await p790Page.getByRole("button", { name: "Left handed" }).click();
await p790Page.getByRole("button", { name: "Graphite" }).click();
const graphiteFlexes = await p790Page.locator(".catalog-configurator fieldset").filter({ has: p790Page.locator("legend", { hasText: "Flex" }) }).getByRole("button").allTextContents();
const xStiffCount = await p790Page.getByRole("button", { name: /X-Stiff/ }).count();
await p790Page.getByRole("button", { name: "Senior (A)" }).click();
const selectedFlexContrast = await p790Page.getByRole("button", { name: "Senior (A)" }).evaluate((button) => {
  const style = getComputedStyle(button);
  const rgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const luminance = (value) => {
    const channels = rgb(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const foreground = luminance(style.color);
  const background = luminance(style.backgroundColor);
  return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
});
await p790Page.getByRole("button", { name: "Steel" }).click();
const steelFlexes = await p790Page.locator(".catalog-configurator fieldset").filter({ has: p790Page.locator("legend", { hasText: "Flex" }) }).getByRole("button").allTextContents();
const selectedSteelFlex = await p790Page.locator(".catalog-configurator fieldset").filter({ has: p790Page.locator("legend", { hasText: "Flex" }) }).locator("button.selected").textContent();
await p790Page.getByRole("button", { name: "Graphite" }).click();
await p790Page.getByRole("button", { name: "Senior (A)" }).click();
await p790Page.getByRole("button", { name: "Enlarge Cavity photo" }).click();
const zoomOpened = await p790Page.getByRole("dialog").isVisible();
await p790Page.keyboard.press("Escape");
const p790 = await p790Page.evaluate(() => ({
  title: document.querySelector(".club-buy-panel h1")?.textContent?.trim(),
  status: document.querySelector(".catalog-stock")?.textContent?.trim(),
  price: document.querySelector(".club-price")?.textContent?.trim(),
  galleryCount: document.querySelectorAll(".club-thumbnails button").length,
  featureCount: document.querySelectorAll(".product-tech-rail article").length,
  scrollCraftMounted: document.querySelector(".product-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true",
  actSequence: [...document.querySelectorAll("[data-sc-act]")].map((act) => act.getAttribute("data-sc-act")),
  loftTraceRows: document.querySelectorAll(".product-gap-trace li").length,
  specificationRows: document.querySelectorAll(".club-specs tbody tr").length,
  equipmentCards: document.querySelectorAll(".product-equipment-grid article").length,
  source: document.querySelector(".club-source")?.getAttribute("href"),
  video: document.querySelector(".product-official-video iframe")?.getAttribute("src"),
  videoStory: document.querySelector(".product-official-video-copy a")?.getAttribute("href"),
  whatsapp: document.querySelector(".catalog-configurator .contact-button")?.getAttribute("href"),
  overflow: document.documentElement.scrollWidth - innerWidth,
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
}));
await p790Page.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  document.documentElement.style.scrollBehavior = "auto";
  scrollTo(0, 0);
});
const focusAudit = [];
const focusTargetCount = Math.min(await p790Page.locator('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').count(), 60);
for (let index = 0; index < focusTargetCount; index += 1) {
  await p790Page.keyboard.press("Tab");
  await p790Page.waitForTimeout(30);
  focusAudit.push(await p790Page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return { label: "unknown", visible: false, focusVisible: false };
    if (!element.matches('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) return { label: element.tagName, skip: true };
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 60) || element.tagName,
      visible: rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && style.visibility !== "hidden" && Number(style.opacity) > 0.85,
      focusVisible: element.matches(":focus-visible") && style.outlineStyle !== "none",
    };
  }));
}
p790.zoomOpened = zoomOpened;
p790.graphiteFlexes = graphiteFlexes;
p790.steelFlexes = steelFlexes;
p790.xStiffCount = xStiffCount;
p790.selectedSteelFlex = selectedSteelFlex?.trim();
p790.selectedFlexContrast = Number(selectedFlexContrast.toFixed(2));
p790.consoleErrors = p790ConsoleErrors;
p790.failedRequests = p790FailedRequests;
p790.focusAuditFailures = focusAudit.filter((item) => !item.skip && (!item.visible || !item.focusVisible));
if (p790Response?.status() !== 200) failures.push(`P790: HTTP ${p790Response?.status()}`);
if (p790.title !== "TaylorMade P790") failures.push(`P790: title ${p790.title}`);
if (!p790.status?.includes("out of stock")) failures.push("P790: stock status");
if (!p790.price?.includes("171,000")) failures.push("P790: current KES price");
if (p790.galleryCount !== 4) failures.push(`P790: gallery count ${p790.galleryCount}`);
if (p790.featureCount !== 4) failures.push(`P790: feature count ${p790.featureCount}`);
if (!p790.scrollCraftMounted) failures.push("P790: Scroll Craft did not mount");
if (!["pin", "pan", "flow"].every((device) => p790.actSequence.includes(device))) failures.push(`P790: incomplete Scroll Craft device set ${p790.actSequence.join(", ")}`);
if (p790.loftTraceRows !== 7) failures.push(`P790: loft trace rows ${p790.loftTraceRows}`);
if (p790.specificationRows !== 7) failures.push(`P790: specification rows ${p790.specificationRows}`);
if (p790.equipmentCards !== 3) failures.push(`P790: equipment cards ${p790.equipmentCards}`);
if (!p790.source?.includes("taylormadegolf.com")) failures.push("P790: official source link");
if (!p790.video?.includes("youtube-nocookie.com/embed/MhMeZNyzRrE")) failures.push("P790: official TaylorMade video embed");
if (!p790.videoStory?.includes("taylormadegolf.com/clubhouse/")) failures.push("P790: official video story link");
if (!p790.graphiteFlexes.includes("Senior (A)") || p790.xStiffCount !== 0) failures.push(`P790: graphite flex options ${p790.graphiteFlexes.join(", ")}`);
if (p790.steelFlexes.includes("Senior (A)") || p790.selectedSteelFlex !== "Regular (R)") failures.push(`P790: steel flex options ${p790.steelFlexes.join(", ")} / selected ${p790.selectedSteelFlex}`);
if (p790.selectedFlexContrast < 4.5) failures.push(`P790: selected option contrast ${p790.selectedFlexContrast}`);
if (!p790.whatsapp?.includes("Left%20handed") || !p790.whatsapp?.includes("Shaft%3A%20Graphite") || !p790.whatsapp?.includes("Flex%3A%20Senior")) failures.push("P790: configurable WhatsApp enquiry");
if (!p790.zoomOpened) failures.push("P790: gallery zoom did not open");
if (p790.consoleErrors.length) failures.push(`P790: console errors ${p790.consoleErrors.join(" | ")}`);
if (p790.failedRequests.length) failures.push(`P790: failed requests ${p790.failedRequests.join(" | ")}`);
if (p790.focusAuditFailures.length) failures.push(`P790: keyboard focus failures ${JSON.stringify(p790.focusAuditFailures)}`);
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
    featureCount: document.querySelectorAll(".product-tech-rail article").length,
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
