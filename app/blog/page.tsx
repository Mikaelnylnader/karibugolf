
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { posts } from "./posts";
export const metadata:Metadata={title:"The Golf Journal | Karibu Golf"};
export default function Blog(){return <main className="inner-page journal-page" id="page-content"><section className="page-intro"><p className="micro">THE KARIBU JOURNAL</p><h1>THINK GOLF.<br/><em>LIVE GOLF.</em></h1><div className="intro-bottom"><span>NOTES FOR YOUR NEXT ROUND.</span><p>Getting started, finding your fit and making a little more of your time on the course.</p></div></section><section className="journal-list" aria-label="Golf articles">{posts.map((p)=><article key={p.slug}><a className="journal-image" href={"/blog/"+p.slug}><Image unoptimized src={"/images/"+p.image} alt={p.alt} width={1600} height={1067}/></a><div><p className="micro">{p.tag}</p><h2><a href={"/blog/"+p.slug}>{p.title}</a></h2><p>{p.intro}</p><a className="editorial-link" href={"/blog/"+p.slug}>Read the story <ArrowUpRight size={20}/></a></div></article>)}</section><section className="small-close"><h2>GOT A<br/><em>GOLF QUESTION?</em></h2><a href="/contact">Ask the Karibu team <ArrowUpRight size={26}/></a></section></main>;}
