import type { CatalogProduct } from "@/lib/shop-catalog";
import { formatKes, productIsInStock } from "@/lib/shop-catalog";

export type ProductSeoQuestion = {
  question: string;
  answer: string;
};

export const productCanonicalUrl = (product: CatalogProduct) =>
  `https://karibugolf.com/shop/product/${product.slug}/`;

export const productSeoTitle = (product: CatalogProduct) =>
  `${product.name} in Kenya | Karibu Golf`;

export const productSeoDescription = (product: CatalogProduct) => {
  const availability = productIsInStock(product) ? "In stock" : "Out of stock";
  return `${product.name} in Kenya: ${formatKes(product.priceKes)}. ${availability}. View photos, options and specifications from Karibu Golf Nairobi.`;
};

export const productSeoQuestions = (product: CatalogProduct): ProductSeoQuestion[] => {
  const available = productIsInStock(product);
  const stockAnswer = available
    ? `Karibu Golf currently lists ${product.stock} ${Number(product.stock) === 1 ? "unit" : "units"} in stock in Nairobi. Confirm availability before payment because stock can change.`
    : `Karibu Golf currently lists this product as out of stock. Ask the Nairobi team about future availability before making plans around a specific date.`;

  return [
    {
      question: `What is the price of ${product.name} in Kenya?`,
      answer: `The listed price is ${formatKes(product.priceKes)}. Confirm the current price and exact product specification with Karibu Golf before payment.`,
    },
    {
      question: `Is ${product.name} available in Kenya?`,
      answer: stockAnswer,
    },
    {
      question: `What options are listed for ${product.name}?`,
      answer: `The listed size or configuration is ${product.sizes}. The listed colour or finish is ${product.colors}. Availability of a particular option must be confirmed before payment.`,
    },
    {
      question: `Can Karibu Golf deliver ${product.name} in Kenya?`,
      answer: `Karibu Golf is based in Nairobi. Delivery options and costs depend on the destination, so confirm the details directly with the team before ordering.`,
    },
  ];
};
