"use client";
/* eslint-disable next/no-html-link-for-pages -- Native document links are required by the static storefront, which has no RSC prefetch server. */

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

function useFeatureArrival() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const staticReading = reduced.matches || innerWidth < 350 || parseFloat(getComputedStyle(document.documentElement).fontSize) > 21;
      const box = section.getBoundingClientRect();
      const arrival = staticReading ? 1 : Math.max(0, Math.min(1, (innerHeight * .92 - box.top) / Math.max(1, Math.min(innerHeight * .72, section.offsetHeight * .8))));
      section.dataset.homeFeatureMotion = staticReading ? "off" : "on";
      section.style.setProperty("--home-feature-arrival", arrival.toFixed(4));
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    reduced.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      reduced.removeEventListener("change", queue);
    };
  }, []);
  return ref;
}

export function HomeCoachingSection() {
  const ref = useFeatureArrival();
  return <section className="home-feature home-coaching" id="home-coaching" ref={ref} aria-labelledby="home-coaching-title">
    <figure className="home-coaching-photo">
      <div className="home-coaching-image"><Image unoptimized src="/images/founder/mikael-volvo-china-open-tee-off.webp" alt="Mikael Nylander playing a tee shot at Volvo China Open qualifying" width={1536} height={1024} loading="lazy"/></div>
      <figcaption>Mikael Nylander at Volvo China Open qualifying.</figcaption>
    </figure>
    <div className="home-coaching-copy">
      <p className="micro">GOLF COACHING IN NAIROBI</p>
      <h2 id="home-coaching-title">YOUR GAME.<br/><em>YOUR NEXT STEP.</em></h2>
      <p>Personal golf lessons with Mikael Nylander. From your first swing to a more confident round, find coaching that meets you where you are.</p>
      <a className="home-feature-link" href="/Coaching/">Explore golf lessons <ArrowUpRight size={21} aria-hidden="true"/></a>
    </div>
  </section>;
}

export function HomeCampaignSection() {
  const ref = useFeatureArrival();
  return <section className="home-feature home-campaign" id="home-campaign" ref={ref} aria-labelledby="home-campaign-title">
    <div className="home-campaign-heading"><h2 id="home-campaign-title">A GAME FOR<br/><em>EVERYONE.</em></h2></div>
    <div className="home-campaign-copy">
      <p>Be part of Karibu’s next chapter.</p>
      <p>Explore our plans for a Nairobi fitting studio, fair-priced golf equipment and a bigger welcome for East Africa’s golfers.</p>
      <a className="home-feature-link" href="/campaign/">Explore campaign <ArrowUpRight size={21} aria-hidden="true"/></a>
      <p className="home-campaign-status">Pre-launch campaign. Rewards are proposed; payments and reservations are not open.</p>
    </div>
    <svg className="home-campaign-seam" viewBox="0 0 1200 30" preserveAspectRatio="none" aria-hidden="true"><path className="home-campaign-seam-ground" d="M0 15 H1200"/><path className="home-campaign-seam-drawn" pathLength="1" d="M0 15 H1200"/><circle cx="1193" cy="15" r="6"/></svg>
  </section>;
}
