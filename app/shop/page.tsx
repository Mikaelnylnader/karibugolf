import type { Metadata } from "next";
import { ArrowUpRight, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { departments, formatKes, inStockProducts, products } from "@/lib/shop-catalog";
import ShopScrollShell from "@/components/shop-scroll-shell";
import LiveProductImage from "@/components/live-product-image";
import "./scrollcraft.css";

export const metadata: Metadata = {
  title: "Golf Shop East Africa | Karibu Golf",
  description: "Shop golf clubs, shoes, apparel, bags, balls and accessories from Karibu Golf, based in Nairobi and serving golfers across East Africa.",
};

export default function Shop() {
  return <ShopScrollShell departments={departments}><main className="inner-page store-page scrollcrafted-store" id="page-content">
    <section className="store-hero" data-sc-act="flow">
      <div className="store-hero-ground" data-sc-parallax="-0.45" aria-hidden="true" />
      <div className="store-hero-gallery" aria-hidden="true">
        <span data-sc-parallax="-0.8"><img src={departments[1].image} alt="" /></span>
        <span data-sc-parallax="-0.35"><img src={departments[0].image} alt="" /></span>
        <span data-sc-parallax="0.35"><img src={departments[4].image} alt="" /></span>
      </div>
      <div className="store-hero-copy"><p className="micro">THE KARIBU WEBSHOP</p><h1>FIND YOUR<br/><em>NEXT ROUND.</em></h1><a href="/shop/stock">Shop in-stock now <ArrowUpRight size={20}/></a></div>
      <div className="store-hero-note"><span>{products.length} PRODUCTS · {inStockProducts.length} IN STOCK · 6 DEPARTMENTS</span><p>Start with what is ready now or browse the full shop by department. Ask a real person when you want help choosing.</p></div>
    </section>

    <nav className="store-quick-nav" aria-label="Shop departments" data-sc-in data-sc-stagger="45">
      {departments.map((item, index) => <a href={`#${item.slug}`} key={item.slug}><span>0{index + 1}</span>{item.label}</a>)}
    </nav>

    <section className="shop-stock-window" aria-labelledby="shop-stock-title" data-sc-act="flow">
      <header data-sc-in data-sc-stagger="55">
        <div><p className="micro">LIVE KARIBU INVENTORY</p><span>{String(inStockProducts.length).padStart(2, "0")} READY IN NAIROBI</span></div>
        <h2 id="shop-stock-title">WHAT IS<br/><em>IN STOCK NOW.</em></h2>
        <p>Only products currently marked available in the Karibu catalogue appear here. Prices and stock come from the same source as each product page.</p>
      </header>
      <div className="shop-stock-rack" data-sc-in data-sc-stagger="55">
        {inStockProducts.map((product, index) => <a href={`/shop/product/${product.slug}`} className={`shop-stock-item shop-stock-item-${index + 1}`} data-sc-tilt="2" key={product.sku}>
          <figure data-sc-reveal={index % 2 ? "right" : "up"} data-sc-reveal-at={`${0.08 + index * 0.04} ${0.42 + index * 0.05}`}><LiveProductImage product={product} alt={product.name} width="900" height="900" loading={index > 1 ? "lazy" : "eager"} data-sc-parallax={index % 2 ? "0.28" : "-0.28"}/></figure>
          <div><span>{String(index + 1).padStart(2, "0")} · {product.sku}</span><h3>{product.name}</h3><strong>{formatKes(product.priceKes)}</strong></div>
        </a>)}
      </div>
      <footer data-sc-in><p>Every in-stock item, one focused collection.</p><a href="/shop/stock">Open live stock room <ArrowUpRight size={20}/></a></footer>
    </section>

    <section className="department-intro" id="departments" data-sc-act="flow" data-shop-snap>
      <p className="micro">THE FULL EQUIPMENT WALL</p>
      <h2>CHOOSE A DEPARTMENT.<br/><em>GO STRAIGHT TO THE GEAR.</em></h2>
      <p>Every category is connected to the live Karibu catalog, so the shop can grow without becoming harder to navigate.</p>
    </section>

    <section className="department-grid" aria-label="Shop by department">
      {departments.map((item, index) => <a className={`department-card department-card-${index + 1}`} href={`/shop/${item.slug}`} id={item.slug} data-shop-department={item.slug} data-shop-snap data-sc-act="flow" data-sc-in data-sc-tilt="4" key={item.slug}>
        <figure data-sc-reveal={index % 2 ? "right" : "left"} data-sc-reveal-at="0.05 0.40"><img src={item.image} alt={`${item.label} at Karibu Golf East Africa`} width="1200" height="1600" loading={index > 1 ? "lazy" : "eager"} data-sc-parallax={index % 2 ? "0.18" : "-0.18"}/></figure>
        <div className="department-shade"/>
        <div className="department-copy"><p className="micro">{item.eyebrow}</p><h2>{item.label}</h2><p>{item.description}</p><span>{item.categories.length} {item.categories.length === 1 ? "category" : "categories"} <ArrowUpRight size={21}/></span></div>
      </a>)}
    </section>

    <section className="store-about" data-sc-act="flow">
      <div><p className="micro">MORE THAN A PRODUCT LIST</p><h2>THE RIGHT GEAR.<br/><em>A REAL PERSON TO HELP.</em></h2></div>
      <div data-sc-in data-sc-stagger="70"><p>Karibu Golf brings together equipment, apparel and round essentials for golfers across East Africa. Start with a department, narrow it to a category and explore only what matters to you.</p><p>Need a specific model, size or specification? Message us. We can confirm availability, discuss delivery and help with special requests.</p><a className="editorial-link" href="https://wa.me/254116416105">Ask the Karibu team <ArrowUpRight size={20}/></a></div>
    </section>

    <section className="store-service-strip" aria-label="Karibu Golf shop services" data-sc-in data-sc-stagger="70">
      <article><MessageCircle/><h3>Personal help</h3><p>Talk to a real person before you decide.</p></article>
      <article><PackageCheck/><h3>Stock confirmation</h3><p>We confirm the exact item and specification.</p></article>
      <article><Truck/><h3>East Africa delivery</h3><p>Ask about delivery options for your country and location.</p></article>
    </section>
  </main></ShopScrollShell>;
}
