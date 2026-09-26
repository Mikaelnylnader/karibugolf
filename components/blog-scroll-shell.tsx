"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import type { BlogPost } from "@/app/blog/posts";

declare global { interface Window { ScrollCraft?: { mount: (root: HTMLElement) => unknown }; } }

export default function BlogScrollShell({ children, posts }: { children: ReactNode; posts: BlogPost[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(posts[0]?.slug ?? "journal");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mount = () => {
      if (!root.dataset.scrollcraftMounted && window.ScrollCraft) {
        window.ScrollCraft.mount(root);
        root.dataset.scrollcraftMounted = "true";
      }
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-karibu-scrollcraft]");
    if (existing) mount();
    else {
      const script = document.createElement("script");
      script.src = "/scrollcraft/scrollcraft.js";
      script.defer = true;
      script.dataset.karibuScrollcraft = "true";
      script.addEventListener("load", mount, { once: true });
      document.body.appendChild(script);
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rootBounds = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - innerHeight, 1);
      setProgress(Math.min(1, Math.max(0, -rootBounds.top / travel)));
      const opener = root.querySelector<HTMLElement>("[data-blog-opener]");
      if (opener) {
        const bounds = opener.getBoundingClientRect();
        const opening = Math.min(1, Math.max(0, (innerHeight * 0.82 - bounds.top) / Math.max(bounds.height * 0.72, 1)));
        opener.style.setProperty("--journal-open", opening.toFixed(4));
        opener.dataset.scVerifyState = `open:${Math.round(opening * 20)}`;
        opener.dataset.scVerifyHold = opening <= 0.01 || opening >= 0.99 ? "true" : "false";
      }
      let nextActive = posts[0]?.slug ?? "journal";
      let closest = Number.POSITIVE_INFINITY;
      root.querySelectorAll<HTMLElement>("[data-journal-article]").forEach((article) => {
        const distance = Math.abs(article.getBoundingClientRect().top - innerHeight * 0.38);
        if (distance < closest) { closest = distance; nextActive = article.dataset.journalArticle ?? nextActive; }
      });
      setActive(nextActive);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [posts]);

  const style = { "--journal-progress": progress } as CSSProperties;
  return <div ref={rootRef} className="blog-scroll-shell" style={style}>
    <aside className="journal-folio" aria-label="Journal progress">
      <span>THE KARIBU JOURNAL</span><i aria-hidden="true"><b /></i>
      <strong>{posts.find((post) => post.slug === active)?.tag ?? "READING ROOM"}</strong>
    </aside>
    {children}
  </div>;
}
