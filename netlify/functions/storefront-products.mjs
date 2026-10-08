import { json } from "./_shared/auth.mjs";
import { readProducts } from "./_shared/sheets.mjs";

export default async function handler(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  try {
    const requestedSku = new URL(request.url).searchParams.get("sku")?.trim().toLowerCase();
    const { products } = await readProducts();
    const visible = products
      .filter((product) => product.websiteVisible && (!requestedSku || product.sku.toLowerCase() === requestedSku))
      .map((product) => ({
        sku: product.sku,
        priceKes: product.priceKes,
        priceCny: product.priceCny,
        priceUsd: product.priceUsd,
        status: product.status,
        stock: product.stock,
        image: product.image,
        shaftFlex: product.shaftFlex,
        shaftMaterial: product.shaftMaterial,
      }));
    return json({ products: visible });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to load live product information" }, 500);
  }
}

export const config = { path: "/api/storefront-products" };
