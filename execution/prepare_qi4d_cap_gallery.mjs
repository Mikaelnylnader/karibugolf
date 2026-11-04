// Delivery encoding and QA contact sheets only. All photo edits use image_gen.
import {execFileSync} from "node:child_process";
import {copyFile,mkdir,readFile,stat,writeFile,access} from "node:fs/promises";
import {createHash} from "node:crypto";
const root=".tmp/qi4d-cap-assets", colours=["navy","grey","white","red"];
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const existing=JSON.parse(await readFile(root+"/manifest.json","utf8"));
const images=[];
await mkdir(root+"/contact-sheets",{recursive:true});
for(const colour of colours){
 const details=JSON.parse(await readFile(root+"/details-"+colour+".json","utf8"));
 if(details.images.length!==5)throw Error("Expected five detail images for "+colour);
 const files=[`public/images/products/gk-hc010/qi4d-cap-${colour}.webp`];
 images.push(existing.images.find(i=>i.colour===colour));
 for(const item of details.images){
  if(item.colour!==colour||!item.source.includes("generated_images")||!['front','embroidery','qi4d-detail','brim-badge','rear-strap'].includes(item.view))throw Error("Invalid image record");
  const filename=`gk-hc010/qi4d-cap-${colour}-${item.view}.webp`,target="public/images/products/"+filename;
  try{await access(target);}catch{execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-n","-i",item.source,"-frames:v","1","-c:v","libwebp","-quality","90","-compression_level","6",target]);}
  await copyFile(target,"images/products/"+filename);
  files.push(target);images.push({...item,target,sha256:hash(await readFile(target)),bytes:(await stat(target)).size,colourAdaptation:colour!=="grey"});
 }
 const inputs=files.flatMap(file=>["-i",file]);
 const filters=files.map((_,i)=>`[${i}:v]scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:white[t${i}]`).join(";")+";"+files.map((_,i)=>`[t${i}]`).join("")+"xstack=inputs=6:layout=0_0|320_0|640_0|0_320|320_320|640_320[out]";
 execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-y",...inputs,"-filter_complex",filters,"-map","[out]","-frames:v","1","-q:v","2",root+"/contact-sheets/"+colour+".jpg"]);
}
await writeFile(root+"/gallery-manifest.json",JSON.stringify({tool:"built-in image_gen",images,originals:existing.originals,note:"Six views per colour. Non-grey detail images are AI colour adaptations, not photographs of physical stock."},null,2));
console.log(JSON.stringify({images:images.length,perColour:6,manifest:root+"/gallery-manifest.json"}));
