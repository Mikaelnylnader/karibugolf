/** Verify the supplied photography, chapter links, scroll states and fallbacks. */
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const base = (process.argv.slice(2).find(argument=>argument.startsWith("http")) || "http://127.0.0.1:4517").replace(/\/$/, "");
const requestedProduct = process.argv.find(argument=>argument.startsWith("--product="))?.slice(10);
const output = `.tmp/clubs-photo-qa/${new Date().toISOString().replace(/[:.]/g,"-")}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const categories = ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"];
const expectedImages = [
 "/images/shop/clubs-editorial/driver-address.webp",
 "/images/shop/clubs-editorial/fairway-address.webp",
 "/images/shop/clubs-editorial/hybrid-swing.webp",
 "/images/shop/clubs-editorial/p790-set-on-grass.webp",
 "/images/shop/clubs-editorial/sm11-wedge-setup.webp",
 "/images/products/scotty-cameron-studio-style-newport-2-hero.jpg",
];
const failures = [], results = [];
for (const [name, viewport, reducedMotion, javaScriptEnabled] of (requestedProduct ? [] : [
 ["desktop",{width:1440,height:900},"no-preference",true],
 ["phone",{width:390,height:844},"no-preference",true],
 ["compact",{width:360,height:640},"no-preference",true],
 ["short",{width:1280,height:604},"no-preference",true],
 ["reduced",{width:390,height:844},"reduce",true],
 ["no-js",{width:390,height:844},"no-preference",false],
])) {
 const page=await browser.newPage({viewport,reducedMotion,javaScriptEnabled});
 await page.addInitScript(()=>{
  Element.prototype.requestPointerLock=()=>Promise.resolve();
  Element.prototype.setPointerCapture=()=>{};
  Element.prototype.releasePointerCapture=()=>{};
 });
 page.on("pageerror",error=>failures.push(`${name}: ${error.message}`));
 page.on("response",response=>{
  const pathname=new URL(response.url()).pathname;
  if(response.status()>=400 && !pathname.startsWith("/api/storefront-products") && !pathname.startsWith("/api/product-images/")) failures.push(`${name}: HTTP ${response.status()} ${pathname}`);
 });
 const response=await page.goto(`${base}/shop/clubs/`,{waitUntil:"load"});
 if(response.status()!==200) failures.push(`${name}: page HTTP ${response.status()}`);
 await page.locator("footer.shared-footer").waitFor({state:"attached"});
 if(javaScriptEnabled) await page.waitForFunction(()=>document.querySelector(".department-scroll-shell")?.dataset.scrollcraftMounted==="true");
 await page.locator("img").evaluateAll(async images=>{
  images.forEach(image=>{image.loading="eager";});
  await Promise.all(images.map(image=>image.decode().catch(()=>{})));
 });
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";});
 const sceneResults=[];
 for(const [index,selector] of [".department-object-hero",...categories.map(slug=>`[data-kit-category="${slug}"]`)].entries()) {
  const geometry=await page.locator(selector).evaluate(element=>({top:element.getBoundingClientRect().top+scrollY,height:element.offsetHeight}));
  const samples=[];
  for(const [sample,progress] of [0,.2,.4,.6,.8,1].entries()) {
   await page.evaluate(({geometry,progress})=>scrollTo(0,Math.max(0,geometry.top-innerHeight*.45+(geometry.height+innerHeight*.25)*progress)),{geometry,progress});
   if(javaScriptEnabled) await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   if(javaScriptEnabled) await page.locator(selector).evaluate(async element=>Promise.all(element.getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{}))));
   samples.push(await page.locator(selector).evaluate(element=>({
    overflow:document.documentElement.scrollWidth-innerWidth,
    imageTransform:getComputedStyle(element.querySelector("img")).transform,
    clip:getComputedStyle(element.querySelector("figure")).clipPath,
    copyOpacity:Number(getComputedStyle(element.querySelector(".department-chapter-copy")||element.querySelector(".department-object-copy")).opacity),
    brokenImages:[...element.querySelectorAll("img")].filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.src),
   })));
   if(name==="desktop"||name==="phone") await page.screenshot({path:`${output}/${name}-scene-${index}-sample-${sample}.png`});
  }
  if(samples.some(state=>state.overflow>0||state.brokenImages.length)) failures.push(`${name} scene ${index}: overflow or images`);
  if(!samples.some(state=>state.copyOpacity>=.99)) failures.push(`${name} scene ${index}: copy never readable`);
  if(index>0 && !samples.some(state=>state.clip==="none"||state.clip.startsWith("circle(78%")||!/[1-9]\d*(?:\.\d+)?%/.test(state.clip))) failures.push(`${name} scene ${index}: photograph never fully revealed`);
  sceneResults.push({selector,samples});
 }
 const content=await page.evaluate(()=>({
  hero:document.querySelector("h1")?.textContent,
  heroImage:document.querySelector(".department-object-hero>figure img")?.getAttribute("src"),
  detailImage:document.querySelector(".clubs-hero-detail img")?.getAttribute("src"),
  chapterImages:[...document.querySelectorAll(".department-picture-link img")].map(image=>image.getAttribute("src")),
  links:[...document.querySelectorAll(".department-picture-link")].map(link=>link.getAttribute("href")),
  ledger:document.querySelectorAll(".kit-ledger-items a").length,
  whatsapp:document.querySelector(".department-inquiry a")?.getAttribute("href"),
 }));
 if(content.hero!=="GOLFCLUBS."||content.ledger!==6) failures.push(`${name}: title or category index`);
 if(content.heroImage!=="/images/shop/clubs-editorial/driver-swing.webp" || content.detailImage!=="/images/shop/clubs-editorial/driver-headcover.webp") failures.push(`${name}: supplied hero pictures`);
 if(JSON.stringify(content.chapterImages)!==JSON.stringify(expectedImages)) failures.push(`${name}: category pictures`);
 if(JSON.stringify(content.links)!==JSON.stringify(categories.map(slug=>`/shop/clubs/${slug}`))) failures.push(`${name}: category links`);
 if(!content.whatsapp?.includes("254116416105")) failures.push(`${name}: inquiry destination`);
 if(javaScriptEnabled) {
  const link=page.locator('[data-kit-category="drivers"] .department-chapter-link');
  await link.focus();
  await page.waitForTimeout(350);
  if(!(await link.evaluate(element=>document.activeElement===element && Number(getComputedStyle(element.closest(".department-chapter-copy")).opacity)>=.99))) failures.push(`${name}: keyboard category access`);
 }
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:`${output}/${name}-opening.png`});
 results.push({name,content,scenes:sceneResults});
 await page.close();
}
const check=await browser.newPage();
for(const slug of (requestedProduct ? [] : categories)) {
 const response=await check.request.get(`${base}/shop/clubs/${slug}/`);
 if(response.status()!==200) failures.push(`category route ${slug}: ${response.status()}`);
}
const galleryResults=[];
const galleryModes = [
 {label:"desktop",viewport:{width:1440,height:900},reducedMotion:"no-preference",javaScriptEnabled:true},
 {label:"phone",viewport:{width:390,height:844},reducedMotion:"no-preference",javaScriptEnabled:true},
 {label:"compact",viewport:{width:360,height:640},reducedMotion:"no-preference",javaScriptEnabled:true},
 {label:"short",viewport:{width:1280,height:604},reducedMotion:"no-preference",javaScriptEnabled:true},
 {label:"reduced",viewport:{width:390,height:844},reducedMotion:"reduce",javaScriptEnabled:true},
 {label:"no-js",viewport:{width:390,height:844},reducedMotion:"no-preference",javaScriptEnabled:false},
];
for(const {label:mode,viewport,reducedMotion,javaScriptEnabled} of galleryModes.filter(mode=>requestedProduct || ["desktop","phone"].includes(mode.label))) {
 for(const [slug,count,photos] of [
  ["gk-ir-tmp",8,[["On course","p790-on-course.webp"],["In the bag","p790-in-bag.webp"],["The set","p790-set-on-grass.webp"],["Club detail","p790-cleaning.webp"]]],
  ["gk-ir-p770",7,[["On course","p770-on-course.webp"],["In the bag","p770-in-bag.webp"],["Address on grass","p770-at-address.webp"]]],
  ["gk-wg010",14,[["Finish reference","sm11-finishes.webp"],["T grind","sm11-t-grind.webp"],["D grind","sm11-d-grind.webp"],["M grind","sm11-m-grind.webp"],["F grind","sm11-f-grind.webp"],["S grind","sm11-s-grind.webp"],["K grind","sm11-k-grind.webp"],["Wedge setup","sm11-wedge-setup.webp"],["In the bag","sm11-in-bag.webp"]]],
  ["gk-ir-ttt",5,[["Back","t200-back.webp"],["Face","t200-face.webp"],["At address","t200-address.webp"],["Rear profile","t200-rear-profile.webp"],["Sole","t200-sole.webp"]]],
 ].filter(([slug])=>!requestedProduct || slug===requestedProduct)) {
  const page=await browser.newPage({viewport,reducedMotion,javaScriptEnabled});
  await page.addInitScript(()=>{
   Element.prototype.requestPointerLock=()=>Promise.resolve();
   Element.prototype.setPointerCapture=()=>{};
   Element.prototype.releasePointerCapture=()=>{};
  });
  page.on("pageerror",error=>failures.push(`${slug}: ${error.message}`));
  page.on("response",response=>{
   const pathname=new URL(response.url()).pathname;
   if(response.status()>=400 && !pathname.startsWith("/api/storefront-products") && !pathname.startsWith("/api/product-images/")) failures.push(`${slug} ${mode}: HTTP ${response.status()} ${pathname}`);
  });
  const response=await page.goto(`${base}/shop/product/${slug}/`,{waitUntil:"load"});
  if(response.status()!==200) failures.push(`${slug}: page HTTP ${response.status()}`);
  await page.locator("footer.shared-footer").waitFor({state:"attached"});
  await page.locator("img").evaluateAll(async images=>{
   images.forEach(image=>{image.loading="eager";});
   await Promise.all(images.map(image=>image.decode().catch(()=>{})));
  });
  if(slug==="gk-ir-ttt") {
   const details=await page.evaluate(()=>({
    title:document.querySelector("h1")?.textContent,
    price:document.querySelector(".club-price")?.textContent,
    stock:document.querySelector(".catalog-stock")?.textContent,
    rows:[...document.querySelectorAll(".club-specs tbody tr")].map(row=>[...row.querySelectorAll("td")].map(cell=>cell.textContent)),
    source:document.querySelector(".club-source")?.getAttribute("href"),
    overview:document.querySelector("#product-overview")?.textContent,
    features:document.querySelector("#product-features")?.textContent,
    detailImage:document.querySelector(".product-detail-silence img")?.getAttribute("src"),
    photos:[...document.querySelectorAll(".club-thumbnails img")].map(image=>image.getAttribute("src")),
    note:document.querySelector(".club-photo-note")?.textContent,
    removedPictures:[...document.querySelectorAll('main img')].map(image=>image.getAttribute('src')).filter(src=>src?.endsWith('t200-construction.webp')||src?.endsWith('Titleist_T200.jpg')),
   }));
   const expectedRows=[["4","21°","61.5°",'38.50"'],["5","24°","62°",'38.00"'],["6","27°","62.5°",'37.50"'],["7","30.5°","63°",'37.00"'],["8","34.5°","63.5°",'36.50"'],["9","38.5°","64°",'36.00"'],["PW","43°","64°",'35.75"']];
   if(details.title!=="Titleist T200" || !details.price?.includes("KSh 130,000") || !/in stock/i.test(details.stock||"")) failures.push(`${mode}: T200 price/stock/title changed`);
   if(JSON.stringify(details.rows)!==JSON.stringify(expectedRows)) failures.push(`${mode}: 2023 reference table`);
   if(details.source!=="https://www.titleist.com/golf-clubs/irons/t200-2023" || !details.overview?.includes("2023 TITLEIST T200")) failures.push(`${mode}: T200 generation/source`);
   if(!["Max Impact","D18 tungsten","Vokey-influenced"].every(term=>details.features?.includes(term))) failures.push(`${mode}: T200 technical copy`);
   if(!details.detailImage?.endsWith("t200-face.webp") || !details.note?.includes("manufacturer references")) failures.push(`${mode}: detail/reference disclaimer`);
   if(details.removedPictures.length) failures.push(`${mode}: removed T200 pictures still present`);
   if(!photos.every(([,file])=>details.photos.some(src=>src?.endsWith(file)))) failures.push(`${mode}: supplied T200 pictures missing`);
   await page.screenshot({path:`${output}/${slug}-${mode}-opening.png`});
   galleryResults.push({slug,mode,details});
  }
  if(await page.locator(".club-thumbnails button").count()!==count) failures.push(`${slug}: gallery count`);
  for(const [label,file] of (javaScriptEnabled ? photos : [])) {
   await page.getByRole("button",{name:`Show ${label} photo`,exact:true}).click();
   const selected=page.locator(".club-zoom-trigger img");
   await page.waitForFunction(file=>{
    const image=document.querySelector(".club-zoom-trigger img");
    return image?.getAttribute("src")?.endsWith(file) && image.complete && image.naturalWidth>0;
   },file);
   await selected.evaluate(image=>image.decode());
   if(!(await selected.getAttribute("src"))?.endsWith(file)) failures.push(`${slug}: wrong selected ${label}`);
   await page.getByRole("button",{name:`Enlarge ${label} photo`,exact:true}).click();
   const dialog=page.getByRole("dialog");
   await dialog.waitFor({state:"visible"});
   await dialog.locator("img").evaluate(image=>image.decode());
   await dialog.evaluate(async element=>Promise.all(element.getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{}))));
   if(!(await dialog.locator("img").getAttribute("src"))?.endsWith(file)) failures.push(`${slug}: zoom ${label}`);
   await page.screenshot({path:`${output}/${slug}-${mode}-${file}.png`});
   await page.keyboard.press("Escape");
   await dialog.waitFor({state:"hidden"});
  }
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) failures.push(`${slug}: horizontal overflow at ${viewport.width}`);
  await page.locator(".club-gallery").scrollIntoViewIfNeeded();
  await page.screenshot({path:`${output}/${slug}-${mode}-gallery.png`});
  galleryResults.push({slug,mode,viewport,count,newPhotos:photos.length,zoomVerified:javaScriptEnabled});
  await page.close();
 }
}
await browser.close();
if(!galleryResults.length) failures.push(`No matching product: ${requestedProduct}`);
await writeFile(`${output}/report.json`,JSON.stringify({base,results,galleryResults,failures},null,2));
console.log(JSON.stringify({base,output,viewports:results.map(result=>result.name),scenesChecked:results.reduce((sum,result)=>sum+result.scenes.length,0),galleryResults,failures},null,2));
if(failures.length) process.exitCode=1;
