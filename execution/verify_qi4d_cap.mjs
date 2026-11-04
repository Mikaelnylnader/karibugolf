// Isolated local product QA. Never reads/writes the live Sheet or publishes.
import assert from "node:assert/strict";
import {mkdir, readFile, readdir, writeFile} from "node:fs/promises";
import {DatabaseSync} from "node:sqlite";
import {chromium} from "playwright-core";

const base=(process.argv[2]||"http://127.0.0.1:4517").replace(/\/$/,"");
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+$/,"QA is local-only");
const catalog=JSON.parse(await readFile("lib/catalog.generated.json","utf8"));
const product=catalog.products.find(p=>p.sku==="GK-HC010");
assert.equal(product.priceKes,3500);assert.equal(product.status,"Out of Stock");assert.equal(product.stock,"0");assert.equal(product.images.length,24);
const backups=(await readdir(".tmp/backups")).filter(n=>/^qi4d-cap-\d/.test(n)).sort();
const backup=".tmp/backups/"+backups.at(-1);
const previous=JSON.parse(await readFile(backup+"/catalog-before.json","utf8"));
assert.deepEqual(catalog.products.filter(p=>p.sku!==product.sku),previous.products,"Other catalogue products unchanged");
const db=new DatabaseSync("backend/golf_kenya.db",{readOnly:true}),before=new DatabaseSync(backup+"/catalog-before.db",{readOnly:true});
assert.deepEqual(db.prepare("SELECT * FROM products WHERE sku<>? ORDER BY id").all(product.sku),before.prepare("SELECT * FROM products ORDER BY id").all(),"Other backend products unchanged");
assert.deepEqual(db.prepare("SELECT * FROM settings ORDER BY key").all(),before.prepare("SELECT * FROM settings ORDER BY key").all(),"Settings unchanged");
const saved=db.prepare("SELECT * FROM products WHERE sku=?").get(product.sku);
assert.equal(saved.website_visible,0);assert.equal(Number(saved.cost_cny),70);assert.equal(Number(saved.cost_kes),1330);assert.equal(saved.price_kes,3500);assert.equal(JSON.parse(saved.gallery).length,23);db.close();before.close();
const output=".tmp/qi4d-cap-qa/"+new Date().toISOString().replace(/[:.]/g,"-");await mkdir(output,{recursive:true});
const failures=[],results=[];const check=(p,m)=>{if(!p)failures.push(m);};
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
try{for(const config of [{name:"desktop",width:1440,height:1000},{name:"phone",width:390,height:844},{name:"compact",width:360,height:640},{name:"narrow",width:320,height:740},{name:"reduced",width:390,height:844,reduced:true},{name:"enlarged",width:390,height:844,large:true},{name:"no-js",width:390,height:844,noJs:true}]){
 console.log("Checking "+config.name);
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},reducedMotion:config.reduced?"reduce":"no-preference",javaScriptEnabled:!config.noJs});
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error("Disabled in QA"));Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Document.prototype.exitPointerLock=()=>{};});
 await context.route("**/api/storefront-products*",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:catalog.products})}));
 const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("response",r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
 check((await page.goto(base+"/shop/product/gk-hc010/",{waitUntil:"networkidle"})).status()===200,config.name+": HTTP");
 await page.locator("footer.shared-footer").waitFor({state:"attached"});
 if(config.large)await page.evaluate(()=>{document.documentElement.style.fontSize="200%";dispatchEvent(new Event("resize"));});
 await page.evaluate(async()=>{for(const im of document.images){im.loading="eager";await im.decode().catch(()=>{});}});
 check((await page.locator("h1").textContent()).trim()==="TaylorMade Qi4D Golf Cap",config.name+": title");
 check((await page.locator(".club-price").innerText()).includes("KSh 3,500"),config.name+": price");
 check((await page.locator(".catalog-stock").innerText()).includes("out of stock"),config.name+": no invented stock");
 check((await page.locator(".club-photo-note").innerText()).includes("AI-enhanced"),config.name+": image disclosure");
 check(await page.locator(".club-thumbnails button span").count()===0,config.name+": thumbnails are pictures only");
 check((await page.locator(".club-zoom-trigger>span").innerText()).trim()==="",config.name+": enlargement icon has no visible caption");
 check(await page.locator(".product-study-key").count()===0,config.name+": no labels under study pictures");
 check(await page.locator(".club-gallery-controls>span").first().evaluate(el=>{const s=getComputedStyle(el);return s.position==="absolute"&&parseFloat(s.width)<=1&&parseFloat(s.height)<=1;}),config.name+": main photo description visually hidden");
 const colourResults=[];
 if(!config.noJs){for(const colour of ["Navy","Grey","White","Red"]){
  await page.getByRole("button",{name:colour,exact:true}).click();
  await page.waitForFunction(c=>document.querySelector(".club-zoom-trigger img")?.getAttribute("src")?.endsWith(`qi4d-cap-${c}.webp`),colour.toLowerCase());
  const src=await page.locator(".club-zoom-trigger img").getAttribute("src");
  const message=new URL(await page.locator(".catalog-configurator a").getAttribute("href")).searchParams.get("text");
  check(message.includes("Colour: "+colour)&&message.includes("GK-HC010"),config.name+": enquiry "+colour);
  check(await page.getByRole("button",{name:colour,exact:true}).getAttribute("aria-pressed")==="true",config.name+": selection state "+colour);
  check(await page.locator(".club-thumbnails button").count()===6,config.name+": six thumbnails for "+colour);
  const views=[];
  for(const [suffix,label] of [["","Three-quarter"],["front","Front"],["embroidery","Front embroidery"],["qi4d-detail","Qi4D detail"],["brim-badge","Brim badge"],["rear-strap","Rear strap"]]){
   await page.getByRole("button",{name:"Show "+label+" photo",exact:true}).evaluate(button=>button.click());
   const expected=`qi4d-cap-${colour.toLowerCase()}${suffix?"-"+suffix:""}.webp`;
   await page.waitForFunction(expected=>document.querySelector(".club-zoom-trigger img")?.getAttribute("src")?.endsWith(expected),expected);
   await page.locator(".club-zoom-trigger img").evaluate(im=>im.decode());
   check((await page.locator(".club-thumbnails img").evaluateAll(images=>images.map(im=>im.getAttribute("src")))).every(path=>path.includes("cap-"+colour.toLowerCase())),config.name+": no cross-colour detail views "+colour);
   views.push({label,src:await page.locator(".club-zoom-trigger img").getAttribute("src")});
  }
  await page.locator(".club-zoom-trigger").click();check(await page.getByRole("dialog").isVisible(),config.name+": zoom "+colour);
  check(await page.getByRole("dialog").getByRole("heading").evaluate(el=>{const s=getComputedStyle(el);return s.position==="absolute"&&parseFloat(s.width)<=1&&parseFloat(s.height)<=1;}),config.name+": zoom label visually hidden "+colour);
  await page.getByRole("button",{name:"Next enlarged photo",exact:true}).click();
  check((await page.getByRole("dialog").locator("img").getAttribute("src")).endsWith(`qi4d-cap-${colour.toLowerCase()}.webp`),config.name+": zoom wraps within colour "+colour);
  await page.keyboard.press("Escape");await page.getByRole("dialog").waitFor({state:"hidden"});
  colourResults.push({colour,src,views});
 }
 await page.getByRole("button",{name:"Navy",exact:true}).click();await page.waitForFunction(()=>document.querySelector(".club-zoom-trigger img")?.getAttribute("src")?.includes("navy"));
 }
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(im=>im.complete&&!im.naturalWidth).map(im=>im.src)}));
 check(layout.overflow<=1,config.name+": overflow "+layout.overflow);check(!layout.broken.length,config.name+": broken images");check(!errors.length,config.name+": errors "+errors.join(" | "));
 await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await page.waitForTimeout(300);await page.screenshot({path:output+"/"+config.name+".jpg",type:"jpeg",quality:80});
 results.push({name:config.name,...layout,colourResults,errors});await context.close();
}
const context=await browser.newContext();await context.addInitScript(()=>{Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};});
await context.route("**/api/storefront-products*",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:catalog.products})}));
const page=await context.newPage();
for(const route of ["/shop/accessories/","/shop/accessories/hats_and_caps/"]){await page.goto(base+route);await page.locator("footer.shared-footer").waitFor({state:"attached"});check(await page.locator('a[href="/shop/product/gk-hc010"]').count()>0,route+": cap card");}
for(const route of ["/","/shop/stock/"]){await page.goto(base+route);await page.locator("footer.shared-footer").waitFor({state:"attached"});check(await page.locator('a[href="/shop/product/gk-hc010"]').count()===0,route+": no unconfirmed stock card");}
await page.goto(base+"/shop/product/gk-pt034/");await page.locator("footer.shared-footer").waitFor({state:"attached"});await page.getByRole("button",{name:"Blue",exact:true}).click();await page.waitForFunction(()=>document.querySelector(".club-zoom-trigger img")?.getAttribute("src")?.includes("blue"));
check(await page.locator(".club-thumbnails button span").count()>0,"other product retains its photo labels");
await context.close();
}catch(e){failures.push(e.stack);}finally{await browser.close();}
await writeFile(output+"/report.json",JSON.stringify({base,output,results,failures,inventoryMode:"local catalogue fixture; no Google/Netlify calls",backendPreservation:true},null,2));
console.log(JSON.stringify({output,configurations:results.length,failures}));if(failures.length)process.exitCode=1;
