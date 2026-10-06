import { readFile } from "node:fs/promises";
import path from "node:path";

const publishDir = path.resolve("dist/static");
const catalog = JSON.parse(await readFile(path.resolve("lib/catalog.generated.json"), "utf8"));
const failures = [];
const baseArg = process.argv.find((argument) => argument.startsWith("--base="));
const baseUrl = baseArg ? baseArg.slice("--base=".length).replace(/\/$/, "") : "";

const loadText = async (localParts, publicPath) => {
  if (!baseUrl) return readFile(path.join(publishDir, ...localParts), "utf8");
  const response = await fetch(`${baseUrl}${publicPath}`, { headers: { "user-agent": "Karibu-SEO-Verifier/1.0" } });
  if (!response.ok) throw new Error(`${publicPath}: HTTP ${response.status}`);
  return response.text();
};

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match?.[1] ?? "";
};

for (const product of catalog.products) {
  const label = `${product.slug} (${product.name})`;
  const canonical = `https://karibugolf.com/shop/product/${product.slug}/`;
  const html = await loadText(["shop", "product", product.slug, "index.html"], `/shop/product/${product.slug}/`);
  const head = html.slice(0, html.indexOf("</head>") + 7);
  const title = head.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
  const descriptionTag = head.match(/<meta\s+name="description"[^>]*>/i)?.[0] ?? "";
  const canonicalTag = head.match(/<link\s+rel="canonical"[^>]*>/i)?.[0] ?? "";

  check(title.includes(product.name) && title.includes("in Kenya"), `${label}: missing Kenya-focused title in initial head`);
  check(attribute(descriptionTag, "content").includes("in Kenya"), `${label}: missing Kenya-focused meta description in initial head`);
  check(attribute(descriptionTag, "content").length <= 160, `${label}: meta description exceeds 160 characters`);
  check(attribute(canonicalTag, "href") === canonical, `${label}: canonical URL is missing or incorrect in initial head`);
  check(head.includes('property="og:title"'), `${label}: missing Open Graph title in initial head`);
  check(head.includes('property="og:description"'), `${label}: missing Open Graph description in initial head`);
  check(head.includes(`property="og:url" content="${canonical}"`), `${label}: missing Open Graph canonical URL in initial head`);
  check(head.includes('property="og:image"'), `${label}: missing Open Graph image in initial head`);
  check(head.includes('name="twitter:card" content="summary_large_image"'), `${label}: missing Twitter card in initial head`);
  check(html.includes('id="buying-in-kenya"'), `${label}: missing visible Kenya buying section`);

  const jsonLdScripts = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const graphs = [];
  for (const match of jsonLdScripts) {
    try {
      const data = JSON.parse(match[1]);
      if (Array.isArray(data["@graph"])) graphs.push(data["@graph"]);
    } catch {
      failures.push(`${label}: invalid JSON-LD`);
    }
  }
  const graph = graphs[0] ?? [];
  const schema = (type) => graph.find((item) => item["@type"] === type);
  const productSchema = schema("Product");
  const faqSchema = schema("FAQPage");
  check(Boolean(productSchema), `${label}: missing Product schema`);
  check(Boolean(schema("BreadcrumbList")), `${label}: missing BreadcrumbList schema`);
  check(Boolean(schema("WebPage")), `${label}: missing WebPage schema`);
  check(Boolean(schema("WebSite")), `${label}: missing WebSite schema`);
  check(Boolean(schema("Organization")), `${label}: missing Organization schema`);
  check(productSchema?.offers?.priceCurrency === "KES", `${label}: Product offer currency is not KES`);
  check(productSchema?.offers?.price === product.priceKes, `${label}: Product offer price does not match catalogue`);
  check(productSchema?.offers?.url === canonical, `${label}: Product offer URL does not match canonical`);
  check(Array.isArray(productSchema?.additionalProperty) && productSchema.additionalProperty.length >= 3, `${label}: missing product option properties`);
  check(Array.isArray(faqSchema?.mainEntity) && faqSchema.mainEntity.length === 4, `${label}: FAQ schema must contain four visible questions`);
  for (const item of faqSchema?.mainEntity ?? []) {
    check(html.includes(item.name) && html.includes(item.acceptedAnswer?.text ?? ""), `${label}: FAQ schema does not match visible content`);
  }
}

const sitemap = await loadText(["sitemap.xml"], "/sitemap.xml");
const robots = await loadText(["robots.txt"], "/robots.txt");
const llms = await loadText(["llms.txt"], "/llms.txt");
check(sitemap.includes("<lastmod>"), "sitemap.xml: missing lastmod values");
check(sitemap.includes("xmlns:image="), "sitemap.xml: missing image sitemap namespace");
check(robots.includes("User-agent: OAI-SearchBot"), "robots.txt: missing explicit OAI-SearchBot group");
check(robots.includes("User-agent: Googlebot"), "robots.txt: missing explicit Googlebot group");

for (const product of catalog.products) {
  const canonical = `https://karibugolf.com/shop/product/${product.slug}/`;
  check(sitemap.includes(`<loc>${canonical}</loc>`), `${product.slug}: missing from sitemap.xml`);
  check(llms.includes(`[${product.name}](${canonical})`), `${product.slug}: missing from llms.txt catalogue`);
  for (const image of product.images) {
    const absolute = image.startsWith("http") ? image : `https://karibugolf.com${image}`;
    const escaped = absolute.replaceAll("&", "&amp;");
    check(sitemap.includes(`<image:loc>${escaped}</image:loc>`), `${product.slug}: image missing from sitemap.xml (${image})`);
  }
}

if (failures.length > 0) {
  console.error(`Product SEO verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Product SEO verification passed for all ${catalog.products.length} product pages${baseUrl ? ` at ${baseUrl}` : ""}.`);
