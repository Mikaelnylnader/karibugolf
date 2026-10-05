// Optional read-only live snapshot for visual QA. Repeated browser contexts and
// catalogue cards otherwise exhaust the upstream Sheets per-user read quota.
export async function loadApiSnapshot(base) {
  if (!process.argv.includes("--api-snapshot") || /127\.0\.0\.1|localhost/.test(base)) return null;
  const response = await fetch(`${base}/api/storefront-products`);
  if (!response.ok) throw new Error(`Live catalogue snapshot: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error("Missing live catalogue products");
  return data.products;
}

export async function installApiSnapshot(context, base, products) {
  if (!products) return;
  await context.route(`${base}/api/storefront-products**`, route => {
    const sku = new URL(route.request().url()).searchParams.get("sku")?.toLowerCase();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ products: products.filter(product => !sku || product.sku.toLowerCase() === sku) }),
    });
  });
}
