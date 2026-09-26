import { isAuthorized, json } from "./_shared/auth.mjs";
import { readProducts, saveProduct, triggerStorefrontBuild } from "./_shared/sheets.mjs";

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
    const product = await request.json();
    product.sku = String(product.sku || "").trim().toUpperCase();
    product.name = String(product.name || "").trim();
    if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(product.sku)) return json({ error: "Use a valid SKU (letters, numbers, dash or underscore)." }, 400);
    if (!product.name) return json({ error: "Product name is required." }, 400);
    await saveProduct(product);
    context.waitUntil(triggerStorefrontBuild());
    return json({ saved: true, product, rebuildStarted: true });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Unable to update products" }, 500);
  }
}

export const config = { path: "/api/admin-products" };
