import { chromium } from "playwright-core";

const base = (process.argv[2] || "http://127.0.0.1:4501").replace(/\/$/, "");
const expected = [
  "beginner-golf-nairobi",
  "cost-of-golf-kenya-budget",
  "first-golf-clubs-kenya",
  "best-golf-courses-kenya",
  "golf-etiquette-dress-code-kenya",
];
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const failures = [];
const results = [];

const index = await browser.newPage({ viewport: { width: 390, height: 844 } });
const indexResponse = await index.goto(`${base}/blog/`, { waitUntil: "networkidle" });
const indexResult = await index.evaluate((slugs) => ({
  statusLinks: slugs.map((slug) => Boolean(document.querySelector(`a[href="/blog/${slug}"]`))),
  articleCount: document.querySelectorAll(".journal-list article").length,
  overflow: document.documentElement.scrollWidth - innerWidth,
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
}), expected);
if (indexResponse?.status() !== 200) failures.push(`blog index HTTP ${indexResponse?.status()}`);
if (indexResult.statusLinks.some((found) => !found)) failures.push("blog index is missing a researched article link");
if (indexResult.articleCount < expected.length) failures.push(`blog index has only ${indexResult.articleCount} articles`);
if (indexResult.overflow > 0) failures.push(`blog index horizontal overflow ${indexResult.overflow}px`);
if (indexResult.brokenImages.length) failures.push("blog index has broken images");
await index.close();

for (const slug of expected) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const response = await page.goto(`${base}/blog/${slug}/`, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => ({
    title: document.querySelector(".article-heading h1")?.textContent?.trim(),
    headings: document.querySelectorAll(".article-copy h2").length,
    paragraphs: document.querySelectorAll(".article-copy p").length,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content"),
    hasArticleSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].some((script) => script.textContent?.includes('"@type":"Article"')),
    oldCategoryLinks: document.querySelectorAll('.article-copy a[href^="/categories/"]').length,
    overflow: document.documentElement.scrollWidth - innerWidth,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
  }));
  results.push({ slug, status: response?.status(), ...result });
  if (response?.status() !== 200) failures.push(`${slug}: HTTP ${response?.status()}`);
  if (!result.title || result.headings < 3 || result.paragraphs < 3) failures.push(`${slug}: article content is incomplete`);
  if (result.canonical !== `https://karibugolf.com/blog/${slug}/`) failures.push(`${slug}: canonical URL`);
  if (!result.metaDescription) failures.push(`${slug}: missing meta description`);
  if (!result.hasArticleSchema) failures.push(`${slug}: missing Article schema`);
  if (result.oldCategoryLinks) failures.push(`${slug}: old category links remain`);
  if (result.overflow > 0) failures.push(`${slug}: horizontal overflow ${result.overflow}px`);
  if (result.brokenImages.length) failures.push(`${slug}: broken images`);
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ base, index: indexResult, articles: results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
