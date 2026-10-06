import { google } from "./sheets.mjs";

const TAB = "Sales";
const HEADERS = ["Sale ID", "Sale date", "Product SKU", "Item / clubs sold", "Client ID", "Customer name", "Quantity", "Actual unit price (KES)", "Total sale (KES)", "Notes", "Status", "Created at", "Updated at"];
const KEYS = ["id", "date", "productSku", "productName", "clientId", "customerName", "quantity", "unitPriceKes", "totalKes", "notes", "status", "createdAt", "updatedAt"];
const range = (cells) => encodeURIComponent(`'${TAB}'!${cells}`);
const uuid = (value) => typeof value === "string" && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value);

export class SaleError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function validateSale(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new SaleError("Enter a sale record.");
  const sale = {};
  for (const [key, limit] of [["date", 10], ["productSku", 40], ["productName", 200], ["clientId", 36], ["customerName", 200], ["notes", 2000], ["status", 10]]) {
    if (input[key] != null && typeof input[key] !== "string") throw new SaleError(`Invalid ${key} field.`);
    sale[key] = (input[key] || "").trim();
    if (sale[key].length > limit || /\p{Cc}/u.test(sale[key].replace(/[\r\n\t]/g, ""))) throw new SaleError(`Invalid ${key} field.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sale.date) || !Number.isFinite(Date.parse(`${sale.date}T12:00:00Z`)) || new Date(`${sale.date}T12:00:00Z`).toISOString().slice(0, 10) !== sale.date) throw new SaleError("Choose a valid sale date.");
  if (!sale.productName) throw new SaleError("Enter the item or clubs sold.");
  if (sale.productSku && !/^[A-Z0-9][A-Z0-9_-]{2,39}$/i.test(sale.productSku)) throw new SaleError("Choose a valid product.");
  if (sale.clientId && !uuid(sale.clientId)) throw new SaleError("Choose a valid client.");
  if (sale.clientId && !sale.customerName) throw new SaleError("Enter the client's name.");
  if (!["string", "number"].includes(typeof input.quantity) || !["string", "number"].includes(typeof input.unitPriceKes)) throw new SaleError("Enter a valid quantity and selling price.");
  const quantity = String(input.quantity ?? "").trim();
  if (!/^\d+$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > 1000) throw new SaleError("Quantity must be a whole number between 1 and 1,000.");
  const price = String(input.unitPriceKes ?? "").trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(price) || Number(price) <= 0 || Number(price) > 100_000_000) throw new SaleError("Enter the actual selling price in KSh, greater than zero, with up to two decimal places.");
  sale.quantity = Number(quantity);
  sale.unitPriceKes = Number(price);
  sale.totalKes = Math.round(sale.unitPriceKes * 100) * sale.quantity / 100;
  sale.status ||= "completed";
  if (!["completed", "void"].includes(sale.status)) throw new SaleError("Choose Completed or Voided for the sale status.");
  return sale;
}

async function findTab() {
  const data = await google("?fields=sheets(properties(sheetId,title))");
  return data.sheets?.some((sheet) => sheet.properties.title === TAB);
}

export async function readSales() {
  if (!(await findTab())) return { sales: [], exists: false, initialized: false };
  const data = await google(`/values/${range("A1:M")}?valueRenderOption=UNFORMATTED_VALUE`);
  const [headers = [], ...rows] = data.values || [];
  if (!headers.length && !rows.length) return { sales: [], exists: true, initialized: false };
  if (!HEADERS.every((label, index) => headers[index] === label)) throw new Error("Sales sheet column headings have changed.");
  const sales = rows.map((row, index) => {
    if (!row[0]) return null;
    const record = Object.fromEntries(KEYS.map((key, column) => [key, row[column] ?? ""]));
    // Recompute totals from the recorded price and quantity; do not trust a
    // submitted total or a manually changed spreadsheet total cell.
    const values = validateSale(record);
    return { ...record, ...values, rowNumber: index + 2 };
  }).filter(Boolean);
  return { sales, exists: true, initialized: true };
}

export async function saveSale(input, method) {
  const values = validateSale(input);
  const editing = method === "PUT";
  if ((editing || input.id != null) && !uuid(input.id)) throw new SaleError("Choose a valid sale record.");
  const { sales, exists, initialized } = await readSales();
  const existing = input.id ? sales.find((sale) => sale.id === input.id) : null;
  if (editing && !existing) throw new SaleError("This sale could not be found. Refresh the sales list.", 404);
  if (!editing && existing) {
    if (!Object.keys(values).every((key) => values[key] === existing[key])) throw new SaleError("This sale was already saved. Edit it from the sales list.", 409);
    const { rowNumber, ...sale } = existing;
    return sale;
  }
  const now = new Date().toISOString();
  const sale = { ...values, id: existing?.id || input.id || crypto.randomUUID(), createdAt: existing?.createdAt || now, updatedAt: now };
  if (!exists) {
    try {
      await google(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: [{ addSheet: { properties: { title: TAB, gridProperties: { frozenRowCount: 1 } } } }] }) });
    } catch (error) { if (!(await findTab())) throw error; }
  }
  if (!initialized) await google(`/values/${range("A1:M1")}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [HEADERS] }) });
  const row = KEYS.map((key) => sale[key]);
  const target = existing ? `/values/${range(`A${existing.rowNumber}:M${existing.rowNumber}`)}?valueInputOption=RAW` : `/values/${range("A:M")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  await google(target, { method: existing ? "PUT" : "POST", body: JSON.stringify({ values: [row] }) });
  return sale;
}
