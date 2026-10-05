import { chromium } from "playwright-core";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const base = (process.argv[2] || "http://127.0.0.1:4506").replace(/\/$/, "");
const local = base.includes("127.0.0.1") || base.includes("localhost");
const isX = process.argv.includes("--pro-v1x");
const isPureTouch = process.argv.includes("--pure-touch");
const isStaSof = process.argv.includes("--stasof");
const isWeatherSof = process.argv.includes("--weathersof");
const isPlayersGlove = process.argv.includes("--players-glove");
const isFootJoy = isPureTouch || isStaSof || isWeatherSof;
const isGlove = isPlayersGlove || isFootJoy;
const brand = isFootJoy ? "FootJoy" : "Titleist";
const sku = isWeatherSof ? "GK-GL009" : isStaSof ? "GK-GL008" : isPureTouch ? "GK-GL010" : isGlove ? "GK-GL005" : isX ? "GK-BL011" : "GK-BL012";
const slug = sku.toLowerCase();
const model = isWeatherSof ? "WeatherSof Men's" : isStaSof ? "StaSof Men's" : isPureTouch ? "Pure Touch Limited Men's" : isGlove ? "Players Men's" : isX ? "Pro V1x" : "Pro V1";
const productName = `${brand} ${model} ${isGlove ? "Golf Glove" : "Golf Balls"}`;
const imagePrefix = isWeatherSof ? "footjoy-weathersof" : isStaSof ? "footjoy-stasof" : isPureTouch ? "footjoy-pure-touch" : isGlove ? "titleist-players-glove" : isX ? "titleist-pro-v1x" : "titleist-pro-v1";
const source = isWeatherSof ? "https://www.footjoy.com/product/sale/sale-gloves/weathersof-2-pack/004WEA.html" : isStaSof ? "https://www.footjoy.com/product/men/gloves-men/stasof/006STA.html?dwvar_006STA_color=66770E-301" : isPureTouch ? "https://www.footjoy.com/product/men/gloves-men/pure-touch-limited/026PUR.html?dwvar_026PUR_color=64013E" : isGlove ? "https://www.titleist.com/product/players-mens/007GL1T.html?dwvar_007GL1T_color=PRL" : isX ? "https://www.titleist.com/product/pro-v1x/005PVXT.html" : "https://www.titleist.com/product/pro-v1/005PV1T.html";
const primary = isFootJoy ? "set" : isGlove ? "back" : "box";
const primaryLabel = isFootJoy ? "Glove + box" : isGlove ? "Back" : "Dozen box";
const output = `.tmp/${isWeatherSof ? "weathersof" : isStaSof ? "stasof" : isPureTouch ? "pure-touch" : isGlove ? "players-glove" : isX ? "pro-v1x" : "pro-v1"}-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
const failures = [], errors = [], results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const ball = catalog.products.find(product => product.sku === sku);
check(ball?.status === "Out of Stock" && Number(ball?.stock) === 0, "catalog: ball incorrectly in stock");
check(catalog.products.filter(product => product.status === "In Stock" && Number(product.stock) > 0).length === 4, "catalog: original stock selection changed");
const pairs = isWeatherSof ? [["weahtersoft men.png", "set"], ["weahtersoft men 2.png", "back"], ["weahtersoft men 3.png", "palm"], ["weahtersoft men 1.png", "packaging"]] : isStaSof ? [["strasoft .png", "set"], ["strasoft 1.png", "back"], ["strasoft 3.png", "palm"], ["strasoft 2.png", "packaging"]] : isPureTouch ? [["Pure feel.png", "set"], ["pure feel1.png", "back"], ["pure feel3.png", "palm"], ["pure feel2.png", "packaging"]] : isGlove ? [["Skärmbild 2026-10-04 171804.png", "back"], ["Skärmbild 2026-10-04 171736.png", "palm"], ["Skärmbild 2026-10-04 171750.png", "grip"], ["Skärmbild 2026-10-04 171717.png", "packaging"]] : isX ? [["Prov2x.png", "box"], ["Prov1x2.png", "ball"], ["prov1x 1.png", "angle"], ["Prov1x4.png", "alignment"], ["prov1x 3.png", "sleeve"]] : [["Prov1.png", "box"], ["Prov1 2.png", "ball"], ["prov1 1.png", "alignment"], ["prov1 3.png", "sleeve"]];
for (const [original, name] of pairs) {
  const hash = bytes => createHash("sha256").update(bytes).digest("hex");
  const folder = isPlayersGlove ? "Pictures/Screenshots" : "Downloads";
  check(hash(await readFile(`C:/Users/mikae/${folder}/${original}`)) === hash(await readFile(`images/products/${imagePrefix}-${name}.png`)), `${name}: provided picture was changed`);
}
if (!local) {
  const response = await fetch(`${base}/api/storefront-products?sku=${sku}`);
  const live = response.ok ? (await response.json()).products?.[0] : null;
  // Sheets can store absolute site URLs or relative image paths; verify the same resource.
  const expectedImage = new URL(`/images/products/${imagePrefix}-${primary}.png`, base).href;
  const liveImage = live?.image ? new URL(live.image, base).href : null;
  check(live?.status === "Out of Stock" && Number(live?.stock) === 0 && liveImage === expectedImage, "live API: incorrect availability or image");
  results.live = live;
}
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
for (const { label, viewport, reducedMotion, javaScriptEnabled } of [
  { label: "desktop", viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "compact", viewport: { width: 360, height: 640 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "reduced", viewport: { width: 390, height: 844 }, reducedMotion: "reduce", javaScriptEnabled: true },
  { label: "no-js", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: false },
]) {
  const context = await browser.newContext({ viewport, reducedMotion, javaScriptEnabled });
  await context.addInitScript(() => {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.requestPointerLock = () => Promise.resolve();
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
  page.on("response", response => { if (response.status() >= 400 && !(local && response.url().includes("/api/"))) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(`${base}/shop/product/${slug}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  check(response.ok(), `${label}: page not found`);
  if (javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true");
  check((await page.locator("h1").textContent()) === productName, `${label}: incorrect product name`);
  check((await page.locator(".catalog-stock").innerText()).includes("out of stock"), `${label}: incorrectly available`);
  check(await page.locator(".club-thumbnails button").count() === pairs.length, `${label}: missing supplied pictures`);
  check(await page.locator(".catalog-configurator legend").allTextContents().then(labels => JSON.stringify(labels) === JSON.stringify(isGlove ? ["Size", "Glove hand / fit", "Colour"] : ["Pack", "Colour"])), `${label}: incorrect product configuration`);
  check((await page.locator(".catalog-configurator .contact-button").innerText()).includes("Ask about availability"), `${label}: ordering offered for unavailable item`);
  const schema = await page.locator('script[type="application/ld+json"]').first().textContent();
  check(schema.includes('"availability":"https://schema.org/OutOfStock"') && schema.includes(`"name":"${brand}"`), `${label}: incorrect structured data`);
  check(await page.locator(".club-source").getAttribute("href") === source, `${label}: manufacturer source missing`);
  check(await page.locator(".product-spec-table-wrap").evaluate(node => node.scrollWidth <= node.clientWidth), `${label}: two-column ball specifications clipped`);
  check(!(await page.locator("main").innerText()).includes("WHAT IS INSIDE THE CLUB"), `${label}: club copy leaked into ball page`);
  await page.screenshot({ path: `${output}/${label}-purchase.png` });
  if (javaScriptEnabled) {
    for (const name of isFootJoy ? ["Back", "Palm", "Packaging", "Glove + box"] : isGlove ? ["Palm", "Grip", "Packaging", "Back"] : ["Ball", ...(isX ? ["Angled view"] : []), "Alignment", "Sleeve", "Dozen box"]) {
      await page.getByRole("button", { name: `Show ${name} photo`, exact: true }).click();
      check(await page.getByRole("button", { name: `Enlarge ${name} photo`, exact: true }).count() === 1, `${label}: ${name} photo cannot be selected`);
    }
    await page.getByRole("button", { name: `Enlarge ${primaryLabel} photo`, exact: true }).click();
    check(await page.getByRole("dialog").isVisible(), `${label}: zoom not working`);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    check(await page.getByRole("dialog").count() === 0, `${label}: zoom cannot close`);
  }
  for (const selector of ["#product-overview", "#product-features", "#product-specifications", ".product-return-close"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${output}/${label}-${selector.replace(/[.#]/g, "")}.png` });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: ${selector} horizontal overflow`);
  }
  const broken = await page.evaluate(async () => {
    const images = [...document.images];
    // Offscreen lazy guide images can leave decode() pending until they enter view.
    images.forEach(image => { image.loading = "eager"; });
    await Promise.all(images.map(image => Promise.race([
      image.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 5000)),
    ])));
    return images.filter(image => image.naturalWidth === 0).map(image => image.src);
  });
  check(broken.length === 0, `${label}: broken photographs: ${broken.join(", ")}`);
  if (javaScriptEnabled) {
    const enquiry = page.locator(".catalog-configurator .contact-button");
    await enquiry.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await page.waitForTimeout(200);
    const focus = await enquiry.evaluate(node => ({ active: node === document.activeElement, top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, outline: getComputedStyle(node).outlineWidth, href: node.href }));
    check(focus.active && focus.top >= 0 && focus.bottom <= viewport.height && parseFloat(focus.outline) >= 2, `${label}: enquiry focus not visible: ${JSON.stringify(focus)}`);
    check(decodeURIComponent(focus.href).includes(isGlove ? `Size: Confirm on restock, Glove hand / fit: Confirm on restock, Colour: ${isWeatherSof ? "White / Black" : isStaSof ? "Pearl / Black" : isPureTouch ? "White" : "Pearl (white)"}` : "Pack: Dozen (12 balls), Colour: White"), `${label}: enquiry missing product options`);
  }
  results[label] = { status: await page.locator(".catalog-stock").innerText(), pictures: pairs.length };
  await context.close();
}
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript(() => {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.requestPointerLock = () => Promise.resolve();
});
const page = await context.newPage();
for (const route of isGlove ? ["/shop/accessories/", "/shop/accessories/gloves/"] : ["/shop/balls/", "/shop/balls/balls/"]) {
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  const card = page.locator(`a.store-product-card[href="/shop/product/${slug}"]`);
  check(await card.count() === 1 && (await card.innerText()).toLowerCase().includes("out of stock"), `${route}: missing out-of-stock ball listing`);
}
for (const route of ["/", "/shop/", "/shop/stock/"]) {
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  check(await page.locator(`.home-stock a[href*="${slug}"], .stock-register a[href*="${slug}"], .stock-room a[href*="${slug}"], .shop-stock-rack a[href*="${slug}"]`).count() === 0, `${route}: unavailable ball leaked into in-stock area`);
  if (route === "/shop/stock/") check(!((await page.locator("main").innerText()).includes(productName)), "stock page: unavailable product shown");
}
await browser.close();
check(errors.length === 0, `runtime/resources: ${errors.join("; ")}`);
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, errors, failures }, null, 2));
console.log(JSON.stringify({ base, output, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
