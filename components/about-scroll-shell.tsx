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
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const founderPhotos = [...root.querySelectorAll<HTMLElement>("[data-about-founder-photo]")];
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const bounds = root.getBoundingClientRect();
      const journey = Math.max(root.offsetHeight - viewport, 1);
      const pageProgress = clamp(-bounds.top / journey);
      const header = document.querySelector(".persistent-nav")?.getBoundingClientRect().height ?? 76;
      root.dataset.aboutMotion = motion.matches ? "off" : "on";
      for (const photo of founderPhotos) {
        // Measure the stable figure, never the independently transformed print.
        const photoBounds = photo.getBoundingClientRect();
        const open = motion.matches ? 1 : clamp((viewport * 0.96 - photoBounds.top) / Math.max(viewport * 0.40, 1));
        const travel = motion.matches ? 0.5 : clamp((viewport - photoBounds.top) / Math.max(viewport + photoBounds.height, 1));
        const direction = Number(photo.dataset.photoDirection || 1);
        const distance = innerWidth > 860 ? 24 : 12;
        const turn = direction * (1 - open) * (innerWidth > 860 ? 1.2 : 0.4);
        photo.style.setProperty("--founder-photo-open", open.toFixed(4));
        photo.style.setProperty("--founder-photo-shift", `${((travel - 0.5) * distance).toFixed(2)}px`);
        photo.style.setProperty("--founder-photo-turn", `${turn.toFixed(3)}deg`);
        photo.dataset.scVerifyState = `print:${Math.round(open * 22)};shift:${Math.round((travel - 0.5) * distance)};turn:${Math.round(turn * 100)}`;
        photo.dataset.scVerifyHold = motion.matches ? "true" : "false";
      }
      const founderTrace = root.querySelector<HTMLElement>("[data-about-founder-trace]");
      if (founderTrace) {
        const traceBounds = founderTrace.getBoundingClientRect();
        const trace = motion.matches ? 1 : clamp((viewport * 0.7 - traceBounds.top) / Math.max(traceBounds.height * 0.9, 1));
        root.style.setProperty("--about-founder-trace", trace.toFixed(4));
        founderTrace.dataset.scVerifyState = `route:${Math.round(trace * 100)}`;
      }
      const communityGrid = root.querySelector<HTMLElement>("[data-about-community-grid]");
      const communityMedia = root.querySelector<HTMLElement>("[data-about-community-media]");
      if (communityGrid && communityMedia) {
        const gridBounds = communityGrid.getBoundingClientRect();
        const mediaBounds = communityMedia.getBoundingClientRect();
        const reveal = motion.matches ? 1 : clamp((viewport * 0.95 - mediaBounds.top) / Math.max(viewport * 0.65, 1));
        const photo = motion.matches ? 1 : innerWidth > 860
          ? clamp((header + 24 - gridBounds.top) / Math.max(gridBounds.height - communityMedia.offsetHeight, 1))
          : clamp((viewport - mediaBounds.top) / Math.max(viewport + mediaBounds.height, 1));
        root.style.setProperty("--about-community-reveal", reveal.toFixed(4));
        root.style.setProperty("--about-community-photo", photo.toFixed(4));
        communityMedia.dataset.scVerifyState = `window:${Math.round(reveal * 100)};zoom:${Math.round((1.12 - photo * 0.10) * 1000)};shift:${Math.round((photo - 0.5) * 60)}`;
      }

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
    motion.addEventListener("change", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      motion.removeEventListener("change", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
      existing?.removeEventListener("load", mount);
    };
  }, []);

  const style = {
    "--about-page": 0,
    "--about-aperture": 0,
    "--about-close": 0,
    "--about-founder-trace": 1,
    "--about-community-reveal": 1,
    "--about-community-photo": 1,
  } as CSSProperties;

  return <div ref={rootRef} className="about-scroll-shell" style={style}>
    <aside className="about-welcome-line" aria-hidden="true">
      <span>KARIBU</span><i><b /></i><small>WELCOME</small>
    </aside>
    {children}
  </div>;
}
