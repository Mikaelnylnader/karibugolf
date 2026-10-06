// Local development adapter for the real online-admin handlers.
// Google Sheets is simulated on disk; every outbound fetch is intercepted.
import { createServer } from "node:http";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import clientsHandler from "../netlify/functions/admin-clients.mjs";
import salesHandler from "../netlify/functions/admin-sales.mjs";
import productsHandler from "../netlify/functions/admin-products.mjs";
import storefrontHandler from "../netlify/functions/storefront-products.mjs";
import { createSessionCookie, json } from "../netlify/functions/_shared/auth.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 8787);
const storageFile = path.resolve(root, process.argv[3] || ".tmp/admin-local-data.json");
if (!storageFile.startsWith(path.join(root, ".tmp") + path.sep)) throw new Error("Local preview data must stay inside .tmp");
process.env.KARIBU_ADMIN_SECRET = randomUUID();
process.env.KARIBU_BUILD_HOOK = "";
process.env.GOOGLE_OAUTH_JSON = JSON.stringify({ client_id: "local", client_secret: "local", refresh_token: "local" });
await mkdir(path.dirname(storageFile), { recursive: true });
let sheets;
try { sheets = JSON.parse(await readFile(storageFile, "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  const database = new DatabaseSync(path.join(root, "backend/golf_kenya.db"), { readOnly: true });
  const products = database.prepare("SELECT * FROM products ORDER BY display_order, name").all();
  database.close();
  sheets = { Sheet1: [
    ["SKU", "Name", "Category", "Description", "Sizes", "Colors", "Cost China (CNY)", "Cost China (Ksh)", "Selling Price (CNY)", "Price Kenya (Ksh)", "Selling Price (USD)", "Status", "Stock", "Image", "Website Visible"],
    ...products.map((p) => [p.sku, p.name, p.category_slug, p.description, p.sizes, p.colors, p.cost_cny, p.cost_kes, p.price_cny, p.price_kes, p.price_usd, p.status, p.stock, p.image || (p.image_filename ? `/images/products/${p.image_filename}` : ""), p.website_visible ? "TRUE" : "FALSE"]),
  ] };
}
let persistence = Promise.resolve();
function persist() {
  const contents = JSON.stringify(sheets, null, 2);
  persistence = persistence.catch(() => {}).then(async () => {
    await writeFile(`${storageFile}.tmp`, contents);
    // Windows scanners can briefly hold the destination after a write/read.
    // Keep the old file intact and retry its atomic replacement, bounded.
    for (let attempt = 0; ; attempt += 1) {
      try { await rename(`${storageFile}.tmp`, storageFile); break; }
      catch (error) {
        if (!["EPERM", "EACCES", "EBUSY"].includes(error.code) || attempt >= 5) throw error;
        await new Promise((resolve) => setTimeout(resolve, 50 * 2 ** attempt));
      }
    }
  });
  return persistence;
}
await persist();
const columnIndex = (label) => [...label].reduce((value, char) => value * 26 + char.charCodeAt(0) - 64, 0) - 1;
function writeCells(a1, values) {
  const match = a1.match(/^'?([^'!]+)'?!([A-Z]+)(\d+)/);
  if (!match || !sheets[match[1]]) throw new Error("Unsupported local sheet range");
  const row = Number(match[3]) - 1;
  const column = columnIndex(match[2]);
  values.forEach((cells, offset) => {
    sheets[match[1]][row + offset] ||= [];
    cells.forEach((value, index) => { sheets[match[1]][row + offset][column + index] = value; });
  });
}
globalThis.fetch = async (input, options = {}) => {
  try {
  const url = new URL(String(input));
  if (url.hostname === "oauth2.googleapis.com") return json({ access_token: "local-token", expires_in: 3600 });
  if (url.hostname !== "sheets.googleapis.com") throw new Error("Outbound requests are disabled in local preview");
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : {};
  const pathname = decodeURIComponent(url.pathname);
  if (url.searchParams.has("fields")) return json({ sheets: Object.keys(sheets).map((title, sheetId) => ({ properties: { title, sheetId } })) });
  if (pathname.endsWith("/values:batchUpdate")) {
    for (const update of body.data) writeCells(update.range, update.values);
  } else if (pathname.endsWith(":batchUpdate")) {
    for (const request of body.requests) {
      const title = request.addSheet.properties.title;
      if (sheets[title]) return json({ error: "Sheet already exists" }, 400);
      sheets[title] = [];
    }
  } else {
    const a1 = pathname.split("/values/")[1]?.replace(/:append$/, "");
    const title = a1?.split("!")[0].replaceAll("'", "");
    if (!sheets[title]) { console.error("Unknown local sheet range:", pathname); return json({ error: "Unknown local sheet" }, 400); }
    if (method === "GET") return json({ values: sheets[title] });
    if (pathname.endsWith(":append")) sheets[title].push(...body.values);
    else writeCells(a1, body.values);
  }
  await persist();
  return json({ updated: true });
  } catch (error) { console.error("Local storage adapter failed:", error); throw error; }
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) throw new Error("Use localhost for this preview");
    if (req.headers.origin && req.headers.origin !== url.origin) throw new Error("Use the local preview page to save changes");
    let response;
    if (url.pathname.startsWith("/api/")) {
      const parts = [];
      let length = 0;
      for await (const part of req) { length += part.length; if (length > 500_000) throw new Error("Request too large"); parts.push(part); }
      const body = Buffer.concat(parts);
      const request = new Request(url, { method: req.method, headers: req.headers, ...(body.length ? { body } : {}) });
      if (url.pathname === "/api/admin-auth") {
        // Local preview is accessible only on loopback, with its own session.
        const cookie = (await createSessionCookie()).replace("; Secure", "");
        response = json({ authenticated: true }, 200, { "set-cookie": cookie });
      } else if (url.pathname === "/api/admin-clients") response = await clientsHandler(request);
      else if (url.pathname === "/api/admin-sales") response = await salesHandler(request);
      else if (url.pathname === "/api/admin-products") response = await productsHandler(request, { waitUntil: (promise) => promise.catch(() => {}) });
      else if (url.pathname === "/api/storefront-products") response = await storefrontHandler(request);
      else response = json({ error: "This endpoint is unavailable in local preview" }, 404);
    } else {
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const candidates = url.pathname === "/" ? ["public/admin/index.html"] : [
        `public/${relative}${url.pathname.endsWith("/") ? "index.html" : ""}`,
        `dist/static/${relative}${url.pathname.endsWith("/") ? "index.html" : ""}`,
      ];
      let bytes;
      let file;
      for (const candidate of candidates) {
        file = path.resolve(root, candidate);
        if (![path.join(root, "public") + path.sep, path.join(root, "dist/static") + path.sep].some((allowed) => file.startsWith(allowed))) throw new Error("Invalid path");
        try { bytes = await readFile(file); break; } catch (error) { if (error.code !== "ENOENT" && error.code !== "EISDIR") throw error; }
      }
      if (!bytes) response = new Response("Not found", { status: 404 });
      else {
        const ext = path.extname(file);
        const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".webp": "image/webp" }[ext] || "application/octet-stream";
        if (file.endsWith(path.join("admin", "index.html")) || file.endsWith(path.join("admin", "admin.js"))) {
          let text = bytes.toString("utf8").replaceAll("Google Sheets", "local preview storage").replaceAll("Google Sheet", "Local preview").replaceAll("https://karibugolf.com/shop/", "/shop/");
          text = text.replaceAll("The live website rebuild has started.", "Changes are saved locally.").replaceAll("One storefront rebuild has started.", "Changes are saved locally.").replaceAll("Website rebuild started.", "Changes are saved locally.").replaceAll("starts a live storefront build", "keeps changes on this computer").replaceAll("start one website update", "stay on this computer");
          if (ext === ".html") {
            text = text.replace(/<a href="https:\/\/docs\.google\.com\/spreadsheets[^>]*>[\s\S]*?<\/a>/, "");
            text = text.replace('<div class="workspace">', '<div class="workspace"><div style="padding:12px 24px;background:#f3e7cf;color:#17130f;font-size:13px" role="status">Local preview · Changes stay on this computer.</div>');
          }
          bytes = Buffer.from(text);
        }
        response = new Response(bytes, { headers: { "content-type": mime, "cache-control": "no-store" } });
      }
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end("Unable to complete the local preview request"); }
});
server.listen(port, "127.0.0.1", () => console.log(`Local admin: http://127.0.0.1:${server.address().port}/admin/#clients\nData: ${storageFile}\nNetlify and Google Sheets requests: disabled`));
