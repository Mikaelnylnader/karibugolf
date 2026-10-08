import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4515").replace(/\/$/, "");
const out = "scrollcraft/builds/karibu-category-guides/lab";
await mkdir(out, { recursive: true });

const routes = [
  { name: "drivers", path: "/shop/clubs/drivers/", title: "DRIVERS.", products: 1, instrument: "flight" },
  { name: "irons", path: "/shop/clubs/golf_irons/", title: "IRONS.", products: 5, instrument: "ladder" },
  { name: "wedges", path: "/shop/clubs/wedges/", title: "WEDGES.", products: 3, instrument: "turf" },
  { name: "bags", path: "/shop/bags/bags/", title: "GOLF BAGS.", products: 0, instrument: "load" },
  { name: "balls", path: "/shop/balls/balls/", title: "GOLF BALLS.", products: 2, instrument: "contact" },
  { name: "gloves", path: "/shop/accessories/gloves/", title: "GLOVES.", products: 6, instrument: "contact" },
  { name: "shoes", path: "/shop/shoes/mens_shoes/", title: "MEN’S SHOES.", products: 0, instrument: "field" },
];

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const failures = [];
const errors = [];
const runs = [];

const prepare = async (page, label) => {
  await page.addInitScript(() => {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${label} console: ${message.text()}`); });
  page.on("requestfailed", (request) => errors.push(`${label} request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`));
};

for (const route of routes) {
  for (const device of [
    { name: "desktop", viewport: { width: 1440, height: 900 } },
    { name: "phone", viewport: { width: 390, height: 844 } },
  ]) {
    const label = `${route.name}-${device.name}`;
    const context = await browser.newContext({ viewport: device.viewport });
    const page = await context.newPage();
    await prepare(page, label);
    const response = await page.goto(`${base}${route.path}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector(".department-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true");
    await page.evaluate(() => document.fonts.ready);

    const hero = page.locator(".equipment-object-hero");
    await hero.screenshot({ path: `${out}/${label}-hero.png` });
    await page.locator("#fit-line").scrollIntoViewIfNeeded();
    const lastChoice = page.locator(".equipment-fit-controls button").last();
    await lastChoice.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
    await page.locator(".equipment-fit-workbench").screenshot({ path: `${out}/${label}-fit.png` });

    const result = await page.evaluate(() => ({
      title: document.querySelector(".equipment-object-copy h1")?.textContent?.trim(),
      decisions: document.querySelectorAll(".equipment-decision-track>article").length,
      choices: document.querySelectorAll(".equipment-fit-controls button").length,
      active: document.querySelector('.equipment-fit-controls button[aria-pressed="true"]')?.textContent?.trim(),
      result: document.querySelector(".equipment-fit-result")?.textContent?.replace(/\s+/g, " ").trim(),
      products: document.querySelectorAll("#products .store-product-card").length,
      empty: Boolean(document.querySelector(".category-empty")),
      overflow: document.documentElement.scrollWidth - innerWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      instrument: [...(document.querySelector(".equipment-instrument")?.classList ?? [])].find((name) => name.startsWith("equipment-instrument--"))?.replace("equipment-instrument--", ""),
      railOverflow: (document.querySelector(".equipment-decision-track")?.scrollWidth ?? 0) - (document.querySelector(".equipment-decision-stage")?.clientWidth ?? 0),
    }));

    runs.push({ route: route.name, device: device.name, status: response?.status(), ...result });
    if (response?.status() !== 200) failures.push(`${label}: HTTP ${response?.status()}`);
    if (result.title !== route.title) failures.push(`${label}: title ${result.title}`);
    if (result.decisions !== 3 || result.choices !== 3) failures.push(`${label}: education structure ${result.decisions}/${result.choices}`);
    if (result.instrument !== route.instrument) failures.push(`${label}: instrument ${result.instrument}`);
    if (result.products !== route.products) failures.push(`${label}: products ${result.products}`);
    if ((route.products === 0) !== result.empty) failures.push(`${label}: empty-state mismatch`);
    if (result.overflow > 1) failures.push(`${label}: horizontal overflow ${result.overflow}px`);
    if (result.brokenImages.length) failures.push(`${label}: broken images ${result.brokenImages.join(", ")}`);
    if (result.railOverflow < device.viewport.width) failures.push(`${label}: decision rail too short ${result.railOverflow}px`);
    if (!result.active || !result.result) failures.push(`${label}: keyboard choice did not resolve`);
    await context.close();
  }
}

for (const route of routes.filter((item) => ["drivers", "irons", "wedges", "bags", "balls", "shoes"].includes(item.name))) {
  const label = `${route.name}-reduced`;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await prepare(page, label);
  const response = await page.goto(`${base}${route.path}`, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => ({
    title: document.querySelector(".equipment-object-copy h1")?.textContent?.trim(),
    heroHeight: document.querySelector(".equipment-hero-stage")?.getBoundingClientRect().height,
    railTransform: getComputedStyle(document.querySelector(".equipment-decision-track")).transform,
    overflow: document.documentElement.scrollWidth - innerWidth,
  }));
  await page.screenshot({ path: `${out}/${label}.png`, fullPage: true });
  runs.push({ route: route.name, device: "reduced", status: response?.status(), ...result });
  if (response?.status() !== 200 || result.title !== route.title) failures.push(`${label}: essential content missing`);
  if (result.overflow > 1) failures.push(`${label}: horizontal overflow ${result.overflow}px`);
  if (result.railTransform !== "none") failures.push(`${label}: rail still transformed (${result.railTransform})`);
  await context.close();
}

for (const route of [routes[0], routes[3]]) {
  const label = `${route.name}-no-js`;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto(`${base}${route.path}`, { waitUntil: "load" });
  const result = await page.evaluate(() => ({
    title: document.querySelector(".equipment-object-copy h1")?.textContent?.trim(),
    decisions: document.querySelectorAll(".equipment-decision-track>article").length,
    defaultResult: document.querySelector(".equipment-fit-result")?.textContent?.replace(/\s+/g, " ").trim(),
    overflow: document.documentElement.scrollWidth - innerWidth,
  }));
  runs.push({ route: route.name, device: "no-js", status: response?.status(), ...result });
  if (response?.status() !== 200 || result.title !== route.title || result.decisions !== 3 || !result.defaultResult) failures.push(`${label}: essential content missing`);
  if (result.overflow > 1) failures.push(`${label}: horizontal overflow ${result.overflow}px`);
  await page.screenshot({ path: `${out}/${label}.png`, fullPage: true });
  await context.close();
}

await browser.close();
failures.push(...errors);
const report = { base, routes: routes.map((route) => route.path), runs, errors, failures };
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
