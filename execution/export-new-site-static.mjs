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
  kids: ["junior_sets"],
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
const productByRoute = new Map(catalog.products.map((product) => [`/shop/product/${product.slug}`, product]));
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
  "/Coaching",
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
  const deadline = Date.now() + 90_000;
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

function hoistSeoMetadata(html) {
  const headEnd = html.indexOf("</head>");
  if (headEnd === -1) return html;
  const initialHead = html.slice(0, headEnd);
  const patterns = [
    /<title>[^<]*<\/title>/i,
    /<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/gi,
    /<link\s+rel="canonical"[^>]*>/i,
  ];
  const tags = [];
  for (const pattern of patterns) {
    const matches = html.match(pattern) ?? [];
    for (const tag of matches) {
      if (!initialHead.includes(tag) && !tags.includes(tag)) tags.push(tag);
    }
  }
  if (tags.length === 0) return html;
  return html.replace("</head>", `${tags.join("")}\n</head>`);
}

const xmlEscape = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const absoluteUrl = (value) => value.startsWith("http") ? value : `https://karibugolf.com${value}`;

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
    const html = hoistSeoMetadata(await response.text());
    const outputDir =
      route === "/"
        ? publishDir
        : path.join(publishDir, route.replace(/^\//, ""));
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "index.html"), html, "utf8");
    process.stdout.write(`exported ${route}\n`);
  }

  const canonicalRoutes = [...new Set(routes.filter((route) => route !== "/shop/taylormade-p790-irons"))];
  const lastModified = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${canonicalRoutes
    .map((route) => {
      const location = `https://karibugolf.com${route === "/" ? "/" : `${route}/`}`;
      const product = productByRoute.get(route);
      const images = product
        ? product.images.map((image) => `\n    <image:image><image:loc>${xmlEscape(absoluteUrl(image))}</image:loc></image:image>`).join("")
        : "";
      return `  <url><loc>${xmlEscape(location)}</loc><lastmod>${lastModified}</lastmod>${images}</url>`;
    })
    .join("\n")}\n</urlset>\n`;
  await writeFile(path.join(publishDir, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(publishDir, "robots.txt"), [
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Sitemap: https://karibugolf.com/sitemap.xml",
    "",
  ].join("\n"), "utf8");
  const llms = [
    "# Karibu Golf East Africa",
    "",
    "> Golf equipment catalogue based in Nairobi, Kenya. Product pages show listed prices in Kenyan shillings, availability, product images, options and specifications.",
    "",
    "## Primary pages",
    "",
    "- [Shop](https://karibugolf.com/shop/): Browse the complete golf catalogue.",
    "- [Golf coaching](https://karibugolf.com/Coaching/): Private lessons, swing assessments, junior coaching and corporate clinics in Nairobi.",
    "- [Current stock](https://karibugolf.com/shop/stock/): Browse products currently listed in stock.",
    "- [Contact Karibu Golf](https://karibugolf.com/contact/): Confirm availability, specifications and delivery in Kenya.",
    "",
    "## Product catalogue",
    "",
    ...catalog.products.map((product) => {
      const stock = product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0 ? "in stock" : "out of stock";
      return `- [${product.name}](https://karibugolf.com/shop/product/${product.slug}/): ${product.categoryLabel}; KSh ${Math.round(product.priceKes).toLocaleString("en-KE")}; currently ${stock}.`;
    }),
    "",
    "Prices and availability can change. Confirm the exact product, configuration, delivery cost and payment details directly with Karibu Golf before ordering.",
    "",
  ].join("\n");
  await writeFile(path.join(publishDir, "llms.txt"), llms, "utf8");
} finally {
  server.kill("SIGTERM");
}
