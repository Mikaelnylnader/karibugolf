/* oxlint-disable next/no-img-element -- The static catalogue uses local and exported product paths without an image service. */
import { type CatalogProduct, productDisplayImage } from "@/lib/shop-catalog";
import LiveProductCardPrice from "@/components/live-product-card-price";

export default function ShopProductCard({ product }: { product: CatalogProduct }) {
  const available = product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;
  return <a className="store-product-card" href={`/shop/product/${product.slug}`}>
    <div className="store-product-image">
      <img src={productDisplayImage(product)} alt={product.name} loading="lazy"/>
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
