import type {ProductPageDetails} from "@/lib/product-page-details";

const base="/images/products/gk-bg019/titleist-premium-stand-bag-";
export const titleistPremiumStandBag: ProductPageDetails = {
 brand:"Titleist",
 intro:"A black-and-white stand bag visually matched to Titleist's Premium Stand Bag. Confirm the product label, condition and included accessories before ordering.",
 gallery:[["hero","Stand view"],["top-front","Top and pockets"],["rear","Back and straps"],["upright-side","Upright side"]].map(([file,label])=>({src:base+file+".webp",label,alt:`Black/White Titleist stand bag, ${label.toLowerCase()}; AI-enhanced supplied-photo reference`})),
 galleryNote:"AI-enhanced versions of all four supplied photographs. Backgrounds, phone interface and promotional overlays were removed; the images do not verify condition, authenticity or the exact model. Ask for unedited photographs and the product label before payment.",
 overviewEyebrow:"PREMIUM STAND BAG",
 overviewTitle:"TOUR-INSPIRED. READY TO STAND.",
 overviewBody:["Titleist lists the Premium Stand Bag in its Tour Bags range. The reference model is TB20SXSF-01 in Black/White.","The supplied bag appears to match this design. The exact model label and generation have not been verified, so the manufacturer specifications below are references, not measurements of this particular item."],
 overviewImage:base+"hero.webp",
 features:[
  {title:"Tour-inspired format",text:"Titleist combines a Tour-bag look with a stand-leg format."},
  {title:"Storage reference",text:"The manufacturer lists seven pockets, including a magnetic, velour-lined valuables pocket."},
  {title:"Pocket protection",text:"The official model lists two waterproof pockets. This is not a claim that the whole bag is waterproof."},
  {title:"Quilted finish",text:"Titleist describes quilted highlights, a convertible strap and a removable ball pocket."}
 ],
 detailEyebrow:"CHECK THE EXACT ITEM",
 detailTitle:"SEE THE BAG. CONFIRM THE DETAILS.",
 detailBody:["The supplied photographs show the white logo panels, quilted back pad, pockets, carrying straps and stand legs. Protective wrapping is visible on the legs.","Before payment, confirm the model label, actual condition, divider layout, functioning zippers and legs, strap setup, and whether a rain hood or any accessories are included. A photograph is not a guarantee of authenticity or warranty."],
 detailImage:base+"rear.webp",
 configuration:[{label:"Colour",values:["Black / White"]}],
 specTitle:"MANUFACTURER REFERENCE.",
 specIntro:"Official Premium Stand Bag specifications, not independently verified for the supplied bag. Confirm the model label first.",
 specs:{headers:["Detail","Titleist reference"],rows:[["Model reference","TB20SXSF-01 (actual label to confirm)"],["Top dividers","4"],["Pockets","7"],["Weight","6.3 lb (approximately 2.86 kg)"],["Strap","Convertible"],["Top cuff width",'8.5 in'],["Base width",'9 in'],["Height",'35.5 in'],["Material","Synthetic leather / polyester"],["Karibu availability","Not confirmed; currently listed Out of Stock"]]},
 source:{label:"Titleist Premium Stand Bag official product page",url:"https://www.titleist.com/product/premium-stand-bag/051GB1T.html"},
 presentation:{galleryLabels:false,imageLabels:["Stand","Top","Back"],featuresTitle:"THE BAG, IN DETAIL.",featuresIntro:"Manufacturer references are separate from the supplied item photographs.",inquiryTitle:"ASK ABOUT THIS BAG.",inquiryBody:"Confirm the exact model, condition, availability and included accessories before payment. A selection does not reserve an item.",inquiryLink:"Enquire about this stand bag"}
};
