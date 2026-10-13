"use client";

import { formatKes, type CatalogProduct } from "@/lib/shop-catalog";
import { stockSetupLabel } from "@/lib/iron-options";
import { useLiveProduct } from "@/components/use-live-products";

export default function LiveProductCardPrice({ product }: { product: CatalogProduct }) {
  const live=useLiveProduct(product);

  return <>
    <p className="store-price" data-live-card-price={live.sku}>{formatKes(live.priceKes)}</p>
    {stockSetupLabel(live) && <p className="stock-setup" data-stock-setup={live.sku}>{stockSetupLabel(live)}</p>}
  </>;
}
