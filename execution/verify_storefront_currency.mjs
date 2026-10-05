import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import catalog from "../lib/catalog.generated.json" with { type: "json" };
import { loadApiSnapshot, installApiSnapshot } from "./storefront-api-qa.mjs";

const base = (process.argv[2] || "http://127.0.0.1:4505").replace(/\/$/, "");
const apiSnapshot = await loadApiSnapshot(base);
const output = `.tmp/storefront-currency-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await installApiSnapshot(context, base, apiSnapshot);
await context.addInitScript(() => {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.requestPointerLock = () => Promise.resolve();
});
const page = await context.newPage();
const failures = [];
const results = [];
page.on("pageerror", (error) => failures.push(error.message));
const routes = ["/", "/shop/", "/shop/stock/", "/shop/clubs/", "/shop/clubs/golf_irons/", "/shop/balls/", "/shop/balls/balls/", ...catalog.products.map((product) => `/shop/product/${product.slug}/`)];
for (const route of routes) {
  const response = await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => ({
    foreignCurrencies: /(?:\bRMB\b|\bUSD\b|[¥$]\s*\d)/.test(document.body.innerText),
    prices: [...document.querySelectorAll("[data-live-price], .stock-exhibit-price strong")].map((item) => item.textContent.trim()),
    foreignPriceElements: document.querySelectorAll(".store-currencies, .club-price > span, .stock-exhibit-price > span").length,
    offers: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((item) => {
      const data = JSON.parse(item.textContent);
      return data.offers ? [data.offers] : [];
    }),
  }));
  if (response.status() !== 200) failures.push(`${route}: HTTP ${response.status()}`);
  if (result.foreignCurrencies || result.foreignPriceElements) failures.push(`${route}: public foreign-currency price remains`);
  if (result.prices.some((price) => !/^KSh\s+[\d,]+/.test(price))) failures.push(`${route}: price is not KSh`);
  if (result.offers.some((offer) => offer.priceCurrency !== "KES")) failures.push(`${route}: offer schema is not KES`);
  if (route.startsWith("/shop/product/")) {
    if (result.prices.length === 0) failures.push(`${route}: product price missing`);
    await page.screenshot({ path: `${output}/${route.split("/").filter(Boolean).at(-1)}.png` });
  }
  results.push({ route, ...result });
}
await browser.close();
const report = { base, apiMode: apiSnapshot ? "live snapshot" : "direct", output, results, failures };
await writeFile(`${output}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ base, output, pages: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
