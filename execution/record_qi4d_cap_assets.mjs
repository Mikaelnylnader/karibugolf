// Preserve supplied screenshots and record image-generation provenance.
import {copyFile,mkdir,readFile,stat,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
const output=".tmp/qi4d-cap-assets";
await mkdir(output+"/supplier-originals",{recursive:true});
const files=["2026-11-02 at 14.20.46 (8)","2026-11-02 at 14.20.46 (9)","2026-11-02 at 14.20.46 (10)","2026-11-02 at 14.20.46 (11)","2026-11-02 at 14.20.46 (12)","2026-11-02 at 14.20.47 (1)","2026-11-02 at 14.20.47 (2)","2026-11-02 at 14.20.47 (4)","2026-11-02 at 14.20.47"];
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
const originals=[];
for(const name of files){const filename="WhatsApp Image "+name+".jpeg",source="C:/Users/mikae/Downloads/"+filename,target=output+"/supplier-originals/"+filename;const bytes=await readFile(source);await copyFile(source,target);if(sha(await readFile(target))!==sha(bytes))throw Error("Original copy mismatch");originals.push({source,target,sha256:sha(bytes)});}
const generated=[
 ["navy","exec-222d4907-ca31-4002-ad9b-78dd0367705d.png","13k9hKBHRmLIsa5m_uH0ma2rOGcjR-9LW"],
 ["grey","exec-30423478-8dc1-4a76-b50c-660b867c5bd9.png","124a3JGA6b9FbG91cR0psIk5BNWLTzk7J"],
 ["white","exec-be700ecd-ab49-4006-ba7f-7ada21b0d947.png","103CQtcE_-pz9LnK9UYYWowOjpQbgAEaN"],
 ["red","exec-68393899-ca6b-43f5-89e5-8eaa5344629d.png","1k-aLy1WzYkEyCsTiSRor7rAcn5TBe88X"]
];
const prompt=colour=>`Use case: precise-object-edit. Asset type: faithful ecommerce catalogue photograph. Edit target: the attached screenshot's ${colour} TaylorMade Qi4D cap. Remove all smartphone and shopping app interface, black bars, thumbnails, Chinese copy and price. Show only the SAME single cap, in the SAME three-quarter angle, on a pure white seamless background with a subtle grounded shadow. Enlarge the product to fill approximately 80% of a square frame, leaving clean margins. Improve photographic clarity, fabric/stitch detail, exposure and natural studio lighting. Preserve the actual ${colour} color, cap silhouette, six panels, seam locations, curved brim, edge piping and every visible embroidered/metal logo EXACTLY as supplied: TAYLOR MADE front motif, Qi4D side embroidery and TaylorMade brim badge. Do not redesign the logos, swap branding, add features, tags, extra products or any text outside the existing product. No claims or watermark. Faithful cleanup of the supplied product, not a different official product.`;
const images=[];for(const [colour,file,driveId] of generated){const source="C:/Users/mikae/.codex/generated_images/019feb17-9a70-7b32-9ecb-0d71c50cbd7b/"+file,target=`public/images/products/gk-hc010/qi4d-cap-${colour}.webp`;images.push({colour,source,sourceSha256:sha(await readFile(source)),target,sha256:sha(await readFile(target)),bytes:(await stat(target)).size,prompt:prompt(colour),driveId});}
await writeFile(output+"/manifest.json",JSON.stringify({tool:"built-in image_gen",edits:"AI-enhanced supplier references; originals retained; not manufacturer verification",originals,images},null,2));
console.log(JSON.stringify({manifest:output+"/manifest.json",originals:originals.length,images:images.map(({colour,target,bytes})=>({colour,target,bytes}))}));
