// Exercise the real Clients handler against an in-memory Google Sheets API,
// then test add, edit, reload, validation and mobile navigation in Chromium.
// No real credentials, client records or Google API requests are used.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import handler from "../netlify/functions/admin-clients.mjs";
import authHandler from "../netlify/functions/admin-auth.mjs";
import { createSessionCookie, isAuthorized, json } from "../netlify/functions/_shared/auth.mjs";

if (process.argv[2] === "--live") {
  // Read-only deployed verification: open the form but never submit client data.
  const base = process.argv[3]?.replace(/\/$/, "");
  assert(base && /^https:\/\//.test(base), "Usage: node execution/verify_admin_clients.mjs --live https://deploy-url");
  const login = await readFile(path.resolve(".tmp/online-admin-login.txt"), "utf8");
  const password = login.match(/^Password:\s*(.+)$/im)?.[1]?.trim();
  assert(password, "Admin login details were not found");
  const unauthorized = await fetch(`${base}/api/admin-clients`);
  assert.equal(unauthorized.status, 401);
  const session = await fetch(`${base}/api/admin-auth`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
  assert.equal(session.status, 200, "Preview login failed");
  const cookie = session.headers.get("set-cookie").split(";")[0];
  const clientsResponse = await fetch(`${base}/api/admin-clients`, { headers: { cookie } });
  assert.equal(clientsResponse.status, 200, "Deployed Clients endpoint could not read Google Sheets");
  const payload = await clientsResponse.json();
  assert(Array.isArray(payload.clients));
  const evidence = path.resolve(".tmp/admin-clients-live-qa");
  await mkdir(evidence, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addCookies([{ name: "karibu_admin", value: cookie.split("=")[1], url: base, secure: true, httpOnly: true, sameSite: "Strict" }]);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/admin/#clients`);
    await page.locator("#client-count").filter({ hasText: "clients" }).waitFor({ timeout: 30_000 });
    assert.equal(await page.locator("#view-title").textContent(), "Clients");
    await page.locator("#new-client").click();
    for (const name of ["firstName", "lastName", "company", "email", "phone", "whatsapp", "notes"]) assert(await page.locator(`#client-form [name="${name}"]`).isVisible());
    await page.screenshot({ path: path.join(evidence, "desktop-form.png"), fullPage: true });
    await page.locator("#cancel-client-editor").click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#new-client").click();
    assert(await page.locator("#save-client").isVisible());
    await page.screenshot({ path: path.join(evidence, "mobile-form.png"), fullPage: true });
    await page.locator("#cancel-client-editor").click();
    assert.deepEqual(errors, []);
    const report = { base, deployedAuth: "passed", realSheetRead: "passed", clientCount: payload.clients.length, form: "passed", mobile: "passed", clientWrites: 0 };
    await writeFile(path.join(evidence, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
  process.exit(0);
}

process.env.KARIBU_ADMIN_SECRET = "isolated-clients-verification-secret";
process.env.KARIBU_ADMIN_PASSWORD = "isolated-clients-verification-password";
process.env.GOOGLE_OAUTH_JSON = JSON.stringify({ client_id: "test", client_secret: "test", refresh_token: "test" });
const realFetch = globalThis.fetch;
let tabExists = false;
let rows = [];
let failWrites = false;
const googleCalls = [];
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(String(input));
  if (url.hostname === "oauth2.googleapis.com") return json({ access_token: "test-token", expires_in: 3600 });
  if (url.hostname !== "sheets.googleapis.com") throw new Error(`Unexpected upstream request: ${url.hostname}`);
  const method = options.method || "GET";
  googleCalls.push({ method, pathname: decodeURIComponent(url.pathname), input: url.searchParams.get("valueInputOption") });
  assert.equal(options.headers.authorization, "Bearer test-token");
  if (method !== "GET" && failWrites) return json({ error: "Simulated unavailable storage" }, 503);
  if (url.searchParams.has("fields")) return json({ sheets: tabExists ? [{ properties: { sheetId: 42, title: "Clients" } }] : [] });
  const body = options.body ? JSON.parse(options.body) : null;
  if (url.pathname.endsWith(":batchUpdate")) {
    assert.equal(body.requests[0].addSheet.properties.title, "Clients");
    tabExists = true;
    return json({ replies: [{}] });
  }
  const match = decodeURIComponent(url.pathname).match(/\/values\/'Clients'!(.+?)(:append)?$/);
  assert(match, "Every client data request must target only the Clients tab");
  if (method === "GET") return json({ values: rows });
  assert.equal(url.searchParams.get("valueInputOption"), "RAW");
  if (match[2]) rows.push(...body.values);
  else {
    const rowNumber = Number(match[1].match(/^A(\d+)/)?.[1]);
    assert(rowNumber > 0);
    rows[rowNumber - 1] = body.values[0];
  }
  return json({ updatedRows: 1 });
};
const cookie = (await createSessionCookie()).split(";")[0];
const request = (method = "GET", body, authorized = true, extraHeaders = {}) => new Request("http://127.0.0.1/api/admin-clients", {
  method, headers: { ...(authorized ? { cookie } : {}), "content-type": "application/json", ...extraHeaders },
  ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
});
const expectStatus = async (req, expected) => {
  const result = await handler(req);
  assert.equal(result.status, expected, await result.clone().text());
  assert.equal(result.headers.get("cache-control"), "no-store");
  return result.json();
};
await expectStatus(request("GET", undefined, false), 401);
await expectStatus(request("POST", { firstName: "No", lastName: "Access" }, false), 401);
assert.equal(googleCalls.length, 0);
assert.deepEqual(await expectStatus(request(), 200), { clients: [] });
assert.equal(tabExists, false, "Reading an empty client list must not create a sheet");
for (const invalid of [null, [], { firstName: "Only" }, { firstName: "A", lastName: "B", email: "invalid" }, { firstName: "A", lastName: "B", phone: "123" }, { firstName: "A", lastName: "B", whatsapp: "javascript:alert(1)" }, { firstName: 123, lastName: "B" }]) {
  await expectStatus(request("POST", invalid), 400);
}
await expectStatus(request("POST", "not json"), 400);
await expectStatus(request("POST", "x".repeat(16_001)), 413);
await expectStatus(request("DELETE"), 405);
await expectStatus(request("POST", { firstName: "A", lastName: "B" }, true, { origin: "https://unrelated.example" }), 403);
assert.equal(tabExists, false);

const input = { firstName: "  Jane ", lastName: "Otieno", company: "Karibu Golf Kenya", email: "jane@example.com", phone: "+254 712 345 678", whatsapp: "+254 733 345 678", notes: '= literal note <img src=x onerror="alert(1)">' };
const saved = (await expectStatus(request("POST", input), 201)).client;
assert.equal(saved.firstName, "Jane");
assert.equal(rows.length, 2);
assert.equal(rows[1][3], input.company);
assert.equal(rows[1][5], input.phone);
assert.equal(rows[1][7], input.notes);
const list = (await expectStatus(request(), 200)).clients;
assert.equal(list[0].id, saved.id);
assert(!("rowNumber" in list[0]));
await expectStatus(request("POST", { firstName: "Another", lastName: "Client", email: "JANE@EXAMPLE.COM" }), 409);
await expectStatus(request("POST", { firstName: "Another", lastName: "Client", whatsapp: "+254712345678" }), 409);
const updated = (await expectStatus(request("PUT", { ...saved, notes: "TaylorMade irons received." }), 200)).client;
assert.equal(updated.id, saved.id);
assert.equal(updated.createdAt, saved.createdAt);
assert.equal(rows.length, 2, "Editing must not append another client");
await expectStatus(request("PUT", { ...saved, id: "missing" }), 400);
await expectStatus(request("PUT", { ...saved, id: crypto.randomUUID() }), 404);
await expectStatus(request("POST", { firstName: "No", lastName: "Contacts" }), 201);
failWrites = true;
await expectStatus(request("POST", { firstName: "Failed", lastName: "Save" }), 500);
failWrites = false;
assert.equal(rows.length, 3, "Failed writes must not report a saved client");
// Recover an empty tab after an interrupted initial header write.
rows = [];
await expectStatus(request("POST", { firstName: "Recovered", lastName: "Client" }), 201);
assert.equal(rows.length, 2);
// Existing nine-column client tabs migrate without losing contact details.
const legacyId = crypto.randomUUID();
rows = [
  ["Client ID", "First name", "Last name", "Email", "Phone number", "WhatsApp", "Items received / notes", "Created at", "Updated at"],
  [legacyId, "Legacy", "Client", "legacy@example.com", "+254700000001", "+254700000001", "Original note", "2026-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z"],
];
const legacy = (await expectStatus(request(), 200)).clients[0];
assert.equal(legacy.company, "");
await expectStatus(request("PUT", { ...legacy, company: "Legacy Company" }), 200);
assert.equal(rows[0][3], "Company");
assert.equal(rows[1][3], "Legacy Company");
assert.equal(rows[1][4], "legacy@example.com");
assert.equal(rows[1][5], "+254700000001");
// Start the UI with a clean, absent sheet to cover the first customer flow.
tabExists = false;
rows = [];

const products = [{ sku: "GK-TEST-001", name: "Test irons", categorySlug: "golf_irons", status: "In Stock", stock: "3", priceKes: 25000, websiteVisible: true }];
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let response;
    if (url.pathname.startsWith("/api/")) {
      const parts = [];
      for await (const part of req) parts.push(part);
      const body = Buffer.concat(parts);
      const webRequest = new Request(url, { method: req.method, headers: req.headers, ...(body.length ? { body } : {}) });
      if (url.pathname === "/api/admin-clients") response = await handler(webRequest);
      else if (url.pathname === "/api/admin-auth") response = await authHandler(webRequest);
      else if (url.pathname === "/api/admin-products") response = await isAuthorized(webRequest) ? json({ products, summary: { total: 1, live: 1, private: 0, inStock: 1 } }) : json({ error: "Unauthorized" }, 401);
      else response = json({ error: "Not found" }, 404);
    } else {
      const relative = url.pathname === "/admin/" ? "admin/index.html" : url.pathname.slice(1);
      const file = path.resolve("public", relative);
      assert(file.startsWith(path.resolve("public") + path.sep));
      const type = relative.endsWith(".js") ? "text/javascript" : relative.endsWith(".css") ? "text/css" : relative.endsWith(".png") ? "image/png" : relative.endsWith(".svg") ? "image/svg+xml" : "text/html";
      response = new Response(await readFile(file), { headers: { "content-type": type } });
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { res.writeHead(500); res.end(error.message); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const evidence = path.resolve(".tmp/admin-clients-qa");
await mkdir(evidence, { recursive: true });
let browser;
const errors = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies([{ name: "karibu_admin", value: cookie.split("=")[1], url: base }]);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/admin/`);
  await page.locator("#app:not([hidden])").waitFor();
  await page.locator("#nav-clients").click();
  await page.getByText("No clients yet.", { exact: false }).waitFor();
  await page.locator("#new-client").click();
  const form = page.locator("#client-form");
  await form.locator('[name="firstName"]').fill("Jane");
  await form.locator('[name="lastName"]').fill("Otieno");
  await form.locator('[name="company"]').fill("Karibu Golf Kenya");
  await form.locator('[name="email"]').fill("jane@example.com");
  await form.locator('[name="phone"]').fill("+254 712 345 678");
  await page.locator("#use-client-phone").click();
  assert.equal(await form.locator('[name="whatsapp"]').inputValue(), "+254 712 345 678");
  await form.locator('[name="notes"]').fill(input.notes);
  await page.locator("#save-client").click();
  await page.locator("#client-editor").waitFor({ state: "hidden" });
  assert.equal(await page.locator("#client-rows tr").count(), 1);
  assert.equal(await page.locator("#client-rows tr td").nth(1).textContent(), "Karibu Golf Kenya");
  assert.equal(await page.locator("#client-rows img").count(), 0, "Client notes must render as text");
  assert.equal(await page.locator('#client-rows a[href^="https://wa.me/"]').getAttribute("href"), "https://wa.me/254712345678");
  await page.locator("#client-search").fill("254712345678");
  assert.equal(await page.locator("#client-rows [data-client-edit]").count(), 1);
  await page.locator("#client-search").fill("no matching person");
  await page.getByText("No clients match your search.").waitFor();
  await page.locator("#client-search").fill("");
  await page.locator("#client-rows [data-client-edit]").click();
  await form.locator('[name="notes"]').fill("TaylorMade irons received.");
  await page.locator("#save-client").click();
  await page.locator("#client-editor").waitFor({ state: "hidden" });
  await page.reload();
  await page.locator("#client-rows [data-client-edit]").waitFor();
  assert.equal(await page.locator(".client-notes").textContent(), "TaylorMade irons received.");
  await page.screenshot({ path: path.join(evidence, "desktop.png"), fullPage: true });
  await page.locator("#new-client").click();
  await form.locator('[name="firstName"]').fill("Duplicate");
  await form.locator('[name="lastName"]').fill("Customer");
  await form.locator('[name="email"]').fill("JANE@EXAMPLE.COM");
  await page.locator("#save-client").click();
  await page.locator("#client-save-status").filter({ hasText: "already exists" }).waitFor();
  assert(await page.locator("#client-editor").isVisible());
  assert.equal(await form.locator('[name="firstName"]').inputValue(), "Duplicate");
  await page.locator("#cancel-client-editor").click();
  await page.locator("#nav-products").click();
  await page.locator("#product-rows [data-edit]").click();
  assert(await page.locator("#editor").isVisible(), "Existing product editor must still work");
  await page.locator("#close-editor").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-admin-nav [data-go="clients"]').click();
  assert.equal(await page.locator("#view-title").textContent(), "Clients");
  assert(await page.locator("#new-client").isVisible());
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.locator("#new-client").click();
  assert(await page.evaluate(() => document.querySelector("#client-editor").scrollWidth <= document.querySelector("#client-editor").clientWidth));
  assert(await page.locator("#save-client").isVisible());
  assert(await page.locator("#save-client").evaluate((button) => button.getBoundingClientRect().bottom <= innerHeight), "Mobile Save button must remain on screen");
  await page.screenshot({ path: path.join(evidence, "mobile-form.png"), fullPage: true });
  await page.locator("#cancel-client-editor").click();
  await page.locator('.mobile-admin-nav [data-go="dashboard"]').click();
  assert.equal(await page.locator("#view-title").textContent(), "Dashboard");
  assert.deepEqual(errors, []);
  const report = { backend: "passed", addEditReload: "passed", duplicateValidation: "passed", literalNotes: "passed", contacts: "passed", existingProducts: "passed", mobile: "passed", realGoogleRequests: 0, googleCalls: googleCalls.length };
  await writeFile(path.join(evidence, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  globalThis.fetch = realFetch;
}
