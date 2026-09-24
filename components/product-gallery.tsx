"use client";
import {useState} from "react";
import Image from "next/image";
import {ChevronLeft,ChevronRight,Maximize2} from "lucide-react";
import {Dialog,DialogContent,DialogTitle} from "@/components/ui/dialog";
import type {GolfProduct} from "@/lib/karibu-products";
export default function ProductGallery({images}:{images:GolfProduct["gallery"]}){
 const [active,setActive]=useState(0);const [zoom,setZoom]=useState(false);
 const current=images[active];const move=(offset:number)=>setActive((active+offset+images.length)%images.length);
 return <div className="club-gallery"><div className="club-gallery-stage"><button className="club-zoom-trigger" onClick={()=>setZoom(true)} aria-label={"Enlarge "+current.label+" photo"}><Image unoptimized priority src={current.src} alt={current.alt} width={900} height={900}/><span><Maximize2 size={17}/> View larger</span></button><div className="club-gallery-controls"><button onClick={()=>move(-1)} aria-label="Previous photo"><ChevronLeft/></button><span aria-live="polite">{active+1} / {images.length} · {current.label}</span><button onClick={()=>move(1)} aria-label="Next photo"><ChevronRight/></button></div></div><div className="club-thumbnails" aria-label="Product photographs">{images.map((img,i)=><button key={img.src} onClick={()=>setActive(i)} aria-label={"Show "+img.label+" photo"} aria-pressed={active===i}><Image unoptimized src={img.src} alt="" width={100} height={100}/><span>{img.label}</span></button>)}</div><p className="club-photo-note">TaylorMade reference images. Ask us for photographs of the available set.</p><Dialog open={zoom} onOpenChange={setZoom}><DialogContent className="club-image-dialog"><DialogTitle>{current.label} · Product photograph</DialogTitle><Image unoptimized src={current.src} alt={current.alt} width={900} height={900}/><div className="club-gallery-controls"><button onClick={()=>move(-1)} aria-label="Previous enlarged photo"><ChevronLeft/></button><span>{active+1} / {images.length}</span><button onClick={()=>move(1)} aria-label="Next enlarged photo"><ChevronRight/></button></div></DialogContent></Dialog></div>;
}
