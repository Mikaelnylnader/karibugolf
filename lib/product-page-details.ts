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
  presentation?: {
    imageLabels: string[];
    featuresTitle: string;
    featuresIntro: string;
    inquiryTitle: string;
    inquiryBody: string;
    inquiryLink: string;
  };
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

const p770: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A modern players iron with a compact profile, forged feel and progressive launch designed for consistent shotmaking.",
  gallery: [
    { src: "/images/products/gk-ir-p770/p770-cavity.jpg", alt: "TaylorMade P770 iron cavity and forged back view", label: "Cavity" },
    { src: "/images/products/gk-ir-p770/p770-face.jpg", alt: "TaylorMade P770 iron face and grooves", label: "Face" },
    { src: "/images/products/gk-ir-p770/p770-address.jpg", alt: "TaylorMade P770 iron viewed from the playing position", label: "At address" },
    { src: "/images/products/gk-ir-p770/p770-profile.jpg", alt: "TaylorMade P770 iron profile, topline and sole", label: "Profile" },
  ],
  galleryNote: "TaylorMade product reference images supplied to Karibu Golf. Ask us for current photographs of the exact set before ordering.",
  overviewEyebrow: "2024 P·770 IRONS",
  overviewTitle: "COMPACT SHAPE. FORGED CONSISTENCY.",
  overviewBody: [
    "TaylorMade positions the P·770 as a modern players iron with a thinner topline and more compact head than P·790.",
    "The forged construction, FLTD CG and precision-milled face are designed to balance feel, launch, spin and forgiveness through the set.",
  ],
  overviewImage: "/images/products/gk-ir-p770/p770-cavity.jpg",
  features: [
    { title: "Solid forged feel", text: "TaylorMade says each forged head is fine-tuned to deliver precise feedback and the best-feeling P·770 generation to date." },
    { title: "Progressive flight", text: "FLTD CG is engineered to promote easier launch in the long irons and a lower, higher-spinning flight in the scoring clubs." },
    { title: "Refined players shaping", text: "A thinner topline, compact head and updated sole geometry provide a clean look at address and support consistent turf interaction." },
    { title: "Measured forgiveness", text: "Exacting mass optimisation and refined tungsten weighting add stability while preserving the workability expected from a players iron." },
  ],
  detailEyebrow: "4-IRON THROUGH PITCHING WEDGE",
  detailTitle: "SEVEN CLUBS. ONE CONTROLLED FLIGHT.",
  detailBody: [
    "This Karibu listing is for a 4–PW set with a stiff steel shaft. The manufacturer reference lofts progress from 22.5° in the 4-iron to 46° in the pitching wedge.",
    "Confirm the shaft brand and model, handedness, lie settings, grips and condition of the physical set with Karibu Golf before payment.",
  ],
  detailImage: "/images/products/gk-ir-p770/p770-face.jpg",
  configuration: [
    { label: "Set", values: ["4–PW"] },
    { label: "Shaft", values: ["Steel"] },
    { label: "Flex", values: ["Stiff"] },
    { label: "Hand", values: ["Confirm exact stock"] },
  ],
  specTitle: "P·770 SPECIFICATIONS.",
  specIntro: "TaylorMade reference specifications for the 2024 P·770. This table covers the 4–PW set shown in the Karibu listing.",
  specs: {
    headers: ["Club", "Loft", "Lie", "Men’s length", "Hand"],
    rows: [
      ["4", "22.5°", "61°", '38.50"', "RH / LH"],
      ["5", "25.5°", "61.5°", '38.00"', "RH / LH"],
      ["6", "29°", "62°", '37.50"', "RH / LH"],
      ["7", "33°", "62.5°", '37.00"', "RH / LH"],
      ["8", "37°", "63°", '36.50"', "RH / LH"],
      ["9", "41°", "63.5°", '36.00"', "RH / LH"],
      ["PW", "46°", "64°", '35.75"', "RH / LH"],
    ],
  },
  equipment: [
    { title: "Stiff steel stock", text: "This Karibu set is listed with a stiff steel shaft. Ask us to confirm the shaft brand, model, weight and labels from the physical clubs." },
    { title: "Manufacturer shaft reference", text: "TaylorMade lists True Temper Dynamic Gold Mid 115 S300 as a stiff reference configuration. The exact Karibu stock shaft must be verified before ordering." },
    { title: "Grip reference", text: "TaylorMade lists the Golf Pride Z-Grip Plus 2 as a standard reference grip. Request current photographs to confirm what is installed." },
  ],
  source: { label: "TaylorMade P·770 official product page", url: "https://www.taylormadegolf.com/P%E2%88%99770-Irons/DW-TC567.html?lang=en_US" },
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

const proV1: ProductPageDetails = {
  brand: "Titleist",
  intro: "A premium golf ball for mid-flight performance, low long-game spin and soft feel. Currently out of stock. Ask us about future availability.",
  gallery: [
    { src: "/images/products/titleist-pro-v1-box.png", alt: "Titleist Pro V1 dozen box in black packaging", label: "Dozen box" },
    { src: "/images/products/titleist-pro-v1-ball.png", alt: "White Titleist Pro V1 golf ball with Titleist logo", label: "Ball" },
    { src: "/images/products/titleist-pro-v1-alignment.png", alt: "Titleist Pro V1 ball showing the side-stamp alignment arrows", label: "Alignment" },
    { src: "/images/products/titleist-pro-v1-sleeve.png", alt: "Titleist Pro V1 sleeve packaging", label: "Sleeve" },
  ],
  galleryNote: "Product reference pictures supplied to Karibu Golf. This listing is for a dozen; the sleeve photograph shows the inner packaging. No stock is currently available.",
  overviewEyebrow: "TITLEIST PRO V1",
  overviewTitle: "DISTANCE. CONTROL. SOFT FEEL.",
  overviewBody: [
    "Pro V1 balances distance from the tee with control around the green. Titleist describes a mid-trajectory flight and softer feel than Pro V1x.",
    "Choose by your preferred flight, spin and feel, not handicap alone. Availability and the exact production generation will be confirmed before any order.",
  ],
  overviewImage: "/images/products/titleist-pro-v1-box.png",
  features: [
    { title: "Mid-flight profile", text: "A 388-dimple aerodynamic pattern supports a penetrating flight, lower than Pro V1x." },
    { title: "Long-game efficiency", text: "A high-flex casing works with the core to support speed and low spin on longer shots." },
    { title: "Scoring-shot control", text: "The high-gradient core is designed for responsive iron and wedge performance." },
    { title: "Soft cover feel", text: "The cast urethane elastomer cover supports touch and greenside spin." },
  ],
  detailEyebrow: "WHITE · DOZEN PACK",
  detailTitle: "YOUR BALL. YOUR PREFERRED FLIGHT.",
  detailBody: [
    "The listing is for 12 white Pro V1 balls. Box, ball, alignment-marking and sleeve photographs help you identify the product.",
    "This is a catalogue listing, not a reservation or an in-stock offer. Contact Karibu Golf for future availability and a confirmed quote.",
  ],
  detailImage: "/images/products/titleist-pro-v1-alignment.png",
  configuration: [
    { label: "Pack", values: ["Dozen (12 balls)"] },
    { label: "Colour", values: ["White"] },
  ],
  specTitle: "PRO V1 REFERENCE DETAILS.",
  specIntro: "Manufacturer reference information. Exact batch, generation and ball numbers are subject to confirmation when stock becomes available.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "Titleist Pro V1"], ["Pack", "Dozen (12 balls)"], ["Colour", "White"],
      ["Flight", "Mid trajectory"], ["Long-game spin", "Low"],
      ["Cover", "Cast urethane elastomer"], ["Dimple pattern", "388 tetrahedral"],
      ["Feel", "Soft"],
    ],
  },
  source: { label: "Titleist Pro V1 official product page", url: "https://www.titleist.com/product/pro-v1/005PV1T.html" },
  presentation: {
    imageLabels: ["Dozen box", "Ball", "Alignment"],
    featuresTitle: "WHAT SHAPES THE BALL'S PERFORMANCE.",
    featuresIntro: "Explore the flight, spin and feel behind Pro V1.",
    inquiryTitle: "FIND YOUR BALL. ASK WHAT'S NEXT.",
    inquiryBody: "This product is currently out of stock. Ask about future availability, the exact pack and delivery options across East Africa. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this golf ball",
  },
};

const proV1x: ProductPageDetails = {
  brand: "Titleist",
  intro: "A premium golf ball for higher flight, low long-game spin and responsive scoring-shot control, with a firmer feel than Pro V1. Currently out of stock; ask about future availability.",
  gallery: [
    { src: "/images/products/titleist-pro-v1x-box.png", alt: "Titleist Pro V1x dozen box in silver packaging", label: "Dozen box" },
    { src: "/images/products/titleist-pro-v1x-ball.png", alt: "White Titleist Pro V1x ball with Titleist logo and red number", label: "Ball" },
    { src: "/images/products/titleist-pro-v1x-angle.png", alt: "Titleist Pro V1x ball at an angle showing its logo and side stamp", label: "Angled view" },
    { src: "/images/products/titleist-pro-v1x-alignment.png", alt: "Titleist Pro V1x side-stamp alignment arrows", label: "Alignment" },
    { src: "/images/products/titleist-pro-v1x-sleeve.png", alt: "Titleist Pro V1x silver sleeve packaging", label: "Sleeve" },
  ],
  galleryNote: "Product reference pictures supplied to Karibu Golf. This listing is for a dozen; the sleeve photograph shows the inner packaging. No stock is currently available.",
  overviewEyebrow: "TITLEIST PRO V1x",
  overviewTitle: "HIGH FLIGHT. PRECISE CONTROL.",
  overviewBody: [
    "Titleist positions Pro V1x for golfers who want a higher flight and more iron and wedge spin than Pro V1, with a firmer feel.",
    "Choose the ball for your preferred trajectory, spin and feel rather than handicap alone. Confirm the exact production generation and availability with Karibu Golf before any order.",
  ],
  overviewImage: "/images/products/titleist-pro-v1x-box.png",
  features: [
    { title: "Higher flight", text: "A spherically tiled 348 tetrahedral dimple pattern supports a higher trajectory than Pro V1." },
    { title: "Low long-game spin", text: "The high-flex casing layer works with the core to support speed while keeping long-game spin low." },
    { title: "Iron and wedge control", text: "A high-gradient dual core supports iron and wedge spin. Titleist describes slightly more scoring-club spin than Pro V1." },
    { title: "Responsive urethane cover", text: "The cast urethane elastomer cover supports greenside touch and control. Overall feel is firmer than Pro V1." },
  ],
  detailEyebrow: "WHITE · DOZEN PACK",
  detailTitle: "MORE HEIGHT. YOUR PREFERRED FEEL.",
  detailBody: [
    "This listing is for 12 white Pro V1x balls. Your five reference photographs show the dozen box, ball, angled view, alignment marking and inner sleeve packaging.",
    "Pro V1x is a different model from Pro V1 and Pro V1x Left Dash. This is an out-of-stock catalogue listing, not a reservation or an available order.",
  ],
  detailImage: "/images/products/titleist-pro-v1x-alignment.png",
  configuration: [{ label: "Pack", values: ["Dozen (12 balls)"] }, { label: "Colour", values: ["White"] }],
  specTitle: "PRO V1x REFERENCE DETAILS.",
  specIntro: "Manufacturer reference information. Exact batch, production generation and ball numbers will be confirmed when stock becomes available.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "Titleist Pro V1x"], ["Pack", "Dozen (12 balls)"], ["Colour", "White"],
      ["Flight", "High trajectory; higher than Pro V1"], ["Long-game spin", "Low"],
      ["Iron / wedge spin", "Higher than Pro V1"], ["Core", "High-gradient dual core"],
      ["Cover", "Cast urethane elastomer"], ["Dimple pattern", "348 tetrahedral"], ["Feel", "Firmer than Pro V1"],
    ],
  },
  source: { label: "Titleist Pro V1x official product page", url: "https://www.titleist.com/product/pro-v1x/005PVXT.html" },
  presentation: {
    imageLabels: ["Dozen box", "Ball", "Angled view"],
    featuresTitle: "WHAT SHAPES THE BALL'S PERFORMANCE.",
    featuresIntro: "Explore the flight, spin and feel behind Pro V1x.",
    inquiryTitle: "FIND YOUR BALL. ASK WHAT'S NEXT.",
    inquiryBody: "This product is currently out of stock. Ask about future availability, the exact pack and delivery options across East Africa. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this golf ball",
  },
};

const playersGlove: ProductPageDetails = {
  brand: "Titleist",
  intro: "A thin cabretta-leather men's golf glove in Pearl (white). Currently out of stock. Ask about future availability and the right size, glove hand and fit for you.",
  gallery: [
    { src: "/images/products/titleist-players-glove-back.png", alt: "Pearl white Titleist Players men's glove showing back and closure", label: "Back" },
    { src: "/images/products/titleist-players-glove-palm.png", alt: "Titleist Players men's glove palm and perforated fingers", label: "Palm" },
    { src: "/images/products/titleist-players-glove-grip.png", alt: "Titleist Players glove gripping a golf club", label: "Grip" },
    { src: "/images/products/titleist-players-glove-packaging.png", alt: "Titleist Players cabretta leather glove in retail packaging", label: "Packaging" },
  ],
  galleryNote: "Product reference pictures supplied to Karibu Golf. Size, glove hand, fit and packaging will be confirmed when stock becomes available. No stock is currently available.",
  overviewEyebrow: "TITLEIST PLAYERS MEN'S",
  overviewTitle: "THIN LEATHER. CONNECTED FEEL.",
  overviewBody: [
    "Titleist pairs select cabretta leather with carefully placed seams for a close fit and responsive feel.",
    "This Pearl (white) glove is a catalogue listing, not an available order. Speak to Karibu Golf about future stock and fit before payment.",
  ],
  overviewImage: "/images/products/titleist-players-glove-back.png",
  features: [
    { title: "Select cabretta leather", text: "Thin leather balances a precise fit with close contact at the grip." },
    { title: "Breathable perforations", text: "Perforated areas help air move through the glove." },
    { title: "Considered construction", text: "Careful seam placement and twin elastic rows support fit and flexibility." },
    { title: "Secure, reinforced finish", text: "A fine-gauge hook-and-loop closure and satin reinforcement at the cuff and thumb finish the glove." },
  ],
  detailEyebrow: "SIZE · GLOVE HAND · FIT",
  detailTitle: "GET THE FIT RIGHT.",
  detailBody: [
    "Glove hand means the hand you wear it on, not the hand you swing with. Confirm size and regular or cadet fit with us when new stock arrives.",
    "The photographs are product references. They do not promise a specific hand or size in stock, and an availability enquiry does not reserve an item.",
  ],
  detailImage: "/images/products/titleist-players-glove-palm.png",
  configuration: [
    { label: "Size", values: ["Confirm on restock"] },
    { label: "Glove hand / fit", values: ["Confirm on restock"] },
    { label: "Colour", values: ["Pearl (white)"] },
  ],
  specTitle: "PLAYERS GLOVE REFERENCE DETAILS.",
  specIntro: "Manufacturer reference ranges, not Karibu inventory. No size or hand is currently available.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "Titleist Players Men's"], ["Colour", "Pearl (white)"], ["Material", "Select cabretta leather"],
      ["Regular left", "S, M, ML, L, XL, XXL"], ["Cadet left", "S, M, ML, L, XL"],
      ["Regular right", "S, M, ML, L, XL"], ["Current stock", "Out of stock · 0"],
    ],
  },
  source: { label: "Titleist Players men's official product page", url: "https://www.titleist.com/product/players-mens/007GL1T.html?dwvar_007GL1T_color=PRL" },
  presentation: {
    imageLabels: ["Back", "Palm", "Grip"],
    featuresTitle: "THE DETAILS BEHIND THE FEEL.",
    featuresIntro: "Explore the leather, ventilation and construction.",
    inquiryTitle: "YOUR FIT. ASK WHAT'S NEXT.",
    inquiryBody: "Currently out of stock. Ask about future availability, size and delivery across East Africa. We will confirm your glove hand and fit before any order.",
    inquiryLink: "Ask about this golf glove",
  },
};

const pureTouchGlove: ProductPageDetails = {
  brand: "FootJoy",
  intro: "Soft cabretta leather, a tailored fit and a clean white finish. Currently out of stock. Ask about future availability and your glove size, hand and fit.",
  gallery: [
    { src: "/images/products/footjoy-pure-touch-set.png", alt: "White FootJoy Pure Touch Limited glove beside its black packaging", label: "Glove + box" },
    { src: "/images/products/footjoy-pure-touch-back.png", alt: "FootJoy Pure Touch Limited glove back with FJ closure and perforated fingers", label: "Back" },
    { src: "/images/products/footjoy-pure-touch-palm.png", alt: "White FootJoy Pure Touch Limited glove palm", label: "Palm" },
    { src: "/images/products/footjoy-pure-touch-packaging.png", alt: "Black FootJoy Pure Touch Limited retail packaging", label: "Packaging" },
  ],
  galleryNote: "Your product reference pictures. Size, glove hand, fit and packaging will be confirmed when new stock arrives. No stock is currently available.",
  overviewEyebrow: "FOOTJOY PURE TOUCH LIMITED",
  overviewTitle: "SOFT FEEL. PRECISE FIT.",
  overviewBody: [
    "Pure Touch Limited combines selected cabretta leather with strategically positioned elastic for a close, tailored fit.",
    "Explore the glove here, then speak to Karibu Golf about future availability across East Africa. This is an out-of-stock catalogue listing, not a ready-to-ship item.",
  ],
  overviewImage: "/images/products/footjoy-pure-touch-back.png",
  features: [
    { title: "Select cabretta leather", text: "FootJoy uses carefully selected leather and a specialist preparation process for a supple feel." },
    { title: "Tailored fit", text: "Targeted elastic helps the glove sit closely around the hand." },
    { title: "White finish", text: "The white model shown in your four reference photographs." },
    { title: "Confirm before ordering", text: "Ask us to confirm size, glove hand, fit and availability when stock returns." },
  ],
  detailEyebrow: "SIZE · GLOVE HAND · FIT",
  detailTitle: "THE RIGHT FIT STARTS HERE.",
  detailBody: [
    "Glove hand is the hand you wear it on, not the hand you swing with. We will confirm your size and regular or cadet fit before any order.",
    "Reference pictures do not promise a particular size or hand in stock. An availability enquiry does not reserve a glove.",
  ],
  detailImage: "/images/products/footjoy-pure-touch-palm.png",
  configuration: [
    { label: "Size", values: ["Confirm on restock"] },
    { label: "Glove hand / fit", values: ["Confirm on restock"] },
    { label: "Colour", values: ["White"] },
  ],
  specTitle: "PURE TOUCH REFERENCE DETAILS.",
  specIntro: "Manufacturer reference details, not inventory. Confirm which sizes and fits we can supply on restock.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "FootJoy Pure Touch Limited"], ["Style", "64013E"],
      ["Colour", "White"], ["Material", "Select cabretta leather"],
      ["Manufacturer size range", "S, M, ML, L, XL, 2XL; varies by hand / fit"],
      ["Manufacturer hand / fit options", "Regular left, cadet left, regular right"],
      ["Current stock", "Out of stock · 0"],
    ],
  },
  source: { label: "FootJoy Pure Touch Limited official product page", url: "https://www.footjoy.com/product/men/gloves-men/pure-touch-limited/026PUR.html?dwvar_026PUR_color=64013E" },
  presentation: {
    imageLabels: ["Glove + box", "Back", "Palm"],
    featuresTitle: "A CLOSER LOOK AT PURE TOUCH.",
    featuresIntro: "Explore the leather, fit and finish.",
    inquiryTitle: "YOUR FIT. ASK WHAT'S NEXT.",
    inquiryBody: "Currently out of stock. Ask about future availability and delivery across East Africa. We will confirm size, glove hand and fit before any order.",
    inquiryLink: "Ask about this golf glove",
  },
};

const stasofGlove: ProductPageDetails = {
  brand: "FootJoy",
  intro: "Advanced performance leather with breathable mesh, perforations and a secure angled closure. Pearl / Black. Currently out of stock; ask about your size, glove hand and fit on restock.",
  gallery: [
    { src: "/images/products/footjoy-stasof-set.png", alt: "FootJoy StaSof glove beside its black and yellow packaging", label: "Glove + box" },
    { src: "/images/products/footjoy-stasof-back.png", alt: "White FootJoy StaSof glove back with black and yellow FJ closure", label: "Back" },
    { src: "/images/products/footjoy-stasof-palm.png", alt: "FootJoy StaSof glove leather palm and perforated fingers", label: "Palm" },
    { src: "/images/products/footjoy-stasof-packaging.png", alt: "FootJoy StaSof retail packaging", label: "Packaging" },
  ],
  galleryNote: "Product reference photos supplied by Karibu Golf. No stock is currently available. Confirm size, glove hand, fit and packaging when stock returns.",
  overviewEyebrow: "FOOTJOY STASOF",
  overviewTitle: "SOFT FEEL. CONFIDENT GRIP.",
  overviewBody: [
    "FootJoy’s StaSof uses advanced performance leather designed for lasting softness and moisture resistance, with a breathable construction and a secure closure.",
    "Explore the glove and size guide here, then ask Karibu Golf about future availability across East Africa. This listing is not a ready-to-ship item.",
  ],
  overviewImage: "/images/products/footjoy-stasof-back.png",
  features: [
    { title: "Advanced performance leather", text: "APL leather is designed to balance softness, moisture resistance and grip." },
    { title: "Breathable construction", text: "PowerNet mesh and positioned perforations support airflow and flexibility." },
    { title: "Consistent fit", text: "Hand-crafted construction and moisture-wicking elastics support comfort." },
    { title: "Angled ComforTab closure", text: "A hook-and-loop closure helps secure the glove around the hand." },
  ],
  detailEyebrow: "SIZE · GLOVE HAND · FIT",
  detailTitle: "MAKE THE FIT YOURS.",
  detailBody: [
    "Use the size guide below to take your measurements. Glove hand means the hand you wear it on; regular and cadet fit must be confirmed for your chosen size.",
    "The photos do not promise any size or hand in stock. We will confirm the exact item and availability before an order.",
  ],
  detailImage: "/images/products/footjoy-stasof-palm.png",
  configuration: [
    { label: "Size", values: ["Confirm on restock"] },
    { label: "Glove hand / fit", values: ["Confirm on restock"] },
    { label: "Colour", values: ["Pearl / Black"] },
  ],
  specTitle: "STASOF REFERENCE DETAILS.",
  specIntro: "Manufacturer reference information, not inventory. Confirm size and fit on restock.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "FootJoy StaSof Men's"], ["Style", "66770E-301"], ["Colour", "Pearl / Black"],
      ["Leather", "APL advanced performance leather"], ["Ventilation", "PowerNet mesh and perforations"],
      ["Closure", "Angled ComforTab hook-and-loop"], ["Size / hand / fit", "Confirm on restock"],
      ["Current stock", "Out of stock · 0"],
    ],
  },
  source: { label: "FootJoy StaSof official product page", url: "https://www.footjoy.com/product/men/gloves-men/stasof/006STA.html?dwvar_006STA_color=66770E-301" },
  presentation: {
    imageLabels: ["Glove + box", "Back", "Palm"],
    featuresTitle: "THE STASOF DETAILS.",
    featuresIntro: "Explore the leather, ventilation and closure.",
    inquiryTitle: "YOUR FIT. ASK WHAT'S NEXT.",
    inquiryBody: "Currently out of stock. Ask about future availability and delivery across East Africa. We will confirm size, glove hand and fit before any order.",
    inquiryLink: "Ask about this golf glove",
  },
};

const weathersofGlove: ProductPageDetails = {
  brand: "FootJoy",
  intro: "Everyday comfort, a soft feel and a secure adjustable closure. White / Black. Currently out of stock; ask about your size, glove hand and fit on restock.",
  gallery: [
    { src: "/images/products/footjoy-weathersof-set.png", alt: "White and black FootJoy WeatherSof glove beside its green packaging", label: "Glove + box" },
    { src: "/images/products/footjoy-weathersof-back.png", alt: "FootJoy WeatherSof glove back with FJ closure and perforated fingers", label: "Back" },
    { src: "/images/products/footjoy-weathersof-palm.png", alt: "FootJoy WeatherSof glove palm with reinforced areas", label: "Palm" },
    { src: "/images/products/footjoy-weathersof-packaging.png", alt: "Green FootJoy WeatherSof retail packaging", label: "Packaging" },
  ],
  galleryNote: "Product reference photographs supplied by Karibu Golf. No stock is currently available. Confirm the exact version, size, glove hand and packaging when stock returns.",
  overviewEyebrow: "FOOTJOY WEATHERSOF",
  overviewTitle: "EVERYDAY COMFORT. CONFIDENT GRIP.",
  overviewBody: [
    "WeatherSof is designed around a soft feel, a consistent fit and dependable grip. Your photographs show the white and black glove with green WeatherSof packaging.",
    "Explore the glove and size guide here, then ask Karibu Golf about future availability across East Africa. This is a catalogue listing, not a ready-to-ship item.",
  ],
  overviewImage: "/images/products/footjoy-weathersof-back.png",
  features: [
    { title: "Soft feel", text: "FootJoy’s prior-generation WeatherSof reference describes FiberSof material for comfort and a consistent fit." },
    { title: "Reinforced grip areas", text: "The same manufacturer reference uses performance leather in high-wear areas. Confirm the exact version on restock." },
    { title: "Breathable design", text: "Perforated fingers are visible in the supplied photographs; the prior-generation reference also describes PowerNet knuckle mesh." },
    { title: "Adjustable closure", text: "The FJ-branded closure helps secure the glove around the hand. FootJoy calls its reference closure ComforTab." },
  ],
  detailEyebrow: "SIZE · GLOVE HAND · FIT",
  detailTitle: "FIND YOUR EVERYDAY FIT.",
  detailBody: [
    "Use the size guide below to measure your hand. Glove hand means the hand you wear it on, not the hand you swing with. We will confirm size and regular or cadet fit before any order.",
    "WeatherSof versions and packaging can differ. The linked manufacturer reference is a prior-generation two-pack; it does not mean this listing includes two gloves. Confirm the exact item and pack contents when stock returns.",
  ],
  detailImage: "/images/products/footjoy-weathersof-palm.png",
  configuration: [
    { label: "Size", values: ["Confirm on restock"] },
    { label: "Glove hand / fit", values: ["Confirm on restock"] },
    { label: "Colour", values: ["White / Black"] },
  ],
  specTitle: "WEATHERSOF REFERENCE DETAILS.",
  specIntro: "The photos show the product to explore. Manufacturer technology references describe the prior-generation model, not confirmed incoming inventory.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "FootJoy WeatherSof Men's"], ["Colour shown", "White / Black"],
      ["Closure", "Adjustable FJ-branded closure"], ["Size / hand / fit", "Confirm on restock"],
      ["Exact version / pack contents", "Confirm on restock"], ["Current stock", "Out of stock · 0"],
    ],
  },
  source: { label: "FootJoy WeatherSof prior-generation manufacturer reference (two-pack)", url: "https://www.footjoy.com/product/sale/sale-gloves/weathersof-2-pack/004WEA.html" },
  presentation: {
    imageLabels: ["Glove + box", "Back", "Palm"],
    featuresTitle: "A CLOSER LOOK AT WEATHERSOF.",
    featuresIntro: "Explore the feel, fit and closure, then confirm the exact version on restock.",
    inquiryTitle: "YOUR FIT. ASK WHAT'S NEXT.",
    inquiryBody: "Currently out of stock. Ask about future availability and delivery across East Africa. We will confirm size, glove hand, fit and pack contents before any order.",
    inquiryLink: "Ask about this golf glove",
  },
};

const womensWeathersofGlove: ProductPageDetails = {
  brand: "FootJoy",
  intro: "A women’s all-weather golf glove with a soft feel, breathable stretch and an adjustable closure. Five photographed colour options are shown. Currently out of stock; ask about your preferred colour, size and glove hand.",
  gallery: [
    { src: "/images/products/footjoy-weathersof-women-white-black-set.png", alt: "White and black women’s FootJoy WeatherSof glove beside green packaging", label: "White / Black · Set" },
    { src: "/images/products/footjoy-weathersof-women-white-black-back.png", alt: "White and black women’s FootJoy WeatherSof glove back", label: "White / Black · Back" },
    { src: "/images/products/footjoy-weathersof-women-white-black-packaging.png", alt: "White and black women’s FootJoy WeatherSof retail packaging", label: "White / Black · Box" },
    { src: "/images/products/footjoy-weathersof-women-white-black-palm.png", alt: "White women’s FootJoy WeatherSof glove palm", label: "White / Black · Palm" },
    { src: "/images/products/footjoy-weathersof-women-black-set.png", alt: "Black women’s FootJoy WeatherSof glove beside green packaging", label: "Black · Set" },
    { src: "/images/products/footjoy-weathersof-women-black-back.png", alt: "Black women’s FootJoy WeatherSof glove back", label: "Black · Back" },
    { src: "/images/products/footjoy-weathersof-women-black-packaging.png", alt: "Black women’s FootJoy WeatherSof retail packaging", label: "Black · Box" },
    { src: "/images/products/footjoy-weathersof-women-navy-set.png", alt: "Navy women’s FootJoy WeatherSof glove beside green packaging", label: "Navy · Set" },
    { src: "/images/products/footjoy-weathersof-women-navy-back.png", alt: "Navy women’s FootJoy WeatherSof glove back", label: "Navy · Back" },
    { src: "/images/products/footjoy-weathersof-women-navy-packaging.png", alt: "Navy women’s FootJoy WeatherSof retail packaging", label: "Navy · Box" },
    { src: "/images/products/footjoy-weathersof-women-pink-set.png", alt: "White and pink women’s FootJoy WeatherSof glove beside green packaging", label: "White / Pink · Set" },
    { src: "/images/products/footjoy-weathersof-women-pink-back.png", alt: "White and pink women’s FootJoy WeatherSof glove back", label: "White / Pink · Back" },
    { src: "/images/products/footjoy-weathersof-women-pink-packaging.png", alt: "White and pink women’s FootJoy WeatherSof retail packaging", label: "White / Pink · Box" },
    { src: "/images/products/footjoy-weathersof-women-turquoise-set.png", alt: "White and turquoise women’s FootJoy WeatherSof glove beside green packaging", label: "White / Turquoise · Set" },
    { src: "/images/products/footjoy-weathersof-women-turquoise-back.png", alt: "White and turquoise women’s FootJoy WeatherSof glove back", label: "White / Turquoise · Back" },
    { src: "/images/products/footjoy-weathersof-women-turquoise-packaging.png", alt: "White and turquoise women’s FootJoy WeatherSof retail packaging", label: "White / Turquoise · Box" },
  ],
  galleryNote: "All 16 product reference photographs were supplied by Karibu Golf. The five colours shown are reference options, not current inventory. Confirm the exact colour, size, glove hand and packaging when stock returns.",
  overviewEyebrow: "FOOTJOY WEATHERSOF WOMEN",
  overviewTitle: "COLOURFUL CHOICE. EVERYDAY COMFORT.",
  overviewBody: [
    "WeatherSof Women combines soft FiberSof MicroTac material, breathable PowerNet mesh and an adjustable ComforTab closure for everyday play.",
    "Explore the five photographed colour options and use the fitting section below, then ask Karibu Golf about future availability across East Africa. This is an out-of-stock catalogue listing.",
  ],
  overviewImage: "/images/products/footjoy-weathersof-women-white-black-back.png",
  features: [
    { title: "FiberSof MicroTac", text: "FootJoy describes the material as soft and designed to support a secure grip." },
    { title: "PowerNet mesh", text: "Mesh across the back of the hand supports breathability, comfort and flexibility." },
    { title: "ComforTab closure", text: "The angled hook-and-loop tab is designed to create a comfortable, secure fit." },
    { title: "Five photographed colours", text: "Choose White / Black, Black, Navy, White / Pink or White / Turquoise as your preferred restock enquiry." },
  ],
  detailEyebrow: "SIZE · GLOVE HAND · COLOUR",
  detailTitle: "CHOOSE YOUR PREFERRED FIT.",
  detailBody: [
    "FootJoy’s current manufacturer page lists S, M, ML and L with Regular Left and Regular Right options. These are reference options, not a statement of Karibu stock.",
    "The supplied women’s measurement picture is a general reference, not an official FootJoy conversion chart. Use it to understand how to measure, then confirm the model-specific fit with Karibu Golf before ordering.",
  ],
  detailImage: "/images/products/footjoy-weathersof-women-white-black-palm.png",
  configuration: [
    { label: "Size", values: ["Small (S)", "Medium (M)", "Medium-Large (ML)", "Large (L)"] },
    { label: "Glove hand / fit", values: ["Regular left", "Regular right"] },
    { label: "Colour", values: ["White / Black", "Black", "Navy", "White / Pink", "White / Turquoise"] },
  ],
  specTitle: "WEATHERSOF WOMEN REFERENCE DETAILS.",
  specIntro: "Manufacturer reference information and owner-supplied colour photographs. Exact incoming inventory must be confirmed on restock.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "FootJoy WeatherSof Women"], ["Style", "66980E"],
      ["Photographed colours", "White / Black · Black · Navy · White / Pink · White / Turquoise"],
      ["Manufacturer size options", "S · M · ML · L"], ["Manufacturer hand options", "Regular Left · Regular Right"],
      ["Material", "FiberSof MicroTac"], ["Ventilation", "PowerNet mesh"],
      ["Closure", "ComforTab hook-and-loop"], ["Current stock", "Out of stock · 0"],
    ],
  },
  source: { label: "FootJoy WeatherSof Women official product page", url: "https://www.footjoy.eu/en/women/gloves/weathersof-women/094AUS.html?dwvar_094AUS_color=66980E" },
  presentation: {
    imageLabels: ["White / Black", "Black", "Navy", "White / Pink", "White / Turquoise"],
    featuresTitle: "THE WEATHERSOF DETAILS.",
    featuresIntro: "Explore the material, ventilation, closure and five photographed colours.",
    inquiryTitle: "YOUR COLOUR. YOUR FIT. ASK WHAT’S NEXT.",
    inquiryBody: "Currently out of stock. Select your preferred size, glove hand and colour, then ask about future availability and delivery across East Africa. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this golf glove",
  },
};

const mg5Wedge: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A tour-inspired, fully forged wedge combining soft carbon-steel feel with a RAW face, Spin Tread Technology and aggressive saw-milled grooves.",
  gallery: [
    { src: "/images/products/taylormade-mg5-wedge-back.jpg", alt: "TaylorMade MG5 Satin Chrome wedge back and milled sole", label: "Back" },
    { src: "/images/products/taylormade-mg5-wedge-face.jpg", alt: "TaylorMade MG5 wedge face and full groove pattern", label: "Face" },
    { src: "/images/products/taylormade-mg5-wedge-face-angle.jpg", alt: "TaylorMade MG5 wedge face, hosel and grooves from an angle", label: "Grooves" },
    { src: "/images/products/taylormade-mg5-wedge-sole.jpg", alt: "TaylorMade MG5 wedge sole and precision-milled grind", label: "Sole" },
  ],
  galleryNote: "All four official TaylorMade product-reference photographs were supplied by Karibu Golf. They show the Satin Chrome finish; exact loft, bounce, grind, hand, shaft and condition must be confirmed when stock returns.",
  overviewEyebrow: "TAYLORMADE MILLED GRIND 5",
  overviewTitle: "FORGED FEEL. CONTROL IN EVERY CONDITION.",
  overviewBody: [
    "TaylorMade builds MG5 from ultrasoft forged carbon steel for responsive feel through the scoring clubs.",
    "Spin Tread Technology redirects water from the RAW face, while tighter, sharper saw-milled grooves are designed to retain friction and control around the green.",
  ],
  overviewImage: "/images/products/taylormade-mg5-wedge-back.jpg",
  features: [
    { title: "Fully forged feel", text: "The MG5 head is fully forged from ultrasoft carbon steel for the soft, responsive feedback TaylorMade targets in a tour-inspired wedge." },
    { title: "Spin Tread Technology", text: "TaylorMade’s face treatment is designed to redirect water away from impact and help maintain friction in wet playing conditions." },
    { title: "Aggressive saw-milled grooves", text: "Tighter tolerances, steeper groove walls and sharper radii are engineered to create more spin and control." },
    { title: "Tour-inspired sole choices", text: "The manufacturer’s selector covers multiple precision-milled grinds for different turf conditions, divot patterns and face manipulation." },
  ],
  detailEyebrow: "LOFT · BOUNCE · GRIND",
  detailTitle: "BUILD THE WEDGE AROUND YOUR TURF.",
  detailBody: [
    "The manufacturer’s current selector spans 46° through 60°, with LB, SC, SB, SX and HB sole choices covering firm through soft conditions and shallow through steep deliveries.",
    "These choices are fitting references, not Karibu inventory. Select your preference below and the team will confirm the exact head, finish, hand, shaft and grip before payment.",
  ],
  detailImage: "/images/products/taylormade-mg5-wedge-face-angle.jpg",
  configuration: [
    { label: "Loft", values: ["46°", "48°", "50°", "52°", "54°", "56°", "58°", "60°"] },
    { label: "Grind", values: ["LB", "SC", "SB", "SX", "HB"] },
    { label: "Finish", values: ["Satin Chrome", "Charcoal"] },
    { label: "Hand", values: ["Right handed", "Left handed"] },
  ],
  specTitle: "MG5 GRIND REFERENCE.",
  specIntro: "TaylorMade manufacturer-reference combinations from the current MG5 selector. Not every loft is offered in every grind, and none of these options represents current Karibu stock.",
  specs: {
    headers: ["Grind", "Loft / bounce", "Manufacturer fit summary"],
    rows: [
      ["LB", "56.08° · 58.08° · 60.08°", "Shallow delivery and firm, tight conditions"],
      ["SC", "54.10° · 56.10° · 58.09° · 60.09°", "Heel-and-toe relief for greenside versatility"],
      ["SB", "46.09° · 48.09° · 50.09° · 52.09° · 54.12° · 56.12° · 58.10° · 60.10°", "Four-way camber for varied swings and turf"],
      ["SX", "58.11° · 60.11°", "Mid-bounce versatility with a Reverse-C trailing edge"],
      ["HB", "54.13° · 56.14° · 58.12° · 60.12°", "Steeper delivery or softer conditions"],
    ],
  },
  source: { label: "TaylorMade MG5 official product page", url: "https://www.taylormadegolf.com/MG5-Wedge/DW-TC647.html?lang=en_US" },
  presentation: {
    imageLabels: ["Back", "Face", "Grooves"],
    featuresTitle: "THE MG5 DETAILS.",
    featuresIntro: "Move through the forged construction, wet-condition face treatment, groove geometry and sole choices.",
    inquiryTitle: "CHOOSE THE LOFT. MATCH THE GRIND.",
    inquiryBody: "Currently out of stock. Select a manufacturer-reference loft, grind, finish and hand, then ask Karibu Golf to confirm future availability and the exact build. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this MG5 wedge",
  },
};

const sim2MaxIrons: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A high-launching game-improvement iron set built around Cap Back construction, an intelligently positioned sweet spot and forged-like impact feel.",
  gallery: [
    { src: "/images/products/taylormade-sim2-max-irons-cavity.jpg", alt: "TaylorMade SIM2 Max 7-iron cavity-back view", label: "Cavity" },
    { src: "/images/products/taylormade-sim2-max-irons-address.jpg", alt: "TaylorMade SIM2 Max iron viewed from the playing position", label: "At address" },
    { src: "/images/products/taylormade-sim2-max-irons-face.jpg", alt: "TaylorMade SIM2 Max iron face and grooves", label: "Face" },
    { src: "/images/products/taylormade-sim2-max-irons-sole.jpg", alt: "TaylorMade SIM2 Max 7-iron sole and Speed Pocket", label: "Sole" },
  ],
  galleryNote: "All four official TaylorMade product-reference photographs were supplied by Karibu Golf. Ask for current photographs and confirmation of the exact 5–PW + AW set, hand, shafts, flexes and condition when stock returns.",
  overviewEyebrow: "TAYLORMADE SIM2 MAX IRONS",
  overviewTitle: "HIGH LAUNCH. FAST FACE. MORE FORGIVENESS.",
  overviewBody: [
    "SIM2 Max uses a multi-material Cap Back structure to support the topline and upper face while preserving face flexibility for distance and forgiveness.",
    "A low centre of gravity promotes higher launch, while TaylorMade positions Progressive Inverted Cone Technology to expand the useful sweet spot and help reduce the common right miss.",
  ],
  overviewImage: "/images/products/taylormade-sim2-max-irons-cavity.jpg",
  features: [
    { title: "Cap Back construction", text: "A lightweight multi-material structure supports the topline from heel to toe while working with the flexible face to improve sound, feel and speed." },
    { title: "Fast, forgiving face", text: "Each face uses Progressive Inverted Cone Technology to position the sweet spot for common impact locations and help minimise the typical right miss." },
    { title: "Thru-Slot Speed Pocket", text: "TaylorMade’s sole slot is engineered to preserve face flexibility and ball speed on strikes low on the face." },
    { title: "ECHO Damping System", text: "A softer polymer blend stretches across the enclosed cavity to channel away harsh vibration and create a forged-like impact sensation." },
  ],
  detailEyebrow: "THE 5–PW + AW SET",
  detailTitle: "SEVEN CLUBS. ONE EASY-LAUNCHING SETUP.",
  detailBody: [
    "The manufacturer configuration shown for this listing runs from the 5-iron through pitching wedge and adds the 49° approach wedge.",
    "Hand, shaft and flex selections below are fitting references, not current Karibu inventory. The team will confirm every club and component before payment.",
  ],
  detailImage: "/images/products/taylormade-sim2-max-irons-face.jpg",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Shaft / flex", values: ["KBS Max 85 MT Steel · Stiff", "Ventus Blue Graphite · Senior", "Ventus Blue Graphite · Regular", "Ventus Blue Graphite · Stiff"] },
    { label: "Set", values: ["5–PW + AW"] },
  ],
  specTitle: "SIM2 MAX SET SPECIFICATIONS.",
  specIntro: "TaylorMade manufacturer-reference specifications for the 5–PW + AW configuration shown in this Karibu listing.",
  specs: {
    headers: ["Club", "Loft", "Lie", "Length", "Hand"],
    rows: [
      ["5", "21.5°", "62.0°", '38.50"', "RH / LH"],
      ["6", "25.0°", "62.5°", '37.88"', "RH / LH"],
      ["7", "28.5°", "63.0°", '37.25"', "RH / LH"],
      ["8", "32.5°", "63.5°", '36.75"', "RH / LH"],
      ["9", "38.0°", "64.0°", '36.25"', "RH / LH"],
      ["PW", "43.5°", "64.5°", '35.75"', "RH / LH"],
      ["AW", "49.0°", "64.5°", '35.50"', "RH / LH"],
    ],
  },
  equipment: [
    { title: "KBS Max 85 MT steel", text: "TaylorMade’s reference steel build lists Stiff flex at 98g with 1.7° torque." },
    { title: "Fujikura Ventus Blue graphite", text: "The reference graphite build lists Senior, Regular and Stiff profiles from 56g to 76g, with high to mid-high launch." },
    { title: "Lamkin Crossline 360 grip", text: "The manufacturer reference grip is a black, standard-size 52g Crossline 360 with a textured round profile." },
  ],
  source: { label: "TaylorMade SIM2 Max Irons official product page", url: "https://www.taylormadegolf.com/SIM2-Max-Irons/DW-TA164.html?lang=en_US" },
  presentation: {
    imageLabels: ["Cavity", "At address", "Face"],
    featuresTitle: "THE SIM2 MAX DETAILS.",
    featuresIntro: "Explore the structural, speed, forgiveness and feel technologies behind this game-improvement set.",
    inquiryTitle: "CHOOSE THE BUILD. WE WILL CONFIRM THE SET.",
    inquiryBody: "Currently out of stock. Select a manufacturer-reference hand and shaft profile, then ask Karibu Golf to confirm the exact seven-club set, condition and future availability. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this SIM2 Max set",
  },
};

const sim2MaxDriver: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A 460cc driver built for high launch, high MOI and maximum forgiveness, with an aerodynamic carbon sole and a speed-injected face.",
  gallery: [
    { src: "/images/products/taylormade-sim2-max-driver-sole.jpg", alt: "TaylorMade SIM2 Max Driver sole and Inertia Generator", label: "Sole" },
    { src: "/images/products/taylormade-sim2-max-driver-crown.jpg", alt: "TaylorMade SIM2 Max Driver carbon crown", label: "Crown" },
    { src: "/images/products/taylormade-sim2-max-driver-face.jpg", alt: "TaylorMade SIM2 Max Driver Twist Face", label: "Face" },
    { src: "/images/products/taylormade-sim2-max-driver-profile.jpg", alt: "TaylorMade SIM2 Max Driver side profile", label: "Profile" },
    { src: "/images/products/taylormade-sim2-max-driver-headcover.jpg", alt: "TaylorMade SIM2 Max Driver headcover", label: "Headcover" },
  ],
  galleryNote: "All five official TaylorMade product-reference photographs were supplied by Karibu Golf. Ask for current photographs and confirmation of the exact loft, hand, shaft, flex, grip, headcover and condition when stock returns.",
  overviewEyebrow: "TAYLORMADE SIM2 MAX DRIVER",
  overviewTitle: "HIGHER LAUNCH. HIGH MOI. MAX FORGIVENESS.",
  overviewBody: [
    "SIM2 Max combines a lightweight Forged Ring Construction with a 24g tungsten weight positioned on the Inertia Generator for stability and forgiveness.",
    "A TPS Front Weight supports a mid-to-high launch and mid-to-low spin profile, while the 9-layer carbon sole is shaped to reduce drag through the downswing.",
  ],
  overviewImage: "/images/products/taylormade-sim2-max-driver-sole.jpg",
  features: [
    { title: "Forged Ring Construction", text: "A precision-milled aluminium ring unites the driver head's components to support speed, stability and forgiveness." },
    { title: "24g Inertia Generator", text: "The heavy rear tungsten weight raises MOI and helps keep the head stable on off-centre strikes." },
    { title: "Speed Injected Twist Face", text: "A milled back face cup and toe-side injection port tune face speed, while Twist Face is designed to reduce common miss patterns." },
    { title: "Thru-Slot Speed Pocket", text: "TaylorMade's sole slot is designed to preserve ball speed on strikes made low on the face." },
  ],
  detailEyebrow: "LOFT · HAND · SHAFT",
  detailTitle: "MATCH THE DRIVER TO YOUR DELIVERY.",
  detailBody: [
    "TaylorMade lists 9° and 10.5° heads in right- and left-handed builds, while the 12° reference head is right-handed. The 4° loft sleeve supports fitting adjustments.",
    "These choices are manufacturer fitting references, not Karibu inventory. The team will confirm the exact head, shaft, flex and playing length before payment.",
  ],
  detailImage: "/images/products/taylormade-sim2-max-driver-face.jpg",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Loft", values: ["9°", "10.5°", "12° (RH reference)"] },
    { label: "Shaft / flex", values: ["Fujikura Ventus Blue · Senior", "Fujikura Ventus Blue · Regular", "Fujikura Ventus Blue · Stiff", "Kuro Kage Silver · Regular", "Kuro Kage Silver · Stiff", "Kuro Kage Silver · X-Stiff"] },
  ],
  specTitle: "SIM2 MAX DRIVER SPECIFICATIONS.",
  specIntro: "TaylorMade manufacturer-reference specifications. Exact Karibu stock must be confirmed when the driver becomes available.",
  specs: {
    headers: ["Loft", "Hand", "Lie", "Volume", "Length", "Swing weight"],
    rows: [
      ["9°", "RH / LH", "56°–60°", "460cc", '45.75"', "D4"],
      ["10.5°", "RH / LH", "56°–60°", "460cc", '45.75"', "D4"],
      ["12°", "RH", "56°–60°", "460cc", '45.75"', "D4"],
    ],
  },
  equipment: [
    { title: "Fujikura Ventus Blue", text: "TaylorMade's reference profiles include Senior, Regular and Stiff flexes from 53g to 55g with mid-high launch and mid spin." },
    { title: "Kuro Kage Silver", text: "Reference Regular, Stiff and X-Stiff profiles range from 64g to 69g with mid launch and mid-low spin." },
    { title: "Golf Pride Z-Grip", text: "The reference grip is a black/grey standard-size 47g Z-Grip. Confirm the grip and included headcover on the exact item." },
  ],
  source: { label: "TaylorMade SIM2 Max Driver official product page", url: "https://www.taylormadegolf.com/SIM2-Max-Driver/DW-JJI65.html?lang=en_US" },
  presentation: {
    imageLabels: ["Sole", "Crown", "Face", "Profile", "Headcover"],
    featuresTitle: "THE SIM2 MAX DRIVER DETAILS.",
    featuresIntro: "Explore the structure, weighting, face technology and low-face protection behind this forgiving 460cc head.",
    inquiryTitle: "CHOOSE THE LOFT. WE WILL CONFIRM THE BUILD.",
    inquiryBody: "Currently out of stock. Select a manufacturer-reference loft, hand and shaft profile, then ask Karibu Golf to confirm future availability and the exact build. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this SIM2 Max driver",
  },
};

const sim2MaxFairway: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A high-launching, forgiving fairway wood with an ultra-low centre of gravity, a versatile V Steel sole and a fast C300 steel face.",
  gallery: [
    { src: "/images/products/taylormade-sim2-max-fairway-sole.jpg", alt: "TaylorMade SIM2 Max Fairway sole and V Steel design", label: "Sole" },
    { src: "/images/products/taylormade-sim2-max-fairway-crown.jpg", alt: "TaylorMade SIM2 Max Fairway carbon crown", label: "Crown" },
    { src: "/images/products/taylormade-sim2-max-fairway-face.jpg", alt: "TaylorMade SIM2 Max Fairway Twist Face", label: "Face" },
    { src: "/images/products/taylormade-sim2-max-fairway-profile.jpg", alt: "TaylorMade SIM2 Max Fairway side profile", label: "Profile" },
    { src: "/images/products/taylormade-sim2-max-fairway-headcover.jpg", alt: "TaylorMade SIM2 Max Fairway headcover", label: "Headcover" },
  ],
  galleryNote: "All five official TaylorMade product-reference photographs were supplied by Karibu Golf. Ask for current photographs and confirmation of the exact loft, hand, shaft, flex, grip, headcover and condition when stock returns.",
  overviewEyebrow: "TAYLORMADE SIM2 MAX FAIRWAY",
  overviewTitle: "LOWER CG. HIGHER LAUNCH. MORE FORGIVENESS.",
  overviewBody: [
    "SIM2 Max pairs multi-material construction with efficient sole weighting to create an ultra-low centre of gravity for high launch, distance and forgiveness.",
    "Its refined V Steel sole reduces the area contacting the turf, helping the head move cleanly through different lies from both tee and fairway.",
  ],
  overviewImage: "/images/products/taylormade-sim2-max-fairway-sole.jpg",
  features: [
    { title: "V Steel with ultra-low CG", text: "The updated sole redistributes mass for forgiveness while its depressed heel and toe improve turf interaction and versatility." },
    { title: "C300 Steel Twist Face", text: "The strong C300 steel face is built for ball speed, while Twist Face curvature is designed to reduce common miss patterns." },
    { title: "Multi-material construction", text: "A 190cc 3-wood head uses strategic weighting to combine explosive distance, forgiveness and a high-launch profile." },
    { title: "Thru-Slot Speed Pocket", text: "TaylorMade's sole slot is designed to preserve face flexibility and ball speed on strikes made low on the face." },
  ],
  detailEyebrow: "LOFT · HAND · SHAFT",
  detailTitle: "FIT THE FAIRWAY WOOD TO YOUR GAPS.",
  detailBody: [
    "TaylorMade lists 3, 3HL and 5 heads in right- and left-handed builds; the 7 and 9 references are right-handed. Head size and playing length change through the range.",
    "These choices are manufacturer fitting references, not Karibu inventory. The team will confirm the exact head, shaft, flex and playing length before payment.",
  ],
  detailImage: "/images/products/taylormade-sim2-max-fairway-face.jpg",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Loft", values: ["3 · 15°", "3HL · 16.5°", "5 · 18°", "7 · 21° (RH reference)", "9 · 24° (RH reference)"] },
    { label: "Shaft / flex", values: ["Ventus Blue 5 FW · Senior", "Ventus Blue 5 FW · Regular", "Ventus Blue 6 FW · Stiff", "Ventus Blue 6 FW · X-Stiff"] },
  ],
  specTitle: "SIM2 MAX FAIRWAY SPECIFICATIONS.",
  specIntro: "TaylorMade manufacturer-reference specifications. Exact Karibu stock must be confirmed when the fairway wood becomes available.",
  specs: {
    headers: ["Club", "Loft", "Hand", "Lie", "Volume", "Length", "Swing weight"],
    rows: [
      ["3", "15°", "RH / LH", "59°", "190cc", '43.25"', "D3"],
      ["3HL", "16.5°", "RH / LH", "59°", "190cc", '43.25"', "D3"],
      ["5", "18°", "RH / LH", "59.5°", "160cc", '42.25"', "D3"],
      ["7", "21°", "RH", "60°", "160cc", '41.75"', "D3"],
      ["9", "24°", "RH", "60.5°", "145cc", '41.25"', "D3"],
    ],
  },
  equipment: [
    { title: "Ventus Blue 6 FW", text: "TaylorMade's Stiff and X-Stiff reference profiles weigh 62g and 63g, with mid launch and mid spin." },
    { title: "Ventus Blue 5 FW", text: "The Regular and Senior reference profiles weigh 56g and 55g, with mid-high launch and mid spin." },
    { title: "Golf Pride Z-Grip", text: "The reference grip is a black/grey standard-size 47g Z-Grip. Confirm the grip and included headcover on the exact item." },
  ],
  source: { label: "TaylorMade SIM2 Max Fairway official product page", url: "https://www.taylormadegolf.com/SIM2-Max-Fairway/DW-JJI58.html?lang=en_US" },
  presentation: {
    imageLabels: ["Sole", "Crown", "Face", "Profile", "Headcover"],
    featuresTitle: "THE SIM2 MAX FAIRWAY DETAILS.",
    featuresIntro: "Explore the sole geometry, face construction, weighting and low-face protection behind this forgiving fairway wood.",
    inquiryTitle: "CHOOSE THE LOFT. WE WILL CONFIRM THE BUILD.",
    inquiryBody: "Currently out of stock. Select a manufacturer-reference loft, hand and shaft profile, then ask Karibu Golf to confirm future availability and the exact build. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this SIM2 Max fairway",
  },
};

const sim2MaxRescue: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A high-launching, forgiving hybrid with a refined V Steel sole, a fast C300 steel face and Tour-validated versatility.",
  gallery: [
    { src: "/images/products/taylormade-sim2-max-rescue-sole.jpg", alt: "TaylorMade SIM2 Max Rescue sole and V Steel design", label: "Sole" },
    { src: "/images/products/taylormade-sim2-max-rescue-crown.jpg", alt: "TaylorMade SIM2 Max Rescue crown", label: "Crown" },
    { src: "/images/products/taylormade-sim2-max-rescue-face.jpg", alt: "TaylorMade SIM2 Max Rescue Twist Face", label: "Face" },
    { src: "/images/products/taylormade-sim2-max-rescue-profile.jpg", alt: "TaylorMade SIM2 Max Rescue side profile", label: "Profile" },
    { src: "/images/products/taylormade-sim2-max-rescue-headcover.jpg", alt: "TaylorMade SIM2 Max Rescue headcover", label: "Headcover" },
  ],
  galleryNote: "All five official TaylorMade product-reference photographs were supplied by Karibu Golf. Ask for current photographs and confirmation of the exact loft, hand, shaft, flex, grip, headcover and condition when stock returns.",
  overviewEyebrow: "TAYLORMADE SIM2 MAX RESCUE",
  overviewTitle: "HIGH LAUNCH. EASY DISTANCE. RESCUE VERSATILITY.",
  overviewBody: [
    "SIM2 Max Rescue builds on the original SIM Max hybrid with precision sole weighting and a refined V Steel shape for increased forgiveness and launch.",
    "The design is intended to work from tee, fairway and rough, offering a towering flight with useful workability across a broad range of golfers.",
  ],
  overviewImage: "/images/products/taylormade-sim2-max-rescue-sole.jpg",
  features: [
    { title: "New V Steel design", text: "The updated sole redistributes mass for forgiveness while its depressed heel and toe improve turf interaction and versatility." },
    { title: "C300 Steel Twist Face", text: "The high-strength steel face is built for ball speed, while Twist Face curvature is designed to reduce common miss patterns." },
    { title: "Tour-validated performance", text: "TaylorMade positions SIM2 Max Rescue as a high-flight, workable hybrid inspired by the success of the original SIM Max Rescue." },
    { title: "Thru-Slot Speed Pocket", text: "TaylorMade's sole slot is designed to preserve face flexibility and ball speed on strikes made low on the face." },
  ],
  detailEyebrow: "LOFT · HAND · SHAFT",
  detailTitle: "FIT THE RESCUE TO YOUR LONG-GAME GAPS.",
  detailBody: [
    "TaylorMade lists 3, 4 and 5 heads in right- and left-handed builds; the 6 and 7 references are right-handed. Lie and playing length change progressively through the range.",
    "These choices are manufacturer fitting references, not Karibu inventory. The team will confirm the exact head, shaft, flex and playing length before payment.",
  ],
  detailImage: "/images/products/taylormade-sim2-max-rescue-face.jpg",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Loft", values: ["3 · 19°", "4 · 22°", "5 · 25°", "6 · 28° (RH reference)", "7 · 31° (RH reference)"] },
    { label: "Shaft / flex", values: ["Fujikura Ventus Blue · Senior", "Fujikura Ventus Blue · Regular", "Fujikura Ventus Blue · Stiff"] },
  ],
  specTitle: "SIM2 MAX RESCUE SPECIFICATIONS.",
  specIntro: "TaylorMade manufacturer-reference specifications. Exact Karibu stock must be confirmed when the Rescue becomes available.",
  specs: {
    headers: ["Club", "Loft", "Hand", "Lie", "Length", "Swing weight"],
    rows: [
      ["3", "19°", "RH / LH", "60°", '40.75"', "D3"],
      ["4", "22°", "RH / LH", "60.5°", '40.25"', "D3"],
      ["5", "25°", "RH / LH", "61°", '39.75"', "D3"],
      ["6", "28°", "RH", "61.5°", '39.25"', "D3"],
      ["7", "31°", "RH", "62°", '38.75"', "D3"],
    ],
  },
  equipment: [
    { title: "Fujikura Ventus Blue", text: "TaylorMade's Senior, Regular and Stiff reference profiles range from 56g to 76g, with high to mid-high launch." },
    { title: "Lamkin Crossline 360", text: "The manufacturer reference grip is a black, standard-size 52g Crossline 360 with a textured round profile." },
  ],
  source: { label: "TaylorMade SIM2 Max Rescue official product page", url: "https://www.taylormadegolf.com/SIM2-Max-Rescue/DW-JJI54.html?lang=en_US" },
  presentation: {
    imageLabels: ["Sole", "Crown", "Face", "Profile", "Headcover"],
    featuresTitle: "THE SIM2 MAX RESCUE DETAILS.",
    featuresIntro: "Explore the sole geometry, face construction, launch profile and low-face protection behind this forgiving hybrid.",
    inquiryTitle: "CHOOSE THE LOFT. WE WILL CONFIRM THE BUILD.",
    inquiryBody: "Currently out of stock. Select a manufacturer-reference loft, hand and shaft profile, then ask Karibu Golf to confirm future availability and the exact build. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this SIM2 Max Rescue",
  },
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
  if (product.slug === "gk-ir-p770") return p770;
  if (product.slug === "gk-ir-ttt") return t200;
  if (product.slug === "gk-ir004") return aiSmokeHl;
  if (product.slug === "gk-bl012") return proV1;
  if (product.slug === "gk-bl011") return proV1x;
  if (product.slug === "gk-gl005") return playersGlove;
  if (product.slug === "gk-gl010") return pureTouchGlove;
  if (product.slug === "gk-gl008") return stasofGlove;
  if (product.slug === "gk-gl009") return weathersofGlove;
  if (product.slug === "gk-gl011") return womensWeathersofGlove;
  if (product.slug === "gk-wg009") return mg5Wedge;
  if (product.slug === "gk-ir005") return sim2MaxIrons;
  if (product.slug === "gk-dr001") return sim2MaxDriver;
  if (product.slug === "gk-fw001") return sim2MaxFairway;
  if (product.slug === "gk-hy001") return sim2MaxRescue;

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
