
import type { Metadata } from "next";
export function generateStaticParams(){return posts.map(post=>({slug:post.slug}));}
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft,ArrowUpRight } from "lucide-react";
import { posts } from "../posts";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=posts.find(x=>x.slug===slug);return {title:p?p.title+" | Karibu Journal":"Article not found | Karibu Golf"};}
export default async function Article({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=posts.find(x=>x.slug===slug);if(!p)notFound();return <main className="inner-page article-page" id="page-content"><header className="article-heading"><a className="back-link" href="/blog"><ArrowLeft size={17}/> Back to the journal</a><p className="micro">{p.tag}</p><h1>{p.title}</h1><p className="article-deck">{p.intro}</p></header><div className="article-photo"><Image unoptimized src={"/images/"+p.image} alt={p.alt} width={1600} height={1067} priority/></div><article className="article-copy">{p.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}<a className="editorial-link" href="/contact">Talk to Karibu Golf <ArrowUpRight size={20}/></a></article><section className="more-reading"><p className="micro">KEEP READING</p>{posts.filter(x=>x.slug!==slug).map(x=><a href={"/blog/"+x.slug} key={x.slug}>{x.title}<ArrowUpRight size={22}/></a>)}</section></main>;}
