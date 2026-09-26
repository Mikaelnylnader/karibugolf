import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:5000").replace(/\/$/, "");
const failures = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
const failedRequests = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("requestfailed", (request) => {
  if (request.url().startsWith(base)) failedRequests.push(request.url());
});

const dashboardResponse = await page.goto(`${base}/`, { waitUntil: "networkidle" });
const dashboard = await page.evaluate(() => ({
  stats: [...document.querySelectorAll(".stat-card .num")].map((node) => node.textContent?.trim()),
  sheetConnected: document.body.innerText.includes("Connected (153 rows)"),
  logoLoaded: [...document.images].some((image) => image.classList.contains("brand-logo") && image.complete && image.naturalWidth > 0),
  overflow: document.documentElement.scrollWidth - innerWidth,
}));
if (dashboardResponse?.status() !== 200) failures.push(`dashboard HTTP ${dashboardResponse?.status()}`);
if (dashboard.stats[0] !== "153" || dashboard.stats[1] !== "1" || dashboard.stats[2] !== "152") failures.push(`dashboard stats ${dashboard.stats.join(", ")}`);
if (!dashboard.sheetConnected) failures.push("Google Sheet count is not connected at 153 rows");
if (!dashboard.logoLoaded) failures.push("admin brand logo is broken");
if (dashboard.overflow > 0) failures.push(`dashboard horizontal overflow ${dashboard.overflow}px`);

await page.goto(`${base}/products`, { waitUntil: "networkidle" });
const allProducts = {
  summaries: await page.locator(".catalog-summary strong").allTextContents(),
  rows: await page.locator(".product-row").count(),
};
if (allProducts.summaries.join(",") !== "153,1,152" || allProducts.rows !== 153) failures.push(`all-products view ${JSON.stringify(allProducts)}`);

await page.goto(`${base}/products?visibility=live`, { waitUntil: "networkidle" });
const liveRows = await page.locator(".product-row").count();
const liveText = await page.locator(".product-row").allInnerTexts();
if (liveRows !== 1 || !liveText[0]?.includes("TaylorMade P790")) failures.push("live filter does not contain only P790");

await page.goto(`${base}/products?visibility=hidden`, { waitUntil: "networkidle" });
const hiddenRows = await page.locator(".product-row").count();
const hiddenP790 = await page.getByText("TaylorMade P790", { exact: true }).count();
if (hiddenRows !== 152 || hiddenP790 !== 0) failures.push(`private filter rows ${hiddenRows}, P790 count ${hiddenP790}`);

await page.goto(`${base}/products/GK-IR-TMP/edit`, { waitUntil: "networkidle" });
if (!(await page.locator('input[name="website_visible"]').isChecked())) failures.push("P790 website checkbox is not selected");
await page.goto(`${base}/products/GK-IR004/edit`, { waitUntil: "networkidle" });
if (await page.locator('input[name="website_visible"]').isChecked()) failures.push("private product website checkbox is selected");

if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(" | ")}`);
if (failedRequests.length) failures.push(`failed local requests: ${failedRequests.join(" | ")}`);
await browser.close();

console.log(JSON.stringify({ base, dashboard, allProducts, liveRows, hiddenRows, consoleErrors, failedRequests, failures }, null, 2));
if (failures.length) process.exitCode = 1;
