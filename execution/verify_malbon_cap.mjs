// Isolated offline QA: no Google reads, writes or deployment.
import assert from "node:assert/strict";
import {readFile,readdir,mkdir,writeFile} from "node:fs/promises";
import {DatabaseSync} from "node:sqlite";
import {chromium} from "playwright-core";
const base="http://127.0.0.1:4517",sku="GK-HC011";
const catalog=JSON.parse(await readFile("lib/catalog.generated.json","utf8"));
const product=catalog.products.find(p=>p.sku===sku);
assert.equal(product.priceKes,3300);assert.equal(product.priceCny,173.68);assert.equal(product.priceUsd,25.48);assert.equal(product.images.length,12);
const backup=".tmp/backups/"+(await readdir(".tmp/backups")).filter(s=>/^malbon-cap-\d/.test(s)).sort().at(-1);
const old=JSON.parse(await readFile(backup+"/catalog-before.json","utf8"));
assert.deepEqual(catalog.products.filter(p=>p.sku!==sku),old.products);
const db=new DatabaseSync("backend/golf_kenya.db",{readOnly:true}),before=new DatabaseSync(backup+"/catalog-before.db",{readOnly:true});
assert.deepEqual(db.prepare("SELECT * FROM products WHERE sku<>? ORDER BY id").all(sku),before.prepare("SELECT * FROM products ORDER BY id").all());
assert.deepEqual(db.prepare("SELECT * FROM settings ORDER BY key").all(),before.prepare("SELECT * FROM settings ORDER BY key").all());
const saved=db.prepare("SELECT * FROM products WHERE sku=?").get(sku);
assert.equal(Number(saved.cost_cny),66);assert.equal(Number(saved.cost_kes),1254);assert.equal(saved.website_visible,0);assert.equal(saved.status,"Out of Stock");assert.equal(saved.stock,"0");assert.equal(JSON.parse(saved.gallery).length,11);
db.close();before.close();
const output=".tmp/malbon-cap-qa/"+new Date().toISOString().replace(/[:.]/g,"-");await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const results=[];
try{
 for(const c of [{name:"desktop",width:1440,height:1000},{name:"phone",width:390,height:844},{name:"narrow",width:320,height:740},{name:"reduced",width:390,height:844,reduced:true},{name:"enlarged",width:390,height:844,large:true},{name:"no-js",width:390,height:844,noJs:true}]){
  console.log("Checking "+c.name);
  const ctx=await browser.newContext({viewport:{width:c.width,height:c.height},javaScriptEnabled:!c.noJs,reducedMotion:c.reduced?"reduce":"no-preference"});
  await ctx.addInitScript(()=>{Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};});
  await ctx.route("**/api/storefront-products*",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:catalog.products})}));
  const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("response",r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
  assert.equal((await page.goto(base+"/shop/product/gk-hc011/",{waitUntil:"networkidle"})).status(),200);
  await page.locator("footer.shared-footer").waitFor({state:"attached"});
  if(c.large)await page.evaluate(()=>{document.documentElement.style.fontSize="200%";dispatchEvent(new Event("resize"));});
  await page.evaluate(async()=>{for(const im of document.images){im.loading="eager";await im.decode().catch(()=>{});}});
  assert.equal((await page.locator("h1").textContent()).trim(),product.name);
  assert.match(await page.locator(".club-price").innerText(),/KSh 3,300/);
  assert.match(await page.locator(".catalog-stock").innerText(),/out of stock/i);
  assert.match(await page.locator(".club-photo-note").innerText(),/AI colour adaptations/);
  assert.equal(await page.locator('.club-gallery img[src*="malbon-cap-colours"]').count(),0);
  assert.equal(await page.locator('#product-overview .product-study-primary img').getAttribute("src"),"/images/products/gk-hc011/malbon-cap-colours.webp");
  assert.equal(await page.locator('#product-overview .product-study-visual img').count(),1);
  assert.equal(await page.locator(".club-thumbnails span").count(),0);
  const seen=new Set();
  if(!c.noJs)for(const [colour,count] of [["Navy",4],["Green",4],["White",4]]){
   await page.getByRole("button",{name:colour,exact:true}).click();
   await page.waitForFunction(v=>document.querySelector(".club-zoom-trigger img")?.getAttribute("src")?.endsWith("malbon-cap-"+v+".webp"),colour.toLowerCase());
   const buttons=page.locator(".club-thumbnails button");assert.equal(await buttons.count(),count);
   for(let i=0;i<count;i++){
    await buttons.nth(i).evaluate(b=>b.click());
    await page.locator(".club-zoom-trigger img").evaluate(im=>im.decode());
    seen.add(await page.locator(".club-zoom-trigger img").getAttribute("src"));
    await page.locator(".club-zoom-trigger").click();assert.ok(await page.getByRole("dialog").isVisible());await page.keyboard.press("Escape");await page.getByRole("dialog").waitFor({state:"hidden"});
   }
   const message=new URL(await page.locator(".catalog-configurator a").getAttribute("href")).searchParams.get("text");
   assert.ok(message.includes(sku)&&message.includes(colour)&&message.includes("3,300"));
  }
  if(!c.noJs){assert.equal(seen.size,12);assert.ok(![...seen].some(src=>src.includes("cap-colours")));await page.locator("#product-overview").scrollIntoViewIfNeeded();await page.screenshot({path:output+"/"+c.name+"-overview.jpg",type:"jpeg",quality:80});}
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(im=>im.complete&&!im.naturalWidth).map(im=>im.src)}));
  assert.ok(layout.overflow<=1);assert.deepEqual(layout.broken,[]);assert.deepEqual(errors,[]);
  if(!c.noJs)await page.getByRole("button",{name:"Navy",exact:true}).click();
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await page.waitForTimeout(200);await page.screenshot({path:output+"/"+c.name+".jpg",type:"jpeg",quality:80});
  results.push({name:c.name,uniquePhotos:seen.size,...layout});await ctx.close();
 }
 const ctx=await browser.newContext();await ctx.route("**/api/storefront-products*",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:catalog.products})}));const page=await ctx.newPage();
 for(const route of ["/shop/accessories/","/shop/accessories/hats_and_caps/"]){await page.goto(base+route);assert.ok(await page.locator('a[href="/shop/product/gk-hc011"]').count());}
 for(const route of ["/","/shop/stock/"]){await page.goto(base+route);await page.locator("footer.shared-footer").waitFor({state:"attached"});assert.equal(await page.locator('a[href="/shop/product/gk-hc011"]').count(),0);}
 await page.goto(base+"/shop/product/gk-bg019/");assert.match(await page.locator(".club-price").innerText(),/KSh 49,000/);
 await page.goto(base+"/shop/product/gk-hc010/");assert.equal(await page.locator(".club-thumbnails button").count(),6);assert.equal(await page.locator(".club-thumbnails span").count(),0);await ctx.close();
}finally{await browser.close();}
await writeFile(output+"/report.json",JSON.stringify({results,unchangedPreviousData:true,network:"local fixtures only"},null,2));console.log(JSON.stringify({output,configurations:results.length,passed:true}));
