import type { ProductPageDetails } from "@/lib/product-page-details";

const colours = ["Navy", "Grey", "White", "Red"];
const views = [["", "Three-quarter"], ["front", "Front"], ["embroidery", "Front embroidery"], ["qi4d-detail", "Qi4D detail"], ["brim-badge", "Brim badge"], ["rear-strap", "Rear strap"]];
export const qi4dCap: ProductPageDetails = {
  brand: "TaylorMade",
  intro: "A curved-brim golf cap with TaylorMade front embroidery, Qi4D side branding and an adjustable rear strap. Choose a colour for your enquiry; availability and fit must be confirmed.",
  gallery: colours.flatMap((colour) => views.map(([suffix, label]) => ({ src: `/images/products/gk-hc010/qi4d-cap-${colour.toLowerCase()}${suffix ? `-${suffix}` : ""}.webp`, alt: `${colour} TaylorMade Qi4D cap, ${label.toLowerCase()}; ${colour === "Grey" || !suffix ? "AI-enhanced supplier reference" : "AI colour-adapted reference, not a photograph of a physical item"}`, label, group: colour }))),
  galleryNote: "AI-enhanced catalogue images based on all supplied photographs. Grey detail views follow the supplier references; Navy, White and Red detail views are AI colour adaptations, not photographs of those physical caps. Request unedited photographs of the exact item before ordering. Colour choices do not confirm stock.",
  overviewEyebrow: "QI4D GOLF CAP",
  overviewTitle: "YOUR COLOUR. YOUR ROUND.",
  overviewBody: ["Navy, Grey, White and Red are shown in the supplied product references. The curved peak, embroidered front motif and side Qi4D mark give this cap its distinctive look.", "Select your preferred colour and ask Karibu Golf to confirm the exact cap, fit and availability before payment."],
  overviewImage: "/images/products/gk-hc010/qi4d-cap-navy.webp",
  features: [
    { title: "Curved brim", text: "A curved peak with contrasting edge trim, as shown in the supplied photographs." },
    { title: "Adjustable strap", text: "The supplier's rear-detail photograph shows an adjustable fabric strap. Head-circumference limits have not been supplied." },
    { title: "Distinctive detailing", text: "Front TaylorMade embroidery, side Qi4D branding and a TaylorMade badge on the brim." },
    { title: "Four colour references", text: "Navy, Grey, White and Red. Ask for a current unedited photograph and confirmation of your chosen colour." },
  ],
  detailEyebrow: "FIT & AVAILABILITY",
  detailTitle: "CONFIRM THE CAP FOR YOU.",
  detailBody: ["An adjustable strap is visible in the supplier references, but no measured size range or fabric specification has been provided. Please confirm those details before ordering.", "Stock is not confirmed. A colour selection adds your preference to the WhatsApp enquiry; it does not reserve an item."],
  detailImage: "/images/products/gk-hc010/qi4d-cap-grey-rear-strap.webp",
  configuration: [{ label: "Colour", values: colours }, { label: "Fit", values: ["Adjustable — confirm size range"] }],
  specTitle: "CAP DETAILS.",
  specIntro: "Based on the supplied product photographs. These are supplier references, not independent manufacturer verification.",
  specs: { headers: ["Detail", "Information"], rows: [["SKU", "GK-HC010"], ["Model", "TaylorMade Qi4D cap (supplier identification)"], ["Colours", "Navy / Grey / White / Red"], ["Closure", "Adjustable fabric strap, shown in supplier reference"], ["Size range", "Confirm before ordering"], ["Fabric / care", "Not supplied; confirm before ordering"], ["Availability", "Out of Stock — stock not confirmed"]] },
  presentation: { galleryLabels: false, imageLabels: ["Three-quarter", "Front", "Embroidery"], featuresTitle: "THE CAP, IN DETAIL.", featuresIntro: "A closer look at the visible design, colour choices and fit details.", inquiryTitle: "ASK ABOUT YOUR COLOUR.", inquiryBody: "Tell us your preferred colour. We will confirm availability, fit, the exact item and delivery before payment.", inquiryLink: "Enquire about this cap" },
};
