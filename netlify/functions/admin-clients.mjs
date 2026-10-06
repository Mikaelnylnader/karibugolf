import { isAuthorized, json } from "./_shared/auth.mjs";
import { ClientError, readClients, saveClient } from "./_shared/clients.mjs";

export default async function handler(request) {
  if (!(await isAuthorized(request))) return json({ error: "Unauthorized" }, 401);
  try {
    if (request.method === "GET") {
      const { clients } = await readClients();
      return json({ clients: clients.map(({ rowNumber, ...client }) => client) });
    }
    if (!["POST", "PUT"].includes(request.method)) return json({ error: "Method not allowed" }, 405, { allow: "GET, POST, PUT" });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return json({ error: "Use the admin page to save clients." }, 403);
    const raw = await request.text();
    if (raw.length > 16_000) return json({ error: "Client record is too large." }, 413);
    let input;
    try { input = JSON.parse(raw); } catch { return json({ error: "Enter a valid client record." }, 400); }
    const client = await saveClient(input, request.method);
    return json({ saved: true, client }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    if (error instanceof ClientError) return json({ error: error.message }, error.status);
    // Client names and contact details must not appear in function logs.
    console.error("Client storage request failed");
    return json({ error: "Unable to access the Clients sheet. Please try again." }, 500);
  }
}

export const config = { path: "/api/admin-clients" };
