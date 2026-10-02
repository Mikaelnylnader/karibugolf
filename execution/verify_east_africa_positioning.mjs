import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4505").replace(/\/$/, "");
const output = "scrollcraft/builds/karibu-east-africa/lab";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const pages = ["/", "/shop/", "/shop/stock/", "/about/", "/contact/", "/blog/", "/shop/product/gk-ir-tmp/"];
const errors = [];
const results = [];

for (const path of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => errors.push(`${path} ${error.message}`));
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, " ");
    return {
      title: document.title,
      hasEastAfrica: /East Africa/i.test(text) || /East Africa/i.test(document.title),
      stalePhrases: ["GOLF KENYA", "across Kenya", "IN KENYA", "Kenya price", "Karibu Golf Kenya"].filter((phrase) => text.includes(phrase) || document.title.includes(phrase)),
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  results.push({ path, ...result });
  await page.close();
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${base}/`, { waitUntil: "networkidle" });
const mobileState = await mobile.evaluate(() => ({
  brand: document.querySelector(".identity>span>span")?.textContent?.trim(),
  overflow: document.documentElement.scrollWidth - innerWidth,
}));
await mobile.screenshot({ path: `${output}/mobile-home.png` });
await browser.close();

const failures = [
  ...results.filter((result) => !result.hasEastAfrica).map((result) => `${result.path} missing East Africa positioning`),
  ...results.flatMap((result) => result.stalePhrases.map((phrase) => `${result.path} still contains ${phrase}`)),
  ...results.filter((result) => result.overflow > 0).map((result) => `${result.path} overflow ${result.overflow}px`),
  ...(mobileState.brand === "GOLF EAST AFRICA" ? [] : [`mobile brand: ${mobileState.brand}`]),
  ...(mobileState.overflow <= 0 ? [] : [`mobile overflow ${mobileState.overflow}px`]),
  ...errors,
];

console.log(JSON.stringify({ base, results, mobileState, errors, failures }, null, 2));
if (failures.length) process.exitCode = 1;
