/** Local Kids' Shoes navigation, scroll, fitting choices and static fallbacks. */
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';

const base=(process.argv[2]||'http://127.0.0.1:4517').replace(/\/$/,'');
const output=`.tmp/kids-shoes-qa/${new Date().toISOString().replace(/[:.]/g,'-')}`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[],errors=[];
/** @type {Array<[string, {width:number,height:number}, 'no-preference'|'reduce', boolean]>} */
const modes=[
 ['desktop',{width:1440,height:900},'no-preference',true],
 ['phone',{width:390,height:844},'no-preference',true],
 ['compact',{width:360,height:640},'no-preference',true],
 ['short',{width:1280,height:604},'no-preference',true],
 ['reduced',{width:390,height:844},'reduce',true],
 ['no-js',{width:390,height:844},'no-preference',false],
];
try{
 for(const [name,viewport,reducedMotion,javaScriptEnabled] of modes){
  const page=await browser.newPage({viewport,reducedMotion,javaScriptEnabled});
  await page.addInitScript(()=>{Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Element.prototype.requestPointerLock=()=>Promise.resolve();});
  page.on('pageerror',error=>errors.push(`${name}: ${error.message}`));
  page.on('response',response=>{if(response.status()>=400)errors.push(`${name}: HTTP ${response.status()} ${response.url()}`);});
  assert.equal((await page.goto(base+'/shop/shoes/',{waitUntil:'load'})).status(),200);
  await page.locator('footer.shared-footer').waitFor({state:'attached'});
  assert.equal(await page.locator('.kit-ledger-items a').count(),3);
  assert.equal(await page.locator('[data-kit-category]').count(),3);
  const parentLink=page.locator('[data-kit-category="kids_shoes"] .department-chapter-link');
  assert.equal(await parentLink.getAttribute('href'),'/shop/shoes/kids_shoes');
  await parentLink.focus();
  if(javaScriptEnabled)await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.keyboard.press('Enter');
  await page.waitForURL('**/shop/shoes/kids_shoes**');
  await page.locator('footer.shared-footer').waitFor({state:'attached'});
  if(javaScriptEnabled)await page.waitForFunction(()=>document.querySelector('.department-scroll-shell')?.dataset.scrollcraftMounted==='true');
  assert.equal(await page.locator('.kit-ledger').evaluate(e=>getComputedStyle(e).position),'relative');
  assert.equal(await page.locator('.kit-ledger-items a[aria-current="location"]').getAttribute('href'),'/shop/shoes/kids_shoes');
  await page.evaluate(()=>scrollTo(0,0));
  if(javaScriptEnabled)await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert.ok(await page.locator('.equipment-object-copy>div>a').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1),`${name}: opening action below the fold`);
  assert.equal(await page.locator('h1').textContent(),'KIDS’ SHOES.');
  assert.equal(await page.locator('head link[rel="canonical"]').getAttribute('href'),'https://karibugolf.com/shop/shoes/kids_shoes/');
  assert.ok((await page.title()).includes('Kids’ Golf Shoes in Kenya'));
  assert.equal(await page.locator('.equipment-decision-track>article').count(),3);
  assert.equal(await page.locator('.equipment-fit-controls button').count(),3);
  assert.equal(await page.locator('.store-product-card').count(),0);
  assert.match(await page.locator('.category-empty').textContent(),/No kids’ shoe models are listed yet/);
  assert.match(new URL(await page.locator('.category-inquiry a').getAttribute('href')).searchParams.get('text'),/kids’ golf shoes/);
  await page.locator('img').evaluateAll(async images=>{images.forEach(image=>{image.loading='eager';});await Promise.all(images.map(image=>image.decode()));});
  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';});
  const scenes=[];
  for(const selector of ['.equipment-object-hero','.equipment-decision-rail','.equipment-lens','.equipment-fit-line','.category-empty','.category-inquiry']){
   const scene=page.locator(selector);const geometry=await scene.evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight}));
   const samples=[];
   for(const [index,progress]of [0,.2,.4,.6,.8,1].entries()){
    await page.evaluate(({top,height,progress})=>scrollTo(0,Math.max(0,top-innerHeight*.2+Math.max(0,height-innerHeight*.6)*progress)),{...geometry,progress});
    if(javaScriptEnabled){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await scene.evaluate(async e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));}
    const state=await scene.evaluate(e=>({overflow:document.documentElement.scrollWidth-innerWidth,opacity:Number(getComputedStyle(e.querySelector('[data-sc-in]')||e).opacity),photo:getComputedStyle(document.querySelector('.equipment-hero-photo')).transform,rail:getComputedStyle(document.querySelector('.equipment-decision-track')).transform}));
    assert.ok(state.overflow<=1,`${name}: overflow at ${selector}`);samples.push(state);
    if(['desktop','phone'].includes(name))await page.screenshot({path:`${output}/${name}-${selector.slice(1)}-${index}.png`});
   }
   assert.ok(samples.some(s=>s.opacity>=.99),`${name}: copy never readable at ${selector}`);scenes.push({selector,samples});
  }
  if(javaScriptEnabled){
   for(const button of await page.locator('.equipment-fit-controls button').all()){
    await button.focus();await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    const label=await button.locator('span').textContent();
    assert.match(new URL(await page.locator('.equipment-fit-result a').getAttribute('href')).searchParams.get('text'),new RegExp(`Priority: ${label}`));
    assert.ok(await button.evaluate(e=>e.getBoundingClientRect().height>=44));
   }
  }
  const targets=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>a.getAttribute('href').slice(1)).filter(Boolean));
  for(const id of targets)assert.ok(await page.locator(`[id="${id}"]`).count(),`${name}: broken anchor ${id}`);
  results.push({name,scenes,choicesChecked:javaScriptEnabled?3:0});await page.close();
 }
}finally{await browser.close();}
assert.deepEqual(errors,[]);
assert.ok((await readFile('dist/static/sitemap.xml','utf8')).includes('https://karibugolf.com/shop/shoes/kids_shoes/'));
assert.ok((await readFile('dist/static/admin/admin.js','utf8')).includes('["kids_shoes", "Kids’ Shoes"]'));
await writeFile(`${output}/report.json`,JSON.stringify({base,output,results,errors,externalWrites:0},null,2));
console.log(JSON.stringify({output,modes:results.length,scenes:results.reduce((n,r)=>n+r.scenes.length,0),errors}));
