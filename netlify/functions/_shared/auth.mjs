const encoder = new TextEncoder();

export function env(name) {
  return globalThis.Netlify?.env?.get(name) ?? process.env[name] ?? "";
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value) {
  const secret = env("KARIBU_ADMIN_SECRET");
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function safeEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

export async function createSessionCookie() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const value = `${expires}.${await sign(String(expires))}`;
  return `karibu_admin=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}

export function clearSessionCookie() {
  return "karibu_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

export async function isAuthorized(request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)karibu_admin=([^;]+)/);
  if (!match) return false;
  const [expiresRaw, signature] = decodeURIComponent(match[1]).split(".");
  const expires = Number(expiresRaw);
  if (!expires || expires < Date.now()) return false;
  return safeEqual(signature, await sign(expiresRaw));
}

export async function passwordMatches(candidate) {
  const expected = env("KARIBU_ADMIN_PASSWORD");
  if (!expected) return false;
  const digest = async (value) => bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return safeEqual(await digest(String(candidate ?? "").trim()), await digest(expected));
}
