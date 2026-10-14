"use client";
import { type ReactNode, useEffect, useRef } from "react";
import { CampaignChoiceProvider } from "@/components/campaign-choice";

const clamp=(value:number)=>Math.min(1,Math.max(0,value));

export default function CampaignScrollShell({children}:{children:ReactNode}) {
  const rootRef=useRef<HTMLDivElement>(null);
  const engineRef=useRef<{layout:()=>void}|null>(null);
  useEffect(()=>{
    const scrollWindow=window as typeof window & { ScrollCraft?: { mount:(root:HTMLElement)=>{layout:()=>void} } };
    const root=rootRef.current;
    if(!root)return;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    let alive=true;
    // A direct chapter URL can be positioned before the engine expands its
    // pinned acts. Restore the native anchor after the final font/layout pass.
    const initialHash=location.hash;
    const alignInitialHash=()=>{
      if(!alive||!initialHash||location.hash!==initialHash)return;
      let id:string;
      try{id=decodeURIComponent(initialHash.slice(1));}catch{return;}
      const target=document.getElementById(id);
      if(target&&root.contains(target)){
        target.scrollIntoView({block:"start",behavior:"instant"});
        queue();
      }
    };
    const isStatic=()=>motion.matches||innerWidth<350||parseFloat(getComputedStyle(document.documentElement).fontSize)>21;
    const hasRewardSpread=()=>!isStatic()&&innerWidth>=1100&&innerHeight>=560;
    const prepare=()=>{
      // Keep the authored devices stable across resizes. Responsive CSS owns
      // static reading layouts; the shared engine collects its acts only once.
      if(!root.dataset.scrollcraftMounted&&scrollWindow.ScrollCraft){
        engineRef.current=scrollWindow.ScrollCraft.mount(root) as {layout:()=>void};
        root.dataset.scrollcraftMounted="true";
      }
    };
    const update=()=>{
      frame=0;
      const viewport=innerHeight;
      const staticPage=isStatic();
      root.dataset.campaignMotion=staticPage?"off":"on";
      root.dataset.rewardMotion=hasRewardSpread()?"on":"off";
      const hero=root.querySelector<HTMLElement>("[data-campaign-hero]");
      if(hero){
        const box=hero.getBoundingClientRect();
        const progress=staticPage?0:clamp(-box.top/Math.max(hero.offsetHeight-viewport,1));
        root.style.setProperty("--hero-travel",progress.toFixed(4));
        const stage=hero.querySelector<HTMLElement>("[data-sc-stage]");
        if(stage){stage.dataset.scVerifyState=`far:${Math.round(progress*60)};print:${Math.round(progress*(innerWidth<=600?80:160))};seal:${Math.round(progress*(innerWidth<=600?120:180))};scale:${Math.round((1+progress*.1)*100)}`;stage.dataset.scVerifyHold=staticPage?"true":"false";}
      }
      const mission=root.querySelector<HTMLElement>("[data-campaign-mission]");
      if(mission){
        const progress=staticPage?1:clamp(-mission.getBoundingClientRect().top/Math.max(mission.offsetHeight-viewport,1));
        const compact=innerHeight<680;
        const fit=staticPage?1:clamp((progress-.08)/.24);
        const gear=clamp((progress-(compact ? .4 : .18))/(compact ? .22 : .32)),community=clamp((progress-(compact ? .7 : .55))/(compact ? .22 : .32));
        root.style.setProperty("--mission-progress",progress.toFixed(4));
        root.style.setProperty("--mission-fit",fit.toFixed(4));
        root.style.setProperty("--mission-gear",gear.toFixed(4));
        root.style.setProperty("--mission-community",community.toFixed(4));
        const stage=mission.querySelector<HTMLElement>("[data-sc-stage]");
        if(stage){stage.dataset.scVerifyState=`fit-wipe:${Math.round(fit*100)};gear-wipe:${Math.round(gear*100)};community-wipe:${Math.round(community*100)};rule:${Math.round(progress*100)}`;stage.dataset.scVerifyHold=staticPage?"true":"false";}
      }
      const founder=root.querySelector<HTMLElement>("[data-campaign-founder]");
      if(founder){
        const progress=staticPage?0:clamp(-founder.getBoundingClientRect().top/Math.max(founder.offsetHeight-viewport,1));
        root.style.setProperty("--founder-travel",progress.toFixed(4));
        const stage=founder.querySelector<HTMLElement>("[data-sc-stage]");
        if(stage){stage.dataset.scVerifyState=`pan:${Math.round(progress*innerWidth)}`;stage.dataset.scVerifyHold=staticPage?"true":"false";}
      }
      const fitting=root.querySelector<HTMLElement>("[data-campaign-fitting]");
      if(fitting){
        const box=fitting.getBoundingClientRect();
        const progress=staticPage?1:clamp(-box.top/Math.max(fitting.offsetHeight-viewport,1));
        const alignment=staticPage?1:clamp(progress/.76);
        root.style.setProperty("--fit-alignment",alignment.toFixed(4));
        const stage=fitting.querySelector<HTMLElement>("[data-sc-stage]");
        if(stage){stage.dataset.scVerifyState=`rotation:${Math.round((1-alignment)*-320)};shift:${Math.round((1-alignment)*(innerWidth<=600?-50:-170))};scale:${Math.round((.76+alignment*.24)*100)};loft:${Math.round(clamp(alignment*2.4)*100)};grip:${Math.round(clamp((alignment-.24)*2.1)*100)};weight:${Math.round(clamp((alignment-.46)*2.1)*100)}`;stage.dataset.scVerifyHold=alignment>=.999?"true":"false";}
      }
      root.querySelectorAll<HTMLElement>("[data-campaign-promise]").forEach(wrapper=>{
        const arrival=staticPage?1:clamp((viewport*.9-wrapper.getBoundingClientRect().top)/Math.max(viewport*.55,1));
        wrapper.style.setProperty("--promise-arrival",arrival.toFixed(4));
      });
      const rewards=root.querySelector<HTMLElement>("[data-campaign-rewards]");
      if(rewards){
        const enabled=hasRewardSpread();
        const timeline=rewards.querySelector<HTMLElement>("[data-campaign-reward-timeline]");
        const progress=enabled&&timeline?clamp(-timeline.getBoundingClientRect().top/Math.max(timeline.offsetHeight-viewport,1)):1;
        const grid=rewards.querySelector<HTMLElement>(".campaign-reward-grid");
        const cards=rewards.querySelectorAll<HTMLElement>(".campaign-reward");
        const columns=grid?Math.max(1,getComputedStyle(grid).gridTemplateColumns.split(" ").length):1;
        const states:string[]=[];
        cards.forEach((card,index)=>{
          if(enabled&&grid){
            // Each tier owns a separate scroll interval. The stage holds still
            // until every card has arrived and the comparison has been read.
            const arrival=clamp((progress-index*.2)/.18);
            card.style.transform="";
            card.style.pointerEvents=arrival>=.999?"auto":"none";
            card.style.setProperty("--reward-arrival",arrival.toFixed(4));
            states.push(`${Math.round(arrival*100)}`);
          }else{
            const layoutTop=grid?grid.getBoundingClientRect().top+card.offsetTop:card.getBoundingClientRect().top;
            const columnDelay=(index%columns)*(columns>=4?.08:.16);
            const arrival=staticPage?1:clamp((viewport*.94-layoutTop)/Math.max(viewport*.55,1)-columnDelay);
            card.style.transform="";
            card.style.pointerEvents="";
            card.style.setProperty("--reward-arrival",arrival.toFixed(4));
            states.push(`${Math.round(arrival*100)}`);
          }
        });
        const stage=rewards.querySelector<HTMLElement>("[data-sc-stage]");
        if(stage){stage.dataset.scVerifyState=`arrivals:${states.join("|")}`;stage.dataset.scVerifyHold=states.every(state=>state==="100")?"true":"false";}
      }
    };
    const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const resize=()=>{update();engineRef.current?.layout();queue();};
    const start=()=>{
      if(!alive)return;
      root.dataset.campaignMotion=isStatic()?"off":"on";
      root.dataset.rewardMotion=hasRewardSpread()?"on":"off";
      prepare();
      update();
      void document.fonts.ready.then(()=>{
        if(!alive)return;
        engineRef.current?.layout();
        requestAnimationFrame(alignInitialHash);
      });
    };
    const existing=document.querySelector<HTMLScriptElement>("script[data-campaign-engine]");
    if(scrollWindow.ScrollCraft)start();
    else if(existing)existing.addEventListener("load",start,{once:true});
    else{const script=document.createElement("script");script.src="/scrollcraft/scrollcraft.js";script.defer=true;script.dataset.campaignEngine="true";script.addEventListener("load",start,{once:true});document.body.appendChild(script);}
    window.addEventListener("scroll",queue,{passive:true});
    window.addEventListener("resize",resize);
    window.addEventListener("load",alignInitialHash,{once:true});
    const changeMotion=()=>{prepare();resize();};
    motion.addEventListener("change",changeMotion);
    return()=>{alive=false;cancelAnimationFrame(frame);window.removeEventListener("scroll",queue);window.removeEventListener("resize",resize);window.removeEventListener("load",alignInitialHash);motion.removeEventListener("change",changeMotion);existing?.removeEventListener("load",start);};
  },[]);
  return <CampaignChoiceProvider><div className="campaign-scroll" ref={rootRef}>{children}</div></CampaignChoiceProvider>;
}
