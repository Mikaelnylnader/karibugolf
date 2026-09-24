import { chromium } from "playwright-core";

const url = process.argv[2] || "http://127.0.0.1:4500/shop/";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

const errors = [];
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("requestfailed", (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelector(".shop-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true");

for (const slug of ["clubs", "shoes", "apparel", "bags", "balls", "accessories"]) {
  await page.locator(`[data-shop-department="${slug}"]`).scrollIntoViewIfNeeded();
  await page.waitForFunction((selectedSlug) => {
    const image = document.querySelector(`[data-shop-department="${selectedSlug}"] img`);
    return image?.complete && image.naturalWidth > 0;
  }, slug);
}

const result = await page.evaluate(async () => {
  const expected = ["clubs", "shoes", "apparel", "bags", "balls", "accessories"];
  const cards = [...document.querySelectorAll("[data-shop-department]")];
  const imageStates = cards.map((card) => {
    const image = card.querySelector("img");
    return { slug: card.getAttribute("data-shop-department"), loaded: Boolean(image?.complete && image.naturalWidth > 0) };
  });
  const routeStatuses = {};
  for (const slug of expected) {
    routeStatuses[slug] = (await fetch(`/shop/${slug}/`)).status;
  }
  return {
    cardSlugs: cards.map((card) => card.getAttribute("data-shop-department")),
    imageStates,
    routeStatuses,
    horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    trailMarkers: document.querySelectorAll(".fairway-trail a").length,
  };
});

await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(250);
const trailEnd = await page.evaluate(() => ({
  active: document.querySelector(".fairway-trail a.active")?.getAttribute("href"),
  progress: getComputedStyle(document.querySelector(".shop-scroll-shell")).getPropertyValue("--trail-progress").trim(),
}));

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await reduced.goto(url, { waitUntil: "networkidle" });
const reducedMotionVisible = await reduced.evaluate(() => [...document.querySelectorAll("[data-sc-reveal]")].every((item) => getComputedStyle(item).clipPath === "none"));

await browser.close();
const failures = [
  ...(result.cardSlugs.join(",") === "clubs,shoes,apparel,bags,balls,accessories" ? [] : ["department order"]),
  ...(result.imageStates.every((item) => item.loaded) ? [] : ["category image"]),
  ...(Object.values(result.routeStatuses).every((status) => status === 200) ? [] : ["department route"]),
  ...(result.horizontalOverflow <= 0 ? [] : [`horizontal overflow ${result.horizontalOverflow}px`]),
  ...(result.trailMarkers === 6 ? [] : ["trail marker count"]),
  ...(trailEnd.active === "#accessories" && Number(trailEnd.progress) > 0.98 ? [] : ["trail completion"]),
  ...(reducedMotionVisible ? [] : ["reduced motion reveal"]),
  ...errors,
];

console.log(JSON.stringify({ url, ...result, trailEnd, reducedMotionVisible, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
