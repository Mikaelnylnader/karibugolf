"use client";
import { useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/shop-catalog";

// One catalogue read per document, shared by purchase panels and stock cards.
let liveRequest:Promise<Partial<CatalogProduct>[]>|undefined;
function loadLiveProducts():Promise<Partial<CatalogProduct>[]> {
  return liveRequest ??= fetch("/api/storefront-products",{cache:"no-store"}).then(async response=>{
    if (!response.ok) throw new Error(`Live inventory HTTP ${response.status}`);
    const payload=await response.json() as {products?:Partial<CatalogProduct>[]};
    if (!Array.isArray(payload.products)) throw new Error("Invalid live inventory response");
    return payload.products;
  });
}
export function useLiveProducts(initial:CatalogProduct[]) {
  const [products,setProducts]=useState(initial);
  useEffect(()=>{
    let active=true;
    loadLiveProducts().then(records=>{
      if (!active) return;
      const bySku=new Map(records.map(record=>[record.sku?.toUpperCase(),record]));
      setProducts(initial.map(product=>{
        const record=bySku.get(product.sku.toUpperCase());
        return record ? {...product,...record} : {...product,status:"Out of Stock",stock:"0"};
      }));
    }).catch(()=>{ /* The reviewed static catalogue is the offline fallback. */ });
    return ()=>{active=false;};
  },[initial]);
  return products;
}
export function useLiveProduct(product:CatalogProduct) {
  const initial=useMemo(()=>[product],[product]);
  return useLiveProducts(initial)[0] ?? product;
}
