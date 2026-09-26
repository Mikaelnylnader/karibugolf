"use client";

import { type ReactNode, useEffect, useRef } from "react";

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => unknown };
  }
}

export default function ProductScrollShell({ children }: { children: ReactNode }) {
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
    if (existing) {
      mount();
      existing.addEventListener("load", mount, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "/scrollcraft/scrollcraft.js";
      script.defer = true;
      script.dataset.karibuScrollcraft = "true";
      script.addEventListener("load", mount, { once: true });
      document.body.appendChild(script);
    }
  }, []);

  return <div ref={rootRef} className="product-scroll-shell">{children}</div>;
}
