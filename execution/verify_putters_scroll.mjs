import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4515").replace(/\/$/, "");
const route = "/shop/clubs/putters/";
const out = "scrollcraft/builds/karibu-putters/lab";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

const errors = [];
const failures = [];
const runs = [];

const configs = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "phone", viewport: { width: 390, height: 844 } },
  { name: "compact", viewport: { width: 360, height: 640 } },
  { name: "reduced", viewport: { width: 390, height: 844 }, reducedMotion: "reduce" },
];

const prepare = async (page, name) => {
  await page.addInitScript(() => {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${name} console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    errors.push(`${name} request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });
};

for (const config of configs) {
  const context = await browser.newContext({
    viewport: config.viewport,
    reducedMotion: config.reducedMotion,
  });
  const page = await context.newPage();
  await prepare(page, config.name);
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".department-scroll-shell")?.getAttribute("data-scrollcraft-mounted") === "true");
  await page.evaluate(() => document.fonts.ready);

  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const maxScroll = Math.max(0, pageHeight - config.viewport.height);
  const samples = config.name === "desktop"
    ? [0, 0.12, 0.27, 0.43, 0.55, 0.66, 0.78, 1]
    : [0, 0.18, 0.38, 0.56, 0.72, 0.88, 1];
  for (const [index, progress] of samples.entries()) {
    await page.evaluate((y) => scrollTo(0, y), Math.round(maxScroll * progress));
    await page.waitForTimeout(180);
    await page.screenshot({ path: `${out}/${config.name}-${String(index).padStart(2, "0")}.png` });
  }

  await page.locator("#stroke-fit").scrollIntoViewIfNeeded();
  const strongButton = page.getByRole("button", { name: /Stronger arc/i });
  await strongButton.focus();
  await page.keyboard.press("Enter");
  const resultCopy = await page.locator(".putter-fit-result").innerText();

  const result = await page.evaluate(() => {
    const rail = document.querySelector(".putter-shape-rail");
    const stage = document.querySelector(".putter-spectrum-stage");
    const activeButton = document.querySelector('.putter-fit-controls button[aria-pressed="true"]');
    const markerStyles = [...document.querySelectorAll(".putter-tour-markers span")].map((item) => getComputedStyle(item));
    return {
      title: document.querySelector(".putter-object-copy h1")?.textContent?.trim(),
      overflow: document.documentElement.scrollWidth - innerWidth,
      height: document.documentElement.scrollHeight,
      shapeCards: document.querySelectorAll(".putter-shape-card").length,
      markerCount: document.querySelectorAll(".putter-tour-markers span").length,
      productCount: document.querySelectorAll("#products .store-product-card").length,
      tourSource: document.querySelector(".putter-tour-reading a")?.getAttribute("href"),
      fittingSource: document.querySelector(".putter-stroke-fit footer a")?.getAttribute("href"),
      activeStroke: activeButton?.textContent?.trim(),
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      railOverflow: rail && stage ? rail.scrollWidth - stage.clientWidth : 0,
      markerOpacityMin: markerStyles.length ? Math.min(...markerStyles.map((style) => Number(style.opacity))) : 0,
      tourText: document.querySelector(".putter-tour-heading")?.textContent?.replace(/\s+/g, " ").trim(),
    };
  });

  runs.push({ ...config, status: response?.status(), ...result });
  if (response?.status() !== 200) failures.push(`${config.name}: HTTP ${response?.status()}`);
  if (result.title !== "PUTTERS.") failures.push(`${config.name}: title ${result.title}`);
  if (result.overflow > 1) failures.push(`${config.name}: horizontal overflow ${result.overflow}px`);
  if (result.shapeCards !== 4) failures.push(`${config.name}: shape cards ${result.shapeCards}`);
  if (result.markerCount !== 47) failures.push(`${config.name}: Tour markers ${result.markerCount}`);
  if (result.productCount !== 7) failures.push(`${config.name}: products ${result.productCount}`);
  if (result.brokenImages.length) failures.push(`${config.name}: broken images ${result.brokenImages.join(", ")}`);
  if (result.railOverflow < config.viewport.width * 1.5) failures.push(`${config.name}: shape rail is too short (${result.railOverflow}px)`);
  if (!result.tourSource?.includes("pgatour.com")) failures.push(`${config.name}: Tour source missing`);
  if (!result.fittingSource?.includes("ping.com")) failures.push(`${config.name}: fitting source missing`);
  if (!result.activeStroke?.includes("Stronger arc")) failures.push(`${config.name}: keyboard stroke selector failed`);
  if (!resultCopy.includes("heel-shafted")) failures.push(`${config.name}: strong-arc copy did not update`);
  if (!result.tourText?.includes("35 wins with mallets") || !result.tourText?.includes("12 with blades")) failures.push(`${config.name}: Tour figures missing`);
  if (config.name === "reduced" && result.markerOpacityMin < 0.99) failures.push(`reduced: markers are not fully visible (${result.markerOpacityMin})`);

  await context.close();
}

const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
const noJsPage = await noJsContext.newPage();
const noJsResponse = await noJsPage.goto(`${base}${route}`, { waitUntil: "load" });
const noJs = await noJsPage.evaluate(() => ({
  title: document.querySelector(".putter-object-copy h1")?.textContent?.trim(),
  productCount: document.querySelectorAll("#products .store-product-card").length,
  tourFigures: document.querySelector(".putter-tour-board")?.textContent?.replace(/\s+/g, " ").trim(),
  fitCopy: document.querySelector(".putter-fit-result")?.textContent?.replace(/\s+/g, " ").trim(),
  cueOpacity: getComputedStyle(document.querySelector(".putter-object-copy")).opacity,
  overflow: document.documentElement.scrollWidth - innerWidth,
}));
if (noJsResponse?.status() !== 200) failures.push(`no-js: HTTP ${noJsResponse?.status()}`);
if (noJs.title !== "PUTTERS." || noJs.productCount !== 7) failures.push("no-js: essential content missing");
if (!noJs.tourFigures?.includes("35") || !noJs.tourFigures?.includes("12")) failures.push("no-js: Tour figures missing");
if (!noJs.fitCopy?.toLowerCase().includes("slight arc")) failures.push("no-js: default fitting advice missing");
if (Number(noJs.cueOpacity) < 0.99) failures.push(`no-js: hero hidden at opacity ${noJs.cueOpacity}`);
if (noJs.overflow > 1) failures.push(`no-js: horizontal overflow ${noJs.overflow}px`);
await noJsPage.screenshot({ path: `${out}/no-js.png` });
await noJsContext.close();

await browser.close();
failures.push(...errors);
const report = { base, route, runs, noJs, errors, failures };
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
