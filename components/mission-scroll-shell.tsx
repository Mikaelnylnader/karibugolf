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
    const hero = root.querySelector<HTMLElement>("[data-mission-hero]");
    const photo = root.querySelector<HTMLElement>(".mission-hero-photo");
    const growth = root.querySelector<HTMLElement>("[data-mission-growth]");
    const growthPath = growth?.querySelector(".mission-growth-path");
    const lines = [...root.querySelectorAll<HTMLElement>(".mission-growth-line")];
    const plans = root.querySelector<HTMLElement>(".mission-plans");
    const entries = [...root.querySelectorAll<HTMLElement>(".mission-ledger-entries article")];
    const planLinks = [...root.querySelectorAll<HTMLAnchorElement>(".mission-ledger-heading nav a")];
    let frame = 0;
    const update = () => {
      frame = 0;
      root.dataset.missionMotion = motion.matches ? "off" : "on";
      const navHeight = document.querySelector(".persistent-nav")?.getBoundingClientRect().height ?? 76;
      if (hero) {
        const box = hero.getBoundingClientRect();
        const progress = motion.matches ? 0 : clamp((navHeight - box.top) / Math.max(box.height * .7, 1));
        root.style.setProperty("--mission-hero", String(progress));
      }
      if (photo) {
        const box = photo.getBoundingClientRect();
        const absoluteTop = box.top + scrollY;
        const start = Math.max(0, absoluteTop - innerHeight * .88);
        const travel = Math.max(absoluteTop + box.height - navHeight - start, 1);
        const progress = motion.matches ? 0 : clamp((scrollY - start) / travel);
        root.style.setProperty("--mission-photo", String(progress));
      }
      lines.forEach((line, index) => {
        const box = line.getBoundingClientRect();
        const progress = motion.matches ? 1 : clamp((innerHeight * .96 - box.top) / Math.max(innerHeight * .2, 1));
        line.style.setProperty("--mission-line", String(progress));
        line.dataset.scVerifyState = `line:${index + 1};rise:${Math.round((1 - progress) * 110)}`;
      });
      const planBox = plans?.getBoundingClientRect();
      let activeId = "";
      if (planBox && planBox.top < innerHeight * .8 && planBox.bottom > navHeight) {
        activeId = entries[0]?.id ?? "";
        entries.forEach(entry => { if (entry.getBoundingClientRect().top <= navHeight + innerHeight * .22) activeId = entry.id; });
      }
      planLinks.forEach(link => {
        if (link.hash === `#${activeId}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (growth) {
        const box = (growthPath ?? growth).getBoundingClientRect();
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

  return <div ref={rootRef} className="mission-shell" style={{ "--mission-hero": 0, "--mission-photo": 0, "--mission-growth": 1 } as CSSProperties}>{children}</div>;
}
