import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ProductGallery from "@/components/product-gallery";
import CatalogProductConfigurator from "@/components/catalog-product-configurator";
import type { CatalogProduct, Department } from "@/lib/shop-catalog";
import { formatKes } from "@/lib/shop-catalog";
import type { ProductPageDetails } from "@/lib/product-page-details";

type Props = {
  product: CatalogProduct;
  details: ProductPageDetails;
  department?: Department;
  related: CatalogProduct[];
};

const isAvailable = (product: CatalogProduct) => product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;

export default function CatalogProductTemplate({ product, details, department, related }: Props) {
  const available = isAvailable(product);
  const categoryHref = department ? `/shop/${department.slug}/${product.categorySlug}` : "/shop";

  return <main className="inner-page club-product catalog-standard-product" id="page-content">
    <div className="product-breadcrumb"><a href={categoryHref}><ArrowLeft size={16}/> {product.categoryLabel}</a></div>
    <section className="club-purchase" id="product-order">
      <ProductGallery images={details.gallery} note={details.galleryNote}/>
      <div className="club-buy-panel">
        <p className="micro">{details.brand.toUpperCase()} · {product.categoryLabel.toUpperCase()} · {product.sku}</p>
        <h1>{product.name}</h1>
        <div className={`catalog-stock ${available ? "available" : "unavailable"}`}><span/>{available ? `In stock in Kenya · ${product.stock} available` : "Currently out of stock"}</div>
        <p className="club-intro">{details.intro}</p>
        <div className="club-price">{formatKes(product.priceKes)}<span>¥{product.priceCny.toLocaleString("en-US")} RMB · ${product.priceUsd.toLocaleString("en-US")} USD</span></div>
        <dl className="club-set">
          <div><dt>Listed options</dt><dd>{product.sizes || "Confirm with us"}</dd></div>
          <div><dt>Colour / finish</dt><dd>{product.colors || "Confirm with us"}</dd></div>
        </dl>
        <CatalogProductConfigurator name={product.name} sku={product.sku} price={formatKes(product.priceKes)} available={available} configuration={details.configuration}/>
        <a className="club-spec-link" href="#product-specifications">Explore specifications ↓</a>
      </div>
    </section>

    <nav className="club-section-nav" aria-label="Product sections">
      <a href="#product-overview">Overview</a>
      <a href="#product-features">Key details</a>
      <a href="#product-specifications">Specifications</a>
      <a href="#related-products">Related products</a>
      <a href="#product-order">Choose your setup ↑</a>
    </nav>

    <section className="club-editorial" id="product-overview">
      <div className="club-editorial-heading">
        <p className="micro">{details.overviewEyebrow}</p>
        <h2>{details.overviewTitle}</h2>
        {details.overviewBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="club-lifestyle product-overview-visual"><Image unoptimized src={details.overviewImage} alt={`${product.name} product detail`} width={900} height={900}/></div>
    </section>

    <section className="club-feature-grid" id="product-features">
      {details.features.map((feature, index) => <article key={feature.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
    </section>

    <section className="club-detail-pair">
      <Image unoptimized src={details.detailImage} alt={`${product.name} closer view`} width={900} height={900}/>
      <div><p className="micro">{details.detailEyebrow}</p><h2>{details.detailTitle}</h2>{details.detailBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a href="#product-order">Tell us what you need ↗</a></div>
    </section>

    <section className="club-specs" id="product-specifications">
      <p className="micro">REFERENCE INFORMATION</p>
      <h2>{details.specTitle}</h2>
      <p>{details.specIntro}</p>
      <div className="product-spec-table-wrap"><table><thead><tr>{details.specs.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{details.specs.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>
      {details.source && <a className="club-source" href={details.source.url} target="_blank" rel="noreferrer">Source: {details.source.label} ↗</a>}
    </section>

    {details.equipment && <section className="product-equipment-section">
      <div><p className="micro">SHAFTS, FLEX AND GRIP</p><h2>COMPLETE THE SETUP.</h2><p>These are manufacturer references, not a promise of current Karibu stock. Confirm the exact components fitted to the available set.</p></div>
      <div className="product-equipment-grid">{details.equipment.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>}

    <section className="product-related" id="related-products">
      <div className="store-section-heading"><p className="micro">KEEP EXPLORING</p><h2>RELATED PRODUCTS.</h2></div>
      <div className="store-product-grid">{related.map((item) => {
        const relatedAvailable = isAvailable(item);
        return <a className="store-product-card" href={`/shop/product/${item.slug}`} key={item.sku}>
          <div className="store-product-image"><img src={item.images[0] ?? "/images/clubs.jpg"} alt={item.name}/><span className={relatedAvailable ? "available" : "unavailable"}>{relatedAvailable ? "In stock" : "Out of stock"}</span></div>
          <div className="store-product-copy"><p className="micro">{item.categoryLabel}</p><h3>{item.name}</h3><p className="store-price">{formatKes(item.priceKes)}</p><span>View product <ArrowUpRight size={14}/></span></div>
        </a>;
      })}</div>
    </section>
  </main>;
}
