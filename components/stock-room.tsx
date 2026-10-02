"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import type { CatalogProduct } from "@/lib/shop-catalog";
import { formatKes } from "@/lib/shop-catalog";
import LiveProductImage from "@/components/live-product-image";

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: HTMLElement) => unknown };
  }
}

const whatsapp = "https://wa.me/254116416105";

export default function StockRoom({ products }: { products: CatalogProduct[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const active = products[activeIndex] ?? products[0];

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
      const exhibits = [...root.querySelectorAll<HTMLElement>("[data-stock-product]")];
      let next = 0;
      let nearest = Number.POSITIVE_INFINITY;
      exhibits.forEach((item, index) => {
        const box = item.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height * 0.5 - window.innerHeight * 0.5);
        if (distance < nearest) {
          nearest = distance;
          next = index;
        }
      });
      setActiveIndex(next);
      const box = root.getBoundingClientRect();
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, -box.top / travel)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [products]);

  const style = { "--stock-progress": progress } as CSSProperties;
  return <div ref={rootRef} className="stock-room-shell" style={style}>
    <nav className="stock-register" aria-label="In-stock product index">
      <span className="stock-register-track" aria-hidden="true"><i /></span>
      {products.map((product, index) => <a
        href={`#stock-${product.slug}`}
        className={index === activeIndex ? "active" : undefined}
        aria-current={index === activeIndex ? "location" : undefined}
        key={product.sku}
      ><small>{String(index + 1).padStart(2, "0")}</small><span>{product.name}</span></a>)}
    </nav>

    {active && <aside className="stock-ticket" aria-live="polite" aria-atomic="true">
      <div><span>LIVE STOCK TICKET</span><strong>{String(activeIndex + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</strong></div>
      <p>{active.sku}</p>
      <h2>{active.name}</h2>
      <dl>
        <div><dt>Kenya price</dt><dd>{formatKes(active.priceKes)}</dd></div>
        <div><dt>Available</dt><dd>{active.stock}</dd></div>
      </dl>
    </aside>}

    <main className="stock-room" id="page-content">
      <section className="stock-manifest" data-sc-act="flow">
        <div className="stock-manifest-count" aria-label={`${products.length} products in stock`}>
          <span>{String(products.length).padStart(2, "0")}</span>
          <small>AVAILABLE<br/>IN KENYA</small>
        </div>
        <div className="stock-manifest-copy" data-sc-in data-sc-stagger="55">
          <p className="micro">KARIBU LIVE INVENTORY</p>
          <h1>IN STOCK.<br/><em>READY TO PLAY.</em></h1>
          <p>These are the products currently marked in stock in the Karibu catalogue. Open a club for full details or ask us to confirm the exact set before ordering.</p>
          <a href="#stock-collection">See the collection <ArrowUpRight size={20}/></a>
        </div>
        <ol className="stock-manifest-list" data-sc-in data-sc-stagger="45">
          {products.map((product, index) => <li key={product.sku}>
            <a href={`#stock-${product.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{product.name}</strong><small>{formatKes(product.priceKes)}</small></a>
          </li>)}
        </ol>
      </section>

      <section className="stock-exhibits" id="stock-collection" aria-label="Products in stock now">
        {products.map((product, index) => <article
          className={`stock-exhibit stock-exhibit-${(index % 4) + 1}`}
          id={`stock-${product.slug}`}
          data-stock-product={product.sku}
          data-sc-act="flow"
          key={product.sku}
        >
          <span className="stock-exhibit-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <a className="stock-exhibit-image" href={`/shop/product/${product.slug}`} data-sc-reveal={index % 2 ? "right" : "left"} data-sc-reveal-at="0.04 0.50">
            <LiveProductImage product={product} alt={product.name} width="1200" height="1200" loading={index > 0 ? "lazy" : "eager"} data-sc-parallax={index % 2 ? "0.24" : "-0.24"}/>
          </a>
          <div className="stock-exhibit-copy" data-sc-in data-sc-stagger="55">
            <p className="micro">{product.categoryLabel} · {product.sku}</p>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <dl>
              <div><dt>Set</dt><dd>{product.sizes || "Confirm with Karibu"}</dd></div>
              <div><dt>Specification</dt><dd>{product.colors || "Confirm with Karibu"}</dd></div>
              <div><dt>Available</dt><dd>{product.stock}</dd></div>
            </dl>
            <div className="stock-exhibit-price"><strong>{formatKes(product.priceKes)}</strong><span>¥{product.priceCny.toLocaleString("en-US", { maximumFractionDigits: 2 })} · ${product.priceUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span></div>
            <a className="stock-product-link" href={`/shop/product/${product.slug}`}>View product <ArrowUpRight size={19}/></a>
          </div>
        </article>)}
      </section>

      <section className="stock-confirmation" data-sc-act="flow">
        <a className="stock-back-link" href="/shop"><ArrowLeft size={17}/> Full shop</a>
        <div data-sc-in data-sc-stagger="60">
          <p className="micro">CONFIRM BEFORE YOU ORDER</p>
          <h2>THE SET IS HERE.<br/><em>LET’S CHECK THE DETAILS.</em></h2>
        </div>
        <div data-sc-in>
          <p>Stock moves quickly. Message the Karibu team and we will confirm the exact club set, shaft and collection or delivery options in Kenya.</p>
          <a href={`${whatsapp}?text=${encodeURIComponent("Hi Karibu Golf! I would like to confirm what is currently in stock.")}`}>Confirm live stock <MessageCircle size={19}/></a>
        </div>
      </section>
    </main>
  </div>;
}
