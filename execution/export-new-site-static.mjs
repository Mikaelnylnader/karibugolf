import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const publishDir = path.resolve("dist/static");
const catalog = JSON.parse(await readFile(path.resolve("lib/catalog.generated.json"), "utf8"));
const researchedArticles = JSON.parse(await readFile(path.resolve("content/seo-articles-2026.json"), "utf8"));
const productArticles = JSON.parse(await readFile(path.resolve("content/product-seo-articles-2026.json"), "utf8"));
const inStockIronArticles = JSON.parse(await readFile(path.resolve("content/in-stock-iron-articles-2026.json"), "utf8"));
const selectedProductSlugs = new Set([
  "taylormade-p790-irons-kenya-buying-guide",
  "steel-vs-graphite-iron-shafts-kenya",
]);
const departments = {
  clubs: ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"],
  shoes: ["mens_shoes", "womens_shoes"],
  apparel: ["mens_polos", "mens_pants", "mens_jackets", "mens_shorts", "womens_polos", "womens_skirts", "womens_pants", "womens_dresses", "womens_jackets", "womens_tops"],
  bags: ["bags"],
  balls: ["balls"],
  accessories: ["gloves", "hats_and_caps", "grips", "range_finders", "accessories"],
};
const shopRoutes = Object.entries(departments).flatMap(([department, categories]) => [
  `/shop/${department}`,
  ...categories.map((category) => `/shop/${department}/${category}`),
]);
const productRoutes = catalog.products.map((product) => `/shop/product/${product.slug}`);
const blogRoutes = [
  ...inStockIronArticles.map((article) => `/blog/${article.slug}`),
  ...productArticles.filter((article) => selectedProductSlugs.has(article.slug)).map((article) => `/blog/${article.slug}`),
  ...researchedArticles.map((article) => `/blog/${article.slug}`),
  "/blog/your-first-round",
  "/blog/before-you-choose-your-gear",
  "/blog/ready-for-a-day-on-the-course",
];
const routes = [
  "/",
  "/about",
  "/growing-the-game",
  "/blog",
  ...blogRoutes,
  "/contact",
  "/shop",
  "/shop/stock",
  "/shop/taylormade-p790-irons",
  ...shopRoutes,
  ...productRoutes,
];

const useNode = process.argv.includes("--node");
const cli = path.resolve(useNode ? "node_modules/vinext/dist/cli.js" : "node_modules/wrangler/bin/wrangler.js");
const server = spawn(
  process.execPath,
  useNode
    ? [cli, "start", "--hostname", "127.0.0.1", "--port", String(port)]
    : [cli, "dev", "--config", "dist/server/wrangler.json", "--port", String(port)],
  { stdio: ["ignore", "pipe", "pipe"] },
);

let diagnostics = "";
server.stdout.on("data", (chunk) => {
  diagnostics += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  diagnostics += chunk.toString();
});

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for the production server.\n${diagnostics}`);
}

try {
  await waitForServer();
  await rm(publishDir, { recursive: true, force: true });
  await cp(path.resolve("dist/client"), publishDir, { recursive: true });
  await cp(path.resolve("images/products"), path.join(publishDir, "images/products"), { recursive: true });
  await cp(path.resolve("images/categories"), path.join(publishDir, "images/categories"), { recursive: true });

  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) {
      throw new Error(`Unable to export ${route}: HTTP ${response.status}`);
    }
    const html = await response.text();
    const outputDir =
      route === "/"
        ? publishDir
        : path.join(publishDir, route.replace(/^\//, ""));
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "index.html"), html, "utf8");
    process.stdout.write(`exported ${route}\n`);
  }

  const canonicalRoutes = [...new Set(routes.filter((route) => route !== "/shop/taylormade-p790-irons"))];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${canonicalRoutes
    .map((route) => `  <url><loc>https://karibugolf.com${route === "/" ? "/" : `${route}/`}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  await writeFile(path.join(publishDir, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(publishDir, "robots.txt"), [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Sitemap: https://karibugolf.com/sitemap.xml",
    "",
  ].join("\n"), "utf8");
} finally {
  server.kill("SIGTERM");
}
