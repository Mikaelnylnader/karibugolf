"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { productDisplayImage, type CatalogProduct } from "@/lib/shop-catalog";

type LiveProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  product: CatalogProduct;
};

type StorefrontProduct = {
  sku: string;
  image?: string;
};

export default function LiveProductImage({ product, alt, onError, ...props }: LiveProductImageProps) {
  const fallback = productDisplayImage(product);
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/storefront-products?sku=${encodeURIComponent(product.sku)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Live image unavailable")))
      .then((payload: { products?: StorefrontProduct[] }) => {
        const liveImage = payload.products?.[0]?.image?.trim();
        if (liveImage) setSrc(liveImage);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setSrc(fallback);
      });
    return () => controller.abort();
  }, [fallback, product.sku]);

  return <img
    {...props}
    src={src}
    alt={alt ?? product.name}
    data-live-product-image={product.sku}
    onError={(event) => {
      if (src !== fallback) setSrc(fallback);
      onError?.(event);
    }}
  />;
}
