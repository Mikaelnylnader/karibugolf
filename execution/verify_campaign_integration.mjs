import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
import catalog from '../lib/catalog.generated.json' with {type:'json'};

const origin=(process.argv[2]||'http://127.0.0.1:4517').replace(/\/$/,'');
const output='.tmp/campaign-qa/integration-'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],results=[];
try {
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled for QA'));Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Document.prototype.exitPointerLock=()=>{};});
 // Inventory replay is isolated to QA; no live Sheet reads or writes.
 await context.route('**/api/storefront-products*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({products:catalog.products})}));
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 assert.equal((await page.goto(origin+'/campaign/#rewards',{waitUntil:'networkidle'})).status(),200);
 await page.waitForSelector('html.sc-ready');
 await page.waitForTimeout(500);
 const anchor=await page.locator('#rewards').evaluate(el=>el.getBoundingClientRect().top);
 assert.ok(anchor>=65&&anchor<=200,'Direct rewards URL lands below the main header: '+anchor);
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://karibugolf.com/campaign/');
 assert.match(await page.title(),/Campaign/);
 assert.ok(!(await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'));
 const sitemap=await context.request.get(origin+'/sitemap.xml');
 assert.ok((await sitemap.text()).includes('https://karibugolf.com/campaign/'));
 assert.equal(await page.locator('.campaign form').count(),0,'No payment or reservation forms');
 const tier=page.locator('.campaign-reward-button').nth(2);
 await tier.focus();await page.waitForTimeout(160);await tier.click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 const focus=await dialog.getByRole('link').evaluate(el=>{el.focus();return {color:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth};});
 assert.equal(focus.color,'rgb(69, 99, 48)');
 await page.screenshot({path:output+'/reward-dialog.png'});
 await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
 const enquiry=await page.locator('.campaign-invitation-actions a').nth(1).getAttribute('href');
 assert.ok(decodeURIComponent(enquiry).includes('VIP Clinic & Fitting'));
 for(const width of [1440,1280,1100,1000,900,801,800,606,390,320]) {
  await page.setViewportSize({width,height:900});await page.waitForTimeout(130);
  const geometry=await page.locator('header.persistent-nav').evaluate(el=>{const r=el.getBoundingClientRect();const visible=[...el.children].filter(c=>getComputedStyle(c).display!=='none').map(c=>c.getBoundingClientRect().toJSON());return {overflow:document.documentElement.scrollWidth-innerWidth,visible,nav:r.toJSON()};});
  assert.ok(geometry.overflow<=1,'No overflow at '+width);
  assert.ok(geometry.visible.every(r=>r.left>=0&&r.right<=width),'Header fits at '+width);
  assert.ok(geometry.visible.slice(1).every((r,i)=>r.left>=geometry.visible[i].right),'Header controls never overlap at '+width);
  results.push({width,geometry});
 }
 for(const route of ['/','/shop/','/shop/product/gk-ir-ttt/','/shop/shoes/kids_shoes/','/Coaching/']) {
  await page.setViewportSize({width:1440,height:900});
  assert.equal((await page.goto(origin+route,{waitUntil:'networkidle'})).status(),200);
  assert.equal(await page.locator('header a[href="/campaign"]').count(),1);
  assert.equal(await page.locator('footer a[href="/campaign/"]').count(),1);
  assert.equal(await page.locator('.campaign').count(),0,'Campaign styles have no root on '+route);
  // Read-only production baseline: shop routes use the existing engine ground;
  // the main site and Coaching use the brand's forest ground.
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),route.startsWith('/shop/')?'rgb(8, 9, 11)':'rgb(12, 33, 25)','Existing body ground on '+route);
  await page.screenshot({path:output+'/regression-'+(route==='/'?'home':route.replaceAll('/','_'))+'.png'});
 }
 assert.deepEqual(errors,[]);
 await context.close();
 await writeFile(output+'/report.json',JSON.stringify({passed:true,origin,results,errors},null,2));
 console.log(JSON.stringify({passed:true,output,viewports:results.length,regressionPages:5}));
} catch(e) {
 await writeFile(output+'/report.json',JSON.stringify({passed:false,origin,error:e.message,results,errors},null,2));
 console.error(JSON.stringify({passed:false,output,error:e.message,errors}));process.exitCode=1;
} finally {await browser.close();}
