import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4504").replace(/\/$/, "");
const output = "scrollcraft/builds/karibu-people/lab";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [];

async function pageFor(viewport, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport, reducedMotion });
  await context.addInitScript(() => {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.requestPointerLock = () => Promise.resolve();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && !response.url().includes("/api/storefront-products")) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return { context, page };
}

async function scrollState(page, progress) {
  await page.evaluate((value) => {
    document.documentElement.style.scrollBehavior = "auto";
    const section = document.querySelector(".people");
    const top = section.getBoundingClientRect().top + scrollY;
    scrollTo(0, top - innerHeight * 0.9 + value * innerHeight * 0.78);
  }, progress);
  await page.waitForTimeout(850);
  return page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    return {
      progress: getComputedStyle(document.querySelector(".people")).getPropertyValue("--people-p").trim(),
      lineOne: { opacity: style(".people-line-one>span").opacity, transform: style(".people-line-one>span").transform },
      lineTwo: { opacity: style(".people-line-two>em").opacity, transform: style(".people-line-two>em").transform },
      list: { opacity: style(".support-accordion").opacity, transform: style(".support-accordion").transform },
      divider: style(".people-divider i").transform,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
}

const desktopRun = await pageFor({ width: 1440, height: 1000 });
await desktopRun.page.goto(`${base}/`, { waitUntil: "networkidle" });
const desktop = [];
for (const [index, progress] of [0, 0.5, 1].entries()) {
  desktop.push(await scrollState(desktopRun.page, progress));
  await desktopRun.page.screenshot({ path: `${output}/desktop-${index}-${String(progress).replace(".", "-")}.png` });
}
const firstTrigger = desktopRun.page.locator('.support-accordion [data-slot="accordion-trigger"]').first();
await firstTrigger.focus();
const keyboardVisible = await firstTrigger.isVisible();

const mobileRun = await pageFor({ width: 390, height: 844 });
await mobileRun.page.goto(`${base}/`, { waitUntil: "networkidle" });
const mobile = await scrollState(mobileRun.page, 1);
await mobileRun.page.screenshot({ path: `${output}/mobile.png` });

const reducedRun = await pageFor({ width: 1440, height: 1000 }, "reduce");
await reducedRun.page.goto(`${base}/`, { waitUntil: "networkidle" });
const reduced = await scrollState(reducedRun.page, 0.35);
await reducedRun.page.screenshot({ path: `${output}/reduced.png` });

await browser.close();

const failures = [
  ...(new Set(desktop.map((state) => state.lineOne.transform)).size > 1 ? [] : ["first headline line did not move"]),
  ...(new Set(desktop.map((state) => state.lineTwo.transform)).size > 1 ? [] : ["second headline line did not move"]),
  ...(Number(desktop.at(-1).lineOne.opacity) > 0.98 && Number(desktop.at(-1).lineTwo.opacity) > 0.98 ? [] : ["headline did not resolve"]),
  ...(Number(desktop.at(-1).list.opacity) > 0.98 ? [] : ["accordion did not resolve"]),
  ...(Number(mobile.lineOne.opacity) > 0.98 && Number(mobile.lineTwo.opacity) > 0.98 && Number(mobile.list.opacity) > 0.98 ? [] : ["mobile sequence did not resolve"]),
  ...(desktop.every((state) => state.overflow <= 0) && mobile.overflow <= 0 ? [] : ["horizontal overflow"]),
  ...(reduced.lineOne.transform === "none" && reduced.lineTwo.transform === "none" && Number(reduced.list.opacity) === 1 ? [] : ["reduced-motion fallback"]),
  ...(keyboardVisible ? [] : ["accordion trigger not keyboard visible"]),
  ...errors,
];

console.log(JSON.stringify({ base, desktop, mobile, reduced, keyboardVisible, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
