// Encode all twelve edits, retain every attachment, and deduplicate the clipboard copy.
import {execFileSync} from "node:child_process";
import {mkdir,readFile,writeFile,copyFile,access} from "node:fs/promises";
import {createHash} from "node:crypto";
const root=".tmp/taylormade-stand-bag",jobs=JSON.parse(await readFile(root+"/image-jobs.json","utf8"));
if(jobs.records.length!==12)throw Error("Expected twelve unique supplied photographs");
for(const dir of ["public/images/products/gk-bg020","images/products/gk-bg020",root+"/supplier-originals"])await mkdir(dir,{recursive:true});
const hash=b=>createHash("sha256").update(b).digest("hex"),images=[];
for(const job of jobs.records){
 const filename="taylormade-stand-bag-"+job.view+".webp",target="public/images/products/gk-bg020/"+filename;
 try{await access(target);}catch{execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-n","-i",job.source,"-frames:v","1","-c:v","libwebp","-quality","90","-compression_level","6",target]);}
 await copyFile(target,"images/products/gk-bg020/"+filename);
 const originalCopy=root+"/supplier-originals/"+job.original.split("/").at(-1);await copyFile(job.original,originalCopy);
 if(hash(await readFile(job.original))!==hash(await readFile(originalCopy)))throw Error("Original mismatch");
 images.push({...job,target,originalCopy,originalSha256:hash(await readFile(job.original)),sha256:hash(await readFile(target))});
}
const duplicate="C:/Users/mikae/AppData/Local/Temp/codex-clipboard-35ba73c0-6709-47c5-a408-d01f9331f264.jpg";
const duplicateTarget=root+"/supplier-originals/"+duplicate.split("/").at(-1);
await copyFile(duplicate,duplicateTarget);
if(hash(await readFile(duplicate))!==images.find(j=>j.view==="white-hood").originalSha256)throw Error("Clipboard is not expected duplicate");
await writeFile(root+"/manifest.json",JSON.stringify({tool:"built-in image_gen",disclosure:"AI-enhanced supplier-photo references; no exact model, water resistance or authenticity verification",images,duplicate:{source:duplicate,copy:duplicateTarget,duplicateOf:"white-hood"}},null,2));
console.log(JSON.stringify({images:images.length,originalAttachments:13,manifest:root+"/manifest.json"}));
