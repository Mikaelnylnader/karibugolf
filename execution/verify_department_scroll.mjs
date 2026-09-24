import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4501").replace(/\/$/, "");
const out = "scrollcraft/builds/karibu-departments/lab/qa";
await mkdir(out, { recursive: true });

const departments = {
  clubs: ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"],
  shoes: ["mens_shoes", "womens_shoes"],
  apparel: ["mens_polos", "mens_pants", "mens_jackets", "mens_shorts", "womens_polos", "womens_skirts", "womens_pants", "womens_dresses", "womens_jackets", "womens_tops"],
  bags: ["bags"],
  balls: ["balls"],
  accessories: ["gloves", "hats_and_caps", "grips", "range_finders", "accessories"],
};

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [];
const failures = [];
const departmentResults = [];
const categoryResults = [];

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label} console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    errors.push(`${label} request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });
}

for (const [department, categories] of Object.entries(departments)) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(page, department);
  const response = await page.goto(`${base}/shop/${department}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".department-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true");

  for (const category of categories) {
    await page.locator(`[data-kit-category="${category}"]`).scrollIntoViewIfNeeded();
    await page.waitForFunction((slug) => {
      const image = document.querySelector(`[data-kit-category="${slug}"] img`);
      return image?.complete && image.naturalWidth > 0;
    }, category);
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(180);
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    ledgerCount: document.querySelectorAll(".kit-ledger-items a").length,
    visitedCount: document.querySelectorAll(".kit-ledger-items a.visited").length,
    categoryCount: document.querySelectorAll("[data-kit-category]").length,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
    whatsapp: document.querySelector(".department-inquiry a")?.getAttribute("href"),
  }));
  departmentResults.push({ department, status: response?.status(), ...result });
  if (response?.status() !== 200) failures.push(`${department}: HTTP ${response?.status()}`);
  if (result.overflow > 0) failures.push(`${department}: horizontal overflow ${result.overflow}px`);
  if (result.ledgerCount !== categories.length) failures.push(`${department}: ledger count ${result.ledgerCount}`);
  if (result.visitedCount !== categories.length) failures.push(`${department}: ledger incomplete ${result.visitedCount}/${categories.length}`);
  if (result.categoryCount !== categories.length) failures.push(`${department}: category count ${result.categoryCount}`);
  if (result.brokenImages.length) failures.push(`${department}: broken images`);
  if (!result.whatsapp?.includes("254116416105")) failures.push(`${department}: WhatsApp link`);
  if (department === "apparel") await page.screenshot({ path: `${out}/apparel-mobile.png`, fullPage: false });
  await page.close();
}

for (const [department, categories] of Object.entries(departments)) {
  for (const category of categories) {
    const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
    watch(page, `${department}/${category}`);
    const response = await page.goto(`${base}/shop/${department}/${category}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector(".department-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true");
    await page.waitForFunction(() => {
      const image = document.querySelector(".category-object-hero img");
      return image?.complete && image.naturalWidth > 0;
    });
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      hero: Boolean(document.querySelector(".category-object-hero")),
      ledgerCount: document.querySelectorAll(".kit-ledger-items a").length,
      brokenHero: !document.querySelector(".category-object-hero img")?.naturalWidth,
    }));
    categoryResults.push({ route: `${department}/${category}`, status: response?.status(), ...result });
    if (response?.status() !== 200 || !result.hero || result.brokenHero || result.overflow > 0) {
      failures.push(`${department}/${category}: category page check failed`);
    }
    if (department === "clubs" && category === "drivers") {
      await page.screenshot({ path: `${out}/drivers-desktop.png`, fullPage: false });
    }
    await page.close();
  }
}

const reduced = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
watch(reduced, "reduced");
await reduced.goto(`${base}/shop/clubs/`, { waitUntil: "networkidle" });
const reducedResult = await reduced.evaluate(() => ({
  revealVisible: [...document.querySelectorAll("[data-sc-reveal]")].every((item) => getComputedStyle(item).clipPath === "none"),
  overflow: document.documentElement.scrollWidth - innerWidth,
}));
if (!reducedResult.revealVisible) failures.push("reduced motion reveal");
if (reducedResult.overflow > 0) failures.push(`reduced motion overflow ${reducedResult.overflow}px`);
await reduced.close();

await browser.close();
failures.push(...errors);
console.log(JSON.stringify({
  base,
  departments: departmentResults,
  categoriesChecked: categoryResults.length,
  reducedMotion: reducedResult,
  errors,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
