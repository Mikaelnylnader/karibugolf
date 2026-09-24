import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ArticleContent from "../article-content";
import { posts } from "../posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return { title: "Article not found | Karibu Golf" };
  const title = post.seoTitle ?? `${post.title} | Karibu Journal`;
  const description = post.metaDescription ?? post.intro;
  const canonical = `https://karibugolf.com/blog/${post.slug}/`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "article", url: canonical, images: [{ url: `https://karibugolf.com${post.image}`, alt: post.alt }] },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const canonical = `https://karibugolf.com/blog/${post.slug}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription ?? post.intro,
    image: `https://karibugolf.com${post.image}`,
    author: { "@type": "Organization", name: post.author ?? "Karibu Golf" },
    publisher: { "@type": "Organization", name: "Karibu Golf", url: "https://karibugolf.com" },
    mainEntityOfPage: canonical,
  };

  return <main className="inner-page article-page" id="page-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <header className="article-heading">
      <a className="back-link" href="/blog"><ArrowLeft size={17}/> Back to the journal</a>
      <p className="micro">{post.tag}</p>
      <h1>{post.title}</h1>
      <p className="article-deck">{post.intro}</p>
    </header>
    <div className="article-photo"><Image unoptimized src={post.image} alt={post.alt} width={1600} height={1067} priority/></div>
    <article className="article-copy">
      {post.content ? <ArticleContent content={post.content}/> : post.sections?.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      <a className="editorial-link" href="/contact">Talk to Karibu Golf <ArrowUpRight size={20}/></a>
    </article>
    <section className="more-reading"><p className="micro">KEEP READING</p>{posts.filter((item) => item.slug !== slug).map((item) => <a href={`/blog/${item.slug}`} key={item.slug}>{item.title}<ArrowUpRight size={22}/></a>)}</section>
  </main>;
}
