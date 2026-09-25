import type { Metadata } from "next";
import CatalogProductTemplate from "@/components/catalog-product-template";
import { detailsForProduct } from "@/lib/product-page-details";
import { departmentForCategory, productBySlug, productsForCategory } from "@/lib/shop-catalog";

export const metadata: Metadata = {
  title: "TaylorMade P790 Irons | Karibu Golf Kenya",
  description: "Explore TaylorMade P790 irons with detailed images, technology, specifications, price and current Karibu Golf stock information.",
  alternates: { canonical: "https://karibugolf.com/shop/product/gk-ir-tmp/" },
  robots: { index: false, follow: true },
};

export default function Product() {
  const product = productBySlug("gk-ir-tmp");
  if (!product) return null;
  const details = detailsForProduct(product);
  const department = departmentForCategory(product.categorySlug);
  const related = productsForCategory(product.categorySlug).filter((item) => item.slug !== product.slug).slice(0, 4);
  return <CatalogProductTemplate product={product} details={details} department={department} related={related}/>;
}
