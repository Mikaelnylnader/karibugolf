import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const productDrafts = JSON.parse(await readFile(path.join(root, "content", "product-seo-articles-2026.json"), "utf8"));
const ironArticles = JSON.parse(await readFile(path.join(root, "content", "in-stock-iron-articles-2026.json"), "utf8"));
const selected = [
  ...ironArticles,
  ...productDrafts.filter((article) => [
    "taylormade-p790-irons-kenya-buying-guide",
    "steel-vs-graphite-iron-shafts-kenya",
  ].includes(article.slug)),
];

assert.equal(selected.length, 5, "Exactly five product-led articles must be selected");
assert.equal(new Set(selected.map((article) => article.slug)).size, 5, "Article slugs must be unique");

for (const article of selected) {
  const words = article.content.trim().split(/\s+/).length;
  assert(words >= 700, `${article.slug} is only ${words} words`);
  assert(article.seo_title.length <= 60, `${article.slug} SEO title is over 60 characters`);
  assert(article.meta_description.length <= 160, `${article.slug} meta description is over 160 characters`);
  assert(article.content.includes("## Frequently asked questions"), `${article.slug} is missing an FAQ section`);
  assert(article.content.includes("## Sources"), `${article.slug} is missing sources`);
  assert(/\]\(\/shop\/product\//.test(article.content), `${article.slug} is missing a product link`);
  assert(Array.isArray(article.keywords) && article.keywords.length >= 3, `${article.slug} needs keywords`);
  if (article.cover_image.startsWith("/")) {
    const publicPath = path.join(root, "public", article.cover_image);
    const exportedProductPath = path.join(root, article.cover_image.replace(/^\/images\/products\//, "images/products/"));
    await Promise.any([access(publicPath), access(exportedProductPath)]);
  }
  process.stdout.write(`${article.slug}: ${words} words\n`);
}

console.log("Five product-led articles passed content and metadata validation.");

const t200 = ironArticles.find((article) => article.slug === "titleist-t200-irons-kenya-buying-guide");
const comparison = ironArticles.find((article) => article.slug === "p790-vs-t200-vs-ai-smoke-hl-kenya");
assert(t200.content.includes("seven-club 4–PW set") && t200.content.includes("An approach wedge is not included."), "T200 article must match the seven-club product listing");
assert(!/T200[^\n.]*4–PW plus|Karibu listing includes 4–PW and AW|Confirm all eight clubs/.test(t200.content), "T200 article must not include an approach wedge in the Karibu set");
assert(comparison.content.includes("P790 and T200 listings are 4–PW sets, with seven clubs each"), "Comparison must distinguish T200 from the eight-club Ai Smoke HL set");
assert(comparison.content.includes("Ai Smoke HL listing includes 4–PW plus an approach wedge, with eight clubs"), "Keep the separate Ai Smoke HL set composition");
assert(!selected.some((article) => article.content.includes("](/blog/regular-stiff-senior-iron-flex-guide/)")), "Do not link the unpublished flex-guide draft");
console.log("T200 set consistency and repaired flex-guide link passed.");
