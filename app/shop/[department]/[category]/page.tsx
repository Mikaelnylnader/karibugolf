import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ShopProductCard from "@/components/shop-product-card";
import { categoryBySlug, departmentBySlug, departments, productsForCategory } from "@/lib/shop-catalog";

export function generateStaticParams() { return departments.flatMap((department) => department.categories.map((category) => ({ department: department.slug, category: category.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ department: string; category: string }> }): Promise<Metadata> {
  const values = await params;
  const category = categoryBySlug(values.category);
  return { title: category ? `${category.label} | Karibu Golf Shop` : "Category | Karibu Golf", description: category?.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ department: string; category: string }> }) {
  const values = await params;
  const department = departmentBySlug(values.department);
  const category = categoryBySlug(values.category);
  if (!department || !category || !department.categories.some((item) => item.slug === category.slug)) notFound();
  const categoryProducts = productsForCategory(category.slug);
  return <main className="inner-page store-page" id="page-content">
    <header className="store-category-hero"><a className="back-link" href={`/shop/${department.slug}`}><ArrowLeft size={17}/> {department.label}</a><p className="micro">{department.label.toUpperCase()}</p><h1>{category.label.toUpperCase()}.</h1><div><p>{category.description}</p><span>{categoryProducts.length} products</span></div></header>
    {categoryProducts.length > 0 ? <section className="store-products-section"><div className="store-product-grid">{categoryProducts.map((product) => <ShopProductCard product={product} key={product.sku}/>)}</div></section> : <section className="empty-category"><p className="micro">COLLECTION GROWING</p><h2>NOTHING LISTED<br/><em>JUST YET.</em></h2><p>Ask our team about current availability or a special order in this category.</p><a className="contact-button" href={`https://wa.me/254116416105?text=${encodeURIComponent(`Hi Karibu Golf! I'd like to ask about ${category.label}.`)}`}>Ask on WhatsApp ↗</a></section>}
  </main>;
}
