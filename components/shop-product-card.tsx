import type { CatalogProduct } from "@/lib/shop-catalog";
import { formatKes } from "@/lib/shop-catalog";

export default function ShopProductCard({ product }: { product: CatalogProduct }) {
  const available = product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;
  return <a className="store-product-card" href={`/shop/product/${product.slug}`}>
    <div className="store-product-image">
      <img src={product.images[0] || "/images/clubs.jpg"} alt={product.name} loading="lazy"/>
      <span className={available ? "available" : "unavailable"}>{available ? "IN STOCK" : "OUT OF STOCK"}</span>
    </div>
    <div className="store-product-copy">
      <p className="micro">{product.categoryLabel} · {product.sku}</p>
      <h3>{product.name}</h3>
      <p className="store-price">{formatKes(product.priceKes)}</p>
      {(product.priceCny > 0 || product.priceUsd > 0) && <p className="store-currencies">{product.priceCny > 0 ? `¥${product.priceCny.toLocaleString("en-US")}` : ""}{product.priceCny > 0 && product.priceUsd > 0 ? " · " : ""}{product.priceUsd > 0 ? `$${product.priceUsd.toLocaleString("en-US")}` : ""}</p>}
      <span>View product ↗</span>
    </div>
  </a>;
}
