import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ProductGallery from "@/components/product-gallery";
import CatalogProductConfigurator from "@/components/catalog-product-configurator";
import ProductScrollShell from "@/components/product-scroll-shell";
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
  const isP790 = product.slug === "gk-ir-tmp";
  const categoryHref = department ? `/shop/${department.slug}/${product.categorySlug}` : "/shop";

  return <ProductScrollShell><main className={`inner-page club-product catalog-standard-product product-scroll-dossier${isP790 ? " product-scroll-featured" : ""}`} id="page-content">
    <div className="product-breadcrumb"><a href={categoryHref}><ArrowLeft size={16}/> {product.categoryLabel}</a></div>
    <section className="club-purchase" id="product-order" data-sc-act="flow">
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

    <section className="product-study" id="product-overview" data-sc-act="pin" data-sc-span={isP790 ? "2.65" : "1.85"} data-sc-drift="#10261d">
      <div className="sc-stage product-study-stage" data-sc-stage>
        <div className="product-study-copy">
          <p className="micro">{details.overviewEyebrow}</p>
          <h2>{details.overviewTitle}</h2>
          <div>{details.overviewBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
        <div className="product-study-visual" aria-label={`${product.name} technical image study`}>
          <figure className="product-study-primary" data-sc-reveal="iris" data-sc-reveal-at="0.03 0.34">
            <Image unoptimized src={details.overviewImage} alt={`${product.name} product detail`} width={900} height={900}/>
          </figure>
          {details.gallery[1] && <figure className="product-study-face" data-sc-reveal="left" data-sc-reveal-at="0.26 0.56" data-sc-parallax="-0.36">
            <Image unoptimized src={details.gallery[1].src} alt={details.gallery[1].alt} width={900} height={900}/>
          </figure>}
          {details.gallery[2] && <figure className="product-study-address" data-sc-reveal="right" data-sc-reveal-at="0.48 0.78" data-sc-parallax="0.28">
            <Image unoptimized src={details.gallery[2].src} alt={details.gallery[2].alt} width={900} height={900}/>
          </figure>}
        </div>
        <div className="product-study-key" aria-hidden="true"><span>Cavity</span><span>Face</span><span>Address</span></div>
      </div>
    </section>

    <section className="product-tech-pan" id="product-features" data-sc-act="pan" data-sc-span="2.35" data-sc-drift="#14110e">
      <div className="sc-stage product-tech-stage" data-sc-stage>
        <div className="product-tech-rail" data-sc-pan="0.02">
          <header><p className="micro">CONSTRUCTION NOTES</p><h2>WHAT IS INSIDE THE CLUB.</h2><p>Move through the verified details that shape speed, feel, launch and turf interaction.</p></header>
          {details.features.map((feature, index) => <article key={feature.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
          <aside aria-hidden="true"><strong>{details.features.length}</strong><span>connected details</span></aside>
        </div>
      </div>
    </section>

    <section className="club-detail-pair product-detail-silence" data-sc-act="flow">
      <div data-sc-reveal="left" data-sc-reveal-at="0.08 0.54"><Image unoptimized src={details.detailImage} alt={`${product.name} closer view`} width={900} height={900}/></div>
      <div><p className="micro">{details.detailEyebrow}</p><h2>{details.detailTitle}</h2>{details.detailBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a href="#product-order">Tell us what you need ↗</a></div>
    </section>

    {isP790 && <section className="product-gap-act" aria-labelledby="product-gap-title" data-sc-act="pin" data-sc-span="3.1" data-sc-dwell="0.12" data-sc-drift="#1f5132">
      <div className="sc-stage product-gap-stage" data-sc-stage>
        <div className="product-gap-image" data-sc-reveal="right" data-sc-reveal-at="0.03 0.28"><Image unoptimized src={details.gallery[1].src} alt={details.gallery[1].alt} width={900} height={900}/></div>
        <div className="product-gap-copy">
          <p className="micro">THE 4–PW SET</p>
          <h2 id="product-gap-title">THE GAPPING SPINE.</h2>
          <p>Each club adds loft with a purposeful progression from long-iron speed to scoring-club control.</p>
          <ol className="product-gap-trace">
            {details.specs.rows.map((row, index) => {
              const from = 0.13 + index * 0.095;
              const to = from + 0.14;
              return <li key={row[0]} data-sc-reveal="left" data-sc-reveal-at={`${from.toFixed(2)} ${to.toFixed(2)}`}><span>{row[0]}</span><strong>{row[1]}</strong><i aria-hidden="true"/></li>;
            })}
          </ol>
        </div>
      </div>
    </section>}

    <section className="club-specs" id="product-specifications" data-sc-act="flow">
      <p className="micro">REFERENCE INFORMATION</p>
      <h2>{details.specTitle}</h2>
      <p>{details.specIntro}</p>
      <div className="product-spec-table-wrap" data-sc-in><table><thead><tr>{details.specs.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{details.specs.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>
      {details.source && <a className="club-source" href={details.source.url} target="_blank" rel="noreferrer">Source: {details.source.label} ↗</a>}
    </section>

    {details.equipment && <section className="product-equipment-section" data-sc-act="flow">
      <div data-sc-in><p className="micro">SHAFTS, FLEX AND GRIP</p><h2>COMPLETE THE SETUP.</h2><p>These are manufacturer references, not a promise of current Karibu stock. Confirm the exact components fitted to the available set.</p></div>
      <div className="product-equipment-grid" data-sc-in data-sc-stagger="55">{details.equipment.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>}

    <section className="product-return-close" data-sc-act="flow">
      <div data-sc-in><p className="micro">YOUR NEXT MOVE</p><h2>CHOOSE THE SETUP. WE WILL CONFIRM THE SET.</h2></div>
      <div><p>Return to the options above, select your preferred hand, shaft and flex, then send the complete request to Karibu Golf.</p><a href="#product-order">Choose your configuration <ArrowUpRight size={18}/></a></div>
    </section>

    <section className="product-related" id="related-products" data-sc-act="flow">
      <div className="store-section-heading"><p className="micro">KEEP EXPLORING</p><h2>RELATED PRODUCTS.</h2></div>
      <div className="store-product-grid">{related.map((item) => {
        const relatedAvailable = isAvailable(item);
        return <a className="store-product-card" href={`/shop/product/${item.slug}`} key={item.sku}>
          <div className="store-product-image"><img src={item.images[0] ?? "/images/clubs.jpg"} alt={item.name}/><span className={relatedAvailable ? "available" : "unavailable"}>{relatedAvailable ? "In stock" : "Out of stock"}</span></div>
          <div className="store-product-copy"><p className="micro">{item.categoryLabel}</p><h3>{item.name}</h3><p className="store-price">{formatKes(item.priceKes)}</p><span>View product <ArrowUpRight size={14}/></span></div>
        </a>;
      })}</div>
    </section>
  </main></ProductScrollShell>;
}
