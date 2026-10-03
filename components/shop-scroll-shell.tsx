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
  const preferredDepartmentRef = useRef<string | null>(null);
  const [active, setActive] = useState(departments[0]?.slug ?? "clubs");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    document.documentElement.classList.add("shop-category-snap");

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
        const rect = item.getBoundingClientRect();
        const nextDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = item.dataset.shopDepartment ?? closest;
        }
      });
      const preferred = preferredDepartmentRef.current;
      const preferredCard = preferred ? root.querySelector<HTMLElement>(`[data-shop-department="${preferred}"]`) : null;
      if (preferredCard) {
        const rect = preferredCard.getBoundingClientRect();
        const centreDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        if (centreDistance <= 90) closest = preferred;
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
      if (!anchor || !card) return;
      event.preventDefault();
      preferredDepartmentRef.current = slug ?? null;
      history.replaceState(null, "", `#${slug}`);
      card.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    root.addEventListener("click", onClick);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      root.removeEventListener("click", onClick);
      document.documentElement.classList.remove("shop-category-snap");
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
