// Aggregate recorded prices in integer cents so summaries remain exact.
export function salesFigures(records, today = new Date()) {
  const completed = records.filter((sale) => sale.status === "completed");
  const cents = (sale) => Math.round(Number(sale.unitPriceKes) * 100) * Number(sale.quantity);
  const totalCents = completed.reduce((sum, sale) => sum + cents(sale), 0);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1, 12);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: date.toLocaleDateString("en-KE", { month: "short", year: "2-digit" }), totalKes: completed.filter((sale) => sale.date.startsWith(key)).reduce((sum, sale) => sum + cents(sale), 0) / 100 };
  });
  const grouped = new Map();
  for (const sale of completed) {
    const key = sale.productSku || sale.productName.toLowerCase();
    const item = grouped.get(key) || { name: sale.productName, units: 0, cents: 0 };
    item.units += Number(sale.quantity);
    item.cents += cents(sale);
    grouped.set(key, item);
  }
  return {
    totalKes: totalCents / 100,
    count: completed.length,
    units: completed.reduce((sum, sale) => sum + Number(sale.quantity), 0),
    averageKes: completed.length ? Math.round(totalCents / completed.length) / 100 : 0,
    months,
    topProducts: [...grouped.values()].sort((a, b) => b.cents - a.cents).slice(0, 5).map((item) => ({ name: item.name, units: item.units, totalKes: item.cents / 100 })),
  };
}
