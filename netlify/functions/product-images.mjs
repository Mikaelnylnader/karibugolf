import { getStore } from "@netlify/blobs";

export default async function handler(_request, context) {
  const key = context.params.key;
  const store = getStore({ name: "karibu-product-images" });
  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });
  return new Response(result.data, {
    headers: {
      "content-type": result.metadata?.contentType || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

export const config = { path: "/api/product-images/:key" };
