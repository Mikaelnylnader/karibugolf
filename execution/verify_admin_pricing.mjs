import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:8787").replace(/\/$/, "");
const output = `.tmp/admin-pricing-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  const knownPreviewThumbnail = response.status() === 404 && response.url().includes("/images/products/");
  if (response.status() >= 400 && !knownPreviewThumbnail) errors.push(`${response.status()} ${response.url()}`);
});

await page.goto(`${base}/admin/#products`, { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: "Add product" }).waitFor({ state: "visible" });
await page.getByRole("button", { name: "Add product" }).click();
const form = page.locator("#product-form");
await form.waitFor({ state: "visible" });

const field = (name) => form.locator(`[name="${name}"]`);
const valueOf = (name) => field(name).evaluate((element) => element.value);

await field("costCny").fill("250");
assert.equal(await valueOf("costKes"), "4750", "250 RMB cost should convert to 4,750 KSh");

await field("priceUsd").fill("100");
assert.equal(await valueOf("priceKes"), "12950", "100 USD should convert to 12,950 KSh");
assert.equal(await valueOf("priceCny"), "681.58", "100 USD should convert to 681.58 RMB");
assert.equal(await page.locator("#margin-value").innerText(), "63%", "Margin should use converted KSh cost and selling price");
await page.screenshot({ path: `${output}/250-rmb-cost-100-usd-selling.png`, fullPage: false });

await field("priceKes").fill("10000");
assert.equal(await valueOf("priceCny"), "526.32", "10,000 KSh should convert to 526.32 RMB");
assert.equal(await valueOf("priceUsd"), "77.22", "10,000 KSh should convert to 77.22 USD");

await field("costKes").fill("5700");
assert.equal(await valueOf("costCny"), "300.00", "5,700 KSh cost should convert to 300 RMB");
assert.equal(await page.locator("#margin-value").innerText(), "43%", "Margin should refresh after KSh cost changes");

await field("priceCny").fill("1000");
assert.equal(await valueOf("priceKes"), "19000", "1,000 RMB selling price should convert to 19,000 KSh");
assert.equal(await valueOf("priceUsd"), "146.72", "1,000 RMB selling price should convert to 146.72 USD");

await field("priceUsd").fill("");
assert.equal(await valueOf("priceKes"), "", "Clearing USD should clear KSh selling price");
assert.equal(await valueOf("priceCny"), "", "Clearing USD should clear RMB selling price");
assert.equal(await page.locator("#margin-value").innerText(), "—", "Margin should clear without a selling price");

assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
console.log(JSON.stringify({ base, output, verified: ["RMB cost", "KSh cost", "RMB selling", "KSh selling", "USD selling", "gross margin"] }, null, 2));
await browser.close();
