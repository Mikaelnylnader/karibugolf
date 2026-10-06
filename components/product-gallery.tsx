"use client";
import {useEffect,useState} from "react";
import Image from "next/image";
import {ChevronLeft,ChevronRight,Maximize2} from "lucide-react";
import {Dialog,DialogContent,DialogTitle} from "@/components/ui/dialog";
export type ProductGalleryImage={src:string;alt:string;label:string;group?:string};

type ProductConfigurationEvent={sku?:string;label?:string;value?:string};
type Props={images:ProductGalleryImage[];note?:string;sku?:string;filterLabel?:string;initialGroup?:string};

export default function ProductGallery({images,note="Product reference images. Ask us for photographs of the exact available item.",sku,filterLabel,initialGroup}:Props){
 const [active,setActive]=useState(0);const [zoom,setZoom]=useState(false);const [selectedGroup,setSelectedGroup]=useState(initialGroup);
 useEffect(()=>{
  if(!sku||!filterLabel)return;
  const handleConfiguration=(event:Event)=>{
   const detail=(event as CustomEvent<ProductConfigurationEvent>).detail;
   if(detail?.sku!==sku||detail.label!==filterLabel||!detail.value)return;
   setSelectedGroup(detail.value);setActive(0);setZoom(false);
  };
  window.addEventListener("karibu:product-configuration",handleConfiguration);
  return()=>window.removeEventListener("karibu:product-configuration",handleConfiguration);
 },[sku,filterLabel]);
 const matchingImages=selectedGroup?images.filter((image)=>image.group===selectedGroup):[];
 const visibleImages=matchingImages.length?matchingImages:images;
 const current=visibleImages[active]??visibleImages[0];const move=(offset:number)=>setActive((active+offset+visibleImages.length)%visibleImages.length);
 return <div className="club-gallery"><div className="club-gallery-stage"><button className="club-zoom-trigger" onClick={()=>setZoom(true)} aria-label={"Enlarge "+current.label+" photo"}><Image unoptimized priority src={current.src} alt={current.alt} width={900} height={900}/><span><Maximize2 size={17}/> View larger</span></button><div className="club-gallery-controls"><button onClick={()=>move(-1)} aria-label="Previous photo"><ChevronLeft/></button><span aria-live="polite">{active+1} / {visibleImages.length} · {current.label}</span><button onClick={()=>move(1)} aria-label="Next photo"><ChevronRight/></button></div></div><div className="club-thumbnails" aria-label="Product photographs">{visibleImages.map((img,i)=><button key={img.src} onClick={()=>setActive(i)} aria-label={"Show "+img.label+" photo"} aria-pressed={active===i}><Image unoptimized src={img.src} alt="" width={100} height={100}/><span>{img.label}</span></button>)}</div><p className="club-photo-note">{note}</p><Dialog open={zoom} onOpenChange={setZoom}><DialogContent className="club-image-dialog"><DialogTitle>{current.label} · Product photograph</DialogTitle><Image unoptimized src={current.src} alt={current.alt} width={900} height={900}/><div className="club-gallery-controls"><button onClick={()=>move(-1)} aria-label="Previous enlarged photo"><ChevronLeft/></button><span>{active+1} / {visibleImages.length}</span><button onClick={()=>move(1)} aria-label="Next enlarged photo"><ChevronRight/></button></div></DialogContent></Dialog></div>;
}
