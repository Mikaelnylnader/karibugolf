import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import DepartmentScrollShell from "@/components/department-scroll-shell";
import ShopProductCard from "@/components/shop-product-card";
import { departmentBySlug, departments, productsForCategory, productsForDepartment } from "@/lib/shop-catalog";
import "../scrollcraft.css";

const clubPhotoDescriptions: Record<string, string> = {
  drivers: "Driver set behind a golf ball on a tee",
  woods: "Fairway wood behind a golf ball on the grass",
  hybrids: "Golfer with a club during a follow-through",
  golf_irons: "TaylorMade P790 iron heads arranged on grass",
  wedges: "Golfer holding three Vokey SM11 wedges over a towel",
  putters: "Scotty Cameron Studio Style Newport 2 reference photograph",
};

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
  const isClubs = slug === "clubs";
  const whatsappText = encodeURIComponent(
    `Hi Karibu Golf! I would like help choosing from the ${selected.label} collection.`,
  );

  return (
    <DepartmentScrollShell department={selected}>
      <main className={`department-scroll-page${isClubs ? " clubs-photo-page" : ""}`} id="page-content">
        <section
          className="department-object-hero"
          data-sc-act="flow"
        >
          <figure aria-hidden="true">
            <img
              src={selected.image}
              alt=""
              fetchPriority="high"
              width="1314"
              height="915"
              data-sc-parallax="-1.05"
            />
          </figure>
          <div className="department-hero-shade" aria-hidden="true" />
          {isClubs && <div className="clubs-hero-detail" aria-hidden="true" data-sc-parallax="0.35">
            <img src="/images/shop/clubs-editorial/driver-headcover.webp" alt="" width="1263" height="936"/>
          </div>}
          <div className="department-object-copy">
            <a className="department-back-link" href="/shop">
              <ArrowLeft size={17} /> All departments
            </a>
            <p className="micro">{selected.eyebrow}</p>
            <h1>{isClubs ? <>GOLF<br/><em>CLUBS.</em></> : `${selected.label.toUpperCase()}.`}</h1>
            <p>{selected.description}</p>
            <div className="department-object-meta">
              <span>{selected.categories.length} categories / {departmentProducts.length} products</span>
              <a href={`#${firstCategory.slug}`}>
                View the categories <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <aside className="department-hero-intro">
            <p>KARIBU GOLF SHOP</p>
            <span>Choose a category below, then open any product for prices, details and availability.</span>
          </aside>
        </section>

        {selected.categories.map((category, index) => {
          const categoryProducts = productsForCategory(category.slug);
          const number = String(index + 1).padStart(2, "0");
          const reveal = index === selected.categories.length - 1
            ? "iris"
            : index % 2 === 0
              ? "left"
              : "right";
          return (
            <section
              className={`department-category-chapter chapter-tone-${index % 4}${isClubs ? ` clubs-photo-chapter${index >= 4 ? " clubs-reference-chapter" : ""}` : ""}`}
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
                    alt={isClubs ? clubPhotoDescriptions[category.slug] : `${category.label} at Karibu Golf`}
                    width="1300"
                    height="930"
                    loading="lazy"
                    data-sc-parallax={index % 2 === 0 ? "-0.42" : "0.38"}
                  />
                </a>
              </figure>
              <div className="department-chapter-copy" data-sc-in data-sc-stagger="65">
                {(!isClubs || index % 3 === 0) && <p className="micro">{isClubs ? "FROM TEE TO GREEN" : `${selected.label.toUpperCase()} / ${number}`}</p>}
                <h2>{category.label.toUpperCase()}.</h2>
                <p>{category.description}</p>
                <dl>
                  <div><dt>Listed</dt><dd>{categoryProducts.length} products</dd></div>
                  <div><dt>Collection</dt><dd>{category.label}</dd></div>
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
              Open a product to check its price, specifications and current availability.
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
