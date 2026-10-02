"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => unknown };
  }
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function AboutScrollShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

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
    if (window.ScrollCraft) mount();
    else if (existing) existing.addEventListener("load", mount, { once: true });
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
      const viewport = window.innerHeight;
      const bounds = root.getBoundingClientRect();
      const journey = Math.max(root.offsetHeight - viewport, 1);
      const pageProgress = clamp(-bounds.top / journey);

      const hero = root.querySelector<HTMLElement>("[data-about-hero]");
      const heroStage = root.querySelector<HTMLElement>("[data-about-aperture]");
      let aperture = 0;
      if (hero) {
        const heroBounds = hero.getBoundingClientRect();
        aperture = clamp(-heroBounds.top / Math.max(hero.offsetHeight - viewport, 1));
      }

      const close = root.querySelector<HTMLElement>("[data-about-close]");
      let closeProgress = 0;
      if (close) {
        const closeBounds = close.getBoundingClientRect();
        closeProgress = clamp((viewport * 0.82 - closeBounds.top) / Math.max(closeBounds.height * 0.72, 1));
      }

      root.style.setProperty("--about-page", pageProgress.toFixed(4));
      root.style.setProperty("--about-aperture", aperture.toFixed(4));
      root.style.setProperty("--about-close", closeProgress.toFixed(4));
      if (heroStage) {
        heroStage.dataset.scVerifyState = `aperture:${Math.round(aperture * 24)}`;
        heroStage.dataset.scVerifyHold = aperture <= 0.01 || aperture >= 0.99 ? "true" : "false";
      }
      if (close) {
        close.dataset.scVerifyState = `circle:${Math.round(closeProgress * 20)}`;
        close.dataset.scVerifyHold = closeProgress >= 0.99 ? "true" : "false";
      }
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
      existing?.removeEventListener("load", mount);
    };
  }, []);

  const style = {
    "--about-page": 0,
    "--about-aperture": 0,
    "--about-close": 0,
  } as CSSProperties;

  return <div ref={rootRef} className="about-scroll-shell" style={style}>
    <aside className="about-welcome-line" aria-hidden="true">
      <span>KARIBU</span><i><b /></i><small>WELCOME</small>
    </aside>
    {children}
  </div>;
}
