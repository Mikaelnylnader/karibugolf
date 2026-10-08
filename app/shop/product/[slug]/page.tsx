import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogProductTemplate from "@/components/catalog-product-template";
import { detailsForProduct } from "@/lib/product-page-details";
import { departmentForCategory, productBySlug, products, productsForCategory, productsForDepartment } from "@/lib/shop-catalog";
import { productCanonicalUrl, productSeoDescription, productSeoQuestions, productSeoTitle } from "@/lib/product-seo";
import "../../scrollcraft.css";
import "./product-types.css";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product | Karibu Golf" };
  const details = detailsForProduct(product);
  const canonical = productCanonicalUrl(product);
  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
  const socialImage = details.gallery[0]
    ? { url: `https://karibugolf.com${details.gallery[0].src}`, alt: details.gallery[0].alt }
    : undefined;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "en_KE",
      siteName: "Karibu Golf East Africa",
      images: socialImage ? [socialImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImage ? [socialImage.url] : undefined,
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
  const canonical = productCanonicalUrl(product);
  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
  const questions = productSeoQuestions(product);
  const productId = `${canonical}#product`;
  const breadcrumbId = `${canonical}#breadcrumb`;
  const organizationId = "https://karibugolf.com/#organization";
  const websiteId = "https://karibugolf.com/#website";
  const categoryUrl = department
    ? `https://karibugolf.com/shop/${department.slug}/${product.categorySlug}/`
    : "https://karibugolf.com/shop/";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": productId,
        name: product.name,
        sku: product.sku,
        description: product.description,
        image: details.gallery.map((image) => `https://karibugolf.com${image.src}`),
        category: product.categoryLabel,
        brand: { "@type": "Brand", name: details.brand === "Karibu Golf selection" ? product.name.split(" ")[0] : details.brand },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Listed size or configuration", value: product.sizes },
          { "@type": "PropertyValue", name: "Listed colour or finish", value: product.colors },
          ...(product.shaftMaterial ? [{ "@type": "PropertyValue", name: "Shaft material", value: product.shaftMaterial }] : []),
          ...(product.shaftFlex ? [{ "@type": "PropertyValue", name: "Shaft flex", value: product.shaftFlex }] : []),
          { "@type": "PropertyValue", name: "Location", value: "Nairobi, Kenya" },
        ],
        offers: {
          "@type": "Offer",
          "@id": `${canonical}#offer`,
          url: canonical,
          priceCurrency: "KES",
          price: product.priceKes,
          availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@id": organizationId },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://karibugolf.com/" },
          { "@type": "ListItem", position: 2, name: "Shop", item: "https://karibugolf.com/shop/" },
          { "@type": "ListItem", position: 3, name: product.categoryLabel, item: categoryUrl },
          { "@type": "ListItem", position: 4, name: product.name, item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: questions.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: title,
        description,
        inLanguage: "en-KE",
        isPartOf: { "@id": websiteId },
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": productId },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: "https://karibugolf.com/",
        name: "Karibu Golf East Africa",
        inLanguage: "en-KE",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Karibu Golf",
        url: "https://karibugolf.com/",
        logo: "https://karibugolf.com/images/logo.png",
        areaServed: { "@type": "Country", name: "Kenya" },
      },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/>
    <CatalogProductTemplate product={product} details={details} department={department} related={related}/>
  </>;
}
