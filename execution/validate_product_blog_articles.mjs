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
