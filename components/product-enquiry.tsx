"use client";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
type Props={name:string;price:string;set:string;shafts:string;flexes:string[]};
export default function ProductEnquiry({name,price,set,shafts,flexes}:Props){const [flex,setFlex]=useState(flexes[0]);const href="https://wa.me/254116416105?text="+encodeURIComponent("Hi Karibu Golf! I'd like to order the "+name+", "+set+", "+shafts+" shafts, "+flex+" flex, at "+price+". Please confirm handedness and delivery options.");return <div className="product-enquiry"><p id="flex-label">Choose shaft flex</p><RadioGroup aria-labelledby="flex-label" value={flex} onValueChange={setFlex} className="flex-options">{flexes.map(value=><label key={value} className={flex===value?"selected":""}><RadioGroupItem value={value}/><span>{value}<small>In stock</small></span></label>)}</RadioGroup><a className="contact-button" href={href}>Order on WhatsApp ↗</a></div>;}
