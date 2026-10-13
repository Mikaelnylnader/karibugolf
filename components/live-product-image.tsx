"use client";
/* oxlint-disable next/no-img-element -- Exported thumbnails use local/API image paths without a Next image optimizer. */

import { useState, type ImgHTMLAttributes } from "react";
import { productDisplayImage, type CatalogProduct } from "@/lib/shop-catalog";
import { useLiveProduct } from "@/components/use-live-products";

type LiveProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  product: CatalogProduct;
};

export default function LiveProductImage({ product, alt, onError, ...props }: LiveProductImageProps) {
  const fallback = productDisplayImage(product);
  const live=useLiveProduct(product);
  const preferred=live.image?.trim() || fallback;
  const [failed,setFailed]=useState("");
  const src=preferred===failed ? fallback : preferred;

  return <img
    {...props}
    src={src}
    alt={alt ?? product.name}
    data-live-product-image={product.sku}
    onError={(event) => {
      if (src !== fallback) setFailed(preferred);
      onError?.(event);
    }}
  />;
}
