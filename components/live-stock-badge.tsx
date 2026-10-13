"use client";
import { productIsInStock, type CatalogProduct } from "@/lib/shop-catalog";
import { useLiveProduct } from "@/components/use-live-products";
export default function LiveStockBadge({product}:{product:CatalogProduct}) {
  const live=useLiveProduct(product);
  const available=productIsInStock(live);
  return <span className={available ? "available" : "unavailable"} data-live-card-stock={product.sku}>{available ? "IN STOCK" : "OUT OF STOCK"}</span>;
}
