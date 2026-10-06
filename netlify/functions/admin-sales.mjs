import { isAuthorized, json } from "./_shared/auth.mjs";
import { SaleError, readSales, saveSale } from "./_shared/sales.mjs";

export default async function handler(request) {
  if (!(await isAuthorized(request))) return json({ error: "Unauthorized" }, 401);
  try {
    if (request.method === "GET") {
      const { sales } = await readSales();
      return json({ sales: sales.map(({ rowNumber, ...sale }) => sale) });
    }
    if (!["POST", "PUT"].includes(request.method)) return json({ error: "Method not allowed" }, 405, { allow: "GET, POST, PUT" });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return json({ error: "Use the admin page to record sales." }, 403);
    const raw = await request.text();
    if (raw.length > 16_000) return json({ error: "Sale record is too large." }, 413);
    let input;
    try { input = JSON.parse(raw); } catch { return json({ error: "Enter a valid sale record." }, 400); }
    const sale = await saveSale(input, request.method);
    return json({ saved: true, sale }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    if (error instanceof SaleError) return json({ error: error.message }, error.status);
    console.error("Sales storage request failed");
    return json({ error: "Unable to access sales records. Please try again." }, 500);
  }
}

export const config = { path: "/api/admin-sales" };
