import type { Metadata } from "next";
import { ArrowUpRight, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { departments, products } from "@/lib/shop-catalog";

export const metadata: Metadata = {
  title: "Golf Shop Kenya | Karibu Golf",
  description: "Shop golf clubs, shoes, apparel, bags, balls and accessories in Kenya. Browse organised departments and get personal help from Karibu Golf.",
};

export default function Shop() {
  return <main className="inner-page store-page" id="page-content">
    <section className="store-hero">
      <div><p className="micro">THE KARIBU WEBSHOP</p><h1>EVERYTHING<br/><em>FOR YOUR GAME.</em></h1></div>
      <div className="store-hero-note"><span>{products.length} PRODUCTS · 6 DEPARTMENTS</span><p>Browse by what you need, find the right category quickly and message our team when you want a hand choosing.</p></div>
    </section>

    <nav className="store-quick-nav" aria-label="Shop departments">
      {departments.map((item, index) => <a href={`#${item.slug}`} key={item.slug}><span>0{index + 1}</span>{item.label}</a>)}
    </nav>

    <section className="department-grid" aria-label="Shop by department">
      {departments.map((item, index) => <a className={`department-card department-card-${index + 1}`} href={`/shop/${item.slug}`} id={item.slug} key={item.slug}>
        <img src={item.image} alt="" loading={index > 1 ? "lazy" : "eager"}/>
        <div className="department-shade"/>
        <div className="department-copy"><p className="micro">{item.eyebrow}</p><h2>{item.label}</h2><p>{item.description}</p><span>Shop {item.label.toLowerCase()} <ArrowUpRight size={21}/></span></div>
      </a>)}
    </section>

    <section className="store-about">
      <div><p className="micro">MORE THAN A PRODUCT LIST</p><h2>THE RIGHT GEAR.<br/><em>A REAL PERSON TO HELP.</em></h2></div>
      <div><p>Karibu Golf brings together equipment, apparel and round essentials for golfers across Kenya. Our shop is designed to stay simple as the collection grows: start with a department, narrow it to a category and explore only what matters to you.</p><p>Need a specific model, size or specification? Message us. We can confirm availability, discuss delivery and help with special requests.</p><a className="editorial-link" href="https://wa.me/254116416105">Ask the Karibu team <ArrowUpRight size={20}/></a></div>
    </section>

    <section className="store-service-strip" aria-label="Karibu Golf shop services">
      <article><MessageCircle/><h3>Personal help</h3><p>Talk to a real person before you decide.</p></article>
      <article><PackageCheck/><h3>Stock confirmation</h3><p>We confirm the exact item and specification.</p></article>
      <article><Truck/><h3>Delivery in Kenya</h3><p>Ask about delivery options for your location.</p></article>
    </section>
  </main>;
}
