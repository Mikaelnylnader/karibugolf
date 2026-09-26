import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import BlogScrollShell from "@/components/blog-scroll-shell";
import { posts, type BlogPost } from "./posts";
import "../shop/scrollcraft.css";
import "./scrollcraft.css";

export const metadata: Metadata = {
  title: "Golf in Kenya Guides & Stories | The Karibu Journal",
  description: "Practical golf guides for Kenya: beginner advice, equipment buying, golf costs, courses, etiquette and what to wear from Karibu Golf.",
  alternates: { canonical: "https://karibugolf.com/blog/" },
  openGraph: {
    title: "The Karibu Journal | Golf Guides for Kenya",
    description: "Useful, locally aware golf guides for your next round in Kenya.",
    url: "https://karibugolf.com/blog/",
    type: "website",
    images: [{ url: "https://karibugolf.com/images/golf-moment.jpg", alt: "A golfer playing in warm morning light" }],
  },
};

const words = (post: BlogPost) => `${post.content ?? ""} ${(post.sections ?? []).flat().join(" ")} ${post.intro}`.trim().split(/\s+/).filter(Boolean).length;
const readingMinutes = (post: BlogPost) => Math.max(2, Math.ceil(words(post) / 210));

export default function Blog() {
  const [featured, ...library] = posts;
  return <BlogScrollShell posts={posts}>
    <main className="journal-page journal-scrollcrafted" id="page-content">
      <section className="journal-title-page" data-sc-act="flow">
        <div className="journal-title-meta" data-sc-in data-sc-stagger="55">
          <p>NAIROBI · KENYA</p><p>{posts.length} PRACTICAL GUIDES</p><p>FOR YOUR NEXT ROUND</p>
        </div>
        <div className="journal-title-lockup" data-sc-in data-sc-stagger="65">
          <span>THE</span><h1>KARIBU<br/><em>JOURNAL.</em></h1>
        </div>
        <div className="journal-title-deck" data-sc-in data-sc-stagger="60">
          <p>Useful notes for golfers in Kenya. Start well, choose better and feel more at home on the course.</p>
          <span>ISSUE 01 · 2026</span>
        </div>
      </section>

      <section className="journal-opener" data-blog-opener data-sc-act="flow" data-sc-verify-state="open:0">
        <div className="journal-opener-stage">
          <figure data-sc-parallax="-0.38">
            <Image unoptimized src={featured.image} alt={featured.alt} width={1600} height={1067} priority />
            <figcaption>{featured.alt}</figcaption>
          </figure>
          <div className="journal-opener-copy" data-journal-article={featured.slug}>
            <p className="journal-kicker">FEATURED GUIDE · {readingMinutes(featured)} MIN READ</p>
            <h2>{featured.title}</h2><p>{featured.intro}</p>
            <a href={`/blog/${featured.slug}`}>Read the guide <ArrowUpRight size={20}/></a>
          </div>
          <div className="journal-leaf journal-leaf-left" aria-hidden="true"><span>KARIBU</span></div>
          <div className="journal-leaf journal-leaf-right" aria-hidden="true"><span>JOURNAL</span></div>
          <i className="journal-spine" aria-hidden="true" />
        </div>
      </section>

      <section className="reading-room" aria-labelledby="reading-room-title" data-sc-act="flow">
        <header className="reading-room-head" data-sc-in data-sc-stagger="60">
          <div><p>THE READING ROOM</p><h2 id="reading-room-title">FIND THE ANSWER<br/><em>BEFORE THE TEE.</em></h2></div>
          <p>Golf becomes easier to enjoy when the unfamiliar parts are explained plainly. These guides are written around the questions golfers in Kenya actually ask.</p>
        </header>
        <div className="journal-articles">
          {library.map((post, index) => <article className={`journal-story story-${index + 1}`} data-journal-article={post.slug} data-sc-in data-sc-stagger="45" key={post.slug}>
            <a className="story-image" href={`/blog/${post.slug}`} data-sc-tilt={index % 3 === 0 ? "3" : undefined}>
              <Image unoptimized src={post.image} alt={post.alt} width={1600} height={1067}/>
            </a>
            <div className="story-copy">
              <div className="story-meta"><span>{post.tag}</span><span><Clock3 size={13}/>{readingMinutes(post)} MIN</span></div>
              <h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3><p>{post.intro}</p>
              <a className="story-link" href={`/blog/${post.slug}`}>Read the guide <ArrowDownRight size={18}/></a>
            </div>
          </article>)}
        </div>
      </section>

      <section className="journal-colophon" data-sc-act="flow">
        <div className="colophon-rule" data-sc-reveal="right" data-sc-reveal-at="0.05 0.45" />
        <div className="colophon-copy" data-sc-in data-sc-stagger="55">
          <BookOpen size={34}/><p>THE KARIBU JOURNAL</p><h2>PLAY WITH<br/><em>MORE CONFIDENCE.</em></h2>
          <p>Keep reading, visit the shop or ask the Karibu team when you want a human answer.</p>
          <div><a href={`/blog/${featured.slug}`}>Start with the beginner guide <ArrowUpRight size={20}/></a><a href="/contact">Ask Karibu <ArrowUpRight size={20}/></a></div>
        </div>
        <footer><span>KARIBU GOLF · NAIROBI</span><span>OUT HERE. ALL IN.</span></footer>
      </section>
    </main>
  </BlogScrollShell>;
}
