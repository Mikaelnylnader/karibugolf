import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4503").replace(/\/$/, "");
const output = "scrollcraft/builds/karibu-stock/lab";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [];
const attachDiagnostics = (page, label) => {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label} console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "failed";
    if (request.resourceType() === "image" && failure.includes("ERR_ABORTED")) return;
    errors.push(`${label} request: ${request.url()} ${failure}`);
  });
};

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
attachDiagnostics(desktop, "desktop");
await desktop.goto(`${base}/shop/stock/`, { waitUntil: "networkidle" });
await desktop.waitForFunction(() => document.querySelector(".stock-room-shell")?.getAttribute("data-scrollcraft-mounted") === "true");
await desktop.screenshot({ path: `${output}/desktop-opening.png` });

const exhibits = desktop.locator("[data-stock-product]");
const stockCount = await exhibits.count();
const productLinks = [];
for (let index = 0; index < stockCount; index += 1) {
  const exhibit = exhibits.nth(index);
  await exhibit.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await desktop.waitForTimeout(420);
  const image = exhibit.locator("img");
  await image.waitFor({ state: "visible" });
  const loaded = await image.evaluate((node) => node.complete && node.naturalWidth > 0);
  if (!loaded) errors.push(`desktop image ${index + 1} did not load`);
  productLinks.push(await exhibit.locator("a.stock-product-link").getAttribute("href"));
  if (index === Math.floor(stockCount / 2)) await desktop.screenshot({ path: `${output}/desktop-midpoint.png` });
}
await desktop.waitForTimeout(220);
const stockPage = await desktop.evaluate(() => ({
  manifestItems: document.querySelectorAll(".stock-manifest-list li").length,
  ticketName: document.querySelector(".stock-ticket h2")?.textContent?.trim(),
  ticketPrice: document.querySelector(".stock-ticket dd")?.textContent?.trim(),
  registerItems: document.querySelectorAll(".stock-register a").length,
  horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  schemaItems: JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || "{}").numberOfItems,
}));
await desktop.locator(".stock-confirmation").scrollIntoViewIfNeeded();
await desktop.waitForTimeout(700);
await desktop.screenshot({ path: `${output}/desktop-close.png` });

const routeStatuses = {};
for (const href of productLinks) routeStatuses[href] = await desktop.evaluate(async (path) => (await fetch(`${path}/`)).status, href);

await desktop.goto(`${base}/shop/`, { waitUntil: "networkidle" });
const shop = await desktop.evaluate(() => ({
  cards: document.querySelectorAll(".shop-stock-item").length,
  stockLink: document.querySelector(".shop-stock-window footer a")?.getAttribute("href"),
  heading: document.querySelector("#shop-stock-title")?.textContent?.replace(/\s+/g, " ").trim(),
}));
await desktop.locator(".shop-stock-window").scrollIntoViewIfNeeded();
await desktop.waitForTimeout(700);
await desktop.screenshot({ path: `${output}/shop-stock-window.png` });

await desktop.goto(`${base}/`, { waitUntil: "networkidle" });
const home = await desktop.evaluate(() => ({
  cards: document.querySelectorAll(".home-stock-card").length,
  stockLink: document.querySelector(".home-stock-copy>a")?.getAttribute("href"),
  shopIntro: document.querySelector("#webshop-heading")?.textContent?.replace(/\s+/g, " ").trim(),
  shopLink: document.querySelector(".shop-announcement>a")?.getAttribute("href"),
}));
const homeStock = desktop.locator(".home-stock");
await homeStock.scrollIntoViewIfNeeded();
await desktop.evaluate(() => {
  const section = document.querySelector(".home-stock");
  if (section) scrollTo(0, section.getBoundingClientRect().top + scrollY + section.clientHeight - innerHeight - 8);
});
await desktop.waitForTimeout(250);
const fanTransforms = await desktop.locator(".home-stock-card").evaluateAll((items) => items.map((item) => getComputedStyle(item).transform));
await desktop.screenshot({ path: `${output}/home-stock-rack.png` });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
attachDiagnostics(mobile, "mobile");
await mobile.goto(`${base}/shop/stock/`, { waitUntil: "networkidle" });
await mobile.screenshot({ path: `${output}/mobile-opening.png` });
await mobile.locator("[data-stock-product]").first().scrollIntoViewIfNeeded();
await mobile.screenshot({ path: `${output}/mobile-product.png` });
const mobileState = await mobile.evaluate(() => ({
  horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  products: document.querySelectorAll("[data-stock-product]").length,
  registerVisible: getComputedStyle(document.querySelector(".stock-register")).display !== "none",
}));

const reduced = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
attachDiagnostics(reduced, "reduced");
await reduced.goto(`${base}/shop/stock/`, { waitUntil: "networkidle" });
const reducedState = await reduced.evaluate(() => ({
  revealsSettled: [...document.querySelectorAll("[data-sc-reveal]")].every((item) => getComputedStyle(item).clipPath === "none"),
  products: document.querySelectorAll("[data-stock-product]").length,
}));
await reduced.screenshot({ path: `${output}/reduced-opening.png` });

await browser.close();

const expectedCount = 4;
const failures = [
  ...(stockCount === expectedCount ? [] : [`stock page count ${stockCount}`]),
  ...(stockPage.manifestItems === expectedCount ? [] : [`manifest count ${stockPage.manifestItems}`]),
  ...(stockPage.registerItems === expectedCount ? [] : [`register count ${stockPage.registerItems}`]),
  ...(stockPage.schemaItems === expectedCount ? [] : [`schema count ${stockPage.schemaItems}`]),
  ...(stockPage.ticketName === "TaylorMade P790" ? [] : [`ticket did not reach last product: ${stockPage.ticketName}`]),
  ...(stockPage.horizontalOverflow <= 0 ? [] : [`desktop overflow ${stockPage.horizontalOverflow}px`]),
  ...(Object.values(routeStatuses).every((status) => status === 200) ? [] : ["product route status"]),
  ...(shop.cards === expectedCount && shop.stockLink === "/shop/stock" ? [] : ["shop stock window"]),
  ...(home.cards === expectedCount && home.stockLink === "/shop/stock" ? [] : ["home stock rack"]),
  ...(home.shopIntro?.includes("YOUR NEXT FIND") && home.shopLink === "/shop" ? [] : ["home shop introduction"]),
  ...(new Set(fanTransforms).size > 1 ? [] : ["home stock rack did not fan open"]),
  ...(mobileState.products === expectedCount && mobileState.registerVisible ? [] : ["mobile stock content"]),
  ...(mobileState.horizontalOverflow <= 0 ? [] : [`mobile overflow ${mobileState.horizontalOverflow}px`]),
  ...(reducedState.products === expectedCount && reducedState.revealsSettled ? [] : ["reduced motion content"]),
  ...errors,
];

console.log(JSON.stringify({ base, stockCount, stockPage, routeStatuses, shop, home, fanTransforms, mobileState, reducedState, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
