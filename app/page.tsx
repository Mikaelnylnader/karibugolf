"use client";
import Image from "next/image";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, MessageCircle } from "lucide-react";

const chat = "https://wa.me/254116416105";
const topics = ["Equipment", "Apparel", "Essentials"];
const panels = [
 { label:"Equipment", heading:<>Find your<br/><em>feel.</em></>, description:"The right clubs. A setup that feels like yours. We help you explore golf equipment from the brands you know and trust.", detail:"Clubs · Irons · Wedges · Putters", image:"fairway-aerial.jpg", alt:"An aerial view across a sunlit fairway and sand bunkers", tone:"equipment" },
 { label:"Apparel", heading:<>Wear your<br/><em>game.</em></>, description:"For the first tee, the final putt and the rest of your day. Golf clothing and footwear with comfort and character.", detail:"Clothing · Footwear · Hats", image:"golf-moment.jpg", alt:"A golfer completing a swing on the course", tone:"apparel" },
 { label:"Essentials", heading:<>Ready for<br/><em>the round.</em></>, description:"The little things make a difference. Bags, gloves, balls and accessories to keep your golf day moving.", detail:"Bags · Gloves · Balls · Accessories", image:"hero.jpg", alt:"Trees and water surrounding a golf course at sunrise", tone:"essentials" }
];

export default function Home() {
 const root = useRef<HTMLElement>(null);
 const opening = useRef<HTMLElement>(null);
 const welcome = useRef<HTMLElement>(null);
 const journey = useRef<HTMLElement>(null);
 const track = useRef<HTMLDivElement>(null);
 const [active, setActive] = useState(0);
 useEffect(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let previous = -1;
  const clamp = (n:number) => Math.max(0,Math.min(1,n));
  const paint = () => {
   frame = 0;
   if(!root.current || !opening.current || !journey.current) return;
   root.current.dataset.motion = motion.matches ? "off" : "on";
   if(motion.matches) return;
   const vh = window.innerHeight;
   const p = clamp(-opening.current.getBoundingClientRect().top / Math.max(1,opening.current.offsetHeight-vh));
   opening.current.style.setProperty("--p",String(p));
   opening.current.style.setProperty("--leave",String(clamp(p*2.8)));
   opening.current.style.setProperty("--enter",String(clamp((p-.27)*2.4)));
   opening.current.style.setProperty("--inset",String(clamp((p-.60)/.40)));
   if(welcome.current) {
    const box = welcome.current.getBoundingClientRect();
    welcome.current.style.setProperty("--read",String(clamp((vh*.85-box.top)/Math.max(1,box.height*.75))));
   }
   const box = journey.current.getBoundingClientRect();
   const headerHeight = document.querySelector(".persistent-nav")?.getBoundingClientRect().height ?? 76;
   const stageHeight = vh-headerHeight;
   const r = clamp((headerHeight-box.top) / Math.max(1,journey.current.offsetHeight-stageHeight));
   journey.current.style.setProperty("--rail-x",String(-r*Math.max(0,(track.current?.scrollWidth??journey.current.clientWidth)-journey.current.clientWidth))+"px");
   const step=Math.round(r*2);
   if(step!==previous) { previous=step; setActive(step); }
   root.current.style.setProperty("--page-progress", String(clamp(window.scrollY / Math.max(1,document.documentElement.scrollHeight-vh))));
  };
  const update=()=>{ if(!frame) frame=requestAnimationFrame(paint); };
  paint();
  window.addEventListener("scroll",update,{passive:true});
  window.addEventListener("resize",update);
  motion.addEventListener("change",update);
  return()=>{ cancelAnimationFrame(frame); window.removeEventListener("scroll",update); window.removeEventListener("resize",update); motion.removeEventListener("change",update); };
 }, []);
 const goToPanel=(i:number)=>{
  if(!journey.current)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) { document.getElementById("offer-"+i)?.scrollIntoView({behavior:"auto"}); return; }
  const y=journey.current.getBoundingClientRect().top+window.scrollY;
  const headerHeight=document.querySelector(".persistent-nav")?.getBoundingClientRect().height ?? 76;
  window.scrollTo({top:y-headerHeight+(journey.current.offsetHeight-window.innerHeight+headerHeight)*(i/2),behavior:"smooth"});
 };
 const supports=[
  ["A real person in your corner","Ask us about your setup, sizing or what you’re looking for. Our team is here to help you explore the options, one conversation at a time."],
  ["Something specific in mind?","We source golf equipment from around the world. Tell us what’s on your wish list and we’ll discuss special-order options with you."],
  ["From Nairobi. Across Kenya.","We arrange nationwide delivery, so your next golf day doesn’t depend on a trip to the shop. Message us for delivery details."]
 ];
 return (
 <main ref={root} className="new-site" id="top">
  <a className="skip" href="#welcome">Skip opening</a>
  <section className="opening" ref={opening} aria-label="Welcome to Karibu Golf">
   <div className="opening-stage">
    <div className="landscape-window"><Image unoptimized className="landscape" src="/images/fairway-aerial.jpg" alt="Sunlight tracing a fairway through trees, seen from above" width={2400} height={1599} priority/><div className="image-edge-shade"/></div>
    <div className="opening-title"><p className="micro">A LOVE FOR GOLF. A PLACE FOR YOU.</p><h1><span>OUT HERE.</span><span>ALL <em>IN.</em></span></h1></div>
    <div className="opening-second"><span className="micro">KARIBU SANA.</span><h2>The game.<br/>The feeling.<br/><em>The belonging.</em></h2><p>Welcome to your golf world.</p></div>
    <div className="opening-bottom"><span>YOUR GOLF PARTNER<br/>IN KENYA.</span><a href="#offers">Explore what we offer <ArrowUpRight size={22}/></a><span className="opening-side-note">GOOD GOLF.<br/>EVEN BETTER COMPANY.</span></div>
   </div>
  </section>
  <section className="welcome" id="welcome" ref={welcome}>
   <div className="section-label"><span className="small-cross">+</span><span>THE KARIBU SPIRIT</span></div>
   <h2>It’s more than<br/>a game.<br/><em>It’s your kind<br className="mobile-break"/> of place.</em></h2>
   <div className="welcome-footer"><span>KARIBU MEANS WELCOME.</span><p>First-timers. Early risers. Weekend regulars. Wherever you are in your golf journey, there’s a place for you here.</p><a className="round-link" href="#offers" aria-label="Explore what Karibu offers"><ArrowRight/></a></div>
  </section>
  <section className="journey" id="offers" ref={journey} aria-label="What Karibu offers">
   <div className="journey-stage">
    <div className="journey-label"><span className="small-cross">+</span> WHAT WE BRING TO YOUR GAME</div>
    <div className="journey-track" ref={track}>
     {panels.map((panel,i)=><article className={"offer-panel "+panel.tone} key={panel.label} id={"offer-"+i}>
      <div className="offer-copy"><p className="micro">{panel.label}</p><h2>{panel.heading}</h2><p className="offer-description">{panel.description}</p><p className="offer-detail">{panel.detail}</p><a href={chat+"?text="+encodeURIComponent("Hi Karibu Golf! I'd like to know more about "+panel.label.toLowerCase()+".")} onFocus={()=>{if(active!==i)goToPanel(i);}} className="offer-inquire">Ask us about {panel.label.toLowerCase()} <ArrowUpRight size={20}/></a></div>
      <div className="offer-photograph"><Image unoptimized src={"/images/"+panel.image} alt={panel.alt} width={1600} height={1067} loading="lazy"/><span>FOR THE LOVE OF THE GAME.</span></div>
     </article>)}
    </div>
    <nav className="journey-nav" aria-label="Explore services">{topics.map((topic,i)=><button key={topic} className={active===i?"current":""} aria-current={active===i?"step":undefined} onClick={()=>goToPanel(i)}>{topic}<ArrowUpRight size={14}/></button>)}</nav>
   </div>
  </section>
  <section className="shop-announcement" aria-labelledby="webshop-heading"><div><p className="micro">THE KARIBU WEBSHOP</p><h2 id="webshop-heading">YOUR NEXT FIND.<br/><em>JUST A CLICK AWAY.</em></h2><p>Clubs, shoes, apparel, bags, balls and round essentials—organised into a dedicated store that makes the growing Karibu collection easy to explore.</p></div><a href="/shop" target="_blank" rel="noopener">Open the webshop <ArrowUpRight size={25}/></a></section>
  <section className="people" id="people">
   <div className="people-top"><span className="section-label"><span className="small-cross">+</span> THE PEOPLE BEHIND YOUR GAME</span><p>Not just a name.<br/>A team in your corner.</p></div>
   <div className="people-body"><div className="people-title"><h2>GOOD GOLF.<br/><em>REAL PEOPLE.</em></h2><div className="people-caption"><Image unoptimized src="/images/karibu-badge.svg" alt="Karibu Golf" width={66} height={66}/><p>Based in Nairobi.<br/>Here for golfers across Kenya.</p></div></div>
   <Accordion className="support-accordion" defaultValue={[0]}>{supports.map(([title,description],i)=><AccordionItem className="support-item" key={title} value={i}><AccordionTrigger>{title}</AccordionTrigger><AccordionContent><p>{description}</p></AccordionContent></AccordionItem>)}</Accordion></div>
  </section>
  <section className="contact-close" id="contact"><div className="close-top"><span className="micro">YOUR NEXT ROUND STARTS WITH A CONVERSATION.</span><span>NAIROBI, KENYA</span></div><a className="huge-contact" href={chat+"?text="+encodeURIComponent("Hi Karibu Golf! I'd like to learn more about what you offer.")}><span>LET’S TALK<br/><em>GOLF.</em></span><ArrowUpRight strokeWidth={.8}/></a><div className="close-bottom"><p>Have a question? A wish list? A love for the game?<br/>We’d love to hear from you.</p><a href={chat}><MessageCircle size={18}/> +254 116 416 105</a></div></section>
 </main>);
}
