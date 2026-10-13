"use client";

import { useState } from "react";
import CatalogProductConfigurator from "@/components/catalog-product-configurator";
import type { ProductConfiguration } from "@/lib/product-page-details";
import { formatKes, type CatalogProduct } from "@/lib/shop-catalog";
import { stockSetupLabel, type StockMatch } from "@/lib/iron-options";
import { useLiveProduct } from "@/components/use-live-products";

type LiveProduct = Pick<CatalogProduct, "sku" | "priceKes" | "priceCny" | "priceUsd" | "status" | "stock" | "shaftFlex" | "shaftMaterial">;

type Props = {
  product: CatalogProduct;
  configuration: ProductConfiguration[];
};

const availableNow = (product: LiveProduct) => product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;

export default function LiveProductPurchase({ product, configuration }: Props) {
  const live=useLiveProduct(product);
  const isIron=product.categorySlug==="golf_irons";
  const [selectedMatch,setSelectedMatch]=useState<StockMatch>(availableNow(product) ? product.shaftMaterial && product.shaftFlex ? "in-stock" : "unconfirmed" : "out-of-stock");

  const available = availableNow(live);
  const price = formatKes(live.priceKes);
  const selectedAvailable=isIron ? selectedMatch==="in-stock" : available;
  const stockSetup=stockSetupLabel(live);

  return <>
    <div className={`catalog-stock ${selectedAvailable ? "available" : "unavailable"}`} data-live-stock={live.sku}>
      <span/>{selectedAvailable ? `In stock in Nairobi · ${live.stock} available` : isIron && available ? selectedMatch==="unconfirmed" ? "In stock · confirm shaft/flex" : "Selected shaft/flex is not currently in stock" : "Currently out of stock"}
    </div>
    {isIron && <p className="current-stock-setup" data-current-stock={live.sku}>{available ? `In stock now: ${stockSetup}` : "No iron setup currently in stock."}</p>}
    <p className="club-intro">{product.description}</p>
    <div className="club-price" data-live-price={live.sku}>{price}</div>
    <dl className={`club-set${isIron ? " iron-set" : ""}`}>
      <div><dt>{isIron ? "Set" : "Listed options"}</dt><dd>{live.sizes || "Confirm with us"}</dd></div>
      <div><dt>Colour / finish</dt><dd>{product.colors || "Confirm with us"}</dd></div>
      {isIron && <div><dt>Options</dt><dd>Steel / Graphite · Regular / Stiff / Senior</dd></div>}
    </dl>
    <CatalogProductConfigurator name={product.name} sku={product.sku} price={price} available={available} configuration={configuration} ironStock={isIron ? live : undefined} onStockMatchChange={isIron ? setSelectedMatch : undefined}/>
  </>;
}
