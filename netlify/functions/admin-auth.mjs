import { clearSessionCookie, createSessionCookie, isAuthorized, json, passwordMatches } from "./_shared/auth.mjs";

export default async function handler(request) {
  if (request.method === "GET") return json({ authenticated: await isAuthorized(request) });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = await request.json().catch(() => ({}));
  if (body.action === "logout") return json({ authenticated: false }, 200, { "set-cookie": clearSessionCookie() });
  if (!(await passwordMatches(body.password))) return json({ error: "Incorrect password" }, 401);
  return json({ authenticated: true }, 200, { "set-cookie": await createSessionCookie() });
}

export const config = { path: "/api/admin-auth" };
