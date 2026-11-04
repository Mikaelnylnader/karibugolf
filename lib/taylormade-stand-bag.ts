import type {ProductPageDetails} from "@/lib/product-page-details";
const path=(view:string)=>`/images/products/gk-bg020/taylormade-stand-bag-${view}.webp`;
const views=[["stand","Stand view"],["hood","Rain hood"],["upright-angle","Upright angle"],["upright","Upright side"],["rear","Folded legs"]];
const groups: [string,[string,string][]][]= [["White","white"],["Black/White","black-white"],["Blue/Lime","blue-lime"],["Grey/Orange","grey-orange"],["Black/Red","black-red"]].map(([label,key])=>[
 label,[...views.map(([suffix,name]):[string,string]=>[`${key}-${suffix}`,name]),...(key==="black-white" ? [["black-white-closeup","Pocket close-up"] as [string,string]] : [])],
]);
const isAdapted=(view:string)=>!view.startsWith("white-")&&!view.endsWith("-hood")&&!view.endsWith("-closeup");
export const taylormadeStandBag: ProductPageDetails={
 brand:"TaylorMade",
 intro:"A TaylorMade-branded stand bag with carrying straps, storage pockets and folding stand legs, shown in five supplier colour references. Confirm the exact model, condition and included accessories before ordering.",
 gallery:groups.flatMap(([group,views])=>views.map(([view,label])=>({src:path(view),label:group+" "+label.toLowerCase(),group,alt:`${group} TaylorMade stand bag, ${label.toLowerCase()}; ${isAdapted(view) ? "AI colour adaptation of the white bag, not a photograph of a physical item" : "AI-enhanced supplied-photo reference"}`}))),
 galleryNote:"AI-enhanced supplied photographs. Additional non-white stand, upright and rear views are AI colour adaptations of the White bag, not photographs of those physical items. Hood-on views and the Black/White close-up follow supplied references. Colour galleries remain separate; group photographs appear below. Ask for unedited photographs of the exact item before payment.",
 overviewEyebrow:"STAND BAG",
 overviewTitle:"FIVE COLOUR REFERENCES.",
 overviewBody:["White, Black/White, Blue/Lime, Grey/Orange and Black/Red are shown in the supplied photographs. Choose a colour to view its matching images and include it in your enquiry.", "The group photographs show colour options, not a multi-bag bundle. The displayed price is for one bag. Stock and the exact configuration must be confirmed."],
 overviewImage:path("five-colours"),
 features:[
  {title:"Stand-leg design",text:"The white-bag references show the bag supported on two deployed legs, and a rear view shows them folded."},
  {title:"Carry and storage",text:"Carrying straps, grab handles and zippered compartments are visible in the supplied photographs."},
  {title:"Rain-hood references",text:"Hood-on photographs are provided for every colour. Confirm whether a matching hood is included with your exact bag."},
  {title:"Matching views",text:"Every colour has stand, hood-on, upright-angle, upright-side and folded-leg views. Additional non-white angles are AI colour adaptations, not physical-stock photographs."},
 ],
 detailEyebrow:"CONFIRM YOUR BAG",
 detailTitle:"SEE THE OPTIONS. CHECK THE DETAILS.",
 detailBody:["The photographs show TaylorMade branding and WATERPROOF lettering, but no independently verified model label, waterproof rating, measurements or material specification has been supplied.", "Before payment, confirm the actual model, condition, divider layout, weight, dimensions, zipper and leg operation, carry straps, rain hood, water resistance and any included accessories."],
 detailImage:path("three-colours"),
 configuration:[{label:"Colour",values:groups.map(([colour])=>colour)}],
 specTitle:"BAG DETAILS.",
 specIntro:"Based on the owner's supplied product-reference photographs, not independently verified manufacturer specifications.",
 specs:{headers:["Detail","Information"],rows:[["SKU","GK-BG020"],["Style","TaylorMade-branded stand bag; exact model to confirm"],["Colour options","White / Black-White / Blue-Lime / Grey-Orange / Black-Red"],["Price unit","One bag"],["Stand","Folding legs shown in supplied references"],["Rain hood / accessories","Shown in references; inclusion to confirm"],["Weight / dimensions / dividers","Not supplied; confirm before ordering"],["Water resistance","Unverified; printed lettering is not a tested rating"],["Availability","Out of Stock — stock not confirmed"]]},
 presentation:{galleryLabels:false,overviewDetailImages:false,imageLabels:[],featuresTitle:"THE BAG, IN DETAIL.",featuresIntro:"Visible design features from the supplied product photographs.",inquiryTitle:"ASK ABOUT YOUR BAG.",inquiryBody:"Tell us your preferred colour. We will confirm the exact item, availability, included accessories and delivery before payment.",inquiryLink:"Enquire about this stand bag"},
};
