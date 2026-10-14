import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

// Check the real production route, rendered motion, and proposed-reward flow.
const base=(process.argv[2]||'http://127.0.0.1:4517/campaign').replace(/\/$/,'');
const output=`.tmp/campaign-qa/functional-${new Date().toISOString().replace(/[:.]/g,'-')}`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const failures=[],errors=[],expectedScriptBlocks=[],reports=[];
let activePage,activeConfiguration;
const check=(value,message)=>{if(!value)failures.push(message);};
const only=process.argv.find(value=>value.startsWith('--only='))?.slice(7);
const configurations=[
 {name:'desktop',viewport:{width:1440,height:900}},
 {name:'phone',viewport:{width:390,height:844}},
 {name:'compact',viewport:{width:360,height:640}},
 {name:'in-app',viewport:{width:606,height:604}},
 {name:'laptop',viewport:{width:1280,height:604}},
 {name:'desktop-min',viewport:{width:1100,height:560}},
 {name:'short-phone',viewport:{width:390,height:604}},
 {name:'narrow',viewport:{width:320,height:740}},
 {name:'reduced',viewport:{width:1440,height:900},reducedMotion:'reduce'},
 {name:'enlarged',viewport:{width:390,height:844},large:true},
 {name:'no-js',viewport:{width:390,height:844},javaScriptEnabled:false},
].filter(config=>!only||config.name===only);
async function scrollChapter(page,selector,progress=0,animated=true){
 await page.evaluate(({selector,progress})=>{const el=document.querySelector(selector);const top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top+Math.max(el.offsetHeight-innerHeight,0)*progress,behavior:'instant'});},{selector,progress});
 if(animated)await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.waitForTimeout(220);
}
async function motionState(page){return page.evaluate(()=>({
  photo:getComputedStyle(document.querySelector('.campaign-photographic-print')).transform,
  seal:getComputedStyle(document.querySelector('.campaign-near-seal')).transform,
  far:getComputedStyle(document.querySelector('.campaign-fairway-plane')).transform,
  heroText:Object.fromEntries([
   ['status','.campaign-hero-status-inner'],
   ['top','.campaign-hero-line-top'],
   ['accent','.campaign-hero-line-accent'],
   ['description','.campaign-hero-description-inner'],
   ['actions','.campaign-actions'],
  ].map(([name,selector])=>{const style=getComputedStyle(document.querySelector(selector));return [name,{transform:style.transform,opacity:Number(style.opacity)}];})),
  fit:getComputedStyle(document.querySelector('.fitting-image')).transform,
  alignment:document.querySelector('.campaign-scroll').style.getPropertyValue('--fit-alignment'),
  lineTransforms:[...document.querySelectorAll('.fitting-label i')].map(el=>getComputedStyle(el).transform),
  rewards:[...document.querySelectorAll('.campaign-reward')].map(el=>{const style=getComputedStyle(el);return {arrival:style.getPropertyValue('--reward-arrival'),transform:style.transform,opacity:Number(style.opacity),clip:style.clipPath};}),
  mode:document.querySelector('.campaign-scroll').dataset.campaignMotion,
}));}
try{
 for(const config of configurations){
  activeConfiguration=config.name;
  console.log('Checking '+config.name);
  const context=await browser.newContext({viewport:config.viewport,reducedMotion:config.reducedMotion||'no-preference',javaScriptEnabled:config.javaScriptEnabled!==false});
  await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Native pointer lock disabled for verification'));Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};Document.prototype.exitPointerLock=()=>{};});
  const page=await context.newPage();
  activePage=page;
  page.on('pageerror',e=>errors.push(config.name+': '+e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(config.name+': '+r.status()+' '+r.url());});
  page.on('requestfailed',r=>{
   const reason=r.failure()?.errorText;
   if(config.javaScriptEnabled===false&&reason==='csp'&&r.resourceType()==='script')expectedScriptBlocks.push(r.url());
   else errors.push(config.name+': '+reason+' '+r.url());
  });
  const response=await page.goto(base+'/',{waitUntil:'networkidle'});
  check(response.status()===200,config.name+': campaign route');
  if(config.javaScriptEnabled!==false)await page.waitForSelector('html.sc-ready');
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(large=>{document.documentElement.style.scrollBehavior='auto';if(large)document.documentElement.style.fontSize='200%';},!!config.large);
  if(config.large){await page.evaluate(()=>dispatchEvent(new Event('resize')));await page.waitForTimeout(300);}
  check(await page.locator('h1').count()===1,config.name+': one headline');
  check(await page.locator('.campaign-reward').count()===4,config.name+': all four rewards');
  const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,heroTop:document.querySelector('.campaign-status').getBoundingClientRect().top,navBottom:document.querySelector('.persistent-nav').getBoundingClientRect().bottom,broken:[...document.images].filter(el=>el.complete&&!el.naturalWidth).map(el=>el.src)}));
  check(geometry.overflow<=1,config.name+': horizontal overflow');
  check(geometry.heroTop>=geometry.navBottom,config.name+': hero clear of navigation');
  check(geometry.broken.length===0,config.name+': image failures');
  await page.screenshot({path:output+'/'+config.name+'-opening.png'});
  const openingState=await motionState(page);
  check(Object.values(openingState.heroText).every(state=>state.opacity>=.95),config.name+': complete hero copy visible on arrival');
  let motion;
  if(['desktop','phone','compact','in-app','laptop','desktop-min','short-phone'].includes(config.name)){
   check(openingState.mode==='on',config.name+': cinematic motion stays active');
   const heroStart=openingState;
   await scrollChapter(page,'[data-campaign-hero]',.5);
   const heroMiddle=await motionState(page);
   await page.screenshot({path:output+'/'+config.name+'-hero-handoff.png'});
   await scrollChapter(page,'[data-campaign-hero]',.9);
   const heroEnd=await motionState(page);
   check(heroStart.photo!==heroEnd.photo&&heroStart.seal!==heroEnd.seal&&heroStart.far!==heroEnd.far,config.name+': independent moving hero planes');
   check(heroStart.heroText.top.transform!==heroMiddle.heroText.top.transform&&heroStart.heroText.accent.transform!==heroMiddle.heroText.accent.transform,config.name+': headline lines travel independently');
   check(heroMiddle.heroText.top.transform!==heroMiddle.heroText.accent.transform,config.name+': headline uses opposing trajectories');
   check(heroEnd.heroText.top.opacity<heroStart.heroText.top.opacity&&heroEnd.heroText.accent.opacity>heroEnd.heroText.top.opacity,config.name+': EVERYONE remains the final emphasis');
   check(heroEnd.heroText.description.opacity<.2&&heroEnd.heroText.actions.opacity<.2,config.name+': supporting hero copy clears before the next chapter');
   await scrollChapter(page,'#mission',0);
   const missionStart=await page.locator('.mission-scene-gear').evaluate(el=>getComputedStyle(el).clipPath);
   await scrollChapter(page,'#mission',config.viewport.height<680?.65:.55);
   const missionMiddle=await page.locator('.mission-scene-gear').evaluate(el=>getComputedStyle(el).clipPath);
   await scrollChapter(page,'#mission',.98);
   const missionEnd=await page.locator('.mission-scene-community').evaluate(el=>getComputedStyle(el).clipPath);
   check(missionStart!==missionMiddle&&missionEnd==='inset(0% 0px 0px)',config.name+': mission sheets reveal in sequence');
   await scrollChapter(page,'#founder',0);
   const founderStart=await page.locator('.founder-pan-track').evaluate(el=>getComputedStyle(el).transform);
   await scrollChapter(page,'#founder',1);
   const founderEnd=await page.locator('.founder-pan-track').evaluate(el=>({transform:getComputedStyle(el).transform,overflow:el.scrollWidth-innerWidth}));
   check(founderStart!==founderEnd.transform&&founderEnd.overflow>0,config.name+': founder story travels horizontally');
   await scrollChapter(page,'#fitting',0);
   const fitStart=await motionState(page);
   await scrollChapter(page,'#fitting',.5);
   const fitMid=await motionState(page);
   await scrollChapter(page,'#fitting',.82);
   const fitEnd=await motionState(page);
   check(fitStart.fit!==fitMid.fit&&fitMid.fit!==fitEnd.fit,config.name+': fitting advances');
   check(Number(fitEnd.alignment)===1,config.name+': fitting resolves');
   check(new Set(fitStart.lineTransforms).size>=1&&fitStart.lineTransforms.some((t,i)=>t!==fitEnd.lineTransforms[i]),config.name+': fitting leaders advance');
   const fitRects=await page.evaluate(()=>{const els=[...document.querySelectorAll('.fitting-label'),document.querySelector('.fitting-explanation')];return els.map(el=>({text:el.textContent,top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}));});
   check(fitRects.every(r=>r.top>=70&&r.bottom<=config.viewport.height),config.name+': fitting copy visible');
   await page.screenshot({path:output+'/'+config.name+'-resolved-fitting.png'});
   motion={heroStart,heroMiddle,heroEnd,fitStart,fitMid,fitEnd};
   if(['desktop','laptop','desktop-min'].includes(config.name)){
    const selector='[data-campaign-reward-timeline]';
    const sequence=[];
    const stageTops=[];
    for(const [index,progress] of [.19,.39,.59,.79].entries()){
     await scrollChapter(page,selector,progress);
     const state=(await motionState(page)).rewards;
     sequence.push(state);
     stageTops.push(await page.locator('.campaign-rewards-stage').evaluate(el=>el.getBoundingClientRect().top));
     check(state.slice(0,index+1).every(card=>Number(card.arrival)>=.99&&card.opacity>=.99),config.name+': arrived tiers remain visible at step '+index);
     check(state.slice(index+1).every(card=>Number(card.arrival)<=.01&&card.opacity<=.01),config.name+': next tiers wait their turn at step '+index);
     await page.screenshot({path:output+'/'+config.name+'-reward-step-'+(index+1)+'.png'});
    }
    await scrollChapter(page,selector,.91);
    const hold=(await motionState(page)).rewards;
    const stageHold=await page.locator('.campaign-rewards-stage').evaluate(el=>el.getBoundingClientRect().top);
    check(stageTops.every(top=>Math.abs(top-stageHold)<2),config.name+': reward stage stays pinned through all four entrances and final hold');
    check(hold.every((card,index)=>card.transform===sequence[3][index].transform&&card.opacity===1),config.name+': full comparison holds after the arrivals');
    const tierBounds=await page.locator('.campaign-reward').evaluateAll(els=>els.map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom})));
    check(tierBounds.every(r=>r.left>=0&&r.right<=config.viewport.width&&r.top>=70&&r.bottom<config.viewport.height),config.name+': complete reward comparison is inside the viewport');
    check(tierBounds.slice(1).every((r,index)=>r.left>=tierBounds[index].right),config.name+': settled reward cards never overlap');
    await page.screenshot({path:output+'/'+config.name+'-reward-hold.png'});
    motion.rewardSequence=sequence;motion.rewardHold=hold;motion.rewardBounds=tierBounds;
   }else{
    await page.evaluate(()=>{const grid=document.querySelector('.campaign-reward-grid');const card=grid.querySelector('.campaign-reward');const top=grid.getBoundingClientRect().top+scrollY+card.offsetTop;scrollTo({top:top-innerHeight*1.15,behavior:'instant'});});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.waitForTimeout(220);
    const rewardStart=await motionState(page);
    await page.evaluate(()=>{const grid=document.querySelector('.campaign-reward-grid');const card=grid.querySelector('.campaign-reward');const top=grid.getBoundingClientRect().top+scrollY+card.offsetTop;scrollTo({top:top-innerHeight*.75,behavior:'instant'});});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.waitForTimeout(220);
    const rewardMiddle=await motionState(page);
    await page.screenshot({path:output+'/'+config.name+'-reward-arrival.png'});
    check(rewardStart.rewards[0].transform!==rewardMiddle.rewards[0].transform&&rewardMiddle.rewards[0].opacity>rewardStart.rewards[0].opacity,config.name+': reward cards rise into the comparison');
    check(rewardMiddle.rewards[0].transform!==rewardMiddle.rewards[1].transform,config.name+': reward cards use alternating trajectories');
    const rewardSettled=[];
    for(let i=0;i<4;i++){
     await page.evaluate(index=>{const grid=document.querySelector('.campaign-reward-grid');const card=grid.querySelectorAll('.campaign-reward')[index];const top=grid.getBoundingClientRect().top+scrollY+card.offsetTop;scrollTo({top:top-innerHeight*.24,behavior:'instant'});},i);
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     await page.waitForTimeout(120);
     rewardSettled.push((await motionState(page)).rewards[i]);
    }
    check(rewardSettled.every(state=>Number(state.arrival)>=.99&&state.opacity>=.99),config.name+': all four reward cards settle fully readable');
    motion.rewardStart=rewardStart.rewards;motion.rewardMiddle=rewardMiddle.rewards;motion.rewardSettled=rewardSettled;
   }
  }
  if(['narrow','reduced','enlarged','no-js'].includes(config.name)){
   await scrollChapter(page,'#rewards',0,config.javaScriptEnabled!==false);
   const staticRewards=(await motionState(page)).rewards;
   check(staticRewards.every(state=>state.opacity===1&&state.transform==='none'&&state.clip==='none'),config.name+': reward comparison stays complete without motion');
  }
  if(config.name==='in-app'){
   for(const viewport of [{width:606,height:844},{width:320,height:740},{width:1440,height:900},{width:606,height:604}]){
    await page.setViewportSize(viewport);
    await page.waitForTimeout(180);
    const mode=(await motionState(page)).mode;
    check(mode===(viewport.width<350?'off':'on'),'in-app: resize selects readable motion layout '+viewport.width+'x'+viewport.height);
    if(mode==='on'){
     await scrollChapter(page,'#founder',.98);
     const travel=await page.locator('.founder-pan-track').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41);
     check(Math.abs(travel+viewport.width*.98)<3,'in-app: founder travel survives resize '+viewport.width+'x'+viewport.height);
    }
   }
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(150);
   check((await motionState(page)).mode==='off','in-app: reduced motion switches to complete static reading');
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.waitForTimeout(150);
   check((await motionState(page)).mode==='on','in-app: restoring motion reactivates chapters');
  }
  if(config.javaScriptEnabled!==false){
   await page.getByRole('link',{name:'Explore rewards',exact:true}).first().click();
   check(page.url().endsWith('#rewards'),config.name+': backing jumps to rewards');
   for(let i=0;i<4;i++){
    const trigger=page.locator('.campaign-reward-button').nth(i);
    const expected=await page.locator('.campaign-reward h3').nth(i).innerText();
    // A keyboard visitor can unfold the reward deck directly by focusing a tier.
    await trigger.focus();
    await page.waitForTimeout(150);
    await trigger.click();
    const dialog=page.getByRole('dialog');
    await dialog.waitFor();
    check((await dialog.innerText()).includes('contributions and reservations are not open yet'),config.name+': proposed reward status '+i);
    const enquiry=await dialog.getByRole('link').getAttribute('href');
    check(decodeURIComponent(enquiry).includes(expected),config.name+': reward enquiry '+i);
    await page.keyboard.press('Tab');
    check(await dialog.evaluate(el=>el.contains(document.activeElement)),config.name+': dialog keyboard focus '+i);
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    check(await trigger.evaluate(el=>document.activeElement===el),config.name+': focus restoration '+i);
    check((await page.locator('.campaign-invitation-choice').innerText()).includes(expected),config.name+': reward carried into invitation '+i);
   }
   const faq=page.getByRole('button',{name:'Can I contribute right now?'});
   await faq.click();
   check(await faq.getAttribute('aria-expanded')==='true',config.name+': FAQ opens');
   check(await page.getByText('Payments and reward reservations are not open yet.',{exact:false}).isVisible(),config.name+': payment clarity');
   if(config.viewport.width<800){
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await page.locator('#small-menu').getByRole('link',{name:'Campaign',exact:true}).click();
    // This is a document navigation, not the standalone preview's hash link.
    // Wait for the streamed document and engine before inspecting its chapters.
    await page.locator('footer.shared-footer').waitFor({state:'attached'});
    await page.waitForSelector('html.sc-ready');
    check(new URL(page.url()).pathname.replace(/\/$/,'')==='/campaign',config.name+': mobile campaign navigation');
    check(await page.locator('#small-menu').count()===0,config.name+': mobile menu closes');
   }
   await scrollChapter(page,'.invitation-chapter');
   await page.screenshot({path:output+'/'+config.name+'-invitation.png'});
  }else{
   const staticSections=await page.evaluate(()=>[...document.querySelectorAll('.campaign-chapter,.campaign-fitting')].map(el=>({height:el.offsetHeight,text:el.textContent.length})));
   check(staticSections.every(el=>el.height>100&&el.text>30),'no-js: all substantive chapters read naturally');
   await scrollChapter(page,'#fitting',0,false);
   const fallback=await page.evaluate(()=>({image:getComputedStyle(document.querySelector('.fitting-image')).position,labels:[...document.querySelectorAll('.fitting-label')].every(el=>getComputedStyle(el).position==='static'),founder:getComputedStyle(document.querySelector('.founder-pan-track')).transform,mission:[...document.querySelectorAll('.mission-scene')].every(el=>getComputedStyle(el).clipPath==='none')}));
   check(fallback.image==='static'&&fallback.labels&&fallback.founder==='none'&&fallback.mission,'no-js: complete static fitting, mission and founder chapters');
   await page.screenshot({path:output+'/no-js-fitting.png'});
  }
  const endOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  check(endOverflow<=1,config.name+': no overflow after interaction');
  reports.push({name:config.name,viewport:config.viewport,geometry,motion,dialogs:config.javaScriptEnabled!==false?4:0});
  await context.close();
 }
 check(errors.length===0,'No page or request errors');
 const report={passed:failures.length===0,base,output,failures,errors,expectedScriptBlocks,reports};
 await writeFile(output+'/report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({passed:report.passed,output,failures,errors,configurations:reports.map(r=>r.name)}));
 if(failures.length)process.exitCode=1;
}catch(error){
 failures.push(activeConfiguration+': '+error.message);
 await activePage?.screenshot({path:output+'/interrupted-'+activeConfiguration+'.png'}).catch(()=>{});
 await writeFile(output+'/report.json',JSON.stringify({passed:false,base,output,failures,errors,expectedScriptBlocks,reports},null,2));
 console.log(JSON.stringify({passed:false,output,failures,errors}));
 process.exitCode=1;
}finally{await browser.close();}
