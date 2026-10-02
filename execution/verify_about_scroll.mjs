import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4505").replace(/\/$/, "");
const output = "scrollcraft/builds/karibu-about/lab";
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
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`${base}/about/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".about-scroll-shell")?.dataset.scrollcraftMounted === "true");
  return { context, page };
}

async function moveIn(page, selector, progress) {
  await page.evaluate(({ selector, progress }) => {
    document.documentElement.style.scrollBehavior = "auto";
    const section = document.querySelector(selector);
    const top = section.getBoundingClientRect().top + scrollY;
    const travel = Math.max(section.offsetHeight - innerHeight, 1);
    scrollTo(0, top + travel * progress);
  }, { selector, progress });
  await page.waitForTimeout(450);
}

async function state(page) {
  return page.evaluate(() => {
    const root = document.querySelector(".about-scroll-shell");
    const aperture = document.querySelector(".about-aperture-media");
    const hero = document.querySelector("[data-about-aperture]");
    const rail = document.querySelector(".about-promises-rail");
    const close = document.querySelector("[data-about-close]");
    const broken = [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src);
    return {
      mounted: root?.dataset.scrollcraftMounted,
      aperture: getComputedStyle(aperture).clipPath,
      heroState: hero?.dataset.scVerifyState,
      panTransform: getComputedStyle(rail).transform,
      panOverflow: rail.scrollWidth - innerWidth,
      closeState: close?.dataset.scVerifyState,
      documentOverflow: document.documentElement.scrollWidth - innerWidth,
      contactHref: document.querySelector(".about-close-copy a")?.getAttribute("href"),
      promises: document.querySelectorAll(".about-promise").length,
      broken,
    };
  });
}

const desktopRun = await pageFor({ width: 1440, height: 1000 });
const desktop = { hero: [], pan: [] };
for (const [index, progress] of [0, 0.5, 1].entries()) {
  await moveIn(desktopRun.page, ".about-aperture-hero", progress);
  desktop.hero.push(await state(desktopRun.page));
  await desktopRun.page.screenshot({ path: `${output}/desktop-hero-${index}.png` });
}
await desktopRun.page.locator(".about-origin").scrollIntoViewIfNeeded();
await desktopRun.page.waitForTimeout(500);
await desktopRun.page.screenshot({ path: `${output}/desktop-origin.png` });
await moveIn(desktopRun.page, ".about-people-belief", 0.62);
await desktopRun.page.screenshot({ path: `${output}/desktop-people.png` });
for (const [index, progress] of [0, 0.5, 1].entries()) {
  await moveIn(desktopRun.page, ".about-promises", progress);
  desktop.pan.push(await state(desktopRun.page));
  await desktopRun.page.screenshot({ path: `${output}/desktop-promises-${index}.png` });
}
await desktopRun.page.locator(".about-circle-close").scrollIntoViewIfNeeded();
await desktopRun.page.waitForTimeout(500);
desktop.close = await state(desktopRun.page);
await desktopRun.page.screenshot({ path: `${output}/desktop-close.png` });
await desktopRun.context.close();

const mobileRun = await pageFor({ width: 390, height: 844 });
await moveIn(mobileRun.page, ".about-aperture-hero", 0.55);
const mobileHero = await state(mobileRun.page);
await mobileRun.page.screenshot({ path: `${output}/mobile-hero.png` });
await moveIn(mobileRun.page, ".about-promises", 1);
const mobilePan = await state(mobileRun.page);
await mobileRun.page.screenshot({ path: `${output}/mobile-promises.png` });
await mobileRun.page.locator(".about-circle-close").scrollIntoViewIfNeeded();
await mobileRun.page.waitForTimeout(450);
const mobileClose = await state(mobileRun.page);
await mobileRun.page.screenshot({ path: `${output}/mobile-close.png` });
await mobileRun.context.close();

const reducedRun = await pageFor({ width: 1440, height: 1000 }, "reduce");
await reducedRun.page.locator(".about-promises").scrollIntoViewIfNeeded();
await reducedRun.page.waitForTimeout(450);
const reduced = await reducedRun.page.evaluate(() => ({
  railDisplay: getComputedStyle(document.querySelector(".about-promises-rail")).display,
  promises: [...document.querySelectorAll(".about-promise")].map((item) => ({
    opacity: getComputedStyle(item).opacity,
    visible: item.getBoundingClientRect().height > 0,
  })),
  documentOverflow: document.documentElement.scrollWidth - innerWidth,
  heroHeight: document.querySelector(".about-aperture-hero").getBoundingClientRect().height,
}));
await reducedRun.page.screenshot({ path: `${output}/reduced-promises.png`, fullPage: false });
await reducedRun.context.close();

await browser.close();

const failures = [
  ...(new Set(desktop.hero.map((item) => item.aperture)).size >= 3 ? [] : ["hero aperture did not change across scroll"]),
  ...(new Set(desktop.hero.map((item) => item.heroState)).size >= 3 ? [] : ["hero verification state did not change"]),
  ...(desktop.pan[0].panOverflow >= 720 ? [] : [`desktop rail overflow too small: ${desktop.pan[0].panOverflow}px`]),
  ...(new Set(desktop.pan.map((item) => item.panTransform)).size >= 3 ? [] : ["promise rail did not travel"]),
  ...(desktop.close.contactHref === "/contact" ? [] : ["contact link is incorrect"]),
  ...(desktop.close.promises === 3 ? [] : ["expected three service promises"]),
  ...(desktop.close.closeState?.startsWith("circle:") ? [] : ["close signature state missing"]),
  ...(desktop.close.documentOverflow <= 1 && mobileHero.documentOverflow <= 1 && mobilePan.documentOverflow <= 1 && mobileClose.documentOverflow <= 1 ? [] : ["document has horizontal overflow"]),
  ...(desktop.close.broken.length === 0 && mobileClose.broken.length === 0 ? [] : ["broken images found"]),
  ...(mobilePan.panOverflow > 195 ? [] : ["mobile rail does not have meaningful travel"]),
  ...(reduced.railDisplay === "grid" ? [] : ["reduced-motion rail is not a grid"]),
  ...(reduced.promises.every((item) => item.visible && Number(item.opacity) === 1) ? [] : ["reduced-motion promises are not all visible"]),
  ...(reduced.documentOverflow <= 1 ? [] : ["reduced-motion document has horizontal overflow"]),
  ...(reduced.heroHeight <= 1100 ? [] : ["reduced-motion hero retained pinned travel"]),
  ...errors,
];

console.log(JSON.stringify({ base, desktop, mobileHero, mobilePan, mobileClose, reduced, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
