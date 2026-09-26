import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProducts } from "../netlify/functions/_shared/sheets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "lib", "catalog.generated.json");

if (!process.env.GOOGLE_OAUTH_JSON) {
  console.log("Catalog build: Google credentials unavailable; using checked-in catalog.");
  process.exit(0);
}

const existing = JSON.parse(await fs.readFile(output, "utf8"));
const existingBySku = new Map(existing.products.map((product) => [product.sku.toLowerCase(), product]));
const labels = new Map(existing.categories.map((category) => [category.slug, category.label]));
const { products } = await readProducts();
const live = products.filter((product) => product.websiteVisible).map((product) => {
  const previous = existingBySku.get(product.sku.toLowerCase());
  const image = product.image && (/^https?:\/\//i.test(product.image) || product.image.startsWith("/")) ? product.image : null;
  return {
    sku: product.sku,
    slug: product.sku.toLowerCase(),
    name: product.name,
    categorySlug: product.categorySlug,
    categoryLabel: labels.get(product.categorySlug) || product.categorySlug.replaceAll("_", " "),
    description: product.description || previous?.description || "Available from Karibu Golf Kenya.",
    priceKes: Math.round(product.priceKes || 0),
    priceUsd: product.priceUsd || 0,
    priceCny: product.priceCny || 0,
    sizes: product.sizes || "",
    colors: product.colors || "",
    status: product.status || "Out of Stock",
    stock: String(product.stock || "0"),
    featured: previous?.featured || false,
    images: [...new Set([...(image ? [image] : []), ...(previous?.images || []), "/images/clubs.jpg"])],
  };
});

await fs.writeFile(output, `${JSON.stringify({ ...existing, generatedAt: new Date().toISOString(), products: live }, null, 2)}\n`, "utf8");
console.log(`Catalog build: exported ${live.length} live products from Google Sheets.`);
