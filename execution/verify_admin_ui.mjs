import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "https://karibugolf.com").replace(/\/$/, "");
const screenshotPath = process.argv[3];
const loginText = await readFile(new URL("../.tmp/online-admin-login.txt", import.meta.url), "utf8");
const password = loginText.match(/^Password:\s*(.+)$/im)?.[1]?.trim();
assert(password, "Admin password was not found in the local login file");

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
await page.goto(`${base}/admin/`, { waitUntil: "networkidle" });
if (await page.locator("#login:not([hidden])").count()) {
  await page.locator("#password").fill(password);
  await page.locator("#login-form button[type=submit]").click();
}
await page.waitForFunction(() => document.querySelector("#dash-total")?.textContent !== "—", null, { timeout: 30_000 });

const dashboard = await page.evaluate(() => ({
  heading: document.querySelector("#view-title")?.textContent,
  total: document.querySelector("#dash-total")?.textContent,
  live: document.querySelector("#dash-live")?.textContent,
  quickActions: document.querySelectorAll(".quick-actions > *").length,
  stockRows: document.querySelectorAll("#stock-watch-list .mini-row").length,
  categoryBars: document.querySelectorAll("#dashboard-categories .bar-row").length,
  overflow: document.documentElement.scrollWidth - innerWidth,
}));
assert.equal(dashboard.heading, "Dashboard");
assert(Number(dashboard.total) >= 150, `Expected at least 150 products, received ${dashboard.total}`);
assert.equal(dashboard.quickActions, 4);
assert(dashboard.stockRows > 0);
assert(dashboard.categoryBars > 0);
assert(dashboard.overflow <= 0, `Dashboard overflowed by ${dashboard.overflow}px`);

await page.locator("#nav-products").click();
await page.locator("#search").fill("P790");
await page.waitForTimeout(100);
assert.equal(await page.locator("#product-rows tr").count(), 1);
await page.locator("#product-rows [data-select]").check();
assert(await page.locator("#bulk-bar").isVisible(), "Bulk bar did not open after selecting a product");
assert.equal(await page.locator("#selected-count").textContent(), "1");
await page.locator("#clear-selection").click();
assert(!(await page.locator("#bulk-bar").isVisible()), "Bulk selection did not clear");
await page.locator("#product-rows [data-edit]").click();
assert(await page.locator("#editor").isVisible(), "Product editor did not open");
assert.equal(await page.locator('#product-form [name="name"]').inputValue(), "TaylorMade P790");
assert(await page.locator("#editor-preview").isVisible(), "Live product preview link is missing");
await page.locator("#close-editor").click();

await page.locator("#nav-inventory").click();
const inventoryQuantities = await page.locator("#inventory-rows [data-inventory-sku]").evaluateAll((inputs) => inputs.map((input) => Number(input.value)));
assert(inventoryQuantities.length > 0, "Inventory did not show any in-stock products");
assert(inventoryQuantities.every((quantity) => quantity > 0), "Inventory included an out-of-stock product");
await page.locator("#inventory-search").fill("P790");
await page.waitForTimeout(100);
const inventoryInput = page.locator("#inventory-rows [data-inventory-sku]").first();
const original = Number(await inventoryInput.inputValue());
await inventoryInput.fill(String(original + 1));
assert(await page.locator("#save-inventory").isEnabled(), "Inventory save did not enable after editing a quantity");
assert((await page.locator("#save-inventory").textContent())?.includes("1 change"));

await page.locator("#nav-categories").click();
assert(await page.locator("#category-groups").isVisible());
await page.locator('#category-groups [data-category="golf_irons"]').click();
assert((await page.locator(".category-detail h2").textContent())?.includes("Irons"));
assert(await page.locator(".category-product").count() > 0);

if (screenshotPath) {
  await page.locator("#nav-dashboard").click();
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

await browser.close();
assert.equal(consoleErrors.length, 0, `Console errors: ${consoleErrors.join(" | ")}`);
console.log(JSON.stringify({ base, dashboard, productBulkSelection: "passed", productEditor: "passed", inventoryEditing: "passed", categoryDrilldown: "passed" }, null, 2));
