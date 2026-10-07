import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const base=(process.argv[2]||'http://localhost:5201').replace(/\/$/,'');
const output='.tmp/golf-lessons-qa/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const failures=[],errors=[],reports=[];
const check=(pass,message)=>{if(!pass)failures.push(message);};
const only=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7);
const configs=[{name:'desktop',viewport:{width:1440,height:900}},{name:'phone',viewport:{width:390,height:844}},{name:'compact',viewport:{width:606,height:604}},{name:'narrow',viewport:{width:320,height:740}},{name:'reduced',viewport:{width:1440,height:900},reducedMotion:'reduce'},{name:'enlarged',viewport:{width:390,height:844},large:true},{name:'no-js',viewport:{width:390,height:844},javaScriptEnabled:false}].filter(config=>!only||config.name===only);
try{for(const config of configs){
 const context=await browser.newContext({viewport:config.viewport,reducedMotion:config.reducedMotion||'no-preference',javaScriptEnabled:config.javaScriptEnabled!==false});
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled for QA'));Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Document.prototype.exitPointerLock=()=>{};});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(config.name+': '+e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(config.name+': '+r.status()+' '+r.url());});
 const response=await page.goto(base+'/',{waitUntil:'networkidle'});
 check(response.status()===200,config.name+': route');
 await page.evaluate(()=>document.fonts.ready);
 if(config.large){await page.evaluate(()=>{document.documentElement.style.fontSize='200%';window.dispatchEvent(new Event('resize'));});await page.waitForTimeout(200);}
 check(await page.locator('h1').count()===1,config.name+': one headline');
 check(await page.locator('.lesson-price-card').count()===3,config.name+': primary lessons');
 check(await page.locator('.more-lessons article').count()===4,config.name+': additional lessons');
 const links=await page.locator('a[href*="wa.me"]').evaluateAll(items=>items.map(el=>el.href));
 check(links.length>=13,config.name+': booking links');
 for(const link of links){const url=new URL(link);check(url.pathname==='/254116416105'&&!!url.searchParams.get('text'),config.name+': valid WhatsApp recipient and message');}
 const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"],a[href^="/#"]')].map(a=>a.hash).filter(id=>id&&!document.querySelector(id)));
 check(!anchors.length,config.name+': anchor destinations '+anchors.join(','));
 const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,offscreen:[...document.querySelectorAll('main *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1||r.left< -1}).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,45)})).slice(0,20),broken:[...document.images].filter(el=>el.complete&&!el.naturalWidth).map(el=>el.src),headline:document.querySelector('h1').getBoundingClientRect().toJSON(),nav:document.querySelector('header').getBoundingClientRect().toJSON(),motion:document.querySelector('.lessons-motion').dataset.motion}));
 check(geometry.overflow<=1,config.name+': horizontal overflow '+geometry.overflow);
 check(geometry.broken.length===0,config.name+': broken images');
 check(geometry.headline.top>=geometry.nav.bottom,config.name+': headline clear of navigation');
 await page.screenshot({path:output+'/'+config.name+'-hero.png'});
 if(config.javaScriptEnabled!==false){
  if(config.viewport.width<850){await page.getByRole('button',{name:'Open menu',exact:true}).click();check(await page.locator('#small-menu').isVisible(),config.name+': menu opens');await page.keyboard.press('Escape');check(await page.locator('#small-menu').count()===0,config.name+': menu closes');}
  await page.getByRole('tab',{name:'I want to improve',exact:true}).click();check(await page.getByRole('heading',{name:'Turn practice into progress.'}).isVisible(),config.name+': improvement goal');
  await page.getByRole('tab',{name:'For a junior golfer',exact:true}).click();check(await page.getByRole('heading',{name:'Make their next swing a good one.'}).isVisible(),config.name+': junior goal');
  await page.getByRole('tab',{name:'I’m new to golf',exact:true}).click();
  const question=page.getByRole('button',{name:'Are course fees included?',exact:true});await question.click();check(await question.getAttribute('aria-expanded')==='true',config.name+': FAQ opens');check(await page.getByText('The 9-hole playing lesson is KSh 12,000 plus course fees.',{exact:false}).isVisible(),config.name+': course fees visible');await question.click();
  if(config.name==='desktop'){
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
   const before=await page.locator('.lessons-print').evaluate(el=>getComputedStyle(el).transform);
   await page.evaluate(()=>scrollTo({top:300,behavior:'instant'}));await page.waitForTimeout(200);
   const after=await page.locator('.lessons-print').evaluate(el=>getComputedStyle(el).transform);check(before!==after,'desktop: photographic parallax');
   const keyboard=await context.newPage();await keyboard.goto(base+'/',{waitUntil:'networkidle'});await keyboard.keyboard.press('Tab');check(await keyboard.locator('.skip').evaluate(el=>el===document.activeElement),'desktop: keyboard skip link');await keyboard.close();
  }
  if(config.reducedMotion||config.large||config.name==='narrow')check(geometry.motion==='off',config.name+': motion fallback');
 }
 for(const section of ['coach','assessment','pricing','corporate','questions','book']){
  await page.locator('#'+section).scrollIntoViewIfNeeded();await page.waitForTimeout(180);
  check(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),config.name+': '+section+' fits');
  await page.screenshot({path:output+'/'+config.name+'-'+section+'.png'});
 }
 reports.push({name:config.name,geometry,bookingLinks:links.length});
 await context.close();
}
 const embeddedPath=new URL(base).pathname.replace(/\/+$/,'');
 const route=await browser.newPage();const routeUrl=embeddedPath?base+'/':base+'/golf-lessons/';const res=await route.goto(routeUrl,{waitUntil:'networkidle'});check(res.status()===200,embeddedPath?'embedded coaching route':'dedicated /golf-lessons route');check(await route.title()===(embeddedPath?'Golf Coaching in Nairobi | Karibu Golf':'Golf Lessons in Nairobi | Karibu Golf'),'page title');await route.close();
}finally{await browser.close();}
await writeFile(output+'/report.json',JSON.stringify({base,output,failures,errors,reports},null,2));
console.log(JSON.stringify({output,failures,errors,configurations:reports.length}));
if(failures.length||errors.length)process.exitCode=1;
