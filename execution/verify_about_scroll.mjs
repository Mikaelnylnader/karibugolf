import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4505").replace(/\/$/, "");
const output = `.tmp/about-scroll-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
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

async function inspectNewContent(page, label) {
  const samples = { founder: [], community: [] };
  for (const selector of [".about-founder", ".about-community"]) {
    for (const [index, progress] of [0, 0.2, 0.4, 0.6, 0.8, 1].entries()) {
      await page.evaluate(({ selector, progress }) => {
        document.documentElement.style.scrollBehavior = "auto";
        const section = document.querySelector(selector);
        const nav = document.querySelector(".persistent-nav")?.getBoundingClientRect().height || 76;
        const top = section.getBoundingClientRect().top + scrollY;
        const entry = innerHeight * 0.75;
        scrollTo(0, top - entry + (Math.max(0, section.offsetHeight - innerHeight + nav) + entry) * progress);
      }, { selector, progress });
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${output}/${label}-${selector.slice(7)}-${index}.png` });
      samples[selector.slice(7)].push(await page.evaluate(() => ({
        trace: getComputedStyle(document.querySelector(".about-founder-journey"), "::after").transform,
        traceState: document.querySelector("[data-about-founder-trace]").dataset.scVerifyState,
        photo: getComputedStyle(document.querySelector(".about-community-photo-motion")).transform,
        window: getComputedStyle(document.querySelector(".about-community-photo-window")).clipPath,
        photoState: document.querySelector("[data-about-community-media]").dataset.scVerifyState,
      })));
    }
  }
  const link = page.locator(".about-community-invitation a");
  await link.focus();
  const focus = await link.evaluate((item) => ({
    visible: item.getBoundingClientRect().top >= 0 && item.getBoundingClientRect().bottom <= innerHeight,
    outline: getComputedStyle(item).outlineWidth,
    href: item.href,
  }));
  return page.evaluate(({ focus, samples }) => ({
    focus,
    samples,
    motion: document.querySelector(".about-scroll-shell").dataset.aboutMotion,
    founderPosition: getComputedStyle(document.querySelector(".about-founder-heading")).position,
    photoPosition: getComputedStyle(document.querySelector(".about-community-photo")).position,
    founder: document.querySelector(".about-founder").textContent,
    community: document.querySelector(".about-community").textContent,
    highlights: document.querySelectorAll(".about-community-highlights article").length,
    overflow: document.documentElement.scrollWidth - innerWidth,
    headingWidths: [...document.querySelectorAll(".about-founder h2, .about-community h2")].map((item) => item.scrollWidth - item.clientWidth),
    entryOpacities: [...document.querySelectorAll(".about-founder [data-sc-in] > *, .about-community [data-sc-in] > *")].map((item) => Number(getComputedStyle(item).opacity)),
  }), { focus, samples });
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
const desktopContent = await inspectNewContent(desktopRun.page, "desktop");
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
const mobileContent = await inspectNewContent(mobileRun.page, "mobile");
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
const reducedContent = await inspectNewContent(reducedRun.page, "reduced");
await reducedRun.context.close();

const compactRun = await pageFor({ width: 360, height: 640 });
const compactContent = await inspectNewContent(compactRun.page, "compact");
await compactRun.context.close();

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

for (const [label, result] of Object.entries({ desktopContent, mobileContent, reducedContent, compactContent })) {
  if (!["Mikael Nylander", "Sweden", "DP World Tour", "Volvo China Open", "several tournaments in Shanghai", "multiple long-drive competitions", "Nairobi"].every((text) => result.founder.includes(text))) failures.push(`${label}: founder biography incomplete`);
  if (!result.community.includes("When you buy from Karibu Golf, you’ll be invited") || !result.community.includes("Dates, venues and participation details will be announced")) failures.push(`${label}: customer invitation or event status missing`);
  if (result.highlights !== 4) failures.push(`${label}: four clinic highlights expected`);
  if (!result.focus.href.startsWith("https://wa.me/254116416105?text=") || !decodeURIComponent(result.focus.href).includes("Nairobi driving range clinic")) failures.push(`${label}: incorrect clinic inquiry link`);
  if (!result.focus.visible || parseFloat(result.focus.outline) < 2) failures.push(`${label}: clinic link keyboard focus not visible`);
  if (result.overflow > 1 || result.headingWidths.some((width) => width > 1)) failures.push(`${label}: new content overflows`);
  if (result.entryOpacities.some((opacity) => opacity < 0.99)) failures.push(`${label}: new copy remains hidden after entry`);
  if (label !== "reducedContent") {
    if (new Set(result.samples.founder.map((sample) => sample.trace)).size < 3) failures.push(`${label}: founder route does not draw across scroll`);
    if (new Set(result.samples.community.map((sample) => sample.photo)).size < 3) failures.push(`${label}: community photograph does not move across scroll`);
    if (new Set(result.samples.community.map((sample) => sample.window)).size < 2) failures.push(`${label}: community photograph does not wipe open`);
  } else if (result.samples.community.some((sample) => sample.window !== "none") || result.photoPosition === "sticky" || result.founderPosition === "sticky") failures.push("reducedContent: new sections retained moving/sticky choreography");
}
if (desktopContent.founderPosition !== "sticky" || desktopContent.photoPosition !== "sticky") failures.push("desktop columns do not hold while reading");
if ([mobileContent, compactContent].some((result) => result.founderPosition === "sticky" || result.photoPosition === "sticky")) failures.push("phone layout inherited desktop sticky columns");

const report = { base, output, desktop, mobileHero, mobilePan, mobileClose, reduced, desktopContent, mobileContent, reducedContent, compactContent, errors, failures };
await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
