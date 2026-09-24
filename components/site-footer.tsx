
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
export default function SiteFooter(){return <footer className="new-footer shared-footer"><a className="identity" href="/"><Image unoptimized src="/images/karibu-badge.svg" alt="" width={32} height={32}/><span>KARIBU<span>GOLF KENYA</span></span></a><nav aria-label="Footer navigation"><a href="/shop">Shop</a><a href="/about">About Us</a><a href="/blog">Blog</a><a href="/contact">Contact <ArrowUpRight size={14}/></a></nav><span>© {new Date().getFullYear()} Karibu Golf</span></footer>;}
