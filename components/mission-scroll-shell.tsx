"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Normal-flow motion: reading never depends on finishing a pinned animation. */
export default function MissionScrollShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mount = () => {
      if (window.ScrollCraft && !root.dataset.scrollcraftMounted) {
        window.ScrollCraft.mount(root);
        root.dataset.scrollcraftMounted = "true";
      }
    };
    let script = document.querySelector<HTMLScriptElement>("script[data-karibu-scrollcraft]");
    if (window.ScrollCraft) mount();
    else {
      if (!script) {
        script = document.createElement("script");
        script.src = "/scrollcraft/scrollcraft.js";
        script.defer = true;
        script.dataset.karibuScrollcraft = "true";
        document.body.appendChild(script);
      }
      script.addEventListener("load", mount, { once: true });
    }
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      root.dataset.missionMotion = motion.matches ? "off" : "on";
      const hero = root.querySelector<HTMLElement>("[data-mission-hero]");
      if (hero) {
        const box = hero.getBoundingClientRect();
        const progress = motion.matches ? 0 : clamp(-box.top / Math.max(box.height, 1));
        root.style.setProperty("--mission-hero", String(progress));
      }
      const growth = root.querySelector<HTMLElement>("[data-mission-growth]");
      if (growth) {
        const path = growth.querySelector(".mission-growth-path");
        const box = (path ?? growth).getBoundingClientRect();
        // Use the visible path, not the section top: the headline comes first.
        const progress = motion.matches ? 1 : clamp((innerHeight * .88 - box.top) / Math.max(innerHeight * .42, 1));
        root.style.setProperty("--mission-growth", String(progress));
        growth.dataset.scVerifyState = `path:${Math.round(progress * 100)};nodes:${progress >= .82 ? 3 : progress >= .43 ? 2 : progress >= .08 ? 1 : 0}`;
      }
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    motion.addEventListener("change", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      motion.removeEventListener("change", request);
      script?.removeEventListener("load", mount);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={rootRef} className="mission-shell" style={{ "--mission-hero": 0, "--mission-growth": 1 } as CSSProperties}>{children}</div>;
}
