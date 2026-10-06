import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "http://127.0.0.1:4514").replace(/\/$/, "");
const local = /127\.0\.0\.1|localhost/.test(base);
const sku = "GK-PT034";
const slug = sku.toLowerCase();
const failures = [];
const results = {};
const check = (condition, message) => { if (!condition) failures.push(message); };
const output = `.tmp/lab-golf-df3-qa/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(output, { recursive: true });

const catalog = JSON.parse(await readFile("lib/catalog.generated.json", "utf8"));
const product = catalog.products.find((item) => item.sku === sku);
check(Boolean(product), "catalog: DF3 missing");
check(product?.name === "L.A.B. Golf DF3 Custom Putter", `catalog: name ${product?.name}`);
check(product?.priceKes === 33537, `catalog: price ${product?.priceKes}`);
check(product?.status === "Out of Stock" && Number(product?.stock) === 0, "catalog: availability mismatch");
check(product?.images?.length === 12, `catalog: expected 12 unique images, found ${product?.images?.length}`);
check(product?.colors === "Black; Blue; Pink", `catalog: finishes ${product?.colors}`);
check(product?.description?.includes("no-insert DF3") && product.description.includes("No fitting service is currently available") && product.description.includes("Currently out of stock"), "catalog: DF3 description mismatch");
check(product?.sizes === "28–38 in (standard)", `catalog: size range ${product?.sizes}`);

const imagePairs = [
  ["DF31.png", "lab-golf-df3-custom-putter-black-address.png"],
  ["DF3 1.png", "lab-golf-df3-custom-putter-black-front.png"],
  ["DF3 2.png", "lab-golf-df3-custom-putter-black-rear.png"],
  ["DF3i 5.png", "lab-golf-df3-custom-putter-black-profile.png"],
  ["DF3 blue.png", "lab-golf-df3-custom-putter-blue-address.png"],
  ["DF3 blue 4.png", "lab-golf-df3-custom-putter-blue-front.png"],
  ["DF3 blue 3.png", "lab-golf-df3-custom-putter-blue-sole.png"],
  ["DF3 blue 1.png", "lab-golf-df3-custom-putter-blue-rear.png"],
  ["DF3 pink 1.png", "lab-golf-df3-custom-putter-pink-address.png"],
  ["DF3 pink 4.png", "lab-golf-df3-custom-putter-pink-front.png"],
  ["DF3 pink 3.png", "lab-golf-df3-custom-putter-pink-sole.png"],
  ["DF3 pink 2.png", "lab-golf-df3-custom-putter-pink-rear.png"],
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, target] of imagePairs) {
  const expected = hash(await readFile(`C:/Users/mikae/Downloads/${source}`));
  check(hash(await readFile(`images/products/${target}`)) === expected, `${target}: processing image differs from source`);
  check(hash(await readFile(`public/images/products/${target}`)) === expected, `${target}: public image differs from source`);
}

const html = await readFile(`dist/static/shop/product/${slug}/index.html`, "utf8");
check(html.includes('"@type":"Product"'), "static page: Product schema missing");
check(html.includes("https://schema.org/OutOfStock"), "static page: out-of-stock schema missing");
check(html.includes('priceCurrency":"KES'), "static page: KES offer missing");

if (!local) {
  const response = await fetch(`${base}/api/storefront-products?sku=${sku}`);
  const live = response.ok ? (await response.json()).products?.[0] : null;
  check(Boolean(live), `live API: ${sku} missing (HTTP ${response.status})`);
  check(live?.priceKes === 33537, `live API: price ${live?.priceKes}`);
  check(live?.status === "Out of Stock" && Number(live?.stock) === 0, "live API: availability mismatch");
  check(new URL(live?.image || "/", base).pathname === "/images/products/lab-golf-df3-custom-putter-black-address.png", "live API: image mismatch");
  results.liveApi = live;
}

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
for (const contextOptions of [
  { label: "desktop", viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "compact", viewport: { width: 360, height: 640 }, reducedMotion: "no-preference", javaScriptEnabled: true },
  { label: "reduced", viewport: { width: 390, height: 844 }, reducedMotion: "reduce", javaScriptEnabled: true },
  { label: "no-js", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", javaScriptEnabled: false },
]) {
  const { label, ...options } = contextOptions;
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    const ignoredLocalApi = local && (response.url().includes("/api/storefront-products") || response.url().includes("/api/product-images/"));
    if (response.status() >= 400 && !ignoredLocalApi) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(`${base}/shop/product/${slug}/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  if (options.javaScriptEnabled) await page.waitForFunction(() => document.querySelector(".product-scroll-shell")?.dataset.scrollcraftMounted === "true");
  await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    stock: document.querySelector(".catalog-stock")?.textContent?.trim(),
    price: document.querySelector(".club-price")?.textContent?.trim(),
    gallery: document.querySelectorAll(".club-thumbnails button").length,
    gallerySources: [...document.querySelectorAll(".club-thumbnails img")].map((image) => image.getAttribute("src")),
    mainGallerySource: document.querySelector(".club-gallery-stage img")?.getAttribute("src"),
    features: document.querySelectorAll(".product-tech-rail article").length,
    specRows: document.querySelectorAll(".club-specs tbody tr").length,
    specs: [...document.querySelectorAll(".club-specs tbody tr")].map((row) => row.textContent?.replace(/\s+/g, " ").trim()),
    equipment: document.querySelectorAll(".product-equipment-grid article").length,
    groups: [...document.querySelectorAll(".catalog-configurator legend")].map((node) => node.textContent?.trim()),
    configurations: Object.fromEntries([...document.querySelectorAll(".catalog-configurator fieldset")].map((fieldset) => [
      fieldset.querySelector("legend")?.textContent?.trim(),
      [...fieldset.querySelectorAll("button")].map((button) => button.textContent?.trim()),
    ])),
    source: document.querySelector(".club-source")?.getAttribute("href"),
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0 && !image.src.includes("/api/product-images/")).map((image) => image.src),
    text: document.body.innerText,
  }));
  check(response?.status() === 200, `${label}: HTTP ${response?.status()}`);
  check(result.title === "L.A.B. Golf DF3 Custom Putter", `${label}: title mismatch`);
  check(result.stock?.toLowerCase().includes("out of stock"), `${label}: stock text mismatch`);
  check(result.price?.includes("KSh 33,537"), `${label}: KES price missing`);
  check(!result.text.includes("$258.97") && !result.text.includes("¥1,579"), `${label}: foreign public price found`);
  check(result.gallery === 4, `${label}: default Black gallery count ${result.gallery}`);
  check(result.mainGallerySource?.includes("lab-golf-df3-custom-putter-black-address.png"), `${label}: default Black image mismatch`);
  check(result.gallerySources.every((source) => source?.includes("-black-")), `${label}: another finish leaked into Black gallery`);
  check(result.features === 4, `${label}: feature count ${result.features}`);
  check(result.specRows === 5, `${label}: specification row count ${result.specRows}`);
  check(result.specs?.some((row) => row.includes("No insert") && row.includes("CNC-milled aluminum")), `${label}: no-insert specification missing`);
  check(result.specs?.some((row) => row.includes("Standard") && row.includes("28–38")), `${label}: Standard reference missing`);
  check(!result.text.includes("Counterbalanced") && !result.text.includes("ArmLock") && !result.text.includes("Sweeper"), `${label}: unavailable putting style found`);
  check(result.equipment === 3, `${label}: equipment card count ${result.equipment}`);
  if (options.javaScriptEnabled) check(JSON.stringify(result.groups) === JSON.stringify(["Hand", "Putting style", "Finish", "Head weight"]), `${label}: configuration groups ${JSON.stringify(result.groups)}`);
  check(JSON.stringify(result.configurations.Hand) === JSON.stringify(["Right handed"]), `${label}: hand options ${JSON.stringify(result.configurations.Hand)}`);
  check(JSON.stringify(result.configurations.Finish) === JSON.stringify(["Black", "Blue", "Pink"]), `${label}: finish options ${JSON.stringify(result.configurations.Finish)}`);
  check(JSON.stringify(result.configurations["Putting style"]) === JSON.stringify(["Standard"]), `${label}: putting-style options ${JSON.stringify(result.configurations["Putting style"])}`);
  check(JSON.stringify(result.configurations["Head weight"]) === JSON.stringify(["Standard"]), `${label}: head-weight options ${JSON.stringify(result.configurations["Head weight"])}`);
  check(!result.groups.includes("Fitting"), `${label}: fitting option still present`);
  check(result.source === "https://labgolf.com/products/df3-custom", `${label}: official source mismatch`);
  check(result.overflow <= 0, `${label}: horizontal overflow ${result.overflow}px`);
  check(result.broken.length === 0, `${label}: broken images ${result.broken.join(", ")}`);
  check(errors.length === 0, `${label}: browser errors ${errors.join(" | ")}`);
  if (options.javaScriptEnabled) {
    for (const finish of ["Blue", "Pink", "Black"]) {
      await page.getByRole("button", { name: finish, exact: true }).click();
      await page.waitForFunction((group) => {
        const images = [...document.querySelectorAll(".club-thumbnails img")];
        return images.length === 4 && images.every((image) => image.getAttribute("src")?.includes(`-${group.toLowerCase()}-`));
      }, finish);
      const gallery = await page.evaluate(() => ({
        count: document.querySelectorAll(".club-thumbnails button").length,
        sources: [...document.querySelectorAll(".club-thumbnails img")].map((image) => image.getAttribute("src")),
        main: document.querySelector(".club-gallery-stage img")?.getAttribute("src"),
      }));
      check(gallery.count === 4, `${label}: ${finish} gallery count ${gallery.count}`);
      check(gallery.sources.every((source) => source?.includes(`-${finish.toLowerCase()}-`)), `${label}: another finish leaked into ${finish} gallery`);
      check(gallery.main?.includes(`-${finish.toLowerCase()}-address.png`), `${label}: ${finish} selection did not reset to its address image`);
      results[`${label}${finish}Gallery`] = gallery;
    }
  }
  if (label === "desktop") {
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await page.getByRole("button", { name: "Pink", exact: true }).click();
    const whatsapp = await page.locator(".catalog-configurator .contact-button").getAttribute("href");
    check(whatsapp?.includes("Hand%3A%20Right%20handed") && whatsapp.includes("Putting%20style%3A%20Standard") && whatsapp.includes("Finish%3A%20Pink") && whatsapp.includes("Head%20weight%3A%20Standard") && !whatsapp.includes("Fitting"), "desktop: WhatsApp inquiry omitted or added DF3 options");
    await page.getByRole("button", { name: "Enlarge Pink address photo" }).click();
    check(await page.getByRole("dialog").isVisible(), "desktop: gallery zoom did not open");
    await page.keyboard.press("Escape");
  }
  results[label] = { ...result, text: undefined, errors };
  await context.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}/shop/clubs/putters/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() > 0, "/shop/clubs/putters/: DF3 card missing");
  check(await page.locator('a[href="/shop/product/gk-pt035"]').count() > 0, "/shop/clubs/putters/: DF3i regression card missing");
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}/shop/clubs/`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  const puttersText = (await page.locator("#putters").innerText()).replace(/\s+/g, " ").toLowerCase();
  check(puttersText.includes("2 products"), `/shop/clubs/: Putters product count missing (${puttersText})`);
  await page.close();
}
for (const route of ["/", "/shop/", "/shop/stock/"]) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  await page.goto(`${base}${route}`, { waitUntil: "commit" });
  await page.locator("footer.shared-footer").waitFor({ state: "attached" });
  check(await page.locator(`a[href="/shop/product/${slug}"]`).count() === 0, `${route}: out-of-stock DF3 leaked into in-stock selection`);
  await page.close();
}

await browser.close();
await writeFile(`${output}/report.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(JSON.stringify({ base, output, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
