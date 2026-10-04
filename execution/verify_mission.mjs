import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4506").replace(/\/$/, "");
const baseline = process.argv.includes("--baseline");
const compareHome = process.argv.find(argument => argument.startsWith("--compare-home="))?.slice("--compare-home=".length);
const output = `.tmp/mission-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const failures = [], errors = [], results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };

async function pageFor(viewport, reducedMotion = "no-preference", javaScriptEnabled = true) {
  const context = await browser.newContext({ viewport, reducedMotion, javaScriptEnabled });
  await context.addInitScript(() => {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.requestPointerLock = () => Promise.resolve();
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400 && !response.url().includes("/api/storefront-products")) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`${base}/growing-the-game/`, { waitUntil: "networkidle" });
  if (javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".mission-shell")?.dataset.scrollcraftMounted === "true");
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  return { context, page };
}

async function scrollToElement(page, selector) {
  await page.evaluate(selector => {
    const node = document.querySelector(selector);
    const nav = document.querySelector(".persistent-nav").getBoundingClientRect().height;
    scrollTo(0, node.getBoundingClientRect().top + scrollY - nav - 24);
  }, selector);
  await page.waitForTimeout(1000);
}

async function snapshot(page) {
  return page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    drawn: getComputedStyle(document.querySelector(".mission-path-drawn")).strokeDashoffset,
    node: getComputedStyle(document.querySelector(".mission-node-opportunities")).transform,
    photo: getComputedStyle(document.querySelector(".mission-photo-plane")).transform,
    seal: getComputedStyle(document.querySelector(".mission-photo-seal")).transform,
    headline: getComputedStyle(document.querySelector(".mission-hero h1>span")).transform,
    state: document.querySelector("[data-mission-growth]").dataset.scVerifyState,
    pathTop: document.querySelector(".mission-growth-path").getBoundingClientRect().top,
    viewport: innerHeight,
    growthLines: [...document.querySelectorAll(".mission-growth-line>span")].map(line => ({ opacity: getComputedStyle(line).opacity, transform: getComputedStyle(line).transform, rise: new DOMMatrixReadOnly(getComputedStyle(line).transform).m42 })),
    broken: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src),
  }));
}

for (const { label, viewport, reduced } of [
  { label: "desktop", viewport: { width: 1440, height: 1000 }, reduced: "no-preference" },
  { label: "mobile", viewport: { width: 390, height: 844 }, reduced: "no-preference" },
  { label: "compact", viewport: { width: 360, height: 640 }, reduced: "no-preference" },
  { label: "reduced", viewport: { width: 1440, height: 1000 }, reduced: "reduce" },
]) {
  const { page, context } = await pageFor(viewport, reduced);
  const record = { hero: [], growthType: [], growth: [], anchors: [], entries: [] };
  if (!baseline) {
    for (let index = 0; index < 6; index++) {
      await page.evaluate(progress => {
        const lines = [...document.querySelectorAll(".mission-growth-line")];
        const start = lines[0].getBoundingClientRect().top + scrollY - innerHeight * .96;
        const finish = lines.at(-1).getBoundingClientRect().top + scrollY - innerHeight * .65;
        scrollTo(0, start + (finish - start) * progress);
      }, index / 5);
      await page.waitForTimeout(180);
      record.growthType.push(await snapshot(page));
      await page.screenshot({ path: `${output}/${label}-growth-type-${index}.png` });
    }
    check(record.growthType.every(state => state.growthLines.length === 3 && state.growthLines.every(line => Number(line.opacity) === 1)), `${label}: growth headlines missing or faded`);
    check(record.growthType.at(-1).growthLines.every(line => Math.abs(line.rise) < .5), `${label}: growth headlines did not fully arrive`);
    if (reduced !== "reduce") check(new Set(record.growthType.map(state => JSON.stringify(state.growthLines.map(line => line.rise)))).size > 3, `${label}: growth typography did not respond to scrolling`);
    else check(record.growthType.every(state => state.growthLines.every(line => line.transform === "none")), "reduced: moving growth typography");
  }
  for (let index = 0; index < 6; index++) {
    await page.evaluate(index => scrollTo(0, index * innerHeight * .07), index);
    await page.waitForTimeout(160);
    record.hero.push(await snapshot(page));
    await page.screenshot({ path: `${output}/${label}-hero-${index}.png` });
  }
  if (reduced !== "reduce") {
    for (const property of ["photo", "seal", "headline"]) check(new Set(record.hero.map(state => state[property])).size > 1, `${label}: ${property} did not move independently`);
  }
  for (const selector of [".mission-today", ".mission-ledger-heading", "#junior-golf", "#grassroots", "#affordable-equipment", "#responsible-golf", ".mission-partner"]) {
    await scrollToElement(page, selector);
    await page.screenshot({ path: `${output}/${label}-${selector.replace(/[.#]/g, "")}.png` });
    record.entries.push(await page.locator(selector).evaluate(node => {
      const nodes = [node, ...node.querySelectorAll("[data-sc-in], [data-sc-stagger]>*")];
      return { selector: node.id || node.getAttribute("class"), opacities: nodes.map(item => getComputedStyle(item).opacity), overflow: document.documentElement.scrollWidth - innerWidth };
    }));
  }
  for (let index = 0; index < 6; index++) {
    await page.evaluate(progress => {
      const path = document.querySelector(".mission-growth-path");
      scrollTo(0, path.getBoundingClientRect().top + scrollY - innerHeight * .88 + innerHeight * .42 * progress);
    }, index / 5);
    await page.waitForTimeout(180);
    record.growth.push(await snapshot(page));
    await page.screenshot({ path: `${output}/${label}-growth-${index}.png` });
  }
  check(record.entries.every(entry => entry.opacities.every(opacity => Number(opacity) > .98)), `${label}: entry copy did not reach full opacity`);
  check([...record.hero, ...record.growthType, ...record.growth, ...record.entries].every(state => state.overflow <= 0), `${label}: horizontal overflow`);
  check([...record.hero, ...record.growth].every(state => !state.broken.length), `${label}: broken image`);
  check(Number.parseFloat(record.growth.at(-1).drawn.replace(/^calc\(/, "")) < .02, `${label}: growth path did not resolve`);
  check(record.growth.every(state => state.pathTop > 0 && state.pathTop < state.viewport), `${label}: growth animation completed out of view`);
  if (reduced !== "reduce") check(new Set(record.growth.map(state => state.drawn)).size > 3, `${label}: growth path failed six-position sampling`);
  else check(record.hero.every(state => state.photo === "none" && state.seal === "none" && state.headline === "none"), "reduced: moving hero");

  for (const id of ["junior-golf", "grassroots", "affordable-equipment", "responsible-golf"]) {
    await scrollToElement(page, ".mission-ledger-heading");
    const link = page.locator(`.mission-ledger-heading a[href="#${id}"]`);
    await link.click();
    await page.waitForTimeout(900);
    const target = await page.locator(`#${id}`).evaluate(node => ({ top: node.getBoundingClientRect().top, nav: document.querySelector(".persistent-nav").getBoundingClientRect().height }));
    record.anchors.push({ id, ...target });
    check(target.top >= target.nav - 2 && target.top < viewport.height, `${label}: ${id} anchor hidden by navigation`);
    if (!baseline) check(await page.locator(`.mission-ledger-heading a[href="#${id}"]`).getAttribute("aria-current") === "location", `${label}: plan index did not mark ${id} active`);
  }
  const partner = page.locator(".mission-partner-copy>a");
  await partner.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  record.focus = await partner.evaluate(node => ({ active: document.activeElement === node, outline: getComputedStyle(node).outlineWidth, top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, href: node.href }));
  check(record.focus.active && parseFloat(record.focus.outline) >= 2 && record.focus.top >= 0 && record.focus.bottom <= viewport.height, `${label}: partner keyboard focus not visible`);
  check(record.focus.href.startsWith("https://wa.me/254116416105?text=") && decodeURIComponent(record.focus.href).includes("future Growing the Game plans"), `${label}: invalid partner message`);
  record.status = await page.evaluate(() => ({ planLabels: document.querySelectorAll(".mission-entry-label>span").length, explicitFuture: document.body.innerText.includes("future plans, not programmes already running"), canonical: document.querySelector('link[rel="canonical"]')?.href, robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") }));
  check(record.status.planLabels === 4 && record.status.explicitFuture, `${label}: programme status unclear`);
  check(record.status.robots === "index, follow", `${label}: public mission page not indexable`);
  check(record.status.canonical === `${base.includes("localhost") || base.includes("127.0.0.1") ? "https://karibugolf.com" : base}/growing-the-game/`, `${label}: canonical route incorrect`);
  results[label] = record;
  await context.close();
}

const { page: noJs, context: noJsContext } = await pageFor({ width: 390, height: 844 }, "no-preference", false);
const noJsStates = [];
for (const selector of [".mission-today", "#junior-golf", ".mission-growth", ".mission-partner"]) {
  await noJs.locator(selector).scrollIntoViewIfNeeded();
  noJsStates.push(await noJs.locator(selector).evaluate(node => [...node.querySelectorAll("[data-sc-in], [data-sc-stagger]>*"), node].map(item => getComputedStyle(item).opacity)));
}
check(noJsStates.flat().every(opacity => Number(opacity) === 1), "no-JS: unreadable content");
if (!baseline) check(await noJs.locator(".mission-growth-line>span").evaluateAll(lines => lines.length === 3 && lines.every(line => getComputedStyle(line).transform === "none")), "no-JS: growth typography masked");
await noJs.screenshot({ path: `${output}/no-js.png`, fullPage: true });
results.noJs = noJsStates;
await noJsContext.close();

const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript(() => {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.requestPointerLock = () => Promise.resolve();
});
const page = await context.newPage();
await page.goto(`${base}/`, { waitUntil: "networkidle" });
results.homeContract = await page.evaluate(() => ({
  sectionOrder: [...document.querySelectorAll("main>section")].map(section => section.getAttribute("class")),
  headings: [...document.querySelectorAll("main h1,main h2")].map(heading => heading.innerText),
  stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.getAttribute("href")),
  images: [...document.querySelectorAll("main img")].filter(image => !image.closest(".home-stock")).map(image => image.getAttribute("src")),
  paragraphCount: document.querySelectorAll("main p").length,
  structure: [...document.querySelectorAll("main, main *")].map(node => `${node.tagName}:${node.getAttribute("class") ?? ""}`),
}));
if (compareHome) {
  const previous = JSON.parse(await readFile(compareHome, "utf8")).results.homeContract;
  for (const key of Object.keys(previous)) check(JSON.stringify(previous[key]) === JSON.stringify(results.homeContract[key]), `home: original ${key} changed`);
}
check(await page.locator(".shop-announcement").count() === 1 && await page.locator(".home-stock").count() === 1 && await page.locator(".people").count() === 1, "home: original sections missing");
await scrollToElement(page, ".home-mission");
await page.screenshot({ path: `${output}/home-mission-mobile.png` });
check(await page.locator('.home-mission a[href="/growing-the-game/"]').count() === 1, "home: mission link missing");
if (!baseline) check((await page.locator(".home-mission").innerText()).includes("future plans, not programmes already running"), "home: future programmes not clearly marked");
check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "home: footer/mission overflow");
check(await page.evaluate(() => [...document.querySelectorAll(".shared-footer nav a")].every(link => link.getBoundingClientRect().height >= 44)), "home: footer tap targets too small");
for (const { label, viewport } of [
  { label: "desktop", viewport: { width: 1440, height: 1000 } },
  { label: "compact", viewport: { width: 360, height: 640 } },
]) {
  await page.setViewportSize(viewport);
  for (const selector of [".welcome", ".shop-announcement", ".home-mission"]) {
    await scrollToElement(page, selector);
    await page.screenshot({ path: `${output}/home-${selector.slice(1)}-${label}.png` });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `home: ${label} ${selector} overflow`);
  }
}
await page.locator(".home-mission a").click();
await page.waitForURL("**/growing-the-game/");
check(await page.locator("h1").innerText() === "GROWING\nTHE GAME.", "home: mission link did not navigate");
await page.goto(`${base}/about/`, { waitUntil: "networkidle" });
check(await page.locator('.about-origin-copy a[href="/growing-the-game/"]').count() === 1, "about: mission link missing");
await scrollToElement(page, ".about-origin-copy");
await page.screenshot({ path: `${output}/about-mission-mobile.png` });
const sitemap = await context.request.get(`${base}/sitemap.xml`);
check(sitemap.ok() && (await sitemap.text()).includes("https://karibugolf.com/growing-the-game/"), "sitemap: mission route missing");
await browser.close();
check(!errors.length, `runtime/resource errors: ${[...new Set(errors)].join("; ")}`);
const report = { base, output, results, errors: [...new Set(errors)], failures };
await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ base, output, devices: Object.keys(results), errors: report.errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
