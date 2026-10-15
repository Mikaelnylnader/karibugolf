import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright-core';
import catalog from '../lib/catalog.generated.json' with {type:'json'};

const base=(process.argv[2]||'http://127.0.0.1:4517').replace(/\/$/,'');
const output='.tmp/home-features-qa/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(output,{recursive:true});
const normalize=s=>s.replaceAll('\r\n','\n');
const sourceBase=process.argv.find(arg=>arg.startsWith('--source-base='))?.slice('--source-base='.length)||'57e86a1';
const original=normalize(execFileSync('git',['show',sourceBase+':app/page.tsx'],{encoding:'utf8'}));
const current=normalize(await readFile('app/page.tsx','utf8'))
 .replace('import { HomeCoachingSection, HomeCampaignSection } from "@/components/home-feature-sections";\n','')
 .replace('import "./home-features.css";\n','')
 .replace('  <HomeCoachingSection/>\n','').replace('  <HomeCampaignSection/>\n','');
assert.equal(current,original,'All existing homepage markup, copy and motion stay unchanged');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const configs=[{name:'desktop',width:1440,height:900},{name:'laptop',width:1280,height:604},{name:'phone',width:390,height:844},{name:'compact',width:360,height:640},{name:'narrow',width:320,height:740,static:true},{name:'reduced',width:1440,height:900,reduced:true,static:true},{name:'enlarged',width:390,height:844,large:true,static:true},{name:'no-js',width:390,height:844,noJs:true,static:true}];
const failures=[],errors=[],results=[];
const check=(pass,message)=>{if(!pass)failures.push(message);};
try {for(const config of configs){
 console.log('Checking '+config.name);
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},reducedMotion:config.reduced?'reduce':'no-preference',javaScriptEnabled:!config.noJs});
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled for QA'));Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Document.prototype.exitPointerLock=()=>{};});
 await context.route('**/api/storefront-products*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({products:catalog.products})}));
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(config.name+': '+e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(config.name+': '+r.status()+' '+r.url());});
 assert.equal((await page.goto(base+'/',{waitUntil:'networkidle'})).status(),200);
 await page.locator('footer.shared-footer').waitFor({state:'attached'});
 await page.evaluate(async()=>{await document.fonts.ready;document.documentElement.style.scrollBehavior='auto';for(const im of document.querySelectorAll('.home-feature img')){im.loading='eager';await im.decode();}});
 if(config.large)await page.evaluate(()=>{document.documentElement.style.fontSize='200%';dispatchEvent(new Event('resize'));});
 await page.waitForTimeout(120);
 check(await page.locator('.home-feature').count()===2,config.name+': exactly two new sections');
 check(await page.locator('h1').count()===1,config.name+': original single hero');
 for(const selector of ['.opening','.welcome','.journey','.shop-announcement','.home-stock','.people','.home-mission','.contact-close'])check(await page.locator(selector).count()===1,config.name+': retained '+selector);
 check(await page.locator('.home-campaign-status').innerText()==='Pre-launch campaign. Rewards are proposed; payments and reservations are not open.',config.name+': campaign status');
 const record={name:config.name,samples:[]};
 for(const [index,selector] of ['.home-coaching','.home-campaign'].entries()){
  for(let step=0;step<6;step++){
   await page.evaluate(({selector,step})=>{const el=document.querySelector(selector);const top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top-innerHeight*.9+step*innerHeight*.16,behavior:'instant'});},{selector,step});
   if(!config.noJs)await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.waitForTimeout(50);
   const state=await page.locator(selector).evaluate(el=>({arrival:el.style.getPropertyValue('--home-feature-arrival'),mode:el.dataset.homeFeatureMotion,overflow:document.documentElement.scrollWidth-innerWidth,opacity:getComputedStyle(el.querySelector('a')).opacity,transform:getComputedStyle(el.querySelector('h2')).transform,draw:el.querySelector('.home-campaign-seam-drawn')?getComputedStyle(el.querySelector('.home-campaign-seam-drawn')).strokeDashoffset:null}));
   check(state.overflow<=1,config.name+': no overflow '+selector+' '+step);
   check(state.opacity==='1',config.name+': action never hidden '+selector+' '+step);
   if(config.static)check(state.transform==='none',config.name+': complete static heading '+selector);
   record.samples.push({selector,step,...state});
   await page.screenshot({path:output+'/'+config.name+'-'+String(index*6+step).padStart(2,'0')+'.jpg',type:'jpeg',quality:65});
  }
  if(!config.static){const samples=record.samples.filter(s=>s.selector===selector);check(Number(samples.at(-1).arrival)>Number(samples[0].arrival),config.name+': scroll advances '+selector);}
  const link=page.locator(selector+' a');
  if(!config.noJs){
   await link.focus();await page.waitForTimeout(120);
   const focused=await link.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {visible:r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight,hit:hit===el||el.contains(hit),outline:getComputedStyle(el).outlineWidth};});
   check(focused.visible&&focused.hit,config.name+': keyboard action reachable '+selector);
  }
  const expected=index===0?'/Coaching/':'/campaign/';
  check(await link.getAttribute('href')===expected,config.name+': correct destination');
  await link.click();await page.locator('footer.shared-footer').waitFor({state:'attached'});
  check(new URL(page.url()).pathname.replace(/\/$/,'')===expected.slice(0,-1),config.name+': actual navigation '+expected);
  check(await page.locator('h1').count()===1,config.name+': destination page renders');
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;document.documentElement.style.scrollBehavior='auto';for(const im of document.querySelectorAll('.home-feature img')){im.loading='eager';await im.decode();}});
  if(config.large)await page.evaluate(()=>{document.documentElement.style.fontSize='200%';dispatchEvent(new Event('resize'));});
 }
 results.push(record);await context.close();
}}catch(e){failures.push(e.message);}finally{await browser.close();}
await writeFile(output+'/report.json',JSON.stringify({passed:!failures.length&&!errors.length,base,output,results,failures,errors},null,2));
console.log(JSON.stringify({output,configurations:results.length,samples:results.reduce((n,r)=>n+r.samples.length,0),failures,errors}));
if(failures.length||errors.length)process.exitCode=1;
