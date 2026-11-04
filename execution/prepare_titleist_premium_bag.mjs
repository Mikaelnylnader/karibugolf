// Encode image_gen edits and retain original screenshots plus their provenance.
import {execFileSync} from "node:child_process";
import {copyFile,mkdir,readFile,stat,writeFile,access} from "node:fs/promises";
import {createHash} from "node:crypto";
const root=".tmp/titleist-premium-bag";
const jobs=JSON.parse(await readFile(root+"/image-jobs.json","utf8"));
if(jobs.records.length!==4)throw Error("Expected all four supplied views");
for(const dir of ["public/images/products/gk-bg019","images/products/gk-bg019",root+"/supplier-originals"])await mkdir(dir,{recursive:true});
const hash=b=>createHash("sha256").update(b).digest("hex");
const images=[];
for(const job of jobs.records){
 if(!["hero","top-front","rear","upright-side"].includes(job.view))throw Error("Invalid view");
 const filename=`gk-bg019/titleist-premium-stand-bag-${job.view}.webp`,target="public/images/products/"+filename;
 try{await access(target);}catch{execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-n","-i",job.source,"-frames:v","1","-c:v","libwebp","-quality","90","-compression_level","6",target]);}
 await copyFile(target,"images/products/"+filename);
 const originalCopy=root+"/supplier-originals/"+job.original.split("/").at(-1);await copyFile(job.original,originalCopy);
 const before=await readFile(job.original);if(hash(before)!==hash(await readFile(originalCopy)))throw Error("Original preservation failed");
 images.push({...job,target,sha256:hash(await readFile(target)),bytes:(await stat(target)).size,originalCopy,originalSha256:hash(before)});
}
await writeFile(root+"/manifest.json",JSON.stringify({tool:"built-in image_gen",images,officialReference:"https://www.titleist.com/product/premium-stand-bag/051GB1T.html",referenceModel:"TB20SXSF-01",identification:"Visual match; actual model label and authenticity unverified"},null,2));
console.log(JSON.stringify({images:images.length,manifest:root+"/manifest.json"}));
