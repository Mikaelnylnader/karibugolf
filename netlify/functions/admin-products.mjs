import { isAuthorized, json } from "./_shared/auth.mjs";
import { readProducts, saveProduct, saveProducts, triggerStorefrontBuild } from "./_shared/sheets.mjs";

function normalizeProduct(product) {
  const material = String(product.shaftMaterial || "").trim().toLowerCase();
  return {
    ...product,
    sku: String(product.sku || "").trim().toUpperCase(),
    name: String(product.name || "").trim(),
    shaftFlex: String(product.shaftFlex || "").trim().toUpperCase(),
    shaftMaterial: material === "steel" ? "Steel" : material === "graphite" ? "Graphite" : material,
  };
}

function invalidProduct(product) {
  return !/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(product.sku)
    || !product.name
    || !["", "R", "S"].includes(product.shaftFlex)
    || !["", "Steel", "Graphite"].includes(product.shaftMaterial);
}

export default async function handler(request, context) {
  if (!(await isAuthorized(request))) return json({ error: "Unauthorized" }, 401);
  try {
    if (request.method === "GET") {
      const { products } = await readProducts();
      return json({
        products,
        summary: {
          total: products.length,
          live: products.filter((product) => product.websiteVisible).length,
          private: products.filter((product) => !product.websiteVisible).length,
          inStock: products.filter((product) => product.status.toLowerCase() === "in stock" && Number(product.stock) > 0).length,
        },
      });
    }
    if (!["POST", "PUT"].includes(request.method)) return json({ error: "Method not allowed" }, 405);
    const body = await request.json();
    if (Array.isArray(body.products)) {
      if (!body.products.length || body.products.length > 100) return json({ error: "Select between 1 and 100 products." }, 400);
      const products = body.products.map(normalizeProduct);
      const invalid = products.find(invalidProduct);
      if (invalid) return json({ error: `Invalid product in bulk update: ${invalid.sku || "missing SKU"}. Shaft flex must be R, S or blank; shaft material must be Steel, Graphite or blank.` }, 400);
      await saveProducts(products);
      context.waitUntil(triggerStorefrontBuild());
      return json({ saved: true, count: products.length, products, rebuildStarted: true });
    }
    const product = normalizeProduct(body);
    if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(product.sku)) return json({ error: "Use a valid SKU (letters, numbers, dash or underscore)." }, 400);
    if (!product.name) return json({ error: "Product name is required." }, 400);
    if (!["", "R", "S"].includes(product.shaftFlex)) return json({ error: "Shaft flex must be R, S or blank." }, 400);
    if (!["", "Steel", "Graphite"].includes(product.shaftMaterial)) return json({ error: "Shaft material must be Steel, Graphite or blank." }, 400);
    await saveProduct(product);
    context.waitUntil(triggerStorefrontBuild());
    return json({ saved: true, product, rebuildStarted: true });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Unable to update products" }, 500);
  }
}

export const config = { path: "/api/admin-products" };
