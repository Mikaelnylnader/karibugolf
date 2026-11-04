// Encode reviewed image edits; retain all seven original supplier screenshots.
import {execFileSync} from "node:child_process";
import {mkdir,readFile,writeFile,copyFile,access} from "node:fs/promises";
import {createHash} from "node:crypto";
const root=".tmp/malbon-cap", jobs=JSON.parse(await readFile(root+"/image-jobs.json","utf8"));
if(jobs.records.length!==7)throw Error("Expected seven supplied photographs");
for(const dir of ["public/images/products/gk-hc011","images/products/gk-hc011",root+"/supplier-originals"])await mkdir(dir,{recursive:true});
const hash=b=>createHash("sha256").update(b).digest("hex"),images=[];
for(const job of jobs.records){
 const filename="malbon-cap-"+job.view+".webp",target="public/images/products/gk-hc011/"+filename;
 try{await access(target);}catch{execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-n","-i",job.source,"-frames:v","1","-c:v","libwebp","-quality","90","-compression_level","6",target]);}
 await copyFile(target,"images/products/gk-hc011/"+filename);
 const originalCopy=root+"/supplier-originals/"+job.original.split("/").at(-1);await copyFile(job.original,originalCopy);
 if(hash(await readFile(job.original))!==hash(await readFile(originalCopy)))throw Error("Original mismatch");
 images.push({...job,target,originalCopy,originalSha256:hash(await readFile(job.original)),sha256:hash(await readFile(target))});
}
await writeFile(root+"/manifest.json",JSON.stringify({tool:jobs.tool,disclosure:"AI-enhanced supplier references, not manufacturer verification",images},null,2));
console.log(JSON.stringify({images:images.length,manifest:root+"/manifest.json"}));
