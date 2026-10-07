"use client";
/* eslint-disable next/no-html-link-for-pages -- Native links work with the static export without an RSC prefetch server. */
import Image from "next/image";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, MessageCircle } from "lucide-react";
import { formatKes, inStockProducts } from "@/lib/shop-catalog";
import LiveProductImage from "@/components/live-product-image";

const chat = "https://wa.me/254116416105";
const topics = ["Equipment", "Apparel", "Essentials"];
const panels = [
 { label:"Equipment", heading:<>Find your<br/><em>feel.</em></>, description:"From your first set to your next upgrade, explore leading-brand golf clubs with personal help choosing a setup for your game and budget.", detail:"Clubs · Irons · Wedges · Putters", image:"fairway-aerial.jpg", alt:"An aerial view across a sunlit fairway and sand bunkers", tone:"equipment" },
 { label:"Apparel", heading:<>Wear your<br/><em>game.</em></>, description:"For the first tee, the final putt and the rest of your day. Golf clothing and footwear with comfort and character.", detail:"Clothing · Footwear · Hats", image:"golf-moment.jpg", alt:"A golfer completing a swing on the course", tone:"apparel" },
 { label:"Essentials", heading:<>Ready for<br/><em>the round.</em></>, description:"The little things make a difference. Bags, gloves, balls and accessories to keep your golf day moving.", detail:"Bags · Gloves · Balls · Accessories", image:"hero.jpg", alt:"Trees and water surrounding a golf course at sunrise", tone:"essentials" }
];

export default function Home() {
 const root = useRef<HTMLElement>(null);
 const opening = useRef<HTMLElement>(null);
 const welcome = useRef<HTMLElement>(null);
 const journey = useRef<HTMLElement>(null);
 const homeStock = useRef<HTMLElement>(null);
 const people = useRef<HTMLElement>(null);
 const mission = useRef<HTMLElement>(null);
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
   if(homeStock.current) {
    const stockBox=homeStock.current.getBoundingClientRect();
    const stockProgress=clamp(-stockBox.top/Math.max(1,homeStock.current.offsetHeight-vh));
    homeStock.current.style.setProperty("--home-stock-p",String(stockProgress));
    const spread=Math.min(window.innerWidth*.145,210);
    const positions=[[-1.15,-.16,-8],[-.38,.16,-3],[.38,-.13,4],[1.15,.15,8]];
    homeStock.current.querySelectorAll<HTMLElement>("[data-home-stock-card]").forEach((card,index)=>{
     const [x,y,rotate]=positions[index] ?? [0,0,0];
     card.style.transform=`translate(-50%,-50%) translate3d(${x*spread*stockProgress}px,${y*vh*stockProgress}px,0) rotate(${rotate*stockProgress}deg)`;
    });
   }
   if(people.current) {
    const peopleBox=people.current.getBoundingClientRect();
    const peopleProgress=clamp((vh*.9-peopleBox.top)/Math.max(1,vh*.78));
    people.current.style.setProperty("--people-p",String(peopleProgress));
    people.current.style.setProperty("--people-label",String(clamp(peopleProgress*2.2)));
    people.current.style.setProperty("--people-line-one",String(clamp((peopleProgress-.08)*2.15)));
    people.current.style.setProperty("--people-line-two",String(clamp((peopleProgress-.19)*2.05)));
    people.current.style.setProperty("--people-detail",String(clamp((peopleProgress-.34)*1.9)));
    people.current.style.setProperty("--people-list",String(clamp((peopleProgress-.42)*1.75)));
   }
   if(mission.current) {
    const box=mission.current.getBoundingClientRect();
    mission.current.style.setProperty("--home-mission-p",String(clamp((vh*.9-box.top)/Math.max(1,vh*.7))));
   }
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
 const openStockRack=()=>{
  if(!homeStock.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const top=homeStock.current.getBoundingClientRect().top+window.scrollY;
  const travel=Math.max(0,homeStock.current.offsetHeight-window.innerHeight);
  window.scrollTo({top:top+travel*.92,behavior:"smooth"});
 };
 const supports=[
  ["A real person in your corner","Choosing your first clubs or upgrading your set? Get personal guidance on your setup and sizing, with honest help exploring options for your game and budget."],
  ["Something specific in mind?","We source golf equipment from around the world. Tell us what’s on your wish list and we’ll discuss special-order options with you."],
  ["From Nairobi. Across East Africa.","Based in Nairobi, we serve golfers across East Africa. Tell us your location and we’ll talk through delivery options and how to get you started."]
 ];
 return (
 <main ref={root} className="new-site" id="page-content">
  <a className="skip" href="#welcome">Skip opening</a>
  <section className="opening" ref={opening} aria-label="Welcome to Karibu Golf">
   <div className="opening-stage">
    <div className="landscape-window"><Image unoptimized className="landscape" src="/images/fairway-aerial.jpg" alt="Sunlight tracing a fairway through trees, seen from above" width={2400} height={1599} priority/><div className="image-edge-shade"/></div>
    <div className="opening-title"><p className="micro">A LOVE FOR GOLF. A PLACE FOR YOU.</p><h1><span>OUT HERE.</span><span>ALL <em>IN.</em></span></h1></div>
    <div className="opening-second"><span className="micro">KARIBU SANA.</span><h2>The game.<br/>The feeling.<br/><em>The belonging.</em></h2><p>Golf equipment. Personal guidance. A place to belong.</p></div>
    <div className="opening-bottom"><span>YOUR GOLF PARTNER<br/>IN EAST AFRICA.</span><a href="#offers">Explore what we offer <ArrowUpRight size={22}/></a><span className="opening-side-note">GOOD GOLF.<br/>EVEN BETTER COMPANY.</span></div>
   </div>
  </section>
  <section className="welcome" id="welcome" ref={welcome}>
   <div className="section-label"><span className="small-cross">+</span><span>THE KARIBU SPIRIT</span></div>
   <h2>It’s more than<br/>a game.<br/><em>It’s your kind<br className="mobile-break"/> of place.</em></h2>
   <div className="welcome-footer"><span>KARIBU MEANS WELCOME.</span><p>Equipment, personal guidance and a warm welcome. From your first swing to your next round, we help golfers across East Africa find their way.</p><a className="round-link" href="#offers" aria-label="Explore what Karibu offers"><ArrowRight/></a></div>
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
  <section className="shop-announcement" aria-labelledby="webshop-heading">
   <div>
    <p className="micro">THE KARIBU WEBSHOP</p>
    <h2 id="webshop-heading">YOUR NEXT FIND.<br/><em>JUST A CLICK AWAY.</em></h2>
    <p>Explore golf clubs, shoes, apparel and round essentials from leading brands. Find your next setup in a shop built for golfers across East Africa.</p>
   </div>
   <a href="/shop">Open the webshop <ArrowUpRight size={25}/></a>
  </section>
  <section className="home-stock" id="stock-now" ref={homeStock} aria-labelledby="home-stock-title">
   <div className="home-stock-stage">
    <div className="home-stock-copy"><p className="micro">LIVE FROM THE KARIBU STOCK ROOM</p><h2 id="home-stock-title">HERE NOW.<br/><em>READY TO PLAY.</em></h2><p>{inStockProducts.length} products are currently in stock at our Nairobi base, ready for golfers across East Africa. See the exact sets, live prices and product details in one focused collection.</p><a href="/shop/stock">See what is in stock <ArrowUpRight size={21}/></a></div>
    <div className="home-stock-rack" aria-label="Products in stock now">
     {inStockProducts.slice(0,4).map((product,index)=><a className={`home-stock-card home-stock-card-${index+1}`} href={`/shop/product/${product.slug}`} data-home-stock-card onFocus={openStockRack} key={product.sku}>
      <span>{String(index+1).padStart(2,"0")} · IN STOCK</span><figure><LiveProductImage product={product} alt={product.name} width="800" height="800" loading="lazy"/></figure><div><h3>{product.name}</h3><strong>{formatKes(product.priceKes)}</strong></div>
     </a>)}
    </div>
    <div className="home-stock-footer"><span>KARIBU GOLF · NAIROBI · EAST AFRICA</span><a href="/shop">Browse the full shop <ArrowUpRight size={16}/></a></div>
   </div>
  </section>
  <section className="people" id="people" ref={people}>
   <span className="people-orbit" aria-hidden="true"/>
   <div className="people-top"><span className="section-label"><span className="small-cross">+</span> THE PEOPLE BEHIND YOUR GAME</span><p>Not just a name.<br/>A team in your corner.</p></div>
   <div className="people-body"><div className="people-title"><h2><span className="people-line people-line-one"><span>GOOD GOLF.</span></span><span className="people-line people-line-two"><em>REAL PEOPLE.</em></span></h2><div className="people-caption"><Image unoptimized src="/images/karibu-badge.svg" alt="Karibu Golf" width={66} height={66}/><p>Based in Nairobi.<br/>Here for golfers across East Africa.</p></div></div>
   <span className="people-divider" aria-hidden="true"><i/></span>
   <Accordion className="support-accordion" defaultValue={[0]}>{supports.map(([title,description],i)=><AccordionItem className="support-item" key={title} value={i}><AccordionTrigger>{title}</AccordionTrigger><AccordionContent><p>{description}</p></AccordionContent></AccordionItem>)}</Accordion></div>
  </section>
  <section className="home-mission" ref={mission} aria-labelledby="home-mission-title">
   <div><p className="micro">A SHOP WITH A BIGGER AMBITION</p><h2 id="home-mission-title">MORE PEOPLE.<br/><em>MORE GOLF.</em></h2></div>
   <div><p>Golf should be easier to start and a place where more people feel they belong. We bring equipment and personal guidance to golfers across East Africa.</p><p>Our next chapter is about junior golf, beginner-friendly community partnerships and giving equipment a longer life. These are future plans, not programmes already running.</p><a href="/growing-the-game/">Discover our Growing the Game plans <ArrowUpRight size={20}/></a></div>
  </section>
  <section className="contact-close" id="contact"><div className="close-top"><span className="micro">YOUR NEXT ROUND STARTS WITH A CONVERSATION.</span><span>NAIROBI · EAST AFRICA</span></div><a className="huge-contact" href={chat+"?text="+encodeURIComponent("Hi Karibu Golf! I'd like to learn more about what you offer.")}><span>LET’S TALK<br/><em>GOLF.</em></span><ArrowUpRight strokeWidth={.8}/></a><div className="close-bottom"><p>Have a question? A wish list? A love for the game?<br/>We’d love to hear from you.</p><a href={chat}><MessageCircle size={18}/> +254 116 416 105</a></div></section>
 </main>);
}
