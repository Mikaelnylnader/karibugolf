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
  intro: "A high-launch game-improvement iron for moderate-to-average swing speeds, designed to add carry distance and help more approach shots hold the green.",
  gallery: [
    { src: "/images/products/callaway-paradym-ai-smoke-hl-cavity.jpg", alt: "Callaway Paradym Ai Smoke HL iron cavity-back view", label: "Cavity" },
    { src: "/images/products/callaway-paradym-ai-smoke-hl-face.jpg", alt: "Callaway Paradym Ai Smoke HL iron face and grooves", label: "Face" },
    { src: "/images/products/callaway-paradym-ai-smoke-hl-address.jpg", alt: "Callaway Paradym Ai Smoke HL iron at address", label: "Address" },
    { src: "/images/products/callaway-paradym-ai-smoke-hl-sole.jpg", alt: "Callaway Paradym Ai Smoke HL iron sole and hosel profile", label: "Sole" },
  ],
  galleryNote: "Detailed manufacturer product views. Confirm the fitted shaft, flex, hand and condition of the exact Karibu set before ordering.",
  overviewEyebrow: "PARADYM AI SMOKE HL",
  overviewTitle: "HIGHER LAUNCH. MORE CONFIDENCE.",
  overviewBody: [
    "Callaway built the HL model for golfers who need a higher flight to maximise carry distance and hit more greens.",
    "Its game-improvement profile combines a deep cavity back, a low centre of gravity and a confidence-inspiring blade length.",
  ],
  overviewImage: "/images/products/callaway-paradym-ai-smoke-hl-cavity.jpg",
  features: [
    { title: "Ai Smart Face", text: "Callaway used swing data from real golfers to optimise the face for the launch and spin needs of the HL player." },
    { title: "High-launch profile", text: "A deep cavity-back construction and low centre of gravity are designed to help the ball launch higher with more usable carry." },
    { title: "Longer long and mid irons", text: "The 4- through 7-irons use additional length to support speed while retaining a forgiving game-improvement shape." },
    { title: "Dynamic Sole Design", text: "A pre-worn leading edge and variable bounce are designed for cleaner turf interaction and consistent contact." },
  ],
  detailEyebrow: "4-IRON THROUGH APPROACH WEDGE",
  detailTitle: "BUILT TO HELP THE BALL CLIMB.",
  detailBody: [
    "The Karibu configuration is 4–PW plus approach wedge. Callaway's reference 7-iron is 30° at 37.5 inches, and the approach wedge is 47°.",
    "The official model supports both right- and left-handed builds. Confirm the actual hand, shaft, flex and condition of this set before payment.",
  ],
  detailImage: "/images/products/callaway-paradym-ai-smoke-hl-face.jpg",
  configuration: [
    { label: "Set", values: ["4–PW + AW"] },
    { label: "Shaft / flex", values: ["Confirm exact stock"] },
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
    { title: "Reference steel shaft", text: "Callaway lists True Temper Elevate MPH 85 as a stock steel option. Confirm what is installed on the Karibu set." },
    { title: "Reference graphite shaft", text: "Callaway lists Project X Cypher 2.0 60 as a stock graphite option. Confirm the exact shaft and flex before payment." },
  ],
  source: { label: "Callaway Paradym Ai Smoke HL official product page", url: "https://www.callawaygolf.com/golf-clubs/irons/irons-2024-paradym-ai-smoke-hl.html" },
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

const rainGripGlove: ProductPageDetails = {
  brand: "FootJoy",
  intro: "A black pair of wet-weather golf gloves with water-absorbent palms and quick-drying backs. Currently out of stock; ask about future availability and your size.",
  gallery: [
    { src: "/images/products/footjoy-raingrip-pair-set.png", alt: "Black FootJoy RainGrip golf glove pair beside blue retail packaging", label: "Pair + packaging" },
    { src: "/images/products/footjoy-raingrip-pair-packaging.png", alt: "FootJoy RainGrip pair blue retail packaging", label: "Packaging" },
    { src: "/images/products/footjoy-raingrip-pair-grip.png", alt: "Black FootJoy RainGrip pair holding a golf club", label: "Wet-weather grip" },
    { src: "/images/products/footjoy-raingrip-pair-palm-left.png", alt: "FootJoy RainGrip glove Sure-Grip Autosuede knit palm", label: "Palm 1" },
    { src: "/images/products/footjoy-raingrip-pair-palm-right.png", alt: "Second FootJoy RainGrip glove Sure-Grip Autosuede knit palm", label: "Palm 2" },
  ],
  galleryNote: "All five RainGrip product-reference screenshots were supplied by Karibu Golf. The listing is for a pair, but no size is currently in stock. Confirm the exact pair, size and packaging before payment.",
  overviewEyebrow: "FOOTJOY RAINGRIP PAIR",
  overviewTitle: "RAIN-READY GRIP. TWO-GLOVE CONTROL.",
  overviewBody: [
    "RainGrip is FootJoy's wet-weather glove pair. The water-absorbent Sure-Grip Autosuede knit palms are designed to conform to the hands and club as they get wet, supporting control in rainy conditions.",
    "Quick-Dry material across the backs of the fingers is designed to dry quickly while supporting breathability, flexibility and comfort. The supplied photographs show the black pair and blue HydroSeries packaging.",
  ],
  overviewImage: "/images/products/footjoy-raingrip-pair-grip.png",
  features: [
    { title: "Sure-Grip wet-weather palms", text: "Water-absorbent Autosuede knit palms are designed to improve fit and grip in rainy conditions." },
    { title: "Quick-drying comfort", text: "Quick-Dry material on the backs of the fingers supports faster drying and comfortable wet-weather play." },
    { title: "Flexible, breathable build", text: "FootJoy describes the Quick-Dry construction as supporting breathability, flexibility and comfort." },
    { title: "Secure ComforTab closure", text: "A strategically angled hook-and-loop tab is designed to create a secure, precise fit." },
  ],
  detailEyebrow: "PAIR · BLACK · WET WEATHER",
  detailTitle: "MATCH THE PAIR TO YOUR HAND SIZE.",
  detailBody: [
    "RainGrip is sold as a pair, so there is no separate glove-hand selection. FootJoy lists S, M, ML, L, XL and XXL as manufacturer size options for this black Regular Pair.",
    "Those sizes are reference options rather than Karibu inventory. Use the fitting guide below, then ask us to confirm the exact size and package available when stock returns.",
  ],
  detailImage: "/images/products/footjoy-raingrip-pair-palm-left.png",
  configuration: [
    { label: "Size", values: ["Small (S)", "Medium (M)", "Medium-Large (ML)", "Large (L)", "Extra Large (XL)", "2X Large (XXL)"] },
    { label: "Pack", values: ["Regular pair"] },
    { label: "Colour", values: ["Black"] },
  ],
  specTitle: "RAINGRIP PAIR REFERENCE DETAILS.",
  specIntro: "Official FootJoy product information. Manufacturer options do not indicate current Karibu inventory.",
  specs: {
    headers: ["Detail", "Information"],
    rows: [
      ["Model", "FootJoy RainGrip Pair"],
      ["Style", "66083E"],
      ["Colour", "Black"],
      ["Pack", "Pair of gloves"],
      ["Manufacturer sizes", "S · M · ML · L · XL · XXL"],
      ["Palm", "Sure-Grip Autosuede knit"],
      ["Back", "Quick-Dry material"],
      ["Closure", "Angled ComforTab hook-and-loop"],
      ["Current stock", "Out of stock · 0"],
    ],
  },
  source: { label: "FootJoy RainGrip Pair official product page", url: "https://www.footjoy.eu/en/men/gloves/raingrip-pair/024PAI.html?dwvar_024PAI_color=66083E" },
  presentation: {
    imageLabels: ["Pair", "Wet-weather grip", "Quick-Dry"],
    featuresTitle: "BUILT FOR WET-WEATHER CONTROL.",
    featuresIntro: "Explore the palm material, quick-drying construction, flexibility and closure.",
    inquiryTitle: "YOUR SIZE. ASK WHAT'S NEXT.",
    inquiryBody: "Currently out of stock. Select your preferred size, then ask about future availability and delivery across East Africa. We will confirm the exact pair and packaging before any order.",
    inquiryLink: "Ask about this RainGrip pair",
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

const rtx6ZipCoreWedge: ProductPageDetails = {
  brand: "Cleveland Golf",
  intro: "A Tour Satin scoring wedge combining HydraZip face treatment, a low-density ZipCore and tightly spaced UltiZip grooves for predictable spin and control.",
  gallery: [
    { src: "/images/products/cleveland-rtx6-zipcore-tour-satin-back.jpg", alt: "Cleveland RTX 6 ZipCore Tour Satin wedge back", label: "Back" },
    { src: "/images/products/cleveland-rtx6-zipcore-tour-satin-face.jpg", alt: "Cleveland RTX 6 ZipCore Tour Satin wedge face", label: "Face" },
    { src: "/images/products/cleveland-rtx6-zipcore-tour-satin-grooves.jpg", alt: "Cleveland RTX 6 ZipCore Tour Satin wedge groove detail", label: "Grooves" },
    { src: "/images/products/cleveland-rtx6-zipcore-tour-satin-cavity.jpg", alt: "Cleveland RTX 6 ZipCore Tour Satin wedge cavity", label: "Cavity" },
    { src: "/images/products/cleveland-rtx6-zipcore-tour-satin-sole.jpg", alt: "Cleveland RTX 6 ZipCore Tour Satin wedge sole", label: "Sole" },
    { src: "/images/products/cleveland-rtx6-zipcore-tour-satin-topline.webp", alt: "Cleveland RTX 6 ZipCore Tour Satin wedge topline", label: "Topline" },
  ],
  galleryNote: "All six Tour Satin product-reference photographs were supplied by Karibu Golf. Exact loft, bounce, grind, hand, shaft and grip must be confirmed when stock returns.",
  overviewEyebrow: "CLEVELAND RTX 6 ZIPCORE",
  overviewTitle: "MAXIMUM SPIN. ANY CONDITION.",
  overviewBody: [
    "RTX 6 ZipCore combines three face and head technologies to help preserve spin, launch and control from the fairway, rough, sand and wet lies.",
    "The Tour Satin finish shown in every supplied photograph has a clean silver appearance designed to reduce distracting glare at address.",
  ],
  overviewImage: "/images/products/cleveland-rtx6-zipcore-tour-satin-back.jpg",
  features: [
    { title: "HydraZip", text: "A dynamic face-blasting and laser-line system is tuned by loft to increase friction and help maximise spin in wet conditions." },
    { title: "ZipCore", text: "A lightweight, low-density core shifts the centre of gravity while adding stability, feel and forgiveness across the face." },
    { title: "UltiZip grooves", text: "Sharper, deeper and more tightly spaced grooves are designed to cut through debris and create two extra groove edges across the face." },
    { title: "Four sole families", text: "LOW, LOW+, MID and FULL sole options cover different turf conditions, delivery patterns and greenside techniques." },
  ],
  detailEyebrow: "LOFT · BOUNCE · GRIND",
  detailTitle: "MATCH THE GRIND TO THE TURF.",
  detailBody: [
    "The manufacturer range spans 46° through 60°. MID covers every loft, while LOW, LOW+ and FULL add specialised choices in the sand- and lob-wedge lofts.",
    "These are manufacturer references, not current Karibu inventory. Select a preference below and the team will confirm the exact build and future availability before payment.",
  ],
  detailImage: "/images/products/cleveland-rtx6-zipcore-tour-satin-grooves.jpg",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Loft / bounce / grind", values: [
      "46.10 MID", "48.10 MID", "50.10 MID", "52.10 MID",
      "54.08 LOW+", "54.10 MID", "54.12 FULL",
      "56.08 LOW+", "56.10 MID", "56.12 FULL",
      "58.06 LOW", "58.10 MID", "58.12 FULL",
      "60.06 LOW", "60.10 MID", "60.12 FULL",
    ] },
    { label: "Finish", values: ["Tour Satin"] },
    { label: "Shaft", values: ["Steel wedge shaft (confirm exact model / flex)"] },
  ],
  specTitle: "RTX 6 ZIPCORE GRIND REFERENCE.",
  specIntro: "Manufacturer-reference loft, bounce and grind combinations. Standard lie is 64° throughout; these options do not represent current Karibu stock.",
  specs: {
    headers: ["Grind", "Loft / bounce", "Manufacturer fit summary"],
    rows: [
      ["LOW", "58.06 · 60.06", "Firm turf, shallow delivery and maximum face manipulation"],
      ["LOW+", "54.08 · 56.08", "Versatile low bounce with extra help from sand"],
      ["MID", "46.10 · 48.10 · 50.10 · 52.10 · 54.10 · 56.10 · 58.10 · 60.10", "Neutral delivery and varied turf conditions"],
      ["FULL", "54.12 · 56.12 · 58.12 · 60.12", "Softer turf, steeper delivery and a fuller sole"],
    ],
  },
  equipment: [
    { title: "Reference lengths", text: "46° / 48°: 35.625 inches; 50° / 52°: 35.375 inches; 54° / 56°: 35.125 inches; 58° / 60°: 34.875 inches." },
    { title: "Reference swing weights", text: "D3 for 46° / 48°, D4 for 50° / 52°, and D5 from 54° through 60°." },
    { title: "Lie and components", text: "Standard lie is 64°. Ask Karibu Golf to confirm the exact shaft, flex and grip fitted to any future stock." },
  ],
  source: { label: "Cleveland RTX 6 ZipCore Tour Satin official product page", url: "https://us.dunlopsports.com/cleveland-golf/clubs/wedges/rtx-6-zipcore/rtx-6-zipcore-tour-satin-wedge/30227308.html" },
  presentation: {
    imageLabels: ["Back", "Face", "Grooves", "Cavity", "Sole", "Topline"],
    featuresTitle: "THE RTX 6 ZIPCORE DETAILS.",
    featuresIntro: "Explore the face treatment, core construction, groove geometry and sole choices behind this Tour Satin wedge.",
    inquiryTitle: "CHOOSE THE LOFT. MATCH THE GRIND.",
    inquiryBody: "Currently out of stock. Select a manufacturer-reference loft, bounce, grind and hand, then ask Karibu Golf to confirm future availability and the exact shaft and grip. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this RTX 6 wedge",
  },
};

const vokeySm11Wedge: ProductPageDetails = {
  brand: "Titleist",
  intro: "A precision scoring wedge built around six Tour-proven grinds, unified CG placement and the Vokey Spin System for cleaner contact, controlled flight and predictable spin.",
  gallery: [
    { src: "/images/products/titleist-vokey-sm11-wedge-back.png", alt: "Titleist Vokey SM11 Tour Chrome wedge back", label: "Back", group: "Tour Chrome" },
    { src: "/images/products/titleist-vokey-sm11-wedge-face.png", alt: "Titleist Vokey SM11 wedge face and grooves", label: "Face", group: "Tour Chrome" },
    { src: "/images/products/titleist-vokey-sm11-wedge-sole.png", alt: "Titleist Vokey SM11 wedge sole and bounce profile", label: "Sole", group: "Tour Chrome" },
    { src: "/images/products/titleist-vokey-sm11-wedge-profile.png", alt: "Titleist Vokey SM11 Tour Chrome side profile", label: "Profile", group: "Tour Chrome" },
    { src: "/images/products/titleist-vokey-sm11-wedge-address.png", alt: "Titleist Vokey SM11 wedge at address", label: "Address", group: "Tour Chrome" },
    { src: "/images/products/titleist-vokey-sm11-wedge-jet-black-back.png", alt: "Titleist Vokey SM11 Jet Black wedge back", label: "Jet Black back", group: "Jet Black" },
    { src: "/images/products/titleist-vokey-sm11-wedge-jet-black-face.png", alt: "Titleist Vokey SM11 Jet Black wedge face and grooves", label: "Jet Black face", group: "Jet Black" },
    { src: "/images/products/titleist-vokey-sm11-wedge-jet-black-sole.png", alt: "Titleist Vokey SM11 Jet Black wedge sole and bounce profile", label: "Jet Black sole", group: "Jet Black" },
    { src: "/images/products/titleist-vokey-sm11-wedge-jet-black-profile.png", alt: "Titleist Vokey SM11 Jet Black side profile", label: "Jet Black profile", group: "Jet Black" },
  ],
  galleryNote: "All nine product-reference screenshots were supplied by Karibu Golf. They show the Tour Chrome and Jet Black finishes. Karibu's planned SM11 range is right-handed only and is not currently in stock; exact future availability and shaft model / flex must be confirmed.",
  overviewEyebrow: "TITLEIST VOKEY DESIGN SM11",
  overviewTitle: "CLEANER CONTACT. CONTROLLED FLIGHT. SMARTER SPIN.",
  overviewBody: [
    "Karibu's planned SM11 range focuses on seven right-handed loft, bounce and grind models from 48° to 60°, covering F, M and T grinds for full swings and precise scoring shots.",
    "For each loft, Titleist positions the centre of gravity consistently across the grind family, helping preserve a controlled launch window while the Vokey Spin System manages spin from different lies.",
  ],
  overviewImage: "/images/products/titleist-vokey-sm11-wedge-back.png",
  features: [
    { title: "Cleaner contact", text: "The loft, bounce and grind matrix is designed to guide the sole toward a repeatable strike and promote contact between grooves two and five." },
    { title: "Controlled flight", text: "Unified CG placement keeps the centre of gravity consistent across grinds at the same loft for a stable, predictable launch window." },
    { title: "Vokey Spin System", text: "An angled face texture, shot-specific groove shapes and deeper Spin Milled grooves are combined to produce appropriate spin from varied lies." },
    { title: "Extended groove durability", text: "Titleist heat-treats the grooves to improve durability as the wedge sees regular practice and course use." },
  ],
  detailEyebrow: "LOFT · BOUNCE · GRIND",
  detailTitle: "FIT THE SOLE TO YOUR SWING AND TURF.",
  detailBody: [
    "The planned Karibu range covers 48.10 F, 50.08 F, 52.08 F, 54.08 M, 56.08 M, 58.04 T and 60.04 T in Tour Chrome or Jet Black.",
    "These are planned future models, not current inventory. Select a preferred specification below and the team will confirm future availability and the exact shaft model / flex before payment.",
  ],
  detailImage: "/images/products/titleist-vokey-sm11-wedge-address.png",
  configuration: [
    { label: "Hand", values: ["Right handed"] },
    { label: "Loft / bounce / grind", values: [
      "48.10 F", "50.08 F", "52.08 F", "54.08 M", "56.08 M", "58.04 T", "60.04 T",
    ] },
    { label: "Finish", values: ["Tour Chrome", "Jet Black"] },
    { label: "Shaft", values: ["Standard steel shaft"] },
  ],
  specTitle: "VOKEY SM11 SPECIFICATION RANGES.",
  specIntro: "Karibu's seven planned right-handed models. Standard lie is 64° throughout; exact future availability and the shaft model / flex must be confirmed before ordering.",
  specs: {
    headers: ["Wedge family", "Lofts", "Bounce / grind reference", "Length", "Swing weight"],
    rows: [
      ["Pitching", "48°", "10° · F", '35.75"', "D3"],
      ["Gap", "50° / 52°", "8° · F", '35.50"', "D3"],
      ["Sand", "54° / 56°", "8° · M", '35.25"', "D5"],
      ["Lob", "58° / 60°", "4° · T", '35.00"', "D5"],
    ],
  },
  equipment: [
    { title: "Right-handed build", text: "The planned Karibu range will be offered in right-handed models only." },
    { title: "Seven planned models", text: "Choose from 48.10 F, 50.08 F, 52.08 F, 54.08 M, 56.08 M, 58.04 T and 60.04 T." },
    { title: "Tour Chrome or Jet Black", text: "The planned finish range is limited to Tour Chrome and Jet Black." },
    { title: "One standard steel shaft", text: "A single steel shaft option is planned. Karibu will confirm the exact shaft model and flex before an order is accepted." },
  ],
  source: { label: "Titleist Vokey SM11 official product page", url: "https://www.titleist.com/product/vokey-sm11/862C%3ACA-RH%3ACBW-4410.html" },
  presentation: {
    imageLabels: ["Back", "Face", "Sole", "Profile", "Address", "Jet Black back", "Jet Black face", "Jet Black sole", "Jet Black profile"],
    featuresTitle: "THE SM11 DETAILS.",
    featuresIntro: "Explore the contact, launch, spin and durability technologies behind the latest Vokey wedge family.",
    inquiryTitle: "CHOOSE THE LOFT. MATCH THE GRIND.",
    inquiryBody: "Not currently in stock. Select one of Karibu's planned right-handed loft, bounce and grind models and either Tour Chrome or Jet Black, then ask the team to confirm future availability and the exact standard shaft model / flex. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this Vokey SM11 wedge",
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

const teamTaylorMadeJuniorSet: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A premium junior golf set offered in three height-matched sizes for young golfers ages 4–12, with the club makeup growing alongside the player.",
  gallery: [
    { src: "/images/products/taylormade-junior-set-bag.jpg", alt: "Team TaylorMade Junior golf set and blue stand bag", label: "Complete set" },
    { src: "/images/products/taylormade-junior-set-woods.jpg", alt: "Team TaylorMade Junior driver, fairway and Rescue club heads", label: "Long clubs" },
    { src: "/images/products/taylormade-junior-set-irons-putter.jpg", alt: "Team TaylorMade Junior irons and putter", label: "Irons & putter" },
    { src: "/images/products/taylormade-junior-set-bag-closeup.jpg", alt: "Team TaylorMade Junior clubs inside the stand bag", label: "In the bag" },
    { src: "/images/products/taylormade-junior-set-fairway.jpg", alt: "Team TaylorMade Junior fairway wood", label: "Fairway" },
    { src: "/images/products/taylormade-junior-set-seven-iron.jpg", alt: "Team TaylorMade Junior 7-iron", label: "7-iron" },
    { src: "/images/products/taylormade-junior-set-putter.jpg", alt: "Team TaylorMade Junior putter", label: "Putter" },
  ],
  galleryNote: "Seven product-reference photographs were supplied by Karibu Golf. Confirm the exact set, size, hand and included clubs before ordering.",
  overviewEyebrow: "TEAM TAYLORMADE JUNIOR SETS",
  overviewTitle: "THE RIGHT SIZE FOR THEIR FIRST SWING.",
  overviewBody: [
    "TaylorMade offers three progressively larger sets for juniors from 42 to 59 inches tall, covering the manufacturer age guide from 4 to 12 years.",
    "The club makeup grows with the golfer: four clubs in Size 1, five clubs in Size 2 and seven clubs in Size 3, each packaged with a dual-strap stand bag, rain hood and headcovers.",
  ],
  overviewImage: "/images/products/taylormade-junior-set-woods.jpg",
  features: [
    { title: "Three height-matched stages", text: "Size 1 is for 42–47 inches, Size 2 for 48–53 inches and Size 3 for 54–59 inches. TaylorMade pairs those ranges with ages 4–6, 7–9 and 10–12 as guidance." },
    { title: "Junior-specific long clubs", text: "The larger sets use a 400cc titanium driver with a flexible face. Fairway and Rescue clubs use easy-launch profiles and ultra-low centres of gravity." },
    { title: "Easy-launch scoring clubs", text: "The junior irons and wedges are designed for high launch and playability, while the putter uses simple alignment cues to build confidence on the greens." },
    { title: "A complete carrying setup", text: "Every size includes a lightweight dual-strap stand bag, rain hood and headcovers, plus access to TaylorMade's junior instruction content through the bag tag." },
  ],
  detailEyebrow: "HEIGHT FIRST · AGE AS A GUIDE",
  detailTitle: "CHOOSE THE SET THAT FITS NOW.",
  detailBody: [
    "Use the child's standing height as the primary guide. Age is a useful secondary reference, but height is the better starting point for comfortable posture and club control.",
    "The Size 1, Size 2 and Size 3 options include different clubs. Review the table below and ask Karibu Golf to confirm the exact set and handedness before payment.",
  ],
  detailImage: "/images/products/taylormade-junior-set-bag-closeup.jpg",
  configuration: [
    { label: "Size", values: ["Size 1 · 42–47 in · ages 4–6", "Size 2 · 48–53 in · ages 7–9", "Size 3 · 54–59 in · ages 10–12"] },
    { label: "Hand", values: ["Right handed", "Left handed"] },
  ],
  specTitle: "JUNIOR SET SIZE GUIDE.",
  specIntro: "TaylorMade's official height, age and set-composition references. Height should be the primary guide; exact Karibu availability must be confirmed.",
  specs: {
    headers: ["Set", "Height", "Age guide", "Included clubs", "Bag"],
    rows: [
      ["Size 1", "42–47 in", "4–6", "Fairway · 7-iron · wedge · putter", "Stand bag"],
      ["Size 2", "48–53 in", "7–9", "Driver · hybrid · 7-iron · wedge · putter", "Stand bag"],
      ["Size 3", "54–59 in", "10–12", "Driver · fairway · hybrid · 7-iron · 9-iron · wedge · putter", "Stand bag"],
    ],
  },
  equipment: [
    { title: "Size 1 · four clubs", text: "Fairway wood, 7-iron, 54° wedge and 3.5° putter, plus the junior stand bag." },
    { title: "Size 2 · five clubs", text: "17° driver, 27° hybrid, 36° 7-iron, 54° wedge and 3.5° putter, plus the junior stand bag." },
    { title: "Size 3 · seven clubs", text: "17° driver, 21° fairway, 27° hybrid, 36° 7-iron, 45° 9-iron, 54° wedge and 3.5° putter, plus the junior stand bag." },
  ],
  source: { label: "Team TaylorMade Junior Sets official product page", url: "https://www.taylormadegolf.com/Team-TaylorMade-Junior-Sets/DW-TC602.html?lang=en_US" },
  presentation: {
    imageLabels: ["Complete set", "Long clubs", "Irons & putter", "In the bag", "Fairway", "7-iron", "Putter"],
    featuresTitle: "BUILT FOR JUNIOR GOLFERS.",
    featuresIntro: "Explore the sizing stages, easy-launch club design and complete stand-bag setup.",
    inquiryTitle: "MEASURE HEIGHT. CHOOSE THE STAGE.",
    inquiryBody: "Currently out of stock. Select the child's height-matched size and preferred hand, then ask Karibu Golf to confirm the exact set, final landed price and future availability. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this junior set",
  },
};

const labGolfDf3: ProductPageDetails = {
  brand: "L.A.B. Golf",
  intro: "The no-insert DF3: a compact Lie Angle Balanced mallet, CNC-milled from 6061 aluminum and currently offered in one right-handed Standard configuration.",
  gallery: [
    { src: "/images/products/lab-golf-df3-custom-putter-black-address.png", alt: "Black L.A.B. Golf DF3 custom putter viewed at address", label: "Black address", group: "Black" },
    { src: "/images/products/lab-golf-df3-custom-putter-black-front.png", alt: "Black L.A.B. Golf DF3 custom putter front view", label: "Black front", group: "Black" },
    { src: "/images/products/lab-golf-df3-custom-putter-black-rear.png", alt: "Black L.A.B. Golf DF3 custom putter rear view", label: "Black rear", group: "Black" },
    { src: "/images/products/lab-golf-df3-custom-putter-black-profile.png", alt: "Black L.A.B. Golf DF3 custom putter side profile", label: "Black profile", group: "Black" },
    { src: "/images/products/lab-golf-df3-custom-putter-blue-address.png", alt: "Blue L.A.B. Golf DF3 custom putter viewed at address", label: "Blue address", group: "Blue" },
    { src: "/images/products/lab-golf-df3-custom-putter-blue-front.png", alt: "Blue L.A.B. Golf DF3 custom putter front view", label: "Blue front", group: "Blue" },
    { src: "/images/products/lab-golf-df3-custom-putter-blue-sole.png", alt: "Blue L.A.B. Golf DF3 custom putter sole and weighting screws", label: "Blue sole", group: "Blue" },
    { src: "/images/products/lab-golf-df3-custom-putter-blue-rear.png", alt: "Blue L.A.B. Golf DF3 custom putter rear view", label: "Blue rear", group: "Blue" },
    { src: "/images/products/lab-golf-df3-custom-putter-pink-address.png", alt: "Pink L.A.B. Golf DF3 custom putter viewed at address", label: "Pink address", group: "Pink" },
    { src: "/images/products/lab-golf-df3-custom-putter-pink-front.png", alt: "Pink L.A.B. Golf DF3 custom putter front view", label: "Pink front", group: "Pink" },
    { src: "/images/products/lab-golf-df3-custom-putter-pink-sole.png", alt: "Pink L.A.B. Golf DF3 custom putter sole and weighting screws", label: "Pink sole", group: "Pink" },
    { src: "/images/products/lab-golf-df3-custom-putter-pink-rear.png", alt: "Pink L.A.B. Golf DF3 custom putter rear view", label: "Pink rear", group: "Pink" },
  ],
  galleryNote: "Twelve unique DF3 product-reference images were supplied by Karibu Golf. Choose Black, Blue or Pink to see only that finish. The current configuration is right handed with Standard putting style and Standard head weight. Length, lie angle, shaft, alignment and grip must be confirmed before ordering.",
  overviewEyebrow: "L.A.B. GOLF DF3 CUSTOM PUTTER",
  overviewTitle: "LESS TO THINK ABOUT. NO INSERT.",
  overviewBody: [
    "DF3 brings L.A.B. Golf's Lie Angle Balance concept into a smaller mallet shape designed to stay square without the golfer manipulating the face through the stroke.",
    "This is the no-insert DF3. Its face and head are CNC-milled as one 6061-aluminum structure, while eight sole weights are selected to target swing weight and balance.",
  ],
  overviewImage: "/images/products/lab-golf-df3-custom-putter-black-address.png",
  features: [
    { title: "Lie Angle Balance", text: "The head is hand-balanced to reduce torque and help the putter face remain square to the stroke arc." },
    { title: "No-insert aluminum face", text: "Unlike DF3i, this DF3 uses the directly milled aluminum face rather than a stainless-steel insert." },
    { title: "Eight tuned sole weights", text: "Steel or tungsten sole screws of different densities are used to target swing weight and Lie Angle Balance for the completed build." },
    { title: "One available setup", text: "Karibu currently offers this DF3 only as a right-handed Standard build with Standard head weight. The remaining specifications are confirmed before payment." },
  ],
  detailEyebrow: "RIGHT HANDED · STANDARD · THREE FINISHES",
  detailTitle: "CHOOSE THE FINISH. CONFIRM THE BUILD.",
  detailBody: [
    "The supplied gallery covers Black, Blue and Pink. Selecting a finish filters the gallery so only matching photographs remain visible.",
    "The current Karibu configuration is right handed with Standard putting style and Standard head weight. No fitting service is available; length, lie angle, shaft, alignment mark and grip are confirmed directly before ordering.",
  ],
  detailImage: "/images/products/lab-golf-df3-custom-putter-black-profile.png",
  configuration: [
    { label: "Hand", values: ["Right handed"] },
    { label: "Putting style", values: ["Standard"] },
    { label: "Finish", values: ["Black", "Blue", "Pink"] },
    { label: "Head weight", values: ["Standard"] },
  ],
  specTitle: "DF3 CUSTOM SPECIFICATIONS.",
  specIntro: "Official L.A.B. Golf reference details for the Standard build. Final length, lie angle and components must be confirmed before ordering.",
  specs: {
    headers: ["Detail", "Official reference"],
    rows: [
      ["Construction", "6061 aluminum"],
      ["Face", "No insert · CNC-milled aluminum"],
      ["Finish", "Type-3 anodized"],
      ["Effective loft", "3°"],
      ["Standard", "28–38 in · 63–79.5° lie"],
    ],
  },
  equipment: [
    { title: "Standard build", text: "Official reference range: 28–38 inches with lie angles from 63° to 79.5°. Karibu will confirm the exact length and lie angle before ordering." },
    { title: "Available configuration", text: "Right handed, Standard putting style and Standard head weight, with Black, Blue or Pink finish." },
    { title: "Components confirmed", text: "Shaft, alignment and grip are confirmed directly with Karibu. A fitting service is not currently available." },
  ],
  source: { label: "L.A.B. Golf DF3 Custom official product page", url: "https://labgolf.com/products/df3-custom" },
  presentation: {
    imageLabels: ["Address", "Finish", "Balance"],
    featuresTitle: "THE DF3 DETAILS.",
    featuresIntro: "Explore the balance concept, one-piece aluminum construction, sole weighting and available Standard build.",
    inquiryTitle: "CHOOSE THE FINISH. CONFIRM THE BUILD.",
    inquiryBody: "Currently out of stock. Choose Black, Blue or Pink, then ask Karibu Golf to confirm the right-handed Standard build, final length, lie angle and components. No fitting service is currently available, and an enquiry does not reserve stock.",
    inquiryLink: "Ask about this DF3 custom putter",
  },
};

const labGolfOz1: ProductPageDetails = {
  brand: "L.A.B. Golf",
  intro: "A tour-inspired, center-shafted mallet with Lie Angle Balance and a soft-feeling, no-insert 6061-aluminum construction.",
  gallery: [
    { src: "/images/products/lab-golf-oz1-custom-putter-black-address.png", alt: "Black L.A.B. Golf OZ.1 custom putter viewed at address", label: "Black address", group: "Black" },
    { src: "/images/products/lab-golf-oz1-custom-putter-black-front.png", alt: "Black L.A.B. Golf OZ.1 custom putter front view", label: "Black front", group: "Black" },
    { src: "/images/products/lab-golf-oz1-custom-putter-black-rear.png", alt: "Black L.A.B. Golf OZ.1 custom putter rear view", label: "Black rear", group: "Black" },
    { src: "/images/products/lab-golf-oz1-custom-putter-black-sole.png", alt: "Black L.A.B. Golf OZ.1 custom putter sole and weighting screws", label: "Black sole", group: "Black" },
    { src: "/images/products/lab-golf-oz1-custom-putter-black-profile.png", alt: "Black L.A.B. Golf OZ.1 custom putter side profile", label: "Black profile", group: "Black" },
    { src: "/images/products/lab-golf-oz1-custom-putter-black-angled-face.png", alt: "Black L.A.B. Golf OZ.1 custom putter angled face and sole view", label: "Black face", group: "Black" },
  ],
  galleryNote: "Six OZ.1 product-reference images were supplied by Karibu Golf. Black is the available finish for now; additional finish-specific galleries can be added when their photographs are supplied. The current configuration is right handed with Standard putting style and Standard head weight.",
  overviewEyebrow: "L.A.B. GOLF OZ.1 CUSTOM PUTTER",
  overviewTitle: "TOUR-INSPIRED SHAPE. LIE ANGLE BALANCED.",
  overviewBody: [
    "OZ.1 combines a compact, tour-inspired mallet profile with L.A.B. Golf's Lie Angle Balance concept, which is designed to reduce torque and keep the face square to the stroke arc.",
    "This is the no-insert OZ.1. Its all-aluminum construction delivers the softer feel associated with L.A.B. Golf's original putters.",
  ],
  overviewImage: "/images/products/lab-golf-oz1-custom-putter-black-address.png",
  features: [
    { title: "Lie Angle Balance", text: "The head is balanced to reduce torque and help the putter face remain square to the stroke arc." },
    { title: "No-insert aluminum face", text: "The face is part of the 6061-aluminum head, producing the softer response of the original OZ.1." },
    { title: "Tour-inspired mallet", text: "The compact center-shafted profile pairs a clean address shape with the stability of a modern mallet." },
    { title: "One available setup", text: "Karibu currently offers this OZ.1 only as a right-handed Standard build with Standard head weight in Black." },
  ],
  detailEyebrow: "RIGHT HANDED · STANDARD · BLACK",
  detailTitle: "START WITH BLACK. ADD MORE FINISHES LATER.",
  detailBody: [
    "The current gallery and finish selector contain Black only. Each additional finish will receive its own matching gallery when Karibu supplies the photographs.",
    "No fitting service is available. Length, lie angle, shaft, alignment mark and grip are confirmed directly before ordering.",
  ],
  detailImage: "/images/products/lab-golf-oz1-custom-putter-black-profile.png",
  configuration: [
    { label: "Hand", values: ["Right handed"] },
    { label: "Putting style", values: ["Standard"] },
    { label: "Finish", values: ["Black"] },
    { label: "Head weight", values: ["Standard"] },
  ],
  specTitle: "OZ.1 CUSTOM SPECIFICATIONS.",
  specIntro: "Official L.A.B. Golf reference details for the Standard no-insert OZ.1. Final length, lie angle and components must be confirmed before ordering.",
  specs: {
    headers: ["Detail", "Official reference"],
    rows: [
      ["Construction", "6061 aluminum"],
      ["Face", "No insert · aluminum"],
      ["Finish", "Type-3 anodized"],
      ["Effective loft", "3°"],
      ["Standard", "28–38 in · 63–79.5° lie"],
    ],
  },
  equipment: [
    { title: "Standard build", text: "Official reference range: 28–38 inches with lie angles from 63° to 79.5°. Karibu will confirm the exact length and lie angle before ordering." },
    { title: "Available configuration", text: "Right handed, Standard putting style and Standard head weight, currently in Black." },
    { title: "Components confirmed", text: "Shaft, alignment and grip are confirmed directly with Karibu. A fitting service is not currently available." },
  ],
  source: { label: "L.A.B. Golf OZ.1 Custom official product page", url: "https://labgolf.com/products/oz1-custom" },
  presentation: {
    imageLabels: ["Address", "Shape", "Balance"],
    featuresTitle: "THE OZ.1 DETAILS.",
    featuresIntro: "Explore the Lie Angle Balance concept, all-aluminum construction, mallet shape and current Standard configuration.",
    inquiryTitle: "CONFIRM THE STANDARD BUILD.",
    inquiryBody: "Currently out of stock. Ask Karibu Golf to confirm the right-handed Standard build, final length, lie angle and components. Black is available for selection now; more finishes will be added when their photographs are supplied. No fitting service is currently available, and an enquiry does not reserve stock.",
    inquiryLink: "Ask about this OZ.1 custom putter",
  },
};

const labGolfDf3i: ProductPageDetails = {
  brand: "L.A.B. Golf",
  intro: "A compact Lie Angle Balanced mallet with a CNC-milled aluminum head and a stainless-steel insert for a faster, firmer impact feel.",
  gallery: [
    { src: "/images/products/lab-golf-df3i-custom-putter-face.png", alt: "L.A.B. Golf DF3i custom putter with stainless-steel face insert", label: "Face insert" },
    { src: "/images/products/lab-golf-df3i-custom-putter-sole.png", alt: "L.A.B. Golf DF3i custom putter sole and weighting screws", label: "Sole" },
    { src: "/images/products/lab-golf-df3i-custom-putter-rear.png", alt: "L.A.B. Golf DF3i custom putter rear profile and shaft entry", label: "Rear profile" },
  ],
  galleryNote: "All three DF3i product-reference images were supplied by Karibu Golf. The exact hand, build, head weight, length, lie angle, shaft, alignment and grip must be confirmed before ordering.",
  overviewEyebrow: "L.A.B. GOLF DF3i CUSTOM PUTTER",
  overviewTitle: "LIE ANGLE BALANCE. FIRMER INSERT FEEL.",
  overviewBody: [
    "DF3i takes the compact DF3 mallet shape and adds a 303-stainless-steel insert for golfers who prefer a faster, firmer response at impact.",
    "L.A.B. Golf builds the putter around Lie Angle Balance, which is designed to keep the face square to the arc without the golfer having to manipulate it through the stroke.",
  ],
  overviewImage: "/images/products/lab-golf-df3i-custom-putter-face.png",
  features: [
    { title: "Lie Angle Balance", text: "The head is hand-balanced to reduce torque and help the putter face remain square to the stroke arc." },
    { title: "303 stainless-steel insert", text: "The face insert gives DF3i a faster, firmer feel than the non-insert DF3 while retaining the compact mallet platform." },
    { title: "CNC-milled aluminum head", text: "The main head is machined from 6061 aluminum and uses precisely selected sole weights to target swing weight and balance." },
    { title: "Built around fitting", text: "Length, lie angle, hand, putting style and head weight are fitting decisions. Karibu will confirm the complete specification before payment." },
  ],
  detailEyebrow: "HAND · STYLE · WEIGHT · FIT",
  detailTitle: "FIT THE PUTTER BEFORE YOU ORDER.",
  detailBody: [
    "The official custom range covers right- and left-handed builds, standard or counterbalanced putting styles, and standard, heavier or lighter head-weight targets.",
    "This listing is not current Karibu inventory. Select your preferred reference setup and arrange a fitting so the exact length, lie angle, shaft, alignment mark and grip can be confirmed.",
  ],
  detailImage: "/images/products/lab-golf-df3i-custom-putter-rear.png",
  configuration: [
    { label: "Hand", values: ["Right handed", "Left handed"] },
    { label: "Putting style", values: ["Standard", "Counterbalanced"] },
    { label: "Head weight", values: ["Standard", "Heavier", "Lighter"] },
    { label: "Fitting", values: ["Custom fitting required"] },
  ],
  specTitle: "DF3i CUSTOM SPECIFICATIONS.",
  specIntro: "Official L.A.B. Golf reference ranges. The final build depends on fitting and must be confirmed before ordering.",
  specs: {
    headers: ["Detail", "Official reference"],
    rows: [
      ["Head construction", "6061 aluminum"],
      ["Face insert", "303 stainless steel"],
      ["Finish", "Type-3 anodized"],
      ["Effective loft", "3°"],
      ["Standard length", "28–38 inches"],
      ["Standard lie angle", "63–79.5°"],
      ["Counterbalanced length", "36–40 inches"],
      ["Counterbalanced lie angle", "67–75°"],
    ],
  },
  equipment: [
    { title: "Standard build", text: "Official reference range: 28–38 inches with lie angles from 63° to 79.5°. Exact values are fitting dependent." },
    { title: "Counterbalanced build", text: "Official reference range: 36–40 inches with lie angles from 67° to 75°. This build carries a manufacturer upcharge." },
    { title: "Complete custom setup", text: "Shaft, alignment, grip and other final choices are part of the custom configuration and must be confirmed with Karibu." },
  ],
  source: { label: "L.A.B. Golf DF3i Custom official product page", url: "https://labgolf.com/products/df3i-custom" },
  presentation: {
    imageLabels: ["Insert", "Sole", "Balance"],
    featuresTitle: "THE DF3i DETAILS.",
    featuresIntro: "Explore the balance concept, insert construction, compact mallet head and fitting-led build.",
    inquiryTitle: "CHOOSE THE BUILD. COMPLETE THE FITTING.",
    inquiryBody: "Currently out of stock. Select your reference hand, putting style and head weight, then ask Karibu Golf to arrange the fitting and confirm the full build. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this DF3i custom putter",
  },
};

const scottyCameronH25: ProductPageDetails = {
  brand: "Scotty Cameron",
  intro: "A limited-release Newport 2 blade pairing a Teryllium face inlay with a glare-resistant black PVD finish and distinctive copper details.",
  gallery: [
    { src: "/images/products/scotty-cameron-h25-teryllium-newport-2-sole.jpg", alt: "Scotty Cameron H25 Limited Teryllium Newport 2 sole, weights and H25 headcover", label: "Sole" },
    { src: "/images/products/scotty-cameron-h25-teryllium-newport-2-insert.jpg", alt: "Scotty Cameron H25 Limited Teryllium Newport 2 Teryllium face inlay", label: "Teryllium insert" },
    { src: "/images/products/scotty-cameron-h25-teryllium-newport-2-face.jpg", alt: "Scotty Cameron H25 Limited Teryllium Newport 2 putter face", label: "Face" },
    { src: "/images/products/scotty-cameron-h25-teryllium-newport-2-address.jpg", alt: "Scotty Cameron H25 Limited Teryllium Newport 2 viewed from above", label: "At address" },
  ],
  galleryNote: "Four H25 product-reference photographs were supplied by Karibu Golf. This supplier listing is not current stock: confirm the exact item, serial details, authenticity, handedness and availability before payment.",
  overviewEyebrow: "2025 H25 LIMITED TERYLLIUM NEWPORT 2",
  overviewTitle: "TERYLLIUM FEEL. LIMITED BLACK FINISH.",
  overviewBody: [
    "Scotty Cameron's H25 Limited returns the Teryllium face concept in a modern Newport 2 blade. A copper-alloy insert is paired with gray vibration damping to produce the soft, responsive feel associated with the historic TeI3 design.",
    "The stainless-steel head receives a glare-resistant black PVD finish, while the milled sight dot and sole engraving carry metallic copper accents that coordinate with the insert and dedicated H25 headcover.",
  ],
  overviewImage: "/images/products/scotty-cameron-h25-teryllium-newport-2-insert.jpg",
  features: [
    { title: "Teryllium face inlay", text: "A copper-alloy face inlay is cushioned by gray vibration-damping material for the distinctive soft Teryllium response." },
    { title: "Black PVD finish", text: "The stainless-steel head uses a glare-resistant black PVD finish with metallic copper paintfill and detailing." },
    { title: "Modern Newport 2 shaping", text: "A tri-sole, crisp contours and an I-beam plumbing neck define the modern blade setup." },
    { title: "Limited-release build", text: "The official 34.5-inch configuration includes a Tour Black shaft, gray Baby T grip, H25 shaft band and custom H25 headcover." },
  ],
  detailEyebrow: "34.5 IN · BLACK PVD · TERYLLIUM",
  detailTitle: "CONFIRM THE EXACT LIMITED PUTTER.",
  detailBody: [
    "The official H25 release is a fixed 34.5-inch limited build. This Karibu listing records the supplier reference but does not yet confirm current inventory or handedness.",
    "Before payment, request current photographs and confirmation of the exact item, serial details, authenticity, included headcover and delivery terms.",
  ],
  detailImage: "/images/products/scotty-cameron-h25-teryllium-newport-2-face.jpg",
  configuration: [
    { label: "Length", values: ["34.5 in"] },
    { label: "Hand", values: ["Confirm handedness"] },
  ],
  specTitle: "H25 LIMITED SPECIFICATIONS.",
  specIntro: "Official reference details from Scotty Cameron's 2025 H25 Limited introduction. The exact supplier item must still be confirmed before ordering.",
  specs: {
    headers: ["Detail", "Official reference"],
    rows: [
      ["Length", "34.5 in"],
      ["Head shape", "Modern Newport 2 blade"],
      ["Head", "Stainless steel"],
      ["Face inlay", "Teryllium copper alloy"],
      ["Neck", "I-beam plumbing neck"],
      ["Sole", "Tri-sole"],
      ["Finish", "Glare-resistant black PVD"],
      ["Shaft", "Tour Black"],
      ["Grip", "Gray Baby T"],
    ],
  },
  equipment: [
    { title: "Face construction", text: "The Teryllium inlay is paired with gray vibration-damping material and set into the stainless-steel head." },
    { title: "Official setup", text: "The limited release is listed at 34.5 inches with a Tour Black shaft and gray Baby T grip." },
    { title: "Included presentation", text: "The manufacturer reference includes an H25 Limited shaft band and custom black-and-copper H25 headcover." },
  ],
  source: { label: "Scotty Cameron H25 Limited official introduction", url: "https://www.scottycameron.com/articles/introducing-the-scotty-cameron-2025-h25-limited-teryllium-newport-2/" },
  presentation: {
    imageLabels: ["Teryllium", "Newport 2", "H25 Limited"],
    featuresTitle: "THE H25 LIMITED DETAILS.",
    featuresIntro: "Explore the Teryllium construction, black PVD finish, modern Newport 2 geometry and official limited-release setup.",
    inquiryTitle: "VERIFY THE EXACT H25 BEFORE ORDERING.",
    inquiryBody: "Currently out of stock. Ask Karibu Golf to confirm the exact item, serial details, authenticity, handedness, included headcover and availability. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this H25 Limited putter",
  },
};

const scottyCameronStudioStyleNewport2: ProductPageDetails = {
  brand: "Scotty Cameron",
  intro: "An iconic Newport 2 blade updated with a Studio Carbon Steel face insert and chain-link milling for soft sound, solid feel and controlled roll.",
  gallery: [
    { src: "/images/products/scotty-cameron-studio-style-newport-2-hero.jpg", alt: "Scotty Cameron Studio Style Newport 2 putter angled face and sole view", label: "Studio Style" },
    { src: "/images/products/scotty-cameron-studio-style-newport-2-sole.png", alt: "Scotty Cameron Studio Style Newport 2 sole and tungsten weights", label: "Sole" },
    { src: "/images/products/scotty-cameron-studio-style-newport-2-cavity.png", alt: "Scotty Cameron Studio Style Newport 2 rear cavity and plumbing neck", label: "Cavity" },
    { src: "/images/products/scotty-cameron-studio-style-newport-2-address.png", alt: "Scotty Cameron Studio Style Newport 2 viewed from address", label: "At address" },
    { src: "/images/products/scotty-cameron-studio-style-newport-2-face.png", alt: "Scotty Cameron Studio Style Newport 2 SCS insert and chain-link face milling", label: "Face" },
  ],
  galleryNote: "Five product-reference images supplied by Karibu Golf. Confirm the exact hand, length, authenticity, included headcover and physical condition before payment.",
  overviewEyebrow: "STUDIO STYLE NEWPORT 2",
  overviewTitle: "CLASSIC LINES. A NEW CARBON-STEEL FEEL.",
  overviewBody: [
    "The Studio Style Newport 2 retains the crisp, mechanical lines of Scotty Cameron's flagship blade while adding a slightly thicker topline inspired by the 2012 Select generation.",
    "Its precision-milled Studio Carbon Steel insert is nickel plated for durability and paired with chain-link face milling to soften sound while preserving feedback.",
  ],
  overviewImage: "/images/products/scotty-cameron-studio-style-newport-2-cavity.png",
  features: [
    { title: "Studio Carbon Steel insert", text: "The precision-milled SCS insert delivers carbon-steel sound and feel with electroless nickel plating for added durability." },
    { title: "Chain-link face milling", text: "The milling pattern reduces the insert's contact points at impact to soften sound and support consistent roll characteristics." },
    { title: "303 stainless-steel head", text: "The head is precision milled in the United States from 303 stainless steel with length-specific tungsten sole weights." },
    { title: "Newport 2 geometry", text: "A refined tri-sole, I-beam plumbing neck and full-shaft offset create the familiar alignment profile with medium toe flow." },
  ],
  detailEyebrow: "3.5° LOFT · 70° LIE · MEDIUM TOE FLOW",
  detailTitle: "MATCH THE LENGTH AND HAND TO YOUR STROKE.",
  detailBody: [
    "Official stock lengths are 33, 34 and 35 inches, each paired with its own tungsten sole-weight configuration. Both right- and left-handed models are offered by the manufacturer.",
    "Karibu has not confirmed current inventory. Ask us to verify the exact length, hand, authenticity, grip, headcover and final supplier price before ordering.",
  ],
  detailImage: "/images/products/scotty-cameron-studio-style-newport-2-address.png",
  configuration: [
    { label: "Length", values: ["33 in", "34 in", "35 in"] },
    { label: "Hand", values: ["Right handed", "Left handed"] },
  ],
  specTitle: "STUDIO STYLE NEWPORT 2 SPECIFICATIONS.",
  specIntro: "Official Scotty Cameron reference specifications. Manufacturer options do not represent confirmed Karibu stock.",
  specs: {
    headers: ["Detail", "Official reference"],
    rows: [
      ["Loft", "3.5°"],
      ["Lie", "70°"],
      ["Length", "33, 34, 35 in"],
      ["Head material", "303 stainless steel"],
      ["Face insert", "Studio Carbon Steel (SCS)"],
      ["Offset", "Full shaft"],
      ["Grip", "Full Contact Slim"],
      ["Weights — 33 in", "2 × 35 g"],
      ["Weights — 34 in", "2 × 30 g"],
      ["Weights — 35 in", "2 × 25 g"],
      ["Toe flow", "Medium"],
    ],
  },
  equipment: [
    { title: "Length-specific weighting", text: "Tungsten sole weights change with shaft length to maintain the intended head feel: 35 g at 33 inches, 30 g at 34 inches and 25 g at 35 inches." },
    { title: "Standard grip", text: "The official build uses Scotty Cameron's Full Contact Slim grip. Confirm what is included with the exact Karibu item." },
    { title: "Custom references", text: "The manufacturer offers additional half-inch right-handed lengths plus loft and lie adjustments. These are fitting references, not confirmed Karibu inventory." },
  ],
  source: { label: "Scotty Cameron Studio Style Newport 2 official product page", url: "https://www.scottycameron.com/putters/studio-style/newport-2/" },
  presentation: {
    imageLabels: ["SCS insert", "Tri-sole", "Newport 2"],
    featuresTitle: "THE STUDIO STYLE DETAILS.",
    featuresIntro: "Explore the carbon-steel insert, chain-link face milling, stainless-steel construction and classic Newport 2 geometry.",
    inquiryTitle: "CONFIRM THE EXACT NEWPORT 2.",
    inquiryBody: "Currently out of stock. Select a reference length and hand, then ask Karibu Golf to confirm the actual item, authenticity, headcover, supplier price and availability. An enquiry does not reserve stock.",
    inquiryLink: "Ask about this Studio Style Newport 2",
  },
};

const categoryGuidance: Record<string, { eyebrow: string; title: string; text: string }> = {
  drivers: { eyebrow: "OFF THE TEE", title: "KNOW YOUR DRIVER.", text: "Confirm loft, shaft, flex, handedness and head condition before choosing a driver." },
  woods: { eyebrow: "FROM TEE OR TURF", title: "BUILD THE TOP OF YOUR BAG.", text: "Confirm loft, shaft, flex and the role this fairway wood should play in your distance gaps." },
  hybrids: { eyebrow: "VERSATILE DISTANCE", title: "A USEFUL LONG-CLUB OPTION.", text: "Check loft, shaft, flex and how the hybrid fits between your longest iron and fairway wood." },
  golf_irons: { eyebrow: "APPROACH PLAY", title: "UNDERSTAND THE SET.", text: "Confirm every included iron, the shaft material, flex, handedness and condition of the set." },
  wedges: { eyebrow: "SCORING CLUBS", title: "CHECK LOFT AND BOUNCE.", text: "The right wedge depends on loft gaps, bounce, sole design and the conditions you normally play." },
  putters: { eyebrow: "ON THE GREEN", title: "CHOOSE YOUR LOOK AND FEEL.", text: "Confirm head style, length, toe hang or face balance, grip and overall condition." },
  junior_sets: { eyebrow: "GROW INTO THE GAME", title: "START WITH THE RIGHT SIZE.", text: "Use height as the primary guide, then confirm age range, hand and the exact clubs included in the set." },
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
  if (product.slug === "gk-gl007") return rainGripGlove;
  if (product.slug === "gk-gl008") return stasofGlove;
  if (product.slug === "gk-gl009") return weathersofGlove;
  if (product.slug === "gk-gl011") return womensWeathersofGlove;
  if (product.slug === "gk-wg006") return rtx6ZipCoreWedge;
  if (product.slug === "gk-wg009") return mg5Wedge;
  if (product.slug === "gk-wg010") return vokeySm11Wedge;
  if (product.slug === "gk-ir005") return sim2MaxIrons;
  if (product.slug === "gk-dr001") return sim2MaxDriver;
  if (product.slug === "gk-fw001") return sim2MaxFairway;
  if (product.slug === "gk-hy001") return sim2MaxRescue;
  if (product.slug === "gk-jr001") return teamTaylorMadeJuniorSet;
  if (product.slug === "gk-pt034") return labGolfDf3;
  if (product.slug === "gk-pt035") return labGolfDf3i;
  if (product.slug === "gk-pt036") return labGolfOz1;
  if (product.slug === "gk-pt037") return scottyCameronH25;
  if (product.slug === "gk-pt038") return scottyCameronStudioStyleNewport2;

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
