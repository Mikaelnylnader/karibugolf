import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogProductTemplate from "@/components/catalog-product-template";
import { detailsForProduct } from "@/lib/product-page-details";
import { departmentForCategory, productBySlug, products, productsForCategory, productsForDepartment } from "@/lib/shop-catalog";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product | Karibu Golf" };
  const details = detailsForProduct(product);
  const canonical = `https://karibugolf.com/shop/product/${product.slug}/`;
  return {
    title: `${product.name} | Karibu Golf Kenya`,
    description: `${product.description} View price, stock, images, options and specifications from Karibu Golf Kenya.`,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} | Karibu Golf Kenya`,
      description: product.description,
      url: canonical,
      type: "website",
      images: details.gallery[0] ? [{ url: `https://karibugolf.com${details.gallery[0].src}`, alt: details.gallery[0].alt }] : undefined,
    },
  };
}

export default async function CatalogProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const details = detailsForProduct(product);
  const department = departmentForCategory(product.categorySlug);
  const sameCategory = productsForCategory(product.categorySlug).filter((item) => item.slug !== product.slug);
  const departmentFallback = department
    ? productsForDepartment(department.slug).filter((item) => item.slug !== product.slug && !sameCategory.some((match) => match.slug === item.slug))
    : [];
  const related = [...sameCategory, ...departmentFallback].slice(0, 4);
  const available = product.status.toLowerCase() === "in stock" && Number(product.stock || 0) > 0;
  const canonical = `https://karibugolf.com/shop/product/${product.slug}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: details.gallery.map((image) => `https://karibugolf.com${image.src}`),
    category: product.categoryLabel,
    brand: { "@type": "Brand", name: details.brand === "Karibu Golf selection" ? product.name.split(" ")[0] : details.brand },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "KES",
      price: product.priceKes,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Karibu Golf" },
    },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/>
    <CatalogProductTemplate product={product} details={details} department={department} related={related}/>
  </>;
}
