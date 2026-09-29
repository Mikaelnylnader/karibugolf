import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.argv[2] || "https://karibugolf.com").replace(/\/$/, "");
const root = path.resolve(import.meta.dirname, "..");
const loginText = await readFile(path.join(root, ".tmp", "online-admin-login.txt"), "utf8");
const password = loginText.match(/^Password:\s*(.+)$/im)?.[1]?.trim();
assert(password, "Admin password was not found in .tmp/online-admin-login.txt");

const login = await fetch(`${baseUrl}/api/admin-auth`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200, `Admin login failed with HTTP ${login.status}`);
const cookie = login.headers.getSetCookie?.()[0] || login.headers.get("set-cookie");
assert(cookie, "Admin login did not return a session cookie");
const authHeaders = { cookie: cookie.split(";")[0] };

async function getProducts() {
  const response = await fetch(`${baseUrl}/api/admin-products`, { headers: authHeaders });
  assert.equal(response.status, 200, `Product read failed with HTTP ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.products;
}

const changes = new Map([
  ["GK-IR-TTT", {
    name: "Titleist T200",
    description: "Players-distance iron set with a forged face, hollow-body construction, Max Impact technology and a Tour-inspired shape.",
    sizes: "4–PW + AW",
    colors: "Standard",
    image: "/images/products/Titleist_T200.jpg",
  }],
  ["GK-IR004", {
    name: "Callaway Paradym Ai Smoke HL Irons",
    description: "High-launch game-improvement iron set with an Ai Smart Face and deep cavity-back construction.",
    sizes: "4–PW + AW",
    colors: "Standard",
    image: "/images/shop/categories-v2/golf_irons.webp",
  }],
]);

const before = await getProducts();
for (const sku of changes.keys()) assert(before.some((product) => product.sku === sku), `${sku} was not found; no products were changed`);

for (const [sku, fields] of changes) {
  const current = before.find((product) => product.sku === sku);
  const product = { ...current, ...fields, status: "In Stock", stock: "1", websiteVisible: true };
  const response = await fetch(`${baseUrl}/api/admin-products`, {
    method: "PUT",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify(product),
  });
  assert.equal(response.status, 200, `${sku} update failed with HTTP ${response.status}: ${await response.text()}`);
  process.stdout.write(`published ${sku}\n`);
}

const after = await getProducts();
for (const sku of changes.keys()) {
  const product = after.find((item) => item.sku === sku);
  assert.equal(product.websiteVisible, true, `${sku} is still private`);
  assert.equal(product.status, "In Stock", `${sku} is not marked In Stock`);
  assert.equal(String(product.stock), "1", `${sku} stock is not 1`);
}

const catalogPath = path.join(root, "lib", "catalog.generated.json");
const existing = JSON.parse(await readFile(catalogPath, "utf8"));
const previousBySku = new Map(existing.products.map((product) => [product.sku.toLowerCase(), product]));
const labels = new Map(existing.categories.map((category) => [category.slug, category.label]));
const visible = after.filter((product) => product.websiteVisible).map((product) => {
  const previous = previousBySku.get(product.sku.toLowerCase());
  const image = product.image && (/^https?:\/\//i.test(product.image) || product.image.startsWith("/")) ? product.image : null;
  const preferredImage = product.sku === "GK-IR-TMP" ? "/images/p790-hero.webp" : image;
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
    featured: product.sku === "GK-IR-TMP",
    images: [...new Set([...(preferredImage ? [preferredImage] : []), ...(previous?.images || []), "/images/clubs.jpg"])],
  };
});
await writeFile(catalogPath, `${JSON.stringify({ ...existing, generatedAt: new Date().toISOString(), products: visible }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ updated: [...changes.keys()], liveProducts: visible.map((product) => product.sku) }, null, 2));
