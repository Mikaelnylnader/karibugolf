import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] || "http://127.0.0.1:4500/shop/";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const failures = [];
const errors = [];
const expected = ["clubs", "shoes", "apparel", "bags", "balls", "accessories"];
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

async function samplePan(page, label) {
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  const metrics = await page.evaluate(() => {
    const act = document.querySelector("[data-shop-pan]");
    const stage = act?.querySelector("[data-sc-stage]");
    const rail = act?.querySelector("[data-sc-pan]");
    const top = act ? act.getBoundingClientRect().top + scrollY : 0;
    return {
      top,
      travel: act ? Math.max(act.offsetHeight - innerHeight, 1) : 0,
      height: act?.offsetHeight ?? 0,
      stagePosition: stage ? getComputedStyle(stage).position : "missing",
      railOverflow: rail ? rail.scrollWidth - innerWidth : 0,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  const samples = [];
  for (const [index, progress] of [0, 0.17, 0.34, 0.51, 0.68, 0.85, 1].entries()) {
    await page.evaluate(({ top, travel, progress }) => scrollTo(0, top + travel * progress), { ...metrics, progress });
    await page.waitForTimeout(220);
    samples.push(await page.evaluate(() => {
      const stage = document.querySelector("[data-shop-pan] [data-sc-stage]");
      const rail = document.querySelector("[data-shop-pan] [data-sc-pan]");
      const cards = [...document.querySelectorAll("[data-shop-department]")];
      const centred = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return { slug: card.getAttribute("data-shop-department"), distance: Math.abs(rect.left + rect.width / 2 - innerWidth / 2) };
      }).sort((a, b) => a.distance - b.distance)[0]?.slug;
      return {
        y: Math.round(scrollY),
        stageTop: stage ? Math.round(stage.getBoundingClientRect().top) : null,
        railTransform: rail ? getComputedStyle(rail).transform : "missing",
        active: document.querySelector(".fairway-trail a.active")?.getAttribute("href"),
        centred,
        verifyState: stage?.getAttribute("data-sc-verify-state"),
      };
    }));
    if ([0, 3, 6].includes(index)) await page.screenshot({ path: `${out}/${label}-${index}.png` });
  }
  return { metrics, samples };
}

const desktop = await openPage({ width: 1440, height: 900 }, "desktop");
const desktopPan = await samplePan(desktop, "desktop");
const desktopResult = await desktop.evaluate(async (slugs) => {
  const cards = [...document.querySelectorAll("[data-shop-department]")];
  const routeStatuses = {};
  for (const slug of slugs) routeStatuses[slug] = (await fetch(`/shop/${slug}/`)).status;
  return {
    cardSlugs: cards.map((card) => card.getAttribute("data-shop-department")),
    imageStates: cards.map((card) => {
      const image = card.querySelector("img");
      return { slug: card.getAttribute("data-shop-department"), loaded: Boolean(image?.complete && image.naturalWidth > 0) };
    }),
    routeStatuses,
    trailMarkers: document.querySelectorAll(".fairway-trail a").length,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
  };
}, expected);

await desktop.evaluate(() => scrollTo(0, document.querySelector("[data-shop-pan]").getBoundingClientRect().top + scrollY));
await desktop.evaluate(() => { document.documentElement.style.scrollBehavior = ""; });
await desktop.locator('.store-quick-nav a[href="#apparel"]').click();
await desktop.waitForFunction(() => document.querySelector(".fairway-trail a.active")?.getAttribute("href") === "#apparel");
const quickNavTarget = await desktop.evaluate(() => ({
  active: document.querySelector(".fairway-trail a.active")?.getAttribute("href"),
  hash: location.hash,
}));
await desktop.close();

const mobile = await openPage({ width: 390, height: 844 }, "mobile");
const mobilePan = await samplePan(mobile, "mobile");
await mobile.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await mobile.waitForTimeout(220);
const mobileEnd = await mobile.evaluate(() => ({
  active: document.querySelector(".fairway-trail a.active")?.getAttribute("href"),
  progress: getComputedStyle(document.querySelector(".shop-scroll-shell")).getPropertyValue("--trail-progress").trim(),
  overflow: document.documentElement.scrollWidth - innerWidth,
}));
await mobile.close();

const reduced = await openPage({ width: 390, height: 844 }, "reduced", "reduce");
const reducedResult = await reduced.evaluate(() => {
  const act = document.querySelector("[data-shop-pan]");
  const stage = act?.querySelector("[data-sc-stage]");
  const rail = act?.querySelector("[data-sc-pan]");
  return {
    actHeight: act?.offsetHeight,
    stageHeight: stage?.offsetHeight,
    stagePosition: stage ? getComputedStyle(stage).position : "missing",
    nativeOverflow: rail && stage ? rail.scrollWidth - stage.clientWidth : 0,
    panelsVisible: [...document.querySelectorAll(".department-pan-panel")].every((item) => Number(getComputedStyle(item).opacity) > 0.99),
  };
});
await reduced.close();
await browser.close();

const desktopTransforms = new Set(desktopPan.samples.map((sample) => sample.railTransform));
const desktopActives = new Set(desktopPan.samples.map((sample) => sample.active));
const mobileTransforms = new Set(mobilePan.samples.map((sample) => sample.railTransform));
if (desktopResult.cardSlugs.join(",") !== expected.join(",")) failures.push("department order");
if (!desktopResult.imageStates.every((item) => item.loaded)) failures.push("category image");
if (!Object.values(desktopResult.routeStatuses).every((status) => status === 200)) failures.push("department route");
if (desktopResult.trailMarkers !== 6) failures.push("trail marker count");
if (desktopResult.brokenImages.length) failures.push("broken images");
if (desktopPan.metrics.stagePosition !== "sticky") failures.push(`desktop stage ${desktopPan.metrics.stagePosition}`);
if (desktopPan.metrics.railOverflow < 720) failures.push(`desktop rail overflow ${desktopPan.metrics.railOverflow}px`);
if (desktopPan.metrics.horizontalOverflow > 0) failures.push(`desktop horizontal overflow ${desktopPan.metrics.horizontalOverflow}px`);
if (desktopTransforms.size < 6) failures.push(`desktop pan has only ${desktopTransforms.size} positions`);
if (desktopActives.size < 4 || !desktopActives.has("#clubs") || !desktopActives.has("#accessories")) failures.push("desktop trail does not follow the pan");
if (desktopPan.samples.slice(1, -1).some((sample) => Math.abs(sample.stageTop) > 1)) failures.push("desktop stage does not stay pinned");
if (quickNavTarget.active !== "#apparel" || quickNavTarget.hash !== "#apparel") failures.push("quick navigation does not enter the pan");
if (mobilePan.metrics.stagePosition !== "sticky") failures.push(`mobile stage ${mobilePan.metrics.stagePosition}`);
if (mobilePan.metrics.railOverflow < 390) failures.push(`mobile rail overflow ${mobilePan.metrics.railOverflow}px`);
if (mobileTransforms.size < 6) failures.push(`mobile pan has only ${mobileTransforms.size} positions`);
if (mobileEnd.active !== "#accessories" || Number(mobileEnd.progress) < 0.98) failures.push("mobile trail completion");
if (mobileEnd.overflow > 0) failures.push(`mobile horizontal overflow ${mobileEnd.overflow}px`);
if (reducedResult.stagePosition !== "relative" || reducedResult.actHeight > reducedResult.stageHeight + 2) failures.push("reduced motion keeps a dead pinned track");
if (reducedResult.nativeOverflow < 390 || !reducedResult.panelsVisible) failures.push("reduced motion rail is not reachable");
failures.push(...errors);

console.log(JSON.stringify({ url, desktop: { ...desktopResult, pan: desktopPan, quickNavTarget }, mobile: { pan: mobilePan, end: mobileEnd }, reducedMotion: reducedResult, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
