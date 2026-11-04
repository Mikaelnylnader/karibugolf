import type { ProductPageDetails } from "@/lib/product-page-details";
const path = (view: string) => `/images/products/gk-hc011/malbon-cap-${view}.webp`;
export const malbonCap: ProductPageDetails = {
  brand: "Malbon",
  intro: "An M-logo golf cap with a curved peak and a distinctive mascot badge on the brim. Choose Navy, Green or White for your enquiry; fit and availability will be confirmed before ordering.",
  gallery: ["Navy","Green","White"].flatMap(colour =>
    [["","Front view"],["right","Side view"],["left","Opposite side"],["rear","Rear view"]].map(([suffix,label]) => ({
      src: path(colour.toLowerCase()+(suffix ? "-"+suffix : "")),
      alt: `${colour} Malbon cap, ${label.toLowerCase()}; ${colour === "White" || !suffix ? "AI-enhanced supplied reference" : "AI colour adaptation of white cap; not a photograph of a physical item"}`,
      label: colour+" "+label.toLowerCase(),group: colour,
    }))
  ),
  galleryNote: "AI-enhanced supplied-photo references. Navy and Green side and rear views are AI colour adaptations of the White cap, not photographs of those physical items. Colour choices do not confirm stock. Request unedited photographs of the exact item before payment.",
  overviewEyebrow: "M-LOGO GOLF CAP",
  overviewTitle: "THREE COLOURS. ONE DISTINCTIVE LOOK.",
  overviewBody: ["A bold embroidered M motif sits above a curved peak, with a mascot badge on the brim. Navy, Green and White are shown in the supplied photographs.", "The white-cap views show perforated panels, rear Malbon embroidery and an adjustable closure. Confirm the exact details of your chosen colour before ordering."],
  overviewImage: path("colours"),
  features: [
    {title:"Embroidered M motif",text:"A contrasting front emblem, as shown in the supplied product photographs."},
    {title:"Curved peak",text:"A shaped brim with a fine contrasting edge and mascot badge."},
    {title:"Perforated panels",text:"Visible perforations on the supplied cap references; fabric composition has not been provided."},
    {title:"Colour choice",text:"Navy, Green and White, with matching front, side and rear reference views. Navy and Green detail views are AI colour adaptations."},
  ],
  detailEyebrow: "FIT & DETAILS",
  detailTitle: "CHOOSE YOUR COLOUR.",
  detailBody: ["The white rear photograph shows an adjustable strap and clasp. A measured size range and fabric-care instructions have not been supplied.", "Ask us to confirm the exact cap, included badge, fit and delivery before payment. The precise manufacturer model and authenticity have not been independently verified."],
  detailImage: path("white-rear"),
  configuration: [{label:"Colour",values:["Navy","Green","White"]},{label:"Fit",values:["Adjustable — confirm size range"]}],
  specTitle: "CAP DETAILS.",
  specIntro: "Supplier-photo references. No independently verified manufacturer specification has been supplied.",
  specs: {headers:["Detail","Information"],rows:[["SKU","GK-HC011"],["Style","Malbon M-logo cap (supplier identification)"],["Colours","Navy / Green / White"],["Price unit","One cap"],["Closure","Adjustable, shown on the white cap"],["Size / fabric / care","Confirm before ordering"],["Availability","Out of Stock — stock not confirmed"]]},
  presentation: {galleryLabels:false,overviewDetailImages:false,imageLabels:[],featuresTitle:"THE CAP, IN DETAIL.",featuresIntro:"Visible design details from the supplied photographs.",inquiryTitle:"ASK ABOUT YOUR COLOUR.",inquiryBody:"We will confirm availability, fit, exact item and delivery before payment.",inquiryLink:"Enquire about this cap"},
};
