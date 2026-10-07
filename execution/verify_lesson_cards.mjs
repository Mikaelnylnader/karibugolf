import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const base=(process.argv[2]||'http://localhost:5201').replace(/\/$/,'');
const output='.tmp/golf-lessons-qa/cards-'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const failures=[],errors=[],reports=[];
const check=(pass,message)=>{if(!pass)failures.push(message);};
const configs=[{name:'desktop',viewport:{width:1440,height:900},pin:true},{name:'short-desktop',viewport:{width:1280,height:604},pin:true},{name:'fit-fallback',viewport:{width:1100,height:560}},{name:'short-window',viewport:{width:1280,height:500}},{name:'phone',viewport:{width:390,height:844}},{name:'compact',viewport:{width:606,height:604}},{name:'short-phone',viewport:{width:390,height:604}},{name:'narrow',viewport:{width:320,height:740},static:true},{name:'reduced',viewport:{width:1440,height:900},reducedMotion:'reduce',static:true},{name:'enlarged',viewport:{width:1440,height:900},large:true,static:true},{name:'no-js',viewport:{width:390,height:844},javaScriptEnabled:false,static:true}];
const state=page=>page.locator('[data-pricing-card]').evaluateAll(cards=>cards.map(card=>{const css=getComputedStyle(card);return {arrival:parseFloat(css.getPropertyValue('--card-arrival')),transform:css.transform,opacity:parseFloat(css.opacity)};}));
async function scroll(page,y,animated){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);if(animated)await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.waitForTimeout(80);}
try{for(const config of configs){
 const context=await browser.newContext({viewport:config.viewport,reducedMotion:config.reducedMotion||'no-preference',javaScriptEnabled:config.javaScriptEnabled!==false});
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled for QA'));Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Document.prototype.exitPointerLock=()=>{};});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(config.name+': '+e.message));page.on('response',r=>{if(r.status()>=400)errors.push(config.name+': '+r.status()+' '+r.url());});
 await page.goto(base+'/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const animated=config.javaScriptEnabled!==false;
 if(animated)await page.waitForSelector('html.sc-ready');
 if(config.large){await page.evaluate(()=>{document.documentElement.style.fontSize='200%';dispatchEvent(new Event('resize'));});await page.waitForTimeout(100);}
 const layout=await page.locator('[data-pricing-cards]').evaluate(grid=>({top:grid.getBoundingClientRect().top+scrollY,offsets:[...grid.children].map(card=>card.offsetTop),height:grid.offsetHeight}));
 const sequences=[];
 const timeline=await page.locator('[data-pricing-timeline]').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight,pinned:getComputedStyle(el.firstElementChild).position==='sticky'}));
 check(timeline.pinned===!!config.pin,config.name+': correct pinned or reading layout');
 if(config.pin){
  const tops=[];
  for(const [index,progress] of [.23,.48,.73,.91].entries()){
   await scroll(page,timeline.top+(timeline.height-config.viewport.height)*progress,animated);
   const snapshot=await state(page);sequences.push(snapshot);
   tops.push(await page.locator('.lesson-pricing-stage').evaluate(el=>el.getBoundingClientRect().top));
   const arrived=Math.min(index+1,3);
   check(snapshot.slice(0,arrived).every(card=>card.arrival>=.999&&card.opacity===1),config.name+': previous arrivals remain visible at step '+index);
   check(snapshot.slice(arrived).every(card=>card.arrival<=.001&&card.opacity<=.001),config.name+': next cards wait their turn at step '+index);
   check(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),config.name+': no horizontal overflow at step '+index);
   await page.screenshot({path:output+'/'+config.name+'-step-'+index+'.png'});
  }
  check(tops.every(top=>Math.abs(top-tops[0])<2),config.name+': stage remains pinned through arrivals and hold');
  check(sequences[3].every((card,index)=>card.transform===sequences[2][index].transform),config.name+': full comparison holds');
  const bounds=await page.locator('[data-pricing-card]').evaluateAll(cards=>cards.map(el=>el.getBoundingClientRect().toJSON()));
  const navBottom=await page.locator('header').evaluate(el=>el.getBoundingClientRect().bottom);
  check(bounds.every(r=>r.left>=0&&r.right<=config.viewport.width&&r.top>navBottom&&r.bottom<config.viewport.height),config.name+': complete cards fit below navigation');
  check(bounds.slice(1).every((r,index)=>r.left>=bounds[index].right),config.name+': settled cards never overlap');
  await scroll(page,timeline.top+(timeline.height-config.viewport.height)*1.1,animated);
  check(await page.locator('.lesson-pricing-stage').evaluate(el=>el.getBoundingClientRect().top)<-5,config.name+': stage releases to more lessons');
  await scroll(page,timeline.top,animated);check((await state(page)).every(card=>card.arrival<.01),config.name+': reverse scrolling restores entrances');
  for(let index=0;index<3;index++){
   await page.locator('[data-pricing-card] .lesson-button').nth(index).focus();
   await page.waitForFunction(index=>{const el=document.querySelectorAll('[data-pricing-card] .lesson-button')[index];const r=el.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight&&(hit===el||el.contains(hit));},index,{timeout:2500});
  }
  check((await state(page)).every(card=>card.arrival===1&&card.opacity===1),config.name+': keyboard resolves entire comparison');
  if(config.name==='desktop'){
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(160);
   check(await page.locator('.lesson-pricing-stage').evaluate(el=>getComputedStyle(el).position)!=='sticky','resize: comparison returns to mobile flow');
   await page.setViewportSize(config.viewport);await page.waitForTimeout(160);
   check(await page.locator('.lesson-pricing-stage').evaluate(el=>getComputedStyle(el).position)==='sticky','resize: desktop pin resumes');
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(160);
   check(await page.locator('.lesson-pricing-stage').evaluate(el=>getComputedStyle(el).position)!=='sticky','motion preference: no long spacer');
  }
 }else{
 for(let card=0;card<3;card++){
  const samples=[];
  for(let step=0;step<6;step++){
   await scroll(page,layout.top+layout.offsets[card]-config.viewport.height*.9+config.viewport.height*.71*step/5,animated);
   const snapshot=await state(page);samples.push(snapshot);
   check(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),config.name+': no horizontal overflow at card '+card+' step '+step);
   if(!config.static){check(step===0||snapshot[card].arrival>=samples[step-1][card].arrival-0.001,config.name+': monotonic card '+card);}
   else check(snapshot.every(item=>item.opacity===1&&(item.transform==='none'||item.transform==='matrix(1, 0, 0, 1, 0, 0)')),config.name+': static fully readable');
   if(card===0&&(step===0||step===2||step===5))await page.screenshot({path:output+'/'+config.name+'-'+step+'.png'});
  }
  if(!config.static){check(samples[0][card].transform!==samples[5][card].transform,config.name+': card '+card+' visibly moves');check(samples[5][card].arrival>=.999,config.name+': card '+card+' completely settles');check(samples[5][card].opacity===1,config.name+': card '+card+' full opacity');}
  sequences.push(samples);
 }
 }
 const hrefs=await page.locator('[data-pricing-card] .lesson-button').evaluateAll(links=>links.map(link=>link.href));check(hrefs.every(href=>new URL(href).pathname==='/254116416105'&&new URL(href).searchParams.get('text')),'booking destinations retained');
 reports.push({name:config.name,layout,timeline,sequences});await context.close();
}}catch(error){errors.push(String(error));}finally{await writeFile(output+'/report.json',JSON.stringify({base,output,failures,errors,reports},null,2));await browser.close();}
console.log(JSON.stringify({output,failures,errors,configurations:reports.length}));if(failures.length||errors.length)process.exitCode=1;
