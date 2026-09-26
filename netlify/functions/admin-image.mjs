import { getStore } from "@netlify/blobs";
import { isAuthorized, json } from "./_shared/auth.mjs";

export default async function handler(request) {
  if (!(await isAuthorized(request))) return json({ error: "Unauthorized" }, 401);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const contentType = request.headers.get("content-type") || "application/octet-stream";
  if (!contentType.startsWith("image/")) return json({ error: "Please upload an image file." }, 400);
  const buffer = await request.arrayBuffer();
  if (!buffer.byteLength || buffer.byteLength > 5_500_000) return json({ error: "Image must be smaller than 5 MB." }, 400);
  const original = request.headers.get("x-filename") || "product-image";
  const safeName = original.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "").slice(-80);
  const key = `${crypto.randomUUID()}-${safeName || "product-image"}`;
  const store = getStore({ name: "karibu-product-images", consistency: "strong" });
  await store.set(key, buffer, { metadata: { contentType, original } });
  return json({ url: `/api/product-images/${encodeURIComponent(key)}` });
}

export const config = { path: "/api/admin-image" };
