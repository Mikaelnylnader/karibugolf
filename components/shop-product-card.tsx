import type { CatalogProduct } from "@/lib/shop-catalog";
import LiveProductCardPrice from "@/components/live-product-card-price";

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
      <LiveProductCardPrice product={product}/>
      <span>View product ↗</span>
    </div>
  </a>;
}
