import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const publishDir = path.resolve("dist/static");
const catalog = JSON.parse(await readFile(path.resolve("lib/catalog.generated.json"), "utf8"));
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
const routes = [
  "/",
  "/about",
  "/blog",
  "/blog/your-first-round",
  "/blog/before-you-choose-your-gear",
  "/blog/ready-for-a-day-on-the-course",
  "/contact",
  "/shop",
  "/shop/taylormade-p790-irons",
  ...shopRoutes,
  ...productRoutes,
];

const wrangler = path.resolve("node_modules/wrangler/bin/wrangler.js");
const server = spawn(
  process.execPath,
  [wrangler, "dev", "--config", "dist/server/wrangler.json", "--port", String(port)],
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
} finally {
  server.kill("SIGTERM");
}
