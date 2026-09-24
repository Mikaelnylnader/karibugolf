import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import DepartmentScrollShell from "@/components/department-scroll-shell";
import ShopProductCard from "@/components/shop-product-card";
import { departmentBySlug, departments, productsForCategory, productsForDepartment } from "@/lib/shop-catalog";
import "../scrollcraft.css";

export function generateStaticParams() {
  return departments.map((department) => ({ department: department.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}): Promise<Metadata> {
  const { department: slug } = await params;
  const selected = departmentBySlug(slug);
  return {
    title: selected ? `${selected.label} | Karibu Golf Shop` : "Department | Karibu Golf",
    description: selected?.description,
  };
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department: slug } = await params;
  const selected = departmentBySlug(slug);
  if (!selected) notFound();

  const departmentProducts = productsForDepartment(slug);
  const firstCategory = selected.categories[0];
  const shelfProducts = departmentProducts.slice(0, 8);
  const whatsappText = encodeURIComponent(
    `Hi Karibu Golf! I would like help choosing from the ${selected.label} collection.`,
  );

  return (
    <DepartmentScrollShell department={selected}>
      <main className="department-scroll-page" id="page-content">
        <section
          className="department-object-hero"
          id={firstCategory.slug}
          data-kit-category={firstCategory.slug}
          data-sc-act="flow"
        >
          <figure>
            <a
              className="department-picture-link"
              href={`/shop/${selected.slug}/${firstCategory.slug}`}
              aria-label={`Shop ${firstCategory.label}`}
            >
              <img
                src={firstCategory.image}
                alt={`${firstCategory.label} at Karibu Golf`}
                fetchPriority="high"
                data-sc-parallax="-1.05"
              />
            </a>
          </figure>
          <div className="department-hero-shade" aria-hidden="true" />
          <div className="department-object-copy">
            <a className="department-back-link" href="/shop">
              <ArrowLeft size={17} /> All departments
            </a>
            <p className="micro">{selected.label.toUpperCase()} COLLECTION</p>
            <h1>{firstCategory.label.toUpperCase()}.</h1>
            <p>{firstCategory.description}</p>
            <div className="department-object-meta">
              <span>{productsForCategory(firstCategory.slug).length} products listed</span>
              <a href={`/shop/${selected.slug}/${firstCategory.slug}`}>
                Shop {firstCategory.label} <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <aside className="department-hero-intro">
            <p>{selected.eyebrow}</p>
            <span>{selected.description}</span>
          </aside>
        </section>

        {selected.categories.slice(1).map((category, index) => {
          const categoryProducts = productsForCategory(category.slug);
          const number = String(index + 2).padStart(2, "0");
          const reveal = index === selected.categories.length - 2
            ? "iris"
            : index % 2 === 0
              ? "left"
              : "right";
          return (
            <section
              className={`department-category-chapter chapter-tone-${index % 4}`}
              id={category.slug}
              data-kit-category={category.slug}
              data-sc-act="flow"
              key={category.slug}
            >
              <figure
                data-sc-reveal={reveal}
                data-sc-reveal-at="0.04 0.52"
                data-sc-tilt={index % 3 === 1 ? "5" : undefined}
              >
                <a
                  className="department-picture-link"
                  href={`/shop/${selected.slug}/${category.slug}`}
                  aria-label={`Shop ${category.label}`}
                >
                  <img
                    src={category.image}
                    alt={`${category.label} at Karibu Golf`}
                    loading="lazy"
                    data-sc-parallax={index % 2 === 0 ? "-0.42" : "0.38"}
                  />
                </a>
              </figure>
              <div className="department-chapter-copy" data-sc-in data-sc-stagger="65">
                <p className="micro">{selected.label.toUpperCase()} / {number}</p>
                <h2>{category.label.toUpperCase()}.</h2>
                <p>{category.description}</p>
                <dl>
                  <div><dt>Listed</dt><dd>{categoryProducts.length} products</dd></div>
                  <div><dt>Route</dt><dd>{selected.label} / {category.label}</dd></div>
                </dl>
                <a className="department-chapter-link" href={`/shop/${selected.slug}/${category.slug}`}>
                  Explore {category.label} <ArrowUpRight size={19} />
                </a>
              </div>
            </section>
          );
        })}

        <section className="department-shelf" id="available-now" data-sc-act="flow">
          <header data-sc-in data-sc-stagger="60">
            <p className="micro">AVAILABLE FROM {selected.label.toUpperCase()}</p>
            <h2>SHOP WHAT IS<br />LISTED NOW.</h2>
            <p>
              Start with these products, or use the category index to narrow the collection.
              Stock changes made in the Karibu product admin are reflected here when the site publishes.
            </p>
          </header>
          {shelfProducts.length > 0 ? (
            <div className="store-product-grid" data-sc-in data-sc-stagger="45">
              {shelfProducts.map((product) => <ShopProductCard product={product} key={product.sku} />)}
            </div>
          ) : (
            <p className="department-empty">New products for this department are being prepared.</p>
          )}
        </section>

        <section className="department-inquiry" data-sc-act="flow">
          <div data-sc-in>
            <p className="micro">KARIBU GOLF / COLLECTION DESK</p>
            <h2>NOT SURE WHICH<br />ONE FITS YOUR GAME?</h2>
          </div>
          <div data-sc-in>
            <p>Tell us what you play now, your budget and what you want to improve. We will help you find the right place to start.</p>
            <a href={`https://wa.me/254116416105?text=${whatsappText}`}>
              <MessageCircle size={19} /> Ask on WhatsApp <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      </main>
    </DepartmentScrollShell>
  );
}
