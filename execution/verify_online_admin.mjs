import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const baseUrl = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https:\/\//.test(baseUrl)) {
  throw new Error("Usage: node execution/verify_online_admin.mjs https://deploy-url");
}

const loginFile = await readFile(new URL("../.tmp/online-admin-login.txt", import.meta.url), "utf8");
const password = loginFile.match(/^Password:\s*(.+)$/im)?.[1]?.trim();
assert(password, "Admin password was not found in the local login file");

const publicAuth = await fetch(`${baseUrl}/api/admin-auth`);
assert.equal(publicAuth.status, 200);
assert.equal((await publicAuth.json()).authenticated, false);

const protectedProducts = await fetch(`${baseUrl}/api/admin-products`);
assert.equal(protectedProducts.status, 401);

const login = await fetch(`${baseUrl}/api/admin-auth`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200, `Login failed with HTTP ${login.status}`);
const cookie = login.headers.getSetCookie?.()[0] || login.headers.get("set-cookie");
assert(cookie, "Login did not return a session cookie");

const productsResponse = await fetch(`${baseUrl}/api/admin-products`, {
  headers: { cookie: cookie.split(";")[0] },
});
assert.equal(productsResponse.status, 200);
const payload = await productsResponse.json();
const products = Array.isArray(payload) ? payload : payload.products;
assert(Array.isArray(products), "Products response was not an array");
assert(products.length >= 153, `Expected at least 153 products, received ${products.length}`);
const visible = products.filter((product) => product.websiteVisible === true || String(product.websiteVisible).toLowerCase() === "true");
assert.equal(visible.length, 1, `Expected one visible product, received ${visible.length}`);
assert.equal(visible[0].sku, "GK-IR-TMP");

const adminHtml = await (await fetch(`${baseUrl}/admin/`)).text();
assert(adminHtml.includes("Karibu Golf — Online Admin"), "Admin UI marker was not found");

const blogHtml = await (await fetch(`${baseUrl}/blog/`)).text();
const articleSlugs = [...blogHtml.matchAll(/href="\/blog\/([^"#?]+)"/g)].map((match) => match[1]);
const uniqueSlugs = [...new Set(articleSlugs)];
assert.equal(uniqueSlugs.length, 8, `Expected eight blog articles, received ${uniqueSlugs.length}`);
for (const slug of uniqueSlugs) {
  const response = await fetch(`${baseUrl}/blog/${slug}/`);
  assert.equal(response.status, 200, `Blog article ${slug} returned HTTP ${response.status}`);
}

console.log(JSON.stringify({
  admin: "protected and authenticated",
  products: products.length,
  visibleProducts: visible.length,
  blogArticles: uniqueSlugs.length,
}));
