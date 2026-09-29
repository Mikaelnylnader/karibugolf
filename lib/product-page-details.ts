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

const t200: ProductPageDetails = {
  brand: "Titleist",
  intro: "A players-distance iron that pairs a clean, Tour-inspired shape with a forged face, hollow construction and modern launch technology.",
  gallery: [
    { src: "/images/products/Titleist_T200.jpg", alt: "Titleist T200 iron set available from Karibu Golf", label: "T200 set" },
  ],
  galleryNote: "Karibu Golf catalogue image. Ask us for current photographs of the exact set, shafts, faces and soles before ordering.",
  overviewEyebrow: "TITLEIST T200 IRONS",
  overviewTitle: "CLEAN SHAPE. CONTROLLED DISTANCE.",
  overviewBody: [
    "T200 is Titleist’s players-distance design: a forged face and hollow-body chassis in a compact shape with less offset.",
    "This Karibu listing covers a 4–PW plus approach-wedge set. Confirm the model generation and installed shaft against the physical stock before payment.",
  ],
  overviewImage: "/images/products/Titleist_T200.jpg",
  features: [
    { title: "Forged face and Max Impact", text: "Titleist combines a dual-taper forged face with a reengineered chassis and Max Impact technology to support feel and performance across the face." },
    { title: "Player-validated profile", text: "The head uses a clean Tour-inspired shape, less offset and proportions designed to frame the ball without looking oversized." },
    { title: "Progressive tungsten weighting", text: "Dense D18 tungsten is positioned through the set to tune launch in the long irons and control in the scoring clubs." },
    { title: "Variable-bounce sole", text: "A softened trailing edge, influenced by Vokey Design, is intended to help the sole move cleanly through the turf after impact." },
  ],
  detailEyebrow: "4-IRON THROUGH APPROACH WEDGE",
  detailTitle: "EIGHT CLUBS. CHECK EVERY SPEC.",
  detailBody: [
    "The manufacturer reference lofts run from 21° in the 4-iron to 48° in the approach wedge.",
    "The exact shaft, flex, handedness, condition and model generation must be confirmed with Karibu Golf before payment.",
  ],
  detailImage: "/images/products/Titleist_T200.jpg",
  configuration: [
    { label: "Set", values: ["4–PW + AW"] },
    { label: "Shaft and flex", values: ["Confirm exact stock"] },
    { label: "Hand", values: ["Confirm exact stock"] },
  ],
  specTitle: "T200 REFERENCE SPECIFICATIONS.",
  specIntro: "Titleist reference lofts for the 2023 T200 generation. Confirm that the physical set matches this generation.",
  specs: {
    headers: ["Club", "Loft", "Lie", "Length"],
    rows: [
      ["4", "21°", "61.5°", '38.50"'],
      ["5", "24°", "62°", '38.00"'],
      ["6", "27°", "62.5°", '37.50"'],
      ["7", "30.5°", "63°", '37.00"'],
      ["8", "34.5°", "63.5°", '36.50"'],
      ["9", "38.5°", "64°", '36.00"'],
      ["PW", "43°", "64°", '35.75"'],
      ["AW", "48°", "64°", '35.50"'],
    ],
  },
  equipment: [
    { title: "Steel and graphite", text: "Titleist lists a broad range of shaft weights and launch profiles. Ask for the exact brand, model, material, weight and flex fitted to this set." },
    { title: "Wedge gapping", text: "The 48° approach wedge should be checked against the next wedge in your bag by loft and carry distance." },
  ],
  source: { label: "Titleist T200 official product page", url: "https://www.titleist.com/golf-clubs/irons/t200-2023" },
};

const aiSmokeHl: ProductPageDetails = {
  brand: "Callaway",
  intro: "A high-launch game-improvement iron designed for moderate-to-average swing speeds and a confidence-inspiring flight.",
  gallery: [
    { src: "/images/shop/categories-v2/golf_irons.webp", alt: "Golf irons representing the Callaway Paradym Ai Smoke HL set", label: "Ai Smoke HL" },
  ],
  galleryNote: "Temporary category image. Ask Karibu Golf for current photographs of the exact Ai Smoke HL set before ordering.",
  overviewEyebrow: "PARADYM AI SMOKE HL",
  overviewTitle: "HIGHER LAUNCH. MORE CONFIDENCE.",
  overviewBody: [
    "Callaway built the HL model for golfers who need more launch to improve carry and hold more greens.",
    "A deep cavity, low centre of gravity and longer blade length distinguish it from the standard Ai Smoke and Max Fast models.",
  ],
  overviewImage: "/images/shop/categories-v2/golf_irons.webp",
  features: [
    { title: "Ai Smart Face", text: "Callaway says the face was optimised with swing data from thousands of golfers to support the launch and spin needs of the HL player." },
    { title: "Deep cavity construction", text: "A low, deep centre of gravity and tungsten weighting are designed to create a higher, more playable flight." },
    { title: "Longer long and mid irons", text: "The 4- through 7-irons use additional length to create speed; centre contact and fit still need to be checked." },
    { title: "Dynamic Sole Design", text: "A pre-worn leading edge and variable bounce are intended to promote clean turf interaction and forgiveness." },
  ],
  detailEyebrow: "4-IRON THROUGH APPROACH WEDGE",
  detailTitle: "BUILT TO HELP THE BALL CLIMB.",
  detailBody: [
    "The reference 7-iron is 30° with a 37.5-inch standard length. The set continues to a 47° approach wedge.",
    "Confirm that the physical stock carries the HL badge and verify its shaft, flex, handedness and condition before payment.",
  ],
  detailImage: "/images/shop/categories-v2/golf_irons.webp",
  configuration: [
    { label: "Set", values: ["4–PW + AW"] },
    { label: "Shaft and flex", values: ["Confirm exact stock"] },
    { label: "Hand", values: ["Confirm exact stock"] },
  ],
  specTitle: "AI SMOKE HL SPECIFICATIONS.",
  specIntro: "Callaway reference specifications for the 2024 Paradym Ai Smoke HL. Confirm the exact physical set before ordering.",
  specs: {
    headers: ["Club", "Loft", "Lie", "Length"],
    rows: [
      ["4", "21°", "59.75°", '39.75"'],
      ["5", "24°", "60.5°", '39.00"'],
      ["6", "27°", "61.25°", '38.25"'],
      ["7", "30°", "62°", '37.50"'],
      ["8", "34°", "62.75°", '36.75"'],
      ["9", "38°", "63.5°", '36.00"'],
      ["PW", "43°", "63.75°", '35.75"'],
      ["AW", "47°", "64°", '35.50"'],
    ],
  },
  equipment: [
    { title: "Reference steel shaft", text: "Callaway lists True Temper Elevate MPH 85 as an original steel configuration. Confirm what is installed on the Karibu set." },
    { title: "Reference graphite shaft", text: "Callaway lists Project X Cypher 2.0 60 as an original graphite configuration. Confirm the exact shaft and flex before payment." },
  ],
  source: { label: "Callaway Paradym Ai Smoke HL official product page", url: "https://www.callawaygolf.com/product/irons-2024-paradym-ai-smoke-hl" },
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
  if (product.slug === "gk-ir-ttt") return t200;
  if (product.slug === "gk-ir004") return aiSmokeHl;

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
