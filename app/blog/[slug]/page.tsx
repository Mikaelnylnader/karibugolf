import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ArticleContent from "../article-content";
import { posts } from "../posts";

const plainText = (value: string) => value
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/[*_`#]/g, "")
  .trim();

function extractFaqs(content = "") {
  const faq = content.split("## Frequently asked questions")[1]?.split("## Sources")[0] ?? "";
  return [...faq.matchAll(/###\s+([^\n]+)\n+([\s\S]*?)(?=\n###\s+|$)/g)].map((match) => ({
    question: plainText(match[1]),
    answer: plainText(match[2].replace(/\n+/g, " ")),
  })).filter((item) => item.question && item.answer);
}

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
    keywords: post.keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author ?? "Karibu Golf"],
      images: [{ url: `https://karibugolf.com${post.image}`, alt: post.alt }],
    },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const canonical = `https://karibugolf.com/blog/${post.slug}/`;
  const faqs = extractFaqs(post.content);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        headline: post.title,
        description: post.metaDescription ?? post.intro,
        image: `https://karibugolf.com${post.image}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: "en-KE",
        keywords: post.keywords?.join(", "),
        author: { "@type": "Organization", name: post.author ?? "Karibu Golf", url: "https://karibugolf.com/about/" },
        publisher: { "@type": "Organization", name: "Karibu Golf", url: "https://karibugolf.com" },
        mainEntityOfPage: canonical,
        isPartOf: { "@type": "Blog", name: "The Karibu Journal", url: "https://karibugolf.com/blog/" },
        about: post.productSlug ? { "@type": "Product", url: `https://karibugolf.com/shop/product/${post.productSlug}/` } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://karibugolf.com/" },
          { "@type": "ListItem", position: 2, name: "Journal", item: "https://karibugolf.com/blog/" },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
        ],
      },
      ...(faqs.length ? [{
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }] : []),
    ],
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
