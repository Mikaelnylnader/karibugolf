import type { Metadata } from "next";

export const siteOrigin = "https://karibugolf.com";
export const canonicalUrl = (route: string) => `${siteOrigin}${route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "").toLowerCase()}/`}`;

/** Give every public route its own canonical and social metadata. */
export function pageMetadata(route: string, title: string, description: string, image = "/images/fairway-aerial.jpg"): Metadata {
  const url = canonicalUrl(route);
  const imageUrl = new URL(image, siteOrigin).href;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", locale: "en_KE", siteName: "Karibu Golf East Africa", images: [{ url: imageUrl, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

// Only owner-confirmed public facts: do not invent a street address, opening
// hours, certification, review rating, social account or coaching credential.
export const siteOrganization = {
  "@type": "Organization",
  "@id": `${siteOrigin}/#organization`,
  name: "Karibu Golf",
  alternateName: "Karibu Golf East Africa",
  url: `${siteOrigin}/`,
  logo: `${siteOrigin}/images/logo.png`,
  telephone: "+254116416105",
  areaServed: [{ "@type": "Country", name: "Kenya" }, { "@type": "Place", name: "East Africa" }],
  location: { "@type": "Place", name: "Nairobi, Kenya" },
  founder: { "@type": "Person", "@id": `${siteOrigin}/about/#founder`, name: "Mikael Nylander", url: `${siteOrigin}/about/#founder` },
  contactPoint: { "@type": "ContactPoint", telephone: "+254116416105", contactType: "Customer enquiries", availableLanguage: "English", url: `${siteOrigin}/contact/` },
};

export const siteWebsite = {
  "@type": "WebSite", "@id": `${siteOrigin}/#website`, url: `${siteOrigin}/`,
  name: "Karibu Golf East Africa", inLanguage: "en-KE", publisher: { "@id": siteOrganization["@id"] },
};

const collectionTopics: Record<string, string> = {
  drivers: "Compare driver heads and discuss loft, shaft, flex and handedness",
  woods: "Explore fairway woods and discuss loft, shaft, flex and handedness",
  hybrids: "Explore hybrid golf clubs and discuss loft, shaft, flex and set gaps",
  golf_irons: "Compare iron sets, set makeup, steel or graphite shafts and flex options",
  wedges: "Compare golf wedges and discuss loft, bounce, grind and finish options",
  putters: "Compare golf putters and discuss head shape, length, alignment and specifications",
  junior_sets: "Explore height-matched junior golf sets and confirm set makeup and handedness",
  mens_shoes: "Explore men's golf shoe fit, grip, sizing and course footwear options",
  womens_shoes: "Explore women's golf shoe fit, grip, sizing and course footwear options",
  kids_shoes: "Explore junior golf shoe fit, grip, sizes and easy fastening",
  mens_polos: "Explore men's golf polos and discuss size, fabric and colour preferences",
  mens_pants: "Explore men's golf trousers and discuss size, fit and fabric preferences",
  mens_jackets: "Explore men's golf jackets and discuss sizing, layers and weather protection",
  mens_shorts: "Explore men's golf shorts and discuss sizing, fit and fabric preferences",
  womens_polos: "Explore women's golf polos and discuss sizing, fit and colour preferences",
  womens_skirts: "Explore women's golf skirts and discuss sizing, fit and movement",
  womens_pants: "Explore women's golf trousers and discuss sizing, fit and fabric preferences",
  womens_dresses: "Explore women's golf dresses and discuss sizing, fit and fabric preferences",
  womens_jackets: "Explore women's golf jackets and discuss sizing, layers and weather protection",
  womens_tops: "Explore women's golf tops and discuss sizing, layers and fabric preferences",
  bags: "Compare stand bags, carry options, storage and golf travel bags",
  balls: "Compare golf balls, pack sizes, feel and flight preferences",
  gloves: "Compare golf gloves and discuss hand, size, fit and pack options",
  hats_and_caps: "Explore golf hats and caps and discuss colour, fit and closure options",
  grips: "Explore golf grips and discuss size, feel and replacement options",
  range_finders: "Explore golf range finders and discuss distance measurement and features",
  accessories: "Explore golf accessories and practical essentials for your next round",
};

export function collectionMetadata(department: string, category: string, label: string, image: string): Metadata {
  const topic = collectionTopics[category] ?? `Explore ${label.toLowerCase()} and discuss your preferences`;
  const searchLabel = /golf|range/i.test(label) ? label : `Golf ${label}`;
  return pageMetadata(`/shop/${department}/${category}/`, `${searchLabel} in Kenya | Karibu Golf`, `${topic} with Karibu Golf in Nairobi, Kenya. Confirm availability and KSh prices.`, image);
}

export function departmentMetadata(slug: string, label: string, image: string): Metadata {
  const topics: Record<string, string> = {
    clubs: "Compare golf clubs, iron sets, drivers, wedges and putters",
    kids: "Explore junior golf sets, height-based fit and club options",
    shoes: "Explore men's, women's and kids' golf shoes and fit guidance",
    apparel: "Explore men's and women's golf clothing, layers and fit guidance",
    bags: "Explore golf bags, carrying options, storage and travel protection",
    balls: "Explore golf balls, pack sizes and performance preferences",
    accessories: "Explore golf gloves, caps, grips, range finders and accessories",
  };
  const title = slug === "kids" ? "Kids' Golf Sets" : `Golf ${label}${["bags", "balls", "accessories"].includes(slug) ? " Shop" : ""}`;
  return pageMetadata(`/shop/${slug}/`, `${title} in Kenya | Karibu Golf`, `${topics[slug] ?? `Explore golf ${label.toLowerCase()}`} with Karibu Golf in Nairobi. Confirm availability, KSh prices and delivery.`, image);
}
