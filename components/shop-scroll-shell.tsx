"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import type { Department } from "@/lib/shop-catalog";

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => unknown };
  }
}

export default function ShopScrollShell({ children, departments }: { children: ReactNode; departments: Department[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(departments[0]?.slug ?? "clubs");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pan = root.querySelector<HTMLElement>("[data-shop-pan]");
    if (pan) pan.dataset.scSpan = matchMedia("(max-width: 760px)").matches ? "4.7" : "6.3";

    const mount = () => {
      if (!root.dataset.scrollcraftMounted && window.ScrollCraft) {
        window.ScrollCraft.mount(root);
        root.dataset.scrollcraftMounted = "true";
      }
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-karibu-scrollcraft]');
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
    const updateTrail = () => {
      frame = 0;
      const bounds = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
      setProgress(Math.min(1, Math.max(0, -bounds.top / travel)));

      let closest = departments[0]?.slug ?? "clubs";
      const panTop = pan ? pan.getBoundingClientRect().top + window.scrollY : 0;
      const panTravel = pan ? Math.max(pan.offsetHeight - window.innerHeight, 1) : 1;
      if (pan && window.scrollY >= panTop && window.scrollY <= panTop + panTravel) {
        const rail = pan.querySelector<HTMLElement>("[data-sc-pan]");
        const panProgress = Math.min(1, Math.max(0, (window.scrollY - panTop) / panTravel));
        const overflow = rail ? Math.max(rail.scrollWidth - window.innerWidth, 0) : 0;
        const extra = rail ? Number(rail.dataset.scPan || 0) : 0;
        const translated = overflow * (1 + extra) * panProgress;
        let distance = Number.POSITIVE_INFINITY;
        root.querySelectorAll<HTMLElement>("[data-shop-department]").forEach((item) => {
          const nextDistance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - translated - window.innerWidth / 2);
          if (nextDistance < distance) {
            distance = nextDistance;
            closest = item.dataset.shopDepartment ?? closest;
          }
        });
      } else if (pan && window.scrollY > panTop + panTravel) {
        closest = departments.at(-1)?.slug ?? closest;
      }
      const stage = pan?.querySelector<HTMLElement>("[data-sc-stage]");
      if (stage) {
        const panProgress = Math.min(1, Math.max(0, (window.scrollY - panTop) / panTravel));
        stage.dataset.scVerifyState = `${closest}:${panProgress.toFixed(2)}`;
      }
      setActive(closest);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateTrail);
    };
    updateTrail();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const slug = anchor?.getAttribute("href")?.slice(1);
      const card = slug ? root.querySelector<HTMLElement>(`[data-shop-department="${slug}"]`) : null;
      const rail = pan?.querySelector<HTMLElement>("[data-sc-pan]");
      if (!anchor || !card || !pan || !rail) return;
      event.preventDefault();
      const panTop = pan.getBoundingClientRect().top + window.scrollY;
      const panTravel = Math.max(pan.offsetHeight - window.innerHeight, 1);
      const overflow = Math.max(rail.scrollWidth - window.innerWidth, 1);
      const desiredX = Math.min(overflow, Math.max(0, card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2));
      const target = panTop + (desiredX / (overflow * 1.02)) * panTravel;
      history.replaceState(null, "", `#${slug}`);
      window.scrollTo({ top: target, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    root.addEventListener("click", onClick);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      root.removeEventListener("click", onClick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [departments]);

  const trailStyle = { "--trail-progress": progress } as CSSProperties;
  return <div ref={rootRef} className="shop-scroll-shell" style={trailStyle}>
    <nav className="fairway-trail" aria-label="Shop department progress">
      <span className="fairway-trail-line" aria-hidden="true"><i /></span>
      {departments.map((item) => <a
        href={`#${item.slug}`}
        className={active === item.slug ? "active" : undefined}
        aria-current={active === item.slug ? "location" : undefined}
        key={item.slug}
      ><span aria-hidden="true" />{item.label}</a>)}
    </nav>
    {children}
  </div>;
}
