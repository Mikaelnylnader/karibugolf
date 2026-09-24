import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ShopProductCard from "@/components/shop-product-card";
import { departmentBySlug, departments, productsForCategory, productsForDepartment } from "@/lib/shop-catalog";

export function generateStaticParams() { return departments.map((department) => ({ department: department.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ department: string }> }): Promise<Metadata> {
  const { department: slug } = await params;
  const selected = departmentBySlug(slug);
  return { title: selected ? `${selected.label} | Karibu Golf Shop` : "Department | Karibu Golf", description: selected?.description };
}

export default async function DepartmentPage({ params }: { params: Promise<{ department: string }> }) {
  const { department: slug } = await params;
  const selected = departmentBySlug(slug);
  if (!selected) notFound();
  const departmentProducts = productsForDepartment(slug);
  return <main className="inner-page store-page" id="page-content">
    <header className="store-department-hero">
      <a className="back-link" href="/shop"><ArrowLeft size={17}/> All departments</a>
      <p className="micro">{selected.eyebrow}</p><h1>{selected.label.toUpperCase()}.</h1>
      <div><p>{selected.description}</p><span>{departmentProducts.length} products</span></div>
    </header>
    <section className="subcategory-grid" aria-label={`${selected.label} categories`}>
      {selected.categories.map((category) => <a href={`/shop/${selected.slug}/${category.slug}`} key={category.slug}>
        <div><img src={category.image} alt="" loading="lazy"/><span>{productsForCategory(category.slug).length}</span></div>
        <p className="micro">SHOP CATEGORY</p><h2>{category.label}</h2><p>{category.description}</p><strong>Explore <ArrowUpRight size={18}/></strong>
      </a>)}
    </section>
    {departmentProducts.length > 0 && <section className="store-products-section"><div className="store-section-heading"><p className="micro">AVAILABLE IN THIS DEPARTMENT</p><h2>BROWSE {selected.label.toUpperCase()}.</h2></div><div className="store-product-grid">{departmentProducts.map((product) => <ShopProductCard product={product} key={product.sku}/>)}</div></section>}
  </main>;
}
