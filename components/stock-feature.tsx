"use client";
/* eslint-disable next/no-html-link-for-pages -- Native links support the static storefront without an RSC prefetch server. */

import { useEffect, useMemo, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { formatKes, products, productIsInStock } from "@/lib/shop-catalog";
import { stockSetupLabel } from "@/lib/iron-options";
import { useLiveProducts } from "@/components/use-live-products";
import LiveProductImage from "@/components/live-product-image";

export default function StockFeature({ context = "home" }: { context?: "home" | "shop" }) {
  const sectionRef = useRef<HTMLElement>(null);
  const liveProducts=useLiveProducts(products);
  const inStockProducts=useMemo(()=>liveProducts.filter(productIsInStock),[liveProducts]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const shell = section.closest<HTMLElement>(".shop-scroll-shell");
    let frame = 0;
    const paint = () => {
      frame = 0;
      // Match the live homepage: desktop cards fan even in shorter windows.
      const navHeight = document.querySelector(".persistent-nav")?.getBoundingClientRect().height ?? 76;
      const animated = !motion.matches && innerWidth > 700;
      section.dataset.stockMotion = animated ? "on" : "off";
      const bounds = section.getBoundingClientRect();
      if (shell) shell.dataset.stockActive = String(bounds.top < innerHeight * .7 && bounds.bottom > navHeight);
      const progress = animated
        ? Math.max(0, Math.min(1, -bounds.top / Math.max(1, section.offsetHeight - innerHeight)))
        : 0;
      section.style.setProperty("--home-stock-p", String(progress));
      const spread = Math.min(innerWidth * .145, 210);
      const positions = [[-1.15, -.16, -8], [-.38, .16, -3], [.38, -.13, 4], [1.15, .15, 8]];
      section.querySelectorAll<HTMLElement>("[data-home-stock-card]").forEach((card, index) => {
        const [x, y, rotate] = positions[index] ?? [0, 0, 0];
        card.style.transform = animated
          ? `translate(-50%,-50%) translate3d(${x * spread * progress}px,${y * innerHeight * progress}px,0) rotate(${rotate * progress}deg)`
          : "none";
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      if (shell) delete shell.dataset.stockActive;
    };
  }, []);

  const openRack = () => {
    const section = sectionRef.current;
    if (!section || section.dataset.stockMotion !== "on") return;
    const top = section.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + Math.max(0, section.offsetHeight - innerHeight) * .92, behavior: "smooth" });
  };

  const titleId = context === "shop" ? "shop-stock-title" : "home-stock-title";
  return <section className={`home-stock stock-feature${context === "shop" ? " shop-stock-feature" : ""}`} id="stock-now" ref={sectionRef} aria-labelledby={titleId}>
    <div className="home-stock-stage">
      <div className="home-stock-copy">
        <p className="micro">LIVE FROM THE KARIBU STOCK ROOM</p>
        <h2 id={titleId}>HERE NOW.<br/><em>READY TO PLAY.</em></h2>
        <p>{inStockProducts.length} products are currently in stock at our Nairobi base, ready for golfers across East Africa. See the exact sets, live prices and product details in one focused collection.</p>
        <a href="/shop/stock">See what is in stock <ArrowUpRight size={21}/></a>
      </div>
      <div className="home-stock-rack" aria-label="Products in stock now">
        {inStockProducts.slice(0, 4).map((product, index) => <a className={`home-stock-card home-stock-card-${index + 1}`} href={`/shop/product/${product.slug}`} data-home-stock-card onFocus={openRack} key={product.sku}>
          <span>{String(index + 1).padStart(2, "0")} · IN STOCK</span>
          <figure><LiveProductImage product={product} alt={product.name} width="800" height="800" loading="lazy"/></figure>
          <div><h3>{product.name}</h3>{stockSetupLabel(product) && <p className="stock-setup" data-stock-setup={product.sku}>{stockSetupLabel(product)}</p>}<strong>{formatKes(product.priceKes)}</strong></div>
        </a>)}
      </div>
      <div className="home-stock-footer"><span>KARIBU GOLF · NAIROBI · EAST AFRICA</span><a href={context === "shop" ? "#departments" : "/shop"}>Browse the full shop <ArrowUpRight size={16}/></a></div>
    </div>
  </section>;
}
