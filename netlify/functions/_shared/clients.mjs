import { google } from "./sheets.mjs";

const TAB = "Clients";
const HEADERS = ["Client ID", "First name", "Last name", "Company", "Email", "Phone number", "WhatsApp", "Items received / notes", "Created at", "Updated at"];
const KEYS = ["id", "firstName", "lastName", "company", "email", "phone", "whatsapp", "notes", "createdAt", "updatedAt"];
const LEGACY_HEADERS = ["Client ID", "First name", "Last name", "Email", "Phone number", "WhatsApp", "Items received / notes", "Created at", "Updated at"];
const LEGACY_KEYS = ["id", "firstName", "lastName", "email", "phone", "whatsapp", "notes", "createdAt", "updatedAt"];
const range = (cells) => encodeURIComponent(`'${TAB}'!${cells}`);

export class ClientError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function validateClient(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ClientError("Enter a client record.");
  const client = {};
  for (const [key, limit] of [["firstName", 100], ["lastName", 100], ["company", 200], ["email", 254], ["phone", 40], ["whatsapp", 40], ["notes", 2000]]) {
    if (input[key] != null && typeof input[key] !== "string") throw new ClientError(`Invalid ${key} field.`);
    client[key] = (input[key] || "").trim();
    if (client[key].length > limit) throw new ClientError(`${key} is too long (maximum ${limit} characters).`);
    if (/\p{Cc}/u.test(client[key].replace(/[\r\n\t]/g, ""))) throw new ClientError(`Invalid characters in ${key}.`);
  }
  if (!client.firstName || !client.lastName) throw new ClientError("First name and last name are required.");
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) throw new ClientError("Enter a valid email address.");
  for (const key of ["phone", "whatsapp"]) {
    if (client[key] && (!/^\+?[\d\s().-]+$/.test(client[key]) || !/^\d{7,15}$/.test(phoneDigits(client[key])))) {
      throw new ClientError(`Enter a valid ${key === "phone" ? "phone number" : "WhatsApp number"} with 7–15 digits, including the country code.`);
    }
  }
  return client;
}

const phoneDigits = (value) => String(value || "").replace(/\D/g, "");

async function findTab() {
  const metadata = await google("?fields=sheets(properties(sheetId,title))");
  return metadata.sheets?.find((sheet) => sheet.properties.title === TAB)?.properties;
}

export async function readClients() {
  if (!(await findTab())) return { clients: [], exists: false, initialized: false };
  const data = await google(`/values/${range("A1:J")}?valueRenderOption=UNFORMATTED_VALUE`);
  const [headers = [], ...rows] = data.values || [];
  if (!headers.length && !rows.length) return { clients: [], exists: true, initialized: false };
  const current = HEADERS.every((label, index) => headers[index] === label);
  const legacy = LEGACY_HEADERS.every((label, index) => headers[index] === label);
  if (!current && !legacy) {
    throw new Error("The Clients sheet columns do not match the admin. Restore the original column headings before saving.");
  }
  const keys = current ? KEYS : LEGACY_KEYS;
  return {
    exists: true,
    initialized: true,
    legacy,
    clients: rows.map((row, index) => ({ company: "", ...Object.fromEntries(keys.map((key, column) => [key, String(row[column] ?? "")])), rowNumber: index + 2 })).filter((client) => client.id),
  };
}

async function upgradeLegacyClients(clients) {
  const values = [HEADERS, ...clients.map((client) => KEYS.map((key) => client[key] ?? ""))];
  await google(`/values/${range(`A1:J${values.length}`)}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values }) });
}

async function createTab() {
  try {
    await google(":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: TAB, gridProperties: { frozenRowCount: 1 } } } }] }),
    });
  } catch (error) {
    // Another admin may have created the tab while this request was running.
    if (!(await findTab())) throw error;
    return;
  }
}

export async function saveClient(input, method) {
  const values = validateClient(input);
  const editing = method === "PUT";
  if (editing && (typeof input.id !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(input.id))) {
    throw new ClientError("Choose an existing client to edit.");
  }
  const { clients, exists, initialized, legacy } = await readClients();
  const existing = editing ? clients.find((client) => client.id === input.id) : null;
  if (editing && !existing) throw new ClientError("This client could not be found. Refresh the client list.", 404);
  const contacts = [values.phone, values.whatsapp].filter(Boolean).map(phoneDigits);
  const duplicate = clients.find((client) => client.id !== existing?.id && (
    (values.email && client.email.toLowerCase() === values.email.toLowerCase()) ||
    [client.phone, client.whatsapp].filter(Boolean).some((phone) => contacts.includes(phoneDigits(phone)))
  ));
  if (duplicate) throw new ClientError("A client with this email or number already exists. Search the client list and edit their record.", 409);
  const now = new Date().toISOString();
  const client = { ...values, id: existing?.id || crypto.randomUUID(), createdAt: existing?.createdAt || now, updatedAt: now };
  const row = KEYS.map((key) => client[key]);
  if (!exists) await createTab();
  if (!initialized) await google(`/values/${range("A1:J1")}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [HEADERS] }) });
  else if (legacy) await upgradeLegacyClients(clients);
  if (existing) {
    await google(`/values/${range(`A${existing.rowNumber}:J${existing.rowNumber}`)}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [row] }) });
  } else {
    // RAW preserves plus signs, leading zeroes and notes beginning with '=' as text.
    await google(`/values/${range("A:J")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: "POST", body: JSON.stringify({ values: [row] }) });
  }
  return client;
}
