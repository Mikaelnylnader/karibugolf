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
      let distance = Number.POSITIVE_INFINITY;
      root.querySelectorAll<HTMLElement>("[data-shop-department]").forEach((item) => {
        const nextDistance = Math.abs(item.getBoundingClientRect().top - window.innerHeight * 0.42);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = item.dataset.shopDepartment ?? closest;
        }
      });
      setActive(closest);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateTrail);
    };
    updateTrail();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
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
