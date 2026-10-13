import type { CatalogProduct } from "@/lib/shop-catalog";

export const ironShaftOptions = ["Steel", "Graphite"];
export const ironFlexOptions = ["Regular (R)", "Stiff (S)", "Senior (A)"];
export type StockMatch = "in-stock" | "out-of-stock" | "unconfirmed";
export type IronStock = { shaftMaterial?: string; shaftFlex?: string };
export const flexCode = (value?: string) => {
  const flex = String(value || "").trim().toUpperCase();
  if (flex === "R" || flex.startsWith("REGULAR")) return "R";
  if (flex === "S" || flex.startsWith("STIFF")) return "S";
  if (["A", "SR", "SENIOR"].includes(flex) || flex.startsWith("SENIOR")) return "A";
  return "";
};
export const flexLabel = (value?: string) => ironFlexOptions.find(label=>flexCode(label)===flexCode(value)) || "";
export const ironStockMatch = (available:boolean, stock:IronStock, selected:Record<string,string>):StockMatch => {
  if (!available) return "out-of-stock";
  const flex=flexCode(stock.shaftFlex);
  if (!stock.shaftMaterial || !flex) return "unconfirmed";
  return selected.Shaft?.toLowerCase()===stock.shaftMaterial.toLowerCase() && flexCode(selected.Flex)===flex ? "in-stock" : "out-of-stock";
};
export const initialIronSelection = (stock:IronStock) => ({
  ...(ironShaftOptions.includes(stock.shaftMaterial || "") ? {Shaft:stock.shaftMaterial!} : {}),
  ...(flexLabel(stock.shaftFlex) ? {Flex:flexLabel(stock.shaftFlex)} : {}),
});
export const stockSetupLabel = (product:Pick<CatalogProduct,"categorySlug"|"sizes"|"shaftMaterial"|"shaftFlex">) => {
  if (!["golf_irons","drivers","woods","hybrids","wedges","junior_sets"].includes(product.categorySlug)) return "";
  const setup=[product.sizes.replace(/(\d)\s*-\s*PW/g,"$1–PW"),product.shaftMaterial,flexLabel(product.shaftFlex)].filter(Boolean);
  if (product.categorySlug==="golf_irons" && (!product.shaftMaterial || !flexCode(product.shaftFlex))) setup.push("Shaft/flex to confirm");
  return setup.join(" · ");
};
