"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import type { Department } from "@/lib/shop-catalog";

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => unknown };
  }
}

export default function DepartmentScrollShell({
  children,
  department,
  categoryMode = false,
}: {
  children: ReactNode;
  department: Department;
  categoryMode?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(department.categories[0]?.slug ?? "");
  const [visited, setVisited] = useState<string[]>([]);

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
    const updateLedger = () => {
      frame = 0;
      const items = [...root.querySelectorAll<HTMLElement>("[data-kit-category]")];
      if (!items.length) return;
      const marker = window.innerHeight * 0.46;
      let closest = items[0];
      let distance = Number.POSITIVE_INFINITY;
      const nextVisited: string[] = [];

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const nextDistance = Math.abs(rect.top - marker);
        if (nextDistance < distance && rect.bottom > window.innerHeight * 0.14) {
          distance = nextDistance;
          closest = item;
        }
        if (rect.top < window.innerHeight * 0.68) {
          nextVisited.push(item.dataset.kitCategory ?? "");
        }
      });
      setActive(closest.dataset.kitCategory ?? department.categories[0]?.slug ?? "");
      setVisited(nextVisited.filter(Boolean));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateLedger);
    };
    updateLedger();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [department.categories]);

  const ledgerStyle = { "--kit-count": department.categories.length } as CSSProperties;
  return (
    <div ref={rootRef} className="department-scroll-shell" style={ledgerStyle}>
      <nav className="kit-ledger" aria-label={department.label + " category index"}>
        <div className="kit-ledger-heading">
          <span>Build your {department.slug === "clubs" ? "bag" : "kit"}</span>
          <strong>{visited.length}/{department.categories.length}</strong>
        </div>
        <div className="kit-ledger-items">
          {department.categories.map((category, index) => {
            const complete = visited.includes(category.slug);
            return (
              <a
                href={categoryMode ? `/shop/${department.slug}/${category.slug}` : "#" + category.slug}
                className={[active === category.slug ? "active" : "", complete ? "visited" : ""].filter(Boolean).join(" ")}
                aria-current={active === category.slug ? "location" : undefined}
                key={category.slug}
              >
                <span aria-hidden="true">{complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <em>{category.label}</em>
              </a>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
