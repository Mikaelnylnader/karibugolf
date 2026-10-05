"use client";

import { useEffect, useState } from "react";
import CatalogProductConfigurator from "@/components/catalog-product-configurator";
import type { ProductConfiguration } from "@/lib/product-page-details";
import { formatKes, type CatalogProduct } from "@/lib/shop-catalog";

type LiveProduct = Pick<CatalogProduct, "sku" | "priceKes" | "priceCny" | "priceUsd" | "status" | "stock">;

type Props = {
  product: CatalogProduct;
  configuration: ProductConfiguration[];
};

const availableNow = (product: LiveProduct) => product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;

export default function LiveProductPurchase({ product, configuration }: Props) {
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
      .catch((error) => { if (error.name !== "AbortError") console.warn("Live product information unavailable", error); });
    return () => controller.abort();
  }, [product.sku]);

  const available = availableNow(live);
  const price = formatKes(live.priceKes);

  return <>
    <div className={`catalog-stock ${available ? "available" : "unavailable"}`} data-live-stock={live.sku}>
      <span/>{available ? `In stock in Nairobi · ${live.stock} available` : "Currently out of stock"}
    </div>
    <p className="club-intro">{product.description}</p>
    <div className="club-price" data-live-price={live.sku}>{price}</div>
    <dl className="club-set">
      <div><dt>Listed options</dt><dd>{product.sizes || "Confirm with us"}</dd></div>
      <div><dt>Colour / finish</dt><dd>{product.colors || "Confirm with us"}</dd></div>
    </dl>
    <CatalogProductConfigurator name={product.name} sku={product.sku} price={price} available={available} configuration={configuration}/>
  </>;
}
