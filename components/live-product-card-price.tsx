"use client";

import { useEffect, useState } from "react";
import { formatKes, type CatalogProduct } from "@/lib/shop-catalog";

type LiveProduct = Pick<CatalogProduct, "sku" | "priceKes" | "priceCny" | "priceUsd">;

export default function LiveProductCardPrice({ product }: { product: CatalogProduct }) {
  const [live, setLive] = useState<LiveProduct>(product);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/storefront-products?sku=${encodeURIComponent(product.sku)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as { products?: LiveProduct[] };
      })
      .then((payload) => {
        const current = payload.products?.[0];
        if (current) setLive(current);
      })
      .catch((error) => { if (error.name !== "AbortError") console.warn("Live product price unavailable", error); });
    return () => controller.abort();
  }, [product.sku]);

  return <>
    <p className="store-price" data-live-card-price={live.sku}>{formatKes(live.priceKes)}</p>
  </>;
}
