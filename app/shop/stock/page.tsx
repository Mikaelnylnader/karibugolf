import type { Metadata } from "next";
import { inStockProducts } from "@/lib/shop-catalog";
import StockRoom from "@/components/stock-room";
import "../scrollcraft.css";
import "./stock.css";

export const metadata: Metadata = {
  title: "Golf Equipment In Stock in East Africa | Karibu Golf",
  description: "See golf clubs currently in stock at Karibu Golf in Nairobi, with live prices, quantities and delivery enquiries across East Africa.",
  alternates: { canonical: "https://karibugolf.com/shop/stock/" },
};

export default function StockPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Golf equipment in stock at Karibu Golf East Africa",
    numberOfItems: inStockProducts.length,
    itemListElement: inStockProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://karibugolf.com/shop/product/${product.slug}/`,
      name: product.name,
    })),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    <StockRoom products={inStockProducts} />
  </>;
}
