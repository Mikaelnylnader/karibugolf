import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { departmentForCategory, formatKes, productBySlug, products } from "@/lib/shop-catalog";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  return { title: product ? `${product.name} | Karibu Golf` : "Product | Karibu Golf", description: product?.description };
}

export default async function CatalogProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const department = departmentForCategory(product.categorySlug);
  const available = product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;
  const message = encodeURIComponent(`Hi Karibu Golf! I'd like to ask about ${product.name} (${product.sku}) at ${formatKes(product.priceKes)}.`);
  return <main className="inner-page catalog-product-page" id="page-content">
    <div className="product-breadcrumb"><a href={department ? `/shop/${department.slug}/${product.categorySlug}` : "/shop"}><ArrowLeft size={16}/> {product.categoryLabel}</a></div>
    <section className="catalog-product-hero">
      <div className="catalog-product-gallery">{product.images.map((image, index) => <figure className={index === 0 ? "primary" : ""} key={image}><img src={image} alt={`${product.name}${index ? ` view ${index + 1}` : ""}`}/></figure>)}</div>
      <div className="catalog-product-summary"><p className="micro">{product.categoryLabel} · {product.sku}</p><h1>{product.name}</h1><div className={available ? "catalog-stock available" : "catalog-stock unavailable"}><span/>{available ? "In stock in Kenya" : "Currently out of stock"}</div><p className="catalog-description">{product.description}</p><p className="catalog-main-price">{formatKes(product.priceKes)}</p><p className="catalog-other-prices">Selling price: ¥{product.priceCny.toLocaleString("en-US")} RMB · ${product.priceUsd.toLocaleString("en-US")} USD</p>{product.sizes && <p><strong>Options:</strong> {product.sizes}</p>}{product.colors && <p><strong>Colours:</strong> {product.colors}</p>}<a className="contact-button" href={`https://wa.me/254116416105?text=${message}`}><MessageCircle size={19}/>{available ? "Order on WhatsApp" : "Ask about availability"}</a><p className="catalog-help">We’ll confirm the exact item, specification, delivery cost and payment details with you directly.</p></div>
    </section>
  </main>;
}
