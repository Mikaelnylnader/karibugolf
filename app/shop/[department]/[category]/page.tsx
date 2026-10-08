import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import DepartmentScrollShell from "@/components/department-scroll-shell";
import EquipmentScrollGuide from "@/components/equipment-scroll-guide";
import PutterScrollGuide from "@/components/putter-scroll-guide";
import ShopProductCard from "@/components/shop-product-card";
import { categoryBySlug, departmentBySlug, departments, productsForCategory } from "@/lib/shop-catalog";
import "../../scrollcraft.css";

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
  const isPutters = department.slug === "clubs" && category.slug === "putters";
  const whatsappText = encodeURIComponent(`Hi Karibu Golf! I would like to ask about ${category.label}.`);
  return (
    <DepartmentScrollShell department={department} categoryMode>
      <main className={`department-scroll-page category-scroll-page${isPutters ? " putter-scroll-page" : " equipment-scroll-page"}`} id="page-content">
        {isPutters ? <PutterScrollGuide productCount={categoryProducts.length} /> : <EquipmentScrollGuide
          categorySlug={category.slug}
          categoryLabel={category.label}
          categoryImage={category.image}
          departmentSlug={department.slug}
          departmentLabel={department.label}
          productCount={categoryProducts.length}
        />}

        {categoryProducts.length > 0 ? (
          <section className="category-product-shelf" id="products" data-sc-act="flow">
            <header data-sc-in data-sc-stagger="55">
              <p className="micro">KARIBU GOLF / {category.label.toUpperCase()}</p>
              <h2>THE {category.label.toUpperCase()}<br />COLLECTION.</h2>
              <p>Prices are shown in Kenyan shillings (KSh). Open any product for details and availability.</p>
            </header>
            <div className="store-product-grid" data-sc-in data-sc-stagger="40">
              {categoryProducts.map((product) => <ShopProductCard product={product} key={product.sku} />)}
            </div>
          </section>
        ) : (
          <section className="category-empty" data-sc-act="flow">
            <div data-sc-in>
              <p className="micro">COLLECTION GROWING</p>
              <h2>NOTHING LISTED<br />JUST YET.</h2>
              <p>Ask our team about current availability or a special order in this category.</p>
            </div>
          </section>
        )}

        <section className="category-inquiry" data-sc-act="flow">
          <p>Need help choosing the right {category.label.toLowerCase()}?</p>
          <a href={`https://wa.me/254116416105?text=${whatsappText}`}>
            <MessageCircle size={19} /> Ask Karibu Golf <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
    </DepartmentScrollShell>
  );
}
