import { chromium } from "playwright-core";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import catalog from "../lib/catalog.generated.json" with { type: "json" };

const base = (process.argv[2] || "http://127.0.0.1:4509").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const output = `.tmp/glove-guides-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
const failures = [], errors = [], externalWarnings = [], results = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const original = await readFile("C:/Users/mikae/Downloads/ChatGPT Image Oct 4, 2026, 05_48_51 PM-2.png");
const imagePath = "/images/guides/mens-golf-glove-size-guide.png";
for (const folder of ["images/guides", "public/images/guides", "dist/static/images/guides"]) {
  check(hash(original) === hash(await readFile(`${folder}/mens-golf-glove-size-guide.png`)), `${folder}: size picture changed`);
}
const served = await fetch(`${base}${imagePath}`);
check(served.ok && hash(original) === hash(Buffer.from(await served.arrayBuffer())), "served guide: missing or changed picture");
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
for (const settings of [
  { label: "desktop", viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "phone", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "compact", viewport: { width: 360, height: 640 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "reduced", viewport: { width: 390, height: 844 }, reducedMotion: "reduce", javaScriptEnabled: true },
  { label: "no-js", viewport: { width: 390, height: 844 }, reducedMotion: "reduce", javaScriptEnabled: false },
]) {
  const { label, ...options } = settings;
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
  page.on("response", response => {
    if (response.status() < 400 || (local && response.url().includes("/api/"))) return;
    const target = response.url().startsWith(`${base}/`) ? errors : externalWarnings;
    target.push(`${response.status()} ${response.url()}`);
  });
  for (const product of catalog.products) {
    if (product.categorySlug !== "gloves" && label !== "desktop") continue;
    // Wait on document state directly; external video requests need not go idle.
    const response = await page.goto(`${base}/shop/product/${product.slug}/`, { waitUntil: "commit" });
    await page.waitForFunction(() => document.readyState !== "loading");
    check(response.ok(), `${product.slug}: missing page`);
    const isGlove = product.categorySlug === "gloves";
    check(await page.locator("#glove-size-guide").count() === (isGlove ? 1 : 0), `${product.slug}: guide missing or present on non-glove`);
    if (!isGlove) continue;
    if (options.javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true");
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    await page.locator(".glove-guide-shortcut").click();
    await page.waitForTimeout(700);
    const guide = page.locator("#glove-size-guide");
    check(await guide.isVisible(), `${label}/${product.slug}: guide hidden`);
    const heading = await page.locator("#glove-size-guide-title").boundingBox();
    check(heading && heading.y >= 70 && heading.y < options.viewport.height - 30, `${label}/${product.slug}: shortcut hides heading under sticky navigation`);
    check((await guide.innerText()).includes("not an official FootJoy or Titleist size chart"), `${label}/${product.slug}: conversion caveat missing`);
    check((await guide.innerText()).includes("these are different measurements"), `${label}/${product.slug}: measurement distinction missing`);
    check(await guide.locator(".glove-fit-source").count() === 2, `${label}/${product.slug}: official guide links missing`);
    const picture = guide.locator(".glove-size-guide-image img");
    const dimensions = await picture.evaluate(async node => { await node.decode(); return { width: node.clientWidth, height: node.clientHeight, ratio: node.naturalWidth / node.naturalHeight }; });
    check(Math.abs(dimensions.width / dimensions.height - dimensions.ratio) < .02, `${label}/${product.slug}: chart cropped or distorted`);
    await page.screenshot({ path: `${output}/${label}-${product.slug}-guide.png` });
    await picture.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${output}/${label}-${product.slug}-picture.png` });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}/${product.slug}: horizontal overflow`);
    const fullSize = guide.getByRole("link", { name: "Open full-size sizing picture ↗", exact: true });
    check(await fullSize.getAttribute("href") === imagePath, `${label}/${product.slug}: no-JavaScript full-size fallback broken`);
    if (options.javaScriptEnabled) {
      const trigger = guide.getByRole("button", { name: "Enlarge men's glove size guide", exact: true });
      await trigger.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      check(await trigger.evaluate(node => document.activeElement === node && parseFloat(getComputedStyle(node).outlineWidth) >= 2), `${label}/${product.slug}: missing keyboard focus outline`);
      await page.keyboard.press("Enter");
      check(await page.getByRole("dialog").isVisible(), `${label}/${product.slug}: guide zoom not open`);
      check(await page.getByRole("dialog").locator("img").getAttribute("src") === imagePath, `${label}/${product.slug}: wrong zoom image`);
      await page.waitForTimeout(250);
      const dialogBounds = await page.getByRole("dialog").boundingBox();
      check(dialogBounds && dialogBounds.width <= options.viewport.width && dialogBounds.height <= options.viewport.height, `${label}/${product.slug}: zoom exceeds viewport`);
      check(await page.getByRole("dialog").evaluate(node => {
        const overlay = document.querySelector('[data-slot="dialog-overlay"]');
        const bounds = node.getBoundingClientRect();
        const front = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        return Number(getComputedStyle(node).zIndex) > Number(getComputedStyle(overlay).zIndex) && node.contains(front);
      }), `${label}/${product.slug}: guide is behind the dimming overlay`);
      await page.screenshot({ path: `${output}/${label}-${product.slug}-zoom.png` });
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      check(await trigger.evaluate(node => document.activeElement === node), `${label}/${product.slug}: zoom did not return focus`);
    }
    results.push({ label, slug: product.slug, dimensions });
  }
  await context.close();
}
await browser.close();
check(errors.length === 0, `Runtime/resources: ${errors.join("; ")}`);
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, errors, externalWarnings, failures }, null, 2));
console.log(JSON.stringify({ base, output, views: results.length, errors, externalWarnings, failures }, null, 2));
if (failures.length) process.exitCode = 1;
