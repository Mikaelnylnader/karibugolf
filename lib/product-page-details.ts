import type { CatalogProduct } from "@/lib/shop-catalog";
import type { ProductGalleryImage } from "@/components/product-gallery";

export type ProductFeature = { title: string; text: string };
export type ProductConfiguration = { label: string; values: string[] };
export type ProductSpecTable = { headers: string[]; rows: string[][] };
export type ProductPageDetails = {
  brand: string;
  intro: string;
  gallery: ProductGalleryImage[];
  galleryNote: string;
  overviewEyebrow: string;
  overviewTitle: string;
  overviewBody: string[];
  overviewImage: string;
  features: ProductFeature[];
  detailEyebrow: string;
  detailTitle: string;
  detailBody: string[];
  detailImage: string;
  configuration: ProductConfiguration[];
  specTitle: string;
  specIntro: string;
  specs: ProductSpecTable;
  equipment?: { title: string; text: string }[];
  source?: { label: string; url: string };
};

const splitValues = (value: string) => value.split(/\s*(?:,|;|\|)\s*/).filter(Boolean);

const p790: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A players-distance iron built around a forged feel, consistent carry and a refined shape at address.",
  gallery: [
    { src: "/images/products/gk-ir-tmp/p790-cavity.jpg", alt: "TaylorMade P790 iron cavity-back view", label: "Cavity" },
    { src: "/images/products/gk-ir-tmp/p790-face.jpg", alt: "TaylorMade P790 iron face and grooves", label: "Face" },
    { src: "/images/products/gk-ir-tmp/p790-address.jpg", alt: "TaylorMade P790 iron viewed from the playing position", label: "At address" },
    { src: "/images/products/gk-ir-tmp/p790-profile.jpg", alt: "TaylorMade P790 iron profile and topline", label: "Profile" },
  ],
  galleryNote: "TaylorMade product reference images supplied to Karibu Golf. Ask us for photographs of the exact set before ordering.",
  overviewEyebrow: "2025 P·790 IRONS",
  overviewTitle: "PLAYERS’ SHAPE. SERIOUS DISTANCE.",
  overviewBody: [
    "The 2025 P·790 combines a compact players-inspired profile with the speed and forgiveness expected from a modern hollow-body iron.",
    "TaylorMade positions it in the players-distance category: long, mid-high launching and more forgiving than the company’s compact players irons.",
  ],
  overviewImage: "/images/products/gk-ir-tmp/p790-cavity.jpg",
  features: [
    { title: "A stronger forged face", text: "The 4340M forged face is rated 20% stronger than the previous generation, allowing more face speed and a sweet spot TaylorMade says is up to 24% larger than the 2023 7-iron." },
    { title: "Tuned forged feel", text: "Each head is individually optimised and supported by SpeedFoam Air to balance the hollow construction with a responsive impact feel." },
    { title: "Progressive launch", text: "FLTD CG moves the centre of gravity through the set to manage launch, spin and distance gaps from the long irons into the scoring clubs." },
    { title: "Cleaner players shaping", text: "A thinner topline, increased sole radius and progressive leading edge refine the look at address and support consistent turf interaction." },
  ],
  detailEyebrow: "FROM 4-IRON TO PITCHING WEDGE",
  detailTitle: "ONE SET. PURPOSEFUL GAPPING.",
  detailBody: [
    "This Karibu listing is for a 4–PW set. The manufacturer’s reference lofts progress from 20° in the 4-iron to 44° in the pitching wedge.",
    "Shaft, flex, handedness and the exact set composition must be confirmed with the Karibu team before payment.",
  ],
  detailImage: "/images/products/gk-ir-tmp/p790-face.jpg",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Shaft", values: ["Steel", "Graphite"] },
    { label: "Flex", values: ["Regular (R)", "Stiff (S)", "Senior (A)"] },
    { label: "Set", values: ["4–PW"] },
  ],
  specTitle: "P·790 SPECIFICATIONS.",
  specIntro: "Manufacturer reference specifications for the 2025 P·790. This table covers the 4–PW set shown in the Karibu listing.",
  specs: {
    headers: ["Club", "Loft", "Lie", "Men’s length", "Hand"],
    rows: [
      ["4", "20°", "61°", '38.50"', "RH / LH"],
      ["5", "23°", "61.5°", '38.00"', "RH / LH"],
      ["6", "26.5°", "62°", '37.50"', "RH / LH"],
      ["7", "30°", "62.5°", '37.00"', "RH / LH"],
      ["8", "34°", "63°", '36.50"', "RH / LH"],
      ["9", "39°", "63.5°", '36.00"', "RH / LH"],
      ["PW", "44°", "64°", '35.75"', "RH / LH"],
    ],
  },
  equipment: [
    { title: "Steel shaft references", text: "TaylorMade lists KBS Tour Lite and Nippon Modus Tour 105 Luxury Black among the manufacturer configurations, with flex-dependent weights and launch profiles." },
    { title: "Graphite shaft reference", text: "Mitsubishi MMT configurations are listed in multiple weights and flexes. Confirm what is fitted to the actual Karibu set." },
    { title: "Grip reference", text: "The manufacturer’s standard reference is a Golf Pride Z-Grip Plus 2. The exact installed grip can vary, so request current photographs." },
  ],
  source: { label: "TaylorMade P·790 official product page", url: "https://www.taylormadegolf.com/P%E2%88%99790-Irons/DW-TC635.html?lang=en_US" },
};

const categoryGuidance: Record<string, { eyebrow: string; title: string; text: string }> = {
  drivers: { eyebrow: "OFF THE TEE", title: "KNOW YOUR DRIVER.", text: "Confirm loft, shaft, flex, handedness and head condition before choosing a driver." },
  woods: { eyebrow: "FROM TEE OR TURF", title: "BUILD THE TOP OF YOUR BAG.", text: "Confirm loft, shaft, flex and the role this fairway wood should play in your distance gaps." },
  hybrids: { eyebrow: "VERSATILE DISTANCE", title: "A USEFUL LONG-CLUB OPTION.", text: "Check loft, shaft, flex and how the hybrid fits between your longest iron and fairway wood." },
  golf_irons: { eyebrow: "APPROACH PLAY", title: "UNDERSTAND THE SET.", text: "Confirm every included iron, the shaft material, flex, handedness and condition of the set." },
  wedges: { eyebrow: "SCORING CLUBS", title: "CHECK LOFT AND BOUNCE.", text: "The right wedge depends on loft gaps, bounce, sole design and the conditions you normally play." },
  putters: { eyebrow: "ON THE GREEN", title: "CHOOSE YOUR LOOK AND FEEL.", text: "Confirm head style, length, toe hang or face balance, grip and overall condition." },
  mens_shoes: { eyebrow: "COURSE FOOTWEAR", title: "FIT FOR THE WALK.", text: "Confirm size, width, traction system, colour and return arrangements before ordering." },
  womens_shoes: { eyebrow: "COURSE FOOTWEAR", title: "FIT FOR THE WALK.", text: "Confirm size, width, traction system, colour and return arrangements before ordering." },
};

export function detailsForProduct(product: CatalogProduct): ProductPageDetails {
  if (product.slug === "gk-ir-tmp") return p790;

  const guide = categoryGuidance[product.categorySlug] ?? {
    eyebrow: product.categoryLabel.toUpperCase(),
    title: "THE DETAILS THAT MATTER.",
    text: "Review the available options and ask the Karibu team to confirm the exact specification before payment.",
  };
  const gallery = product.images.map((src, index) => ({
    src,
    alt: `${product.name}${index ? ` product view ${index + 1}` : " product photograph"}`,
    label: index === 0 ? "Product" : `View ${index + 1}`,
  }));
  const configuration: ProductConfiguration[] = [];
  if (product.sizes) configuration.push({ label: "Options", values: splitValues(product.sizes) });
  if (product.colors) configuration.push({ label: "Colour", values: splitValues(product.colors) });

  return {
    brand: "Karibu Golf selection",
    intro: product.description,
    gallery,
    galleryNote: "Product reference images. Ask us for current photographs and the exact specification before ordering.",
    overviewEyebrow: guide.eyebrow,
    overviewTitle: guide.title,
    overviewBody: [product.description, guide.text],
    overviewImage: gallery[0]?.src ?? "/images/clubs.jpg",
    features: [
      { title: "Product overview", text: product.description },
      { title: "Options", text: product.sizes ? `Listed options: ${product.sizes}. Confirm the exact available specification.` : "Ask us to confirm the exact size, model or specification available." },
      { title: "Colour and finish", text: product.colors ? `Listed colour or finish: ${product.colors}. Request current photographs before payment.` : "Ask us to confirm the colour, finish and current condition." },
      { title: "Local support", text: "Karibu Golf confirms stock, the exact item, delivery costs and payment details directly on WhatsApp." },
    ],
    detailEyebrow: product.categoryLabel.toUpperCase(),
    detailTitle: "CONFIRM YOUR EXACT ITEM.",
    detailBody: [
      "Product specifications can vary by model, size and production year. We will confirm the exact item against its SKU before you order.",
      "Use the selection panel to tell us what you need. A selection records your enquiry preference and does not reserve stock.",
    ],
    detailImage: gallery[1]?.src ?? gallery[0]?.src ?? "/images/clubs.jpg",
    configuration,
    specTitle: "PRODUCT DETAILS.",
    specIntro: "The current catalogue information for this Karibu Golf listing.",
    specs: {
      headers: ["Detail", "Information"],
      rows: [
        ["SKU", product.sku],
        ["Category", product.categoryLabel],
        ["Options", product.sizes || "Confirm with Karibu Golf"],
        ["Colour / finish", product.colors || "Confirm with Karibu Golf"],
        ["Stock", `${product.status}${product.stock ? ` · ${product.stock}` : ""}`],
      ],
    },
  };
}
