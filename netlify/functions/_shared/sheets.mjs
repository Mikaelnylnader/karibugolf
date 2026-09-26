import { env } from "./auth.mjs";

const SHEET_ID = "1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY";
const SHEET_TAB = "Sheet1";
let cachedToken = null;
let cachedTokenExpiry = 0;

const categoryMap = {
  irons: "golf_irons", "golf irons": "golf_irons", golf_irons: "golf_irons",
  drivers: "drivers", driver: "drivers", putters: "putters", putter: "putters",
  woods: "woods", wedges: "wedges", hybrids: "hybrids", balls: "balls", bags: "bags",
  gloves: "gloves", grips: "grips", "range finders": "range_finders", range_finders: "range_finders",
  "hats & caps": "hats_and_caps", hats_and_caps: "hats_and_caps", shoes: "mens_shoes",
  apparel: "mens_polos", accessories: "accessories",
};

function credentials() {
  const raw = env("GOOGLE_OAUTH_JSON");
  if (!raw) throw new Error("Google Sheets credentials are not configured");
  return JSON.parse(raw);
}

async function accessToken() {
  if (cachedToken && cachedTokenExpiry > Date.now() + 60_000) return cachedToken;
  const config = credentials();
  const response = await fetch(config.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      refresh_token: config.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`Google authentication failed (${response.status})`);
  const data = await response.json();
  cachedToken = data.access_token;
  cachedTokenExpiry = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function google(path, options = {}) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${path}`, {
    ...options,
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`Google Sheets request failed (${response.status}): ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

const numberValue = (value) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};
const boolValue = (value) => ["true", "1", "yes", "live", "published"].includes(String(value ?? "").trim().toLowerCase());
const cell = (row, headers, ...names) => {
  for (const name of names) {
    const index = headers.indexOf(name);
    if (index >= 0) return row[index] ?? "";
  }
  return "";
};
const categorySlug = (value) => categoryMap[String(value || "").trim().toLowerCase()] || String(value || "accessories").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
const imageValue = (value) => {
  const raw = String(value || "").trim();
  const formula = raw.match(/^=IMAGE\(["']([^"']+)/i);
  return formula?.[1] || raw;
};

export async function readProducts() {
  const range = encodeURIComponent(`${SHEET_TAB}!A1:ZZ`);
  const data = await google(`/values/${range}?valueRenderOption=FORMATTED_VALUE`);
  const values = data.values || [];
  const headers = values[0] || [];
  const rows = values.slice(1);
  const products = rows.map((row, index) => {
    const priceKes = numberValue(cell(row, headers, "Price Kenya (Ksh)", "Selling Price (KES)", "Sell KES"));
    const priceCny = numberValue(cell(row, headers, "Price Kenya (CNY)", "Selling Price (CNY)", "Sell CNY"));
    const sku = String(cell(row, headers, "SKU")).trim();
    return {
      rowNumber: index + 2,
      sku,
      name: String(cell(row, headers, "Name")).trim(),
      categorySlug: categorySlug(cell(row, headers, "Category")),
      description: String(cell(row, headers, "Description")).trim(),
      sizes: String(cell(row, headers, "Sizes")).trim(),
      colors: String(cell(row, headers, "Colors")).trim(),
      costCny: numberValue(cell(row, headers, "Cost China (CNY)", "Cost Price (CNY)", "Cost CNY")),
      costKes: numberValue(cell(row, headers, "Cost China (Ksh)", "Cost KES")),
      priceCny,
      priceKes,
      priceUsd: numberValue(cell(row, headers, "Selling Price (USD)", "Price (USD)")) || Math.round((priceKes / 129.5) * 100) / 100,
      status: String(cell(row, headers, "Status") || "Out of Stock"),
      stock: String(cell(row, headers, "Stock") || "0"),
      image: imageValue(cell(row, headers, "Image", "Image URL")),
      websiteVisible: boolValue(cell(row, headers, "Website Visible")),
    };
  }).filter((product) => product.sku && product.name);
  return { headers, products };
}

function columnName(number) {
  let name = "";
  for (let value = number; value > 0; value = Math.floor((value - 1) / 26)) name = String.fromCharCode(65 + ((value - 1) % 26)) + name;
  return name;
}

async function ensureHeader(headers, label) {
  let index = headers.indexOf(label);
  if (index >= 0) return index;
  headers.push(label);
  index = headers.length - 1;
  const range = encodeURIComponent(`${SHEET_TAB}!${columnName(index + 1)}1`);
  await google(`/values/${range}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [[label]] }) });
  return index;
}

async function ensureAnyHeader(headers, labels) {
  const existing = labels.map((label) => headers.indexOf(label)).find((index) => index >= 0);
  return existing ?? ensureHeader(headers, labels[0]);
}

export async function saveProduct(product) {
  const { headers, products } = await readProducts();
  const fields = [
    [["SKU"], product.sku], [["Name"], product.name], [["Category"], product.categorySlug],
    [["Description"], product.description || ""], [["Sizes"], product.sizes || ""], [["Colors"], product.colors || ""],
    [["Cost China (CNY)", "Cost Price (CNY)", "Cost CNY"], product.costCny || 0],
    [["Cost China (Ksh)", "Cost KES"], product.costKes || 0],
    [["Price Kenya (CNY)", "Selling Price (CNY)", "Sell CNY"], product.priceCny || 0],
    [["Price Kenya (Ksh)", "Selling Price (KES)", "Sell KES"], product.priceKes || 0],
    [["Selling Price (USD)", "Price (USD)"], product.priceUsd || 0],
    [["Status"], product.status || "Out of Stock"], [["Stock"], product.stock || "0"],
    [["Image", "Image URL"], product.image || ""], [["Website Visible"], product.websiteVisible ? "TRUE" : "FALSE"],
  ];
  for (const [candidates] of fields) await ensureAnyHeader(headers, candidates);
  const existing = products.find((item) => item.sku.toLowerCase() === String(product.sku).toLowerCase());
  if (!existing) {
    const row = Array(headers.length).fill("");
    for (const [candidates, value] of fields) {
      const index = candidates.map((name) => headers.indexOf(name)).find((candidate) => candidate >= 0);
      if (index >= 0) row[index] = value;
    }
    const range = encodeURIComponent(`${SHEET_TAB}!A:ZZ`);
    await google(`/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, { method: "POST", body: JSON.stringify({ values: [row] }) });
  } else {
    const data = [];
    for (const [candidates, value] of fields) {
      const index = candidates.map((name) => headers.indexOf(name)).find((candidate) => candidate >= 0);
      if (index >= 0) data.push({ range: `${SHEET_TAB}!${columnName(index + 1)}${existing.rowNumber}`, values: [[value]] });
    }
    await google(`/values:batchUpdate`, { method: "POST", body: JSON.stringify({ valueInputOption: "USER_ENTERED", data }) });
  }
  return product;
}

export async function triggerStorefrontBuild() {
  const hook = env("KARIBU_BUILD_HOOK");
  if (!hook) return false;
  const response = await fetch(hook, { method: "POST" });
  return response.ok;
}
