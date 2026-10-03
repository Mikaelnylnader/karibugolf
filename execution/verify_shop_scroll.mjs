import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] || "http://127.0.0.1:4500/shop/";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const expected = ["clubs", "shoes", "apparel", "bags", "balls", "accessories"];
const failures = [];
const errors = [];
const out = ".tmp/shop-scroll-qa";
const staticLocal = /^(127\.0\.0\.1|localhost)$/.test(new URL(url).hostname);
await mkdir(out, { recursive: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error" && !(staticLocal && message.text().includes("404"))) errors.push(`${label} console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => errors.push(`${label} request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`));
}

async function openPage(viewport, label, reducedMotion = "no-preference") {
  const page = await browser.newPage({ viewport, reducedMotion });
  watch(page, label);
  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (response?.status() !== 200) failures.push(`${label}: HTTP ${response?.status()}`);
  await page.waitForFunction(() => document.querySelector(".shop-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true");
  return page;
}

async function inspectPage(page, label) {
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  const samples = [];
  for (const [index, slug] of expected.entries()) {
    await page.evaluate((target) => document.querySelector(`[data-shop-department="${target}"]`)?.scrollIntoView({ block: "center" }), slug);
    await page.waitForTimeout(260);
    const sample = await page.evaluate((target) => {
      const card = document.querySelector(`[data-shop-department="${target}"]`);
      const rect = card?.getBoundingClientRect();
      const visible = rect ? Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0)) : 0;
      return {
        slug: target,
        y: Math.round(scrollY),
        top: rect ? Math.round(rect.top) : null,
        bottom: rect ? Math.round(rect.bottom) : null,
        centreDelta: rect ? Math.round(rect.top + rect.height / 2 - innerHeight / 2) : null,
        visibleRatio: rect ? Number((visible / rect.height).toFixed(3)) : 0,
        active: document.querySelector(".fairway-trail a.active")?.getAttribute("href"),
        activeRowDelta: (() => {
          const activeSlug = document.querySelector(".fairway-trail a.active")?.getAttribute("href")?.slice(1);
          const activeCard = activeSlug ? document.querySelector(`[data-shop-department="${activeSlug}"]`) : null;
          return rect && activeCard ? Math.round(Math.abs(activeCard.getBoundingClientRect().top - rect.top)) : null;
        })(),
      };
    }, slug);
    samples.push(sample);
    if ([0, 2, 5].includes(index)) await page.screenshot({ path: `${out}/${label}-${index}.png` });
  }

  const result = await page.evaluate(async (slugs) => {
    const cards = [...document.querySelectorAll("[data-shop-department]")];
    const routeStatuses = {};
    for (const slug of slugs) routeStatuses[slug] = (await fetch(`/shop/${slug}/`)).status;
    return {
      cardSlugs: cards.map((card) => card.getAttribute("data-shop-department")),
      snapType: getComputedStyle(document.documentElement).scrollSnapType,
      snapStyles: cards.map((card) => ({ slug: card.getAttribute("data-shop-department"), align: getComputedStyle(card).scrollSnapAlign, stop: getComputedStyle(card).scrollSnapStop })),
      imageStates: cards.map((card) => {
        const image = card.querySelector("img");
        return { slug: card.getAttribute("data-shop-department"), loaded: Boolean(image?.complete && image.naturalWidth > 0) };
      }),
      routeStatuses,
      trailMarkers: document.querySelectorAll(".fairway-trail a").length,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
    };
  }, expected);
  return { ...result, samples };
}

async function sampleEffects(page, label) {
  await page.evaluate(() => { document.documentElement.style.scrollSnapType = "none"; });
  const sample = async (actSelector, mediaSelector, progress, name) => {
    await page.evaluate(({ actSelector, progress }) => {
      const act = document.querySelector(actSelector);
      if (!act) return;
      const top = act.getBoundingClientRect().top + scrollY;
      scrollTo(0, top - innerHeight + progress * (act.offsetHeight + innerHeight));
    }, { actSelector, progress });
    await page.waitForTimeout(220);
    const state = await page.evaluate((mediaSelector) => {
      const media = document.querySelector(mediaSelector);
      const image = media?.querySelector("img");
      const copy = media?.closest("a")?.querySelector(":scope > div:last-child");
      return { clipPath: media ? getComputedStyle(media).clipPath : "missing", imageTransform: image ? getComputedStyle(image).transform : "missing", copyOpacity: copy ? Number(getComputedStyle(copy).opacity) : 0 };
    }, mediaSelector);
    await page.screenshot({ path: `${out}/${label}-${name}.png` });
    return state;
  };
  const effects = {
    stockEntry: await sample(".shop-stock-window", ".shop-stock-item:first-child figure", 0.16, "stock-entry"),
    stockSettled: await sample(".shop-stock-window", ".shop-stock-item:first-child figure", 0.52, "stock-settled"),
    categoryEntry: await sample('[data-shop-department="clubs"]', '[data-shop-department="clubs"] figure', 0.18, "category-entry"),
    categorySettled: await sample('[data-shop-department="clubs"]', '[data-shop-department="clubs"] figure', 0.68, "category-settled"),
  };
  await page.evaluate(() => { document.documentElement.style.scrollSnapType = ""; });
  return effects;
}

const desktop = await openPage({ width: 1440, height: 900 }, "desktop");
const desktopEffects = await sampleEffects(desktop, "desktop");
const desktopResult = await inspectPage(desktop, "desktop");
await desktop.locator('.store-quick-nav a[href="#apparel"]').click();
await desktop.waitForTimeout(1800);
const quickNavTarget = await desktop.evaluate(() => {
  const card = document.querySelector('[data-shop-department="apparel"]');
  const rect = card?.getBoundingClientRect();
  return { active: document.querySelector(".fairway-trail a.active")?.getAttribute("href"), hash: location.hash, centreDelta: rect ? Math.round(rect.top + rect.height / 2 - innerHeight / 2) : null };
});
await desktop.close();

const mobile = await openPage({ width: 390, height: 844 }, "mobile");
const mobileEffects = await sampleEffects(mobile, "mobile");
const mobileResult = await inspectPage(mobile, "mobile");
await mobile.close();

const reduced = await openPage({ width: 390, height: 844 }, "reduced", "reduce");
const reducedResult = await inspectPage(reduced, "reduced");
await reduced.close();
await browser.close();

for (const [label, result] of [["desktop", desktopResult], ["mobile", mobileResult], ["reduced", reducedResult]]) {
  if (result.cardSlugs.join(",") !== expected.join(",")) failures.push(`${label} department order`);
  if (!result.snapType.includes("y")) failures.push(`${label} snap type ${result.snapType}`);
  if (!result.snapStyles.every((item) => item.align.includes("center") && item.stop === "always")) failures.push(`${label} card snap styles`);
  if (!result.imageStates.every((item) => item.loaded)) failures.push(`${label} category image`);
  if (!Object.values(result.routeStatuses).every((status) => status === 200)) failures.push(`${label} department route`);
  if (result.trailMarkers !== 6) failures.push(`${label} trail marker count`);
  if (result.horizontalOverflow > 0) failures.push(`${label} horizontal overflow ${result.horizontalOverflow}px`);
  if (result.brokenImages.length) failures.push(`${label} broken images`);
  if (result.samples.some((sample) => Math.abs(sample.centreDelta ?? 999) > 60 || sample.visibleRatio < 0.99)) failures.push(`${label} category does not settle fully in view`);
  if (result.samples.some((sample) => (sample.activeRowDelta ?? 999) > 2)) failures.push(`${label} active trail row mismatch`);
}
if (quickNavTarget.active !== "#apparel" || quickNavTarget.hash !== "#apparel" || Math.abs(quickNavTarget.centreDelta ?? 999) > 60) failures.push("quick navigation does not centre apparel");
for (const [label, effects] of [["desktop", desktopEffects], ["mobile", mobileEffects]]) {
  const remainingReveal = (clipPath) => Math.max(0, ...[...clipPath.matchAll(/([\d.]+)%/g)].map((match) => Number(match[1])));
  if (effects.stockEntry.clipPath === effects.stockSettled.clipPath || remainingReveal(effects.stockSettled.clipPath) > 0.5) failures.push(`${label} stock reveal does not resolve`);
  if (effects.categoryEntry.clipPath === effects.categorySettled.clipPath || remainingReveal(effects.categorySettled.clipPath) > 0.5) failures.push(`${label} category reveal does not resolve`);
  if (effects.stockEntry.imageTransform === effects.stockSettled.imageTransform) failures.push(`${label} stock image has no scroll drift`);
  if (effects.categoryEntry.imageTransform === effects.categorySettled.imageTransform) failures.push(`${label} category image has no scroll drift`);
  if (effects.stockSettled.copyOpacity < 0.99 || effects.categorySettled.copyOpacity < 0.99) failures.push(`${label} settled card copy is not readable`);
}
failures.push(...errors);

console.log(JSON.stringify({ url, desktop: { ...desktopResult, effects: desktopEffects, quickNavTarget }, mobile: { ...mobileResult, effects: mobileEffects }, reducedMotion: reducedResult, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
