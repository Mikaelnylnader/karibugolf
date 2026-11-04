// Local-only bag QA: fixtures avoid live Sheet reads and all external writes.
import assert from "node:assert/strict";
import {mkdir,readFile,readdir,writeFile} from "node:fs/promises";
import {DatabaseSync} from "node:sqlite";
import {chromium} from "playwright-core";
const base=(process.argv[2]||"http://127.0.0.1:4517").replace(/\/$/,"");
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
const sku="GK-BG019",slug=sku.toLowerCase();
const catalog=JSON.parse(await readFile("lib/catalog.generated.json","utf8")),product=catalog.products.find(p=>p.sku===sku);
assert.equal(product.priceKes,49000);assert.equal(product.status,"Out of Stock");assert.equal(product.images.length,4);
const backups=(await readdir(".tmp/backups")).filter(s=>s.startsWith("titleist-premium-bag-")).sort();const backup=".tmp/backups/"+backups.at(-1);
const original=JSON.parse(await readFile(backup+"/catalog-before.json","utf8"));
assert.deepEqual(catalog.products.filter(p=>p.sku!==sku),original.products,"Existing catalogue unchanged");
const db=new DatabaseSync("backend/golf_kenya.db",{readOnly:true}),before=new DatabaseSync(backup+"/catalog-before.db",{readOnly:true});
assert.deepEqual(db.prepare("SELECT * FROM products WHERE sku<>? ORDER BY id").all(sku),before.prepare("SELECT * FROM products ORDER BY id").all(),"Existing backend records unchanged");
assert.deepEqual(db.prepare("SELECT * FROM settings ORDER BY key").all(),before.prepare("SELECT * FROM settings ORDER BY key").all(),"Settings unchanged");
const saved=db.prepare("SELECT * FROM products WHERE sku=?").get(sku);assert.equal(Number(saved.cost_cny),1800);assert.equal(Number(saved.cost_kes),34200);assert.equal(saved.price_kes,49000);assert.equal(saved.website_visible,0);assert.equal(saved.stock,"0");db.close();before.close();
const output=".tmp/titleist-premium-bag-qa/"+new Date().toISOString().replace(/[:.]/g,"-");await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const results=[],failures=[];const check=(p,m)=>{if(!p)failures.push(m);};
try{for(const c of [{name:"desktop",width:1440,height:1000},{name:"phone",width:390,height:844},{name:"narrow",width:320,height:740},{name:"reduced",width:390,height:844,reduced:true},{name:"enlarged",width:390,height:844,large:true},{name:"no-js",width:390,height:844,noJs:true}]){
 console.log("Checking "+c.name);
 const context=await browser.newContext({viewport:{width:c.width,height:c.height},reducedMotion:c.reduced?"reduce":"no-preference",javaScriptEnabled:!c.noJs});
 await context.addInitScript(()=>{Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Element.prototype.requestPointerLock=()=>Promise.reject(new Error("Disabled for QA"));Document.prototype.exitPointerLock=()=>{};});
 await context.route("**/api/storefront-products*",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:catalog.products})}));
 const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("response",r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
 check((await page.goto(base+"/shop/product/"+slug+"/",{waitUntil:"networkidle"})).status()===200,c.name+": HTTP");await page.locator("footer.shared-footer").waitFor({state:"attached"});
 if(c.large)await page.evaluate(()=>{document.documentElement.style.fontSize="200%";dispatchEvent(new Event("resize"));});
 await page.evaluate(async()=>{for(const im of document.images){im.loading="eager";await im.decode().catch(()=>{});}});
 check((await page.locator("h1").textContent()).trim()===product.name,c.name+": name");
 check((await page.locator(".club-price").innerText()).includes("KSh 49,000"),c.name+": price");
 check((await page.locator(".catalog-stock").innerText()).includes("out of stock"),c.name+": stock");
 check(await page.locator(".club-thumbnails button").count()===4,c.name+": four photos");check(await page.locator(".club-thumbnails span").count()===0,c.name+": picture-only thumbnails");
 check((await page.locator(".club-photo-note").innerText()).includes("AI-enhanced"),c.name+": image disclosure");
 check((await page.locator(".club-specs").innerText()).includes("not independently verified"),c.name+": reference qualification");
 check(await page.locator(".club-source").getAttribute("href")==="https://www.titleist.com/product/premium-stand-bag/051GB1T.html",c.name+": official source");
 const views=[];
 if(!c.noJs){for(const [view,label] of [["hero","Stand view"],["top-front","Top and pockets"],["rear","Back and straps"],["upright-side","Upright side"]]){
  await page.getByRole("button",{name:"Show "+label+" photo",exact:true}).evaluate(b=>b.click());await page.waitForFunction(v=>document.querySelector(".club-zoom-trigger img")?.getAttribute("src")?.endsWith(v+".webp"),view);await page.locator(".club-zoom-trigger img").evaluate(im=>im.decode());
  await page.locator(".club-zoom-trigger").click();check(await page.getByRole("dialog").isVisible(),c.name+": zoom "+view);await page.keyboard.press("Escape");await page.getByRole("dialog").waitFor({state:"hidden"});views.push(view);
 }
 const message=new URL(await page.locator(".catalog-configurator a").getAttribute("href")).searchParams.get("text");check(message.includes(sku)&&message.includes("Black / White")&&message.includes("49,000"),c.name+": enquiry details");
 await page.getByRole("button",{name:"Show Stand view photo",exact:true}).evaluate(b=>b.click());}
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(im=>im.complete&&!im.naturalWidth).map(im=>im.src)}));check(layout.overflow<=1,c.name+": overflow "+layout.overflow);check(!layout.broken.length,c.name+": broken images");check(!errors.length,c.name+": browser errors "+errors.join(" | "));
 await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await page.waitForTimeout(300);await page.screenshot({path:output+"/"+c.name+".jpg",type:"jpeg",quality:80});results.push({name:c.name,views,errors,...layout});await context.close();
}
const context=await browser.newContext();await context.addInitScript(()=>{Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};});await context.route("**/api/storefront-products*",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:catalog.products})}));const page=await context.newPage();
for(const route of ["/shop/bags/","/shop/bags/bags/"]){await page.goto(base+route);await page.locator("footer.shared-footer").waitFor({state:"attached"});check(await page.locator('a[href="/shop/product/gk-bg019"]').count()>0,route+": bag card");}
for(const route of ["/","/shop/stock/"]){await page.goto(base+route);await page.locator("footer.shared-footer").waitFor({state:"attached"});check(await page.locator('a[href="/shop/product/gk-bg019"]').count()===0,route+": no unconfirmed-stock card");}
await page.goto(base+"/shop/product/gk-hc010/");await page.locator("footer.shared-footer").waitFor({state:"attached"});check(await page.locator(".club-thumbnails button").count()===6,"cap gallery retained");check(await page.locator(".club-thumbnails span").count()===0,"cap remains caption-free");await context.close();
}catch(e){failures.push(e.stack);}finally{await browser.close();}
await writeFile(output+"/report.json",JSON.stringify({base,output,results,failures,backendPreserved:true,inventoryMode:"local fixture only; no Google Sheet reads/writes"},null,2));console.log(JSON.stringify({output,configurations:results.length,failures}));if(failures.length)process.exitCode=1;
