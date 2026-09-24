"use client";

import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight,Plus,Minus } from "lucide-react";
const links=[["Home","/"],["Shop","/shop"],["About Us","/about"],["Blog","/blog"],["Contact","/contact"]];
export default function SiteNav(){
 const path=usePathname();
 const [open,setOpen]=useState(false);
 useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false);};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f);},[]);
 const isActive=(href:string)=>href==="/"?path==="/":path===href||path.startsWith(href+"/");
 return <header className="nav persistent-nav">
  <a className="identity" href="/" aria-label="Karibu Golf home"><Image unoptimized src="/images/karibu-badge.svg" alt="" width={40} height={40}/><span>KARIBU<span>GOLF KENYA</span></span></a>
  <nav className="nav-links" aria-label="Main navigation">{links.map(([label,href])=><a href={href} key={href} aria-current={isActive(href)?"page":undefined}>{label}</a>)}</nav>
  <a className="nav-contact" href="https://wa.me/254116416105">LET’S TALK <ArrowUpRight size={17}/></a>
  <button className="nav-toggle" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="small-menu" onClick={()=>setOpen(!open)}>{open?<Minus/>:<Plus/>}</button>
  {open&&<nav className="small-menu" id="small-menu" aria-label="Mobile navigation">{links.map(([label,href])=><a href={href} key={href} onClick={()=>setOpen(false)} aria-current={isActive(href)?"page":undefined}>{label}<ArrowUpRight size={22}/></a>)}</nav>}
 </header>;
}
