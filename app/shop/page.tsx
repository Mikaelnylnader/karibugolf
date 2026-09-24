import type { Metadata } from "next";
import { ArrowUpRight, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { departments, products } from "@/lib/shop-catalog";
import ShopScrollShell from "@/components/shop-scroll-shell";
import "./scrollcraft.css";

export const metadata: Metadata = {
  title: "Golf Shop Kenya | Karibu Golf",
  description: "Shop golf clubs, shoes, apparel, bags, balls and accessories in Kenya. Browse organised departments and get personal help from Karibu Golf.",
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
      <div className="store-hero-copy"><p className="micro">THE KARIBU WEBSHOP</p><h1>FIND YOUR<br/><em>NEXT ROUND.</em></h1><a href="#departments">Browse departments <ArrowUpRight size={20}/></a></div>
      <div className="store-hero-note"><span>{products.length} PRODUCTS · 6 DEPARTMENTS</span><p>Start with what you need. Narrow the collection. Then ask a real person when you want help choosing.</p></div>
    </section>

    <nav className="store-quick-nav" aria-label="Shop departments" data-sc-in data-sc-stagger="45">
      {departments.map((item, index) => <a href={`#${item.slug}`} key={item.slug}><span>0{index + 1}</span>{item.label}</a>)}
    </nav>

    <section className="department-intro" id="departments" data-sc-act="flow">
      <p className="micro">THE FULL EQUIPMENT WALL</p>
      <h2>CHOOSE A DEPARTMENT.<br/><em>GO STRAIGHT TO THE GEAR.</em></h2>
      <p>Every category is connected to the live Karibu catalog, so the shop can grow without becoming harder to navigate.</p>
    </section>

    <section className="department-grid" aria-label="Shop by department" data-sc-act="flow">
      {departments.map((item, index) => <a className={`department-card department-card-${index + 1}`} href={`/shop/${item.slug}`} id={item.slug} data-shop-department={item.slug} data-sc-tilt="4" key={item.slug}>
        <figure data-sc-reveal={index % 2 ? "right" : "left"} data-sc-reveal-at={`${0.03 + index * 0.12} ${0.25 + index * 0.12}`}><img src={item.image} alt={`${item.label} at Karibu Golf Kenya`} width="1200" height="1600" loading={index > 1 ? "lazy" : "eager"}/></figure>
        <div className="department-shade"/>
        <div className="department-copy"><p className="micro">{item.eyebrow}</p><h2>{item.label}</h2><p>{item.description}</p><span>{item.categories.length} {item.categories.length === 1 ? "category" : "categories"} <ArrowUpRight size={21}/></span></div>
      </a>)}
    </section>

    <section className="store-about" data-sc-act="flow">
      <div><p className="micro">MORE THAN A PRODUCT LIST</p><h2>THE RIGHT GEAR.<br/><em>A REAL PERSON TO HELP.</em></h2></div>
      <div data-sc-in data-sc-stagger="70"><p>Karibu Golf brings together equipment, apparel and round essentials for golfers across Kenya. Start with a department, narrow it to a category and explore only what matters to you.</p><p>Need a specific model, size or specification? Message us. We can confirm availability, discuss delivery and help with special requests.</p><a className="editorial-link" href="https://wa.me/254116416105">Ask the Karibu team <ArrowUpRight size={20}/></a></div>
    </section>

    <section className="store-service-strip" aria-label="Karibu Golf shop services" data-sc-in data-sc-stagger="70">
      <article><MessageCircle/><h3>Personal help</h3><p>Talk to a real person before you decide.</p></article>
      <article><PackageCheck/><h3>Stock confirmation</h3><p>We confirm the exact item and specification.</p></article>
      <article><Truck/><h3>Delivery in Kenya</h3><p>Ask about delivery options for your location.</p></article>
    </section>
  </main></ShopScrollShell>;
}
