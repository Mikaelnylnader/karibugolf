/** Isolated stock matching, common selectors and Senior inventory round-trip. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir,readFile,writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import catalog from "../lib/catalog.generated.json" with {type:"json"};
import { ironStockMatch,stockSetupLabel } from "../lib/iron-options.ts";

const base=process.argv[2] || "http://127.0.0.1:4517";
if(!/127\.0\.0\.1|localhost/.test(base)) throw new Error("Use a local preview; this verifier uses simulated inventory.");
const output=`.tmp/iron-options-qa/${new Date().toISOString().replace(/[:.]/g,"-")}`;
await mkdir(output,{recursive:true});
const results=[],failures=[];
const check=(value,label)=>{if(!value)failures.push(label);};
const irons=catalog.products.filter(product=>product.categorySlug==="golf_irons");
assert.equal(irons.length,5);
assert.equal(ironStockMatch(true,{}, {Shaft:"Steel",Flex:"Regular (R)"}),"unconfirmed");
assert.equal(ironStockMatch(false,{shaftMaterial:"Steel",shaftFlex:"R"},{Shaft:"Steel",Flex:"Regular (R)"}),"out-of-stock");

const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
async function makePage(viewport,payload=catalog.products) {
 const page=await browser.newPage({viewport});
 let reads=0;
 await page.addInitScript(()=>{
  Element.prototype.requestPointerLock=()=>Promise.resolve();Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};
 });
 await page.route("**/api/storefront-products*",route=>{
  reads++;return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:payload})});
 });
 page.on("pageerror",error=>failures.push(error.message));
 const ready=page.waitForResponse(response=>response.url().includes("/api/storefront-products")&&response.status()===200);
 return {page,reads:()=>reads,ready};
}
try {
 for(const viewport of (process.argv.includes("--senior-only") ? [] : [{width:1440,height:900},{width:390,height:844}])) {
  for(const product of (process.argv.includes("--stock-only") ? [] : irons)) {
   const {page,reads,ready}=await makePage(viewport);
   await page.goto(`${base}/shop/product/${product.slug}/`,{waitUntil:"commit"});
   await page.locator("footer.shared-footer").waitFor({state:"attached"});
   await ready;
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.waitForFunction(()=>document.querySelectorAll('.catalog-configurator fieldset').length>=3);
   const field=label=>page.getByRole("group",{name:label,exact:true});
   check(JSON.stringify(await field("Shaft").getByRole("button").evaluateAll(buttons=>buttons.map(button=>button.getAttribute("aria-label"))))===JSON.stringify(["Steel","Graphite"]),`${product.sku}: shaft options`);
   for(const shaft of ["Steel","Graphite"]) {
    await field("Shaft").getByRole("button",{name:shaft,exact:true}).click();
    const options=await field("Flex").getByRole("button").evaluateAll(buttons=>buttons.map(button=>button.getAttribute("aria-label")));
    check(JSON.stringify(options)===JSON.stringify(["Regular (R)","Stiff (S)","Senior (A)"]),`${product.sku}: all flex choices for ${shaft}`);
    for(const flex of options) {
     await field("Flex").getByRole("button",{name:flex,exact:true}).click();
     const expected=ironStockMatch(product.status==="In Stock"&&Number(product.stock)>0,product,{Shaft:shaft,Flex:flex});
     await page.waitForFunction(({sku,expected})=>document.querySelector(`[data-selected-stock="${sku}"]`)?.classList.contains(expected),{sku:product.sku,expected});
     const href=await page.locator(".catalog-configurator .contact-button").getAttribute("href");
     const message=new URL(href).searchParams.get("text");
     check(message.includes(`Shaft: ${shaft}`)&&message.includes(`Flex: ${flex}`),`${product.sku}: enquiry selection`);
     if(expected!=="in-stock") check((await page.locator(".catalog-stock").innerText()).toLowerCase().includes("out of stock")||(await page.locator(".catalog-stock").innerText()).includes("not currently in stock"),`${product.sku}: unstocked option falsely available`);
    }
   }
   check(reads()===1,`${product.sku}: ${reads()} catalogue reads instead of one`);
   if(product.sku==="GK-IR-TTT") {
    check((await field("Set").innerText()).includes("4–PW")&&!(await field("Set").innerText()).includes("AW"),"T200: set is not 4–PW only");
    check(await page.locator(".club-specs tbody tr").count()===7,"T200: approach wedge still in specification table");
   }
   if(product.status==="In Stock" && product.shaftMaterial) {
    await field("Shaft").getByRole("button",{name:product.shaftMaterial,exact:true}).click();
    const flex={R:"Regular (R)",S:"Stiff (S)",A:"Senior (A)"}[product.shaftFlex];
    await field("Flex").getByRole("button",{name:flex,exact:true}).click();
    await page.waitForFunction(sku=>document.querySelector(`[data-selected-stock="${sku}"]`)?.classList.contains("in-stock"),product.sku);
   }
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${product.sku}: horizontal overflow`);
   await page.screenshot({path:`${output}/${product.slug}-${viewport.width}.png`});
   results.push({sku:product.sku,viewport:viewport.width,combinations:6,inventory:stockSetupLabel(product),reads:reads()});
   await page.close();
  }
  for(const route of ["/","/shop/","/shop/stock/"]) {
   const {page,reads,ready}=await makePage(viewport);
   await page.goto(`${base}${route}`,{waitUntil:"commit"});
   await page.locator("footer.shared-footer").waitFor({state:"attached"});
   await ready;
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   for(const product of irons.filter(product=>product.status==="In Stock")) {
    const setup=page.locator(`[data-stock-setup="${product.sku}"]`).first();
    try { await setup.waitFor({state:"attached"});check(await setup.textContent()===stockSetupLabel(product),`${route}: ${product.sku} in-stock setup`); }
    catch(error) {
     await writeFile(`${output}/stock-page-failure.json`,JSON.stringify({route,failures,markers:await page.locator('[data-stock-setup]').evaluateAll(elements=>elements.map(element=>[element.getAttribute('data-stock-setup'),element.textContent]))},null,2));
     throw error;
    }
   }
   check(reads()===1,`${route}: multiple catalogue reads`);
   if(route!=="/shop/stock/") {
    await page.locator(".home-stock").evaluate(section=>scrollTo(0,section.getBoundingClientRect().top+scrollY+Math.max(0,section.offsetHeight-innerHeight)*.98));
    await page.waitForTimeout(150);
   }
   await page.screenshot({path:`${output}/${route==='/'?'home':route.replaceAll('/','')}-${viewport.width}.png`});
   await page.close();
  }
 }
 const fixture={sku:"GK-IR-TMP",name:"Isolated P790 fixture",categorySlug:"golf_irons",sizes:"4–PW",colors:"Standard",status:"In Stock",stock:"1",priceKes:130000,priceCny:0,priceUsd:0,shaftMaterial:"Graphite",shaftFlex:"R",websiteVisible:true};
 const headers=["SKU","Name","Category","Sizes","Colors","Status","Stock","Price Kenya (Ksh)","Shaft Material","Shaft Flex","Website Visible"];
 const storage=`${output}/admin-data.json`;
 await writeFile(storage,JSON.stringify({Sheet1:[headers,[fixture.sku,fixture.name,fixture.categorySlug,fixture.sizes,fixture.colors,fixture.status,fixture.stock,fixture.priceKes,fixture.shaftMaterial,fixture.shaftFlex,"TRUE"]]},null,2));
 const server=spawn(process.execPath,["execution/serve_admin_local.mjs","0",storage],{stdio:["ignore","pipe","pipe"]});
 try {
  const origin=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error("Local admin startup timed out")),20000);
   server.once("exit",code=>{clearTimeout(timer);reject(new Error(`Local admin exited ${code}`));});
   server.stdout.on("data",bytes=>{const match=bytes.toString().match(/Local admin: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  });
  const auth=await fetch(`${origin}/api/admin-auth`);
  const cookie=auth.headers.get("set-cookie").split(";")[0];
  const save=await fetch(`${origin}/api/admin-products`,{method:"POST",headers:{cookie,"content-type":"application/json"},body:JSON.stringify({...fixture,shaftFlex:"A"})});
  check(save.status===200,"Senior flex rejected by inventory handler");
  const saved=(await (await fetch(`${origin}/api/storefront-products`)).json()).products[0];
  await writeFile(`${output}/senior-api-fixture.json`,JSON.stringify(saved,null,2));
  check(saved.shaftFlex==="A"&&saved.shaftMaterial==="Graphite"&&saved.sizes==="4–PW","Senior round-trip to storefront API");
  const invalid=await fetch(`${origin}/api/admin-products`,{method:"POST",headers:{cookie,"content-type":"application/json"},body:JSON.stringify({...fixture,shaftFlex:"X"})});
  check(invalid.status===400,"Unsupported inventory flex accepted");
  const payload=catalog.products.map(product=>product.sku===saved.sku?{...product,...saved}:product);
  const {page}=await makePage({width:390,height:844},payload);
  await page.goto(`${base}/shop/product/gk-ir-tmp/`,{waitUntil:"commit"});
  await page.locator("footer.shared-footer").waitFor({state:"attached"});
  await page.waitForFunction(()=>document.querySelector('[data-current-stock="GK-IR-TMP"]')?.textContent?.includes("Senior (A)"));
  await page.getByRole("button",{name:"Senior (A)",exact:true}).click();
  await page.getByRole("button",{name:"Graphite",exact:true}).click();
  try { await page.waitForFunction(()=>document.querySelector('[data-selected-stock="GK-IR-TMP"]')?.classList.contains("in-stock")); }
  catch(error) {
   await writeFile(`${output}/senior-ui-failure.json`,JSON.stringify({saved,failures,ui:await page.locator('.club-buy-panel').innerText()},null,2));
   throw error;
  }
  await page.screenshot({path:`${output}/senior-stock-fixture.png`});
  await page.close();
  results.push({seniorInventoryRoundTrip:"passed",externalWrites:0});
 } finally {server.kill();}
 const adminHtml=await readFile("public/admin/index.html","utf8");
 check(adminHtml.includes('<option value="A">A — Senior</option>'),"Admin editor missing Senior flex");
} finally {await browser.close();}
await writeFile(`${output}/report.json`,JSON.stringify({base,output,results,failures},null,2));
console.log(JSON.stringify({output,products:irons.length,results,failures},null,2));
if(failures.length)process.exitCode=1;
